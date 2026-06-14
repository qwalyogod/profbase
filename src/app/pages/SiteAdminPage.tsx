import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Ban, Check, ChevronDown, ChevronRight, Loader2, Plus, Settings, Shield, Tags, Trash2, UserCog, UserRound,
  X, Building2, LifeBuoy, Paperclip,
} from 'lucide-react';
import { StateBlock } from '../components/common/StateBlock';
import { usePortal } from '../state/PortalContext';
import {
  formatDate, isUserAllowedForSiteAdmin, describeUserRole, notificationTargetRoleLabels,
} from '../lib/portalHelpers';
import type { NotificationTargetRole, SiteRole } from '../types/portal';

const tabs = ['Пользователи', 'Уведомления', 'Специальности', 'Организации', 'Поддержка', 'Настройки'];

// Global roles assignable from the users tab. Organisation admin is intentionally
// excluded — that role is granted per-organisation in the Организации tab.
const assignableRoles: { value: SiteRole; label: string }[] = [
  { value: 'user', label: 'Пользователь' },
  { value: 'editor', label: 'Редактор' },
  { value: 'site_admin', label: 'Глобальный администратор' },
];

const notificationRoleOptions = Object.entries(notificationTargetRoleLabels) as [NotificationTargetRole, string][];

export default function SiteAdminPage() {
  const {
    database, currentUser, isLoading, errorMessage, clearError,
    setUserBanState, updateUser, deleteUser, createOrganization, createSpecialtyTag, deleteOrganization,
    assignOrganizationAdmin, removeOrganizationAdmin, reviewOrgCreationRequest, reviewSupportTicket,
    updateSiteSettings, createNotification,
  } = usePortal();

  const [activeTab, setActiveTab] = useState('Пользователи');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [orgForm, setOrgForm] = useState({ shortName: '', fullName: '', description: '' });
  const [tagForm, setTagForm] = useState({
    name: '', description: '', color: '#2563EB',
    features: { diary: true, calendar: true, notes: true, documents: true, journal: false },
  });
  const [settingsForm, setSettingsForm] = useState(database.siteSettings);
  const [notificationForm, setNotificationForm] = useState({
    title: '', message: '', target: 'all', userId: '', role: 'teacher' as NotificationTargetRole, organizationId: '',
  });
  const [notificationSuccess, setNotificationSuccess] = useState('');
  const [ticketResponses, setTicketResponses] = useState<Record<string, string>>({});

  const usersById = useMemo(() => Object.fromEntries(database.users.map((user) => [user.id, user])), [database.users]);
  const isAllowed = isUserAllowedForSiteAdmin(currentUser);
  const siteAdminCount = database.users.filter((user) => user.role === 'site_admin' && !user.isBanned).length;

  if (!isAllowed || !currentUser) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <StateBlock
          title="Раздел доступен только глобальному администратору"
          description="Выберите пользователя с ролью «Глобальный администратор» в верхней панели, чтобы открыть эту админку."
        />
      </div>
    );
  }

  const handleCreateOrganization = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!orgForm.shortName.trim() || !orgForm.fullName.trim()) return;
    await createOrganization({
      shortName: orgForm.shortName.trim(),
      fullName: orgForm.fullName.trim(),
      description: orgForm.description.trim() || 'Описание не заполнено.',
    });
    setOrgForm({ shortName: '', fullName: '', description: '' });
  };

  const handleCreateSpecialtyTag = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!tagForm.name.trim()) return;
    await createSpecialtyTag({
      name: tagForm.name.trim(),
      description: tagForm.description.trim() || 'Описание тега не заполнено.',
      color: tagForm.color,
      features: tagForm.features,
    });
    setTagForm((prev) => ({ ...prev, name: '', description: '' }));
  };

  const handleCreateNotification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) return;

    const base = { title: notificationForm.title.trim(), message: notificationForm.message.trim(), senderLabel: 'Администрация сайта' };
    if (notificationForm.target === 'role') {
      await createNotification({ ...base, organizationId: null, scope: 'roles', targetRoles: [notificationForm.role], userIds: [] });
    } else if (notificationForm.target === 'organization') {
      if (!notificationForm.organizationId) return;
      await createNotification({ ...base, organizationId: notificationForm.organizationId, scope: 'organization', userIds: [] });
    } else if (notificationForm.target === 'users') {
      if (!notificationForm.userId) return;
      await createNotification({ ...base, organizationId: null, scope: 'users', userIds: [notificationForm.userId] });
    } else {
      await createNotification({ ...base, organizationId: null, scope: 'all', userIds: [] });
    }
    setNotificationForm((prev) => ({ ...prev, title: '', message: '' }));
    setNotificationSuccess('Уведомление отправлено выбранной аудитории.');
  };

  const orgAdmins = (organizationId: string) =>
    database.memberships
      .filter((m) => m.organizationId === organizationId && m.role === 'organization_admin' && m.status === 'approved')
      .map((m) => usersById[m.userId])
      .filter(Boolean);

  const pendingOrgRequests = database.orgCreationRequests.filter((r) => r.status === 'pending');
  const processedOrgRequests = database.orgCreationRequests.filter((r) => r.status !== 'pending');
  const sortedTickets = [...database.supportTickets].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const openTicketCount = database.supportTickets.filter((t) => t.status === 'open').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Главная</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800">Админка сайта</span>
      </nav>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center"><Shield size={22} className="text-blue-700" /></div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Глобальная админ-панель сайта</h1>
          <p className="text-sm text-slate-500">Пользователи, организации, поддержка, уведомления и настройки</p>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{errorMessage}</span>
          <button onClick={clearError} className="text-red-600 hover:underline">Закрыть</button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-1 bg-white border border-slate-200 rounded-xl p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-blue-700 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            {tab}
            {tab === 'Поддержка' && openTicketCount > 0 ? <span className="ml-1.5 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{openTicketCount}</span> : null}
          </button>
        ))}
      </div>

      {/* ─── Пользователи ─── */}
      {activeTab === 'Пользователи' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Все пользователи</h2>
            <span className="text-sm text-slate-500">{database.users.length}</span>
          </div>
          <div className="divide-y divide-slate-100">
            {database.users.map((user) => {
              const isSelf = user.id === currentUser.id;
              const isLastActiveSiteAdmin = user.role === 'site_admin' && !user.isBanned && siteAdminCount <= 1;
              const canPerformDestructiveAction = !isSelf && !isLastActiveSiteAdmin;
              const expanded = expandedUserId === user.id;

              return (
                <div key={user.id} className="px-5 py-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" /> : <UserRound size={15} className="text-slate-500" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                    <span className="hidden sm:inline rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{describeUserRole(user, database.memberships, database.organizations)}</span>
                    {user.isBanned
                      ? <span className="text-xs px-2 py-1 rounded-full bg-red-50 text-red-700">Заблокирован</span>
                      : <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700">Активен</span>}
                    <button
                      onClick={() => setExpandedUserId(expanded ? null : user.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Роли и доступ <ChevronDown size={13} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {expanded ? (
                    <div className="mt-3 grid grid-cols-1 gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 lg:grid-cols-2">
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Глобальная роль</p>
                        <div className="space-y-1.5">
                          {assignableRoles.map((role) => {
                            const checked = user.role === role.value;
                            const disabled = isSelf || (isLastActiveSiteAdmin && role.value !== 'site_admin');
                            return (
                              <label key={role.value} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${checked ? 'border-blue-200 bg-blue-50 text-blue-800' : 'border-slate-200 bg-white text-slate-700'} ${disabled ? 'opacity-60' : 'cursor-pointer'}`}>
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={disabled}
                                  onChange={() => { if (!checked) updateUser(user.id, { role: role.value }); }}
                                />
                                {role.label}
                              </label>
                            );
                          })}
                          {user.role === 'organization_admin' ? (
                            <p className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs text-purple-700">
                              Сейчас: администратор организации. Эта роль назначается во вкладке «Организации».
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Специальности</p>
                        <div className="space-y-1.5">
                          {database.specialtyTags.map((tag) => {
                            const checked = (user.specialtyTagIds ?? []).includes(tag.id);
                            return (
                              <label key={tag.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    const next = new Set(user.specialtyTagIds ?? []);
                                    if (e.target.checked) next.add(tag.id); else next.delete(tag.id);
                                    updateUser(user.id, { specialtyTagIds: Array.from(next) });
                                  }}
                                />
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                                {tag.name}
                              </label>
                            );
                          })}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={async () => {
                              if (!canPerformDestructiveAction) return;
                              const action = user.isBanned ? 'разблокировать' : 'заблокировать';
                              if (window.confirm(`Подтвердите: ${action} пользователя «${user.fullName}».`)) await setUserBanState(user.id, !user.isBanned);
                            }}
                            disabled={!canPerformDestructiveAction}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${!canPerformDestructiveAction ? 'cursor-not-allowed bg-slate-100 text-slate-400' : user.isBanned ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-red-600 text-white hover:bg-red-700'}`}
                          >
                            <Ban size={12} /> {user.isBanned ? 'Разблокировать' : 'Заблокировать'}
                          </button>
                          <button
                            onClick={async () => {
                              if (!canPerformDestructiveAction) return;
                              if (window.confirm(`Удалить пользователя «${user.fullName}»? Связанные членства и доступы будут очищены.`)) await deleteUser(user.id);
                            }}
                            disabled={!canPerformDestructiveAction}
                            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${canPerformDestructiveAction ? 'border border-red-200 bg-white text-red-700 hover:bg-red-50' : 'cursor-not-allowed border border-slate-200 bg-slate-50 text-slate-400'}`}
                          >
                            <Trash2 size={12} /> Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* ─── Уведомления ─── */}
      {activeTab === 'Уведомления' ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[420px_1fr]">
          <form onSubmit={handleCreateNotification} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Создать уведомление</h2>
            {notificationSuccess ? <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notificationSuccess}</div> : null}
            <input value={notificationForm.title} onChange={(e) => { setNotificationSuccess(''); setNotificationForm((p) => ({ ...p, title: e.target.value })); }} placeholder="Заголовок" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <textarea value={notificationForm.message} onChange={(e) => { setNotificationSuccess(''); setNotificationForm((p) => ({ ...p, message: e.target.value })); }} placeholder="Текст уведомления" rows={4} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <select value={notificationForm.target} onChange={(e) => setNotificationForm((p) => ({ ...p, target: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="all">Всем пользователям</option>
              <option value="role">По роли (например, всем преподавателям)</option>
              <option value="organization">По организации</option>
              <option value="users">Конкретному пользователю</option>
            </select>
            {notificationForm.target === 'role' ? (
              <select value={notificationForm.role} onChange={(e) => setNotificationForm((p) => ({ ...p, role: e.target.value as NotificationTargetRole }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                {notificationRoleOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            ) : null}
            {notificationForm.target === 'organization' ? (
              <select value={notificationForm.organizationId} onChange={(e) => setNotificationForm((p) => ({ ...p, organizationId: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Выберите организацию</option>
                {database.organizations.map((org) => <option key={org.id} value={org.id}>{org.shortName}</option>)}
              </select>
            ) : null}
            {notificationForm.target === 'users' ? (
              <select value={notificationForm.userId} onChange={(e) => setNotificationForm((p) => ({ ...p, userId: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                <option value="">Выберите пользователя</option>
                {database.users.map((user) => <option key={user.id} value={user.id}>{user.fullName}</option>)}
              </select>
            ) : null}
            <button className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white" type="submit">Отправить уведомление</button>
          </form>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-3"><h2 className="font-semibold text-slate-900">Последние уведомления</h2></div>
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {[...database.notifications].sort((l, r) => r.createdAt.localeCompare(l.createdAt)).map((notification) => (
                <div key={notification.id} className="px-5 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                    <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
                      {notification.scope === 'roles' ? 'По роли' : notification.scope === 'organization' ? 'Организация' : notification.scope === 'users' ? 'Пользователь' : 'Все'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{notification.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{notification.senderLabel}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* ─── Специальности ─── */}
      {activeTab === 'Специальности' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <form onSubmit={handleCreateSpecialtyTag} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Tags size={16} className="text-blue-700" /> Создать тег специальности</h2>
            <input value={tagForm.name} onChange={(e) => setTagForm((p) => ({ ...p, name: e.target.value }))} placeholder="Например: Преподаватель, Медик, Юрист" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
            <textarea value={tagForm.description} onChange={(e) => setTagForm((p) => ({ ...p, description: e.target.value }))} placeholder="Что открывает этот тег" rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
            <label className="flex items-center gap-3 text-sm text-slate-700">Цвет тега
              <input type="color" value={tagForm.color} onChange={(e) => setTagForm((p) => ({ ...p, color: e.target.value }))} className="h-9 w-14 rounded border border-slate-300 bg-white" />
            </label>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Функции кабинета</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(tagForm.features).map(([feature, enabled]) => (
                  <label key={feature} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <input type="checkbox" checked={enabled} onChange={(e) => setTagForm((p) => ({ ...p, features: { ...p.features, [feature]: e.target.checked } }))} />
                    {feature}
                  </label>
                ))}
              </div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800" type="submit"><Plus size={14} /> Создать тег</button>
          </form>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100"><h2 className="font-semibold text-slate-900">Глобальные теги</h2></div>
            <div className="divide-y divide-slate-100">
              {database.specialtyTags.map((tag) => (
                <div key={tag.id} className="px-5 py-4">
                  <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color }} /><p className="text-sm font-semibold text-slate-900">{tag.name}</p></div>
                  <p className="mt-1 text-xs text-slate-500">{tag.description}</p>
                  <p className="mt-2 text-xs text-slate-500">Функции: {Object.entries(tag.features).filter(([, e]) => e).map(([k]) => k).join(', ') || 'нет'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* ─── Организации ─── */}
      {activeTab === 'Организации' ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <form onSubmit={handleCreateOrganization} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
              <h2 className="font-semibold text-slate-900">Создать организацию</h2>
              <input value={orgForm.shortName} onChange={(e) => setOrgForm((p) => ({ ...p, shortName: e.target.value }))} placeholder="Короткое название" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              <input value={orgForm.fullName} onChange={(e) => setOrgForm((p) => ({ ...p, fullName: e.target.value }))} placeholder="Полное название" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              <textarea value={orgForm.description} onChange={(e) => setOrgForm((p) => ({ ...p, description: e.target.value }))} placeholder="Описание" rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              <button className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800" type="submit">Создать</button>
            </form>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100"><h2 className="font-semibold text-slate-900">Список организаций</h2></div>
              {database.organizations.length === 0 ? (
                <StateBlock title="Организаций пока нет" description="Создайте первую организацию в форме слева." />
              ) : (
                <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
                  {database.organizations.map((organization) => {
                    const admins = orgAdmins(organization.id);
                    const adminIds = new Set(admins.map((a) => a!.id));
                    const memberCount = database.memberships.filter((m) => m.organizationId === organization.id && m.status === 'approved').length;
                    const candidates = database.users.filter((u) => !u.isBanned && u.role !== 'site_admin' && !adminIds.has(u.id));
                    return (
                      <div key={organization.id} className="px-5 py-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{organization.shortName}</p>
                            <p className="text-xs text-slate-500">{organization.fullName}</p>
                            <p className="mt-1 text-xs text-slate-400">{memberCount} участников</p>
                          </div>
                          <button
                            onClick={async () => { if (window.confirm(`Удалить организацию «${organization.shortName}»?`)) await deleteOrganization(organization.id); }}
                            className="w-8 h-8 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Администраторы организации</p>
                          {admins.length === 0 ? (
                            <p className="text-xs text-slate-400">Пока не назначены.</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {admins.map((admin) => admin ? (
                                <span key={admin.id} className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs text-purple-700">
                                  {admin.fullName}
                                  <button onClick={() => removeOrganizationAdmin(organization.id, admin.id)} className="text-purple-400 hover:text-red-500" title="Снять с админов"><X size={11} /></button>
                                </span>
                              ) : null)}
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <UserCog size={14} className="text-slate-500" />
                            <select
                              defaultValue=""
                              onChange={async (event) => { if (event.target.value) { await assignOrganizationAdmin(organization.id, event.target.value); event.target.value = ''; } }}
                              className="px-2 py-1.5 rounded-lg border border-slate-300 text-xs"
                            >
                              <option value="">Добавить администратора</option>
                              {candidates.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.fullName}</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Заявки на подключение организаций */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Building2 size={16} className="text-blue-700" /> Заявки на подключение организаций</h2>
              <span className="text-sm text-slate-500">{pendingOrgRequests.length}</span>
            </div>
            {database.orgCreationRequests.length === 0 ? (
              <StateBlock title="Заявок нет" description="Когда пользователи предложат подключить организацию, заявки появятся здесь." />
            ) : (
              <div className="divide-y divide-slate-100">
                {[...pendingOrgRequests, ...processedOrgRequests].map((request) => {
                  const author = usersById[request.userId];
                  return (
                    <div key={request.id} className="px-5 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900">{request.shortName} <span className="font-normal text-slate-500">— {request.fullName}</span></p>
                        <p className="text-xs text-slate-500">{request.description}</p>
                        <p className="mt-0.5 text-xs text-slate-400">От {author?.fullName ?? 'неизвестно'} · {formatDate(request.createdAt)}</p>
                      </div>
                      {request.status === 'pending' ? (
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => reviewOrgCreationRequest(request.id, true, currentUser.id)} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 flex items-center gap-1"><Check size={12} /> Одобрить</button>
                          <button onClick={async () => { const comment = window.prompt('Причина отклонения (необязательно):') ?? ''; await reviewOrgCreationRequest(request.id, false, currentUser.id, comment); }} className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 flex items-center gap-1"><X size={12} /> Отклонить</button>
                        </div>
                      ) : (
                        <span className={`shrink-0 text-xs px-2 py-1 rounded-full ${request.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {request.status === 'approved' ? 'Одобрена' : 'Отклонена'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ─── Поддержка ─── */}
      {activeTab === 'Поддержка' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2"><LifeBuoy size={16} className="text-blue-700" /> Обращения в поддержку</h2>
            <span className="text-sm text-slate-500">{openTicketCount} новых</span>
          </div>
          {sortedTickets.length === 0 ? (
            <StateBlock title="Обращений нет" description="Когда участники организаций напишут в поддержку, обращения появятся здесь." />
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedTickets.map((ticket) => {
                const author = usersById[ticket.userId];
                const org = database.organizations.find((o) => o.id === ticket.organizationId);
                return (
                  <div key={ticket.id} className="px-5 py-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{ticket.subject}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${ticket.status === 'open' ? 'bg-amber-50 text-amber-700' : ticket.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {ticket.status === 'open' ? 'На рассмотрении' : ticket.status === 'approved' ? 'Выполнено' : 'Отклонено'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{author?.fullName ?? 'Пользователь'}{org ? ` · ${org.shortName}` : ''} · {formatDate(ticket.createdAt)}</p>
                    <p className="text-sm text-slate-600">{ticket.message}</p>
                    {ticket.attachments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {ticket.attachments.map((file, i) => (
                          <a key={i} href={file.dataUrl} download={file.name} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200">
                            <Paperclip size={11} /> {file.name}
                          </a>
                        ))}
                      </div>
                    ) : null}
                    {ticket.status === 'open' ? (
                      <div className="space-y-2 rounded-xl bg-slate-50 p-3">
                        <textarea
                          value={ticketResponses[ticket.id] ?? ''}
                          onChange={(e) => setTicketResponses((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                          placeholder="Ответ пользователю (придёт в уведомления)..."
                          rows={2}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none"
                        />
                        <div className="flex gap-2">
                          <button onClick={async () => { await reviewSupportTicket(ticket.id, true, currentUser.id, ticketResponses[ticket.id] ?? ''); setTicketResponses((prev) => ({ ...prev, [ticket.id]: '' })); }} className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 flex items-center gap-1"><Check size={12} /> Подтвердить выполнение</button>
                          <button onClick={async () => { await reviewSupportTicket(ticket.id, false, currentUser.id, ticketResponses[ticket.id] ?? ''); setTicketResponses((prev) => ({ ...prev, [ticket.id]: '' })); }} className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 flex items-center gap-1"><X size={12} /> Отклонить</button>
                        </div>
                      </div>
                    ) : ticket.adminResponse ? (
                      <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Ответ:</span> {ticket.adminResponse}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {/* ─── Настройки ─── */}
      {activeTab === 'Настройки' ? (
        <form className="bg-white rounded-xl border border-slate-200 p-5 space-y-3" onSubmit={async (e) => { e.preventDefault(); await updateSiteSettings(settingsForm); }}>
          <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Settings size={16} /> Общие настройки сайта</h2>
          <input value={settingsForm.portalName} onChange={(e) => setSettingsForm((p) => ({ ...p, portalName: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="Название портала" />
          <input value={settingsForm.importantNoteTitle} onChange={(e) => setSettingsForm((p) => ({ ...p, importantNoteTitle: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="Заголовок важного примечания" />
          <input value={settingsForm.firstLoginHelpTitle} onChange={(e) => setSettingsForm((p) => ({ ...p, firstLoginHelpTitle: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="Заголовок помощи при первом входе" />
          <input value={settingsForm.supportEmail} onChange={(e) => setSettingsForm((p) => ({ ...p, supportEmail: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="Почта поддержки" />
          <button className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800" type="submit">Сохранить настройки</button>
        </form>
      ) : null}

      {isLoading ? (
        <div className="mt-4 text-sm text-slate-500 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Выполняем обновление данных...</div>
      ) : null}
    </div>
  );
}
