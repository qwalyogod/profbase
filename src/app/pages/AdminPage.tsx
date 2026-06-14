import { FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Building2,
  Check,
  ChevronRight,
  Copy,
  FileText,
  FolderPlus,
  Loader2,
  Plus,
  RefreshCw,
  Shield,
  Tags,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react';
import { StateBlock } from '../components/common/StateBlock';
import { formatDate, isUserAllowedForOrganizationAdmin, organizationRoleLabels } from '../lib/portalHelpers';
import { usePortal } from '../state/PortalContext';
import { AccessMode, DocumentType, OrganizationDocument } from '../types/portal';

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const tabs = ['Обзор', 'Участники', 'Специальности', 'Уведомления', 'Заявки', 'Разделы', 'Документы', 'Код приглашения'];

const accessModes: { value: AccessMode; label: string }[] = [
  { value: 'all', label: 'Все участники организации' },
  { value: 'roles', label: 'По роли' },
  { value: 'specialty_tags', label: 'По тегам специальности' },
  { value: 'users', label: 'Конкретные пользователи' },
];

export default function AdminPage() {
  const {
    database,
    currentUser,
    currentOrganization,
    currentMembership,
    isLoading,
    errorMessage,
    clearError,
    generateOrganizationInviteCode,
    reviewJoinRequest,
    createSection,
    deleteSection,
    createDocument,
    deleteDocument,
    createSpecialtyTag,
    deleteSpecialtyTag,
    createNotification,
    assignOrganizationSpecialtyTags,
    assignMemberSpecialtyTags,
    setMemberRole,
  } = usePortal();

  const [activeTab, setActiveTab] = useState('Обзор');
  const [copied, setCopied] = useState(false);
  const [sectionForm, setSectionForm] = useState({ name: '', description: '', kind: 'common' as 'common' | 'specialized' });
  const [tagForm, setTagForm] = useState({
    name: '',
    description: '',
    color: '#7C3AED',
    features: { diary: true, calendar: true, notes: true, documents: true, journal: false },
  });
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    target: 'organization',
    userId: '',
  });
  const [docForm, setDocForm] = useState({
    title: '',
    sectionId: '',
    type: 'PDF' as DocumentType,
    size: '50 КБ',
    description: '',
    subject: '',
    accessMode: 'all' as AccessMode,
    roles: ['teacher'] as ('organization_admin' | 'teacher' | 'member')[],
    specialtyTagIds: [] as string[],
    userId: '',
    fileUrl: '',
    fileName: '',
  });

  const isAllowed = isUserAllowedForOrganizationAdmin(currentUser) && !!currentOrganization && currentMembership?.role === 'organization_admin';

  const inviteCode = useMemo(() => {
    if (!currentOrganization) {
      return null;
    }
    return database.inviteCodes.find((code) => code.organizationId === currentOrganization.id && code.isActive) ?? null;
  }, [currentOrganization, database.inviteCodes]);

  const sections = useMemo(() => {
    if (!currentOrganization) {
      return [];
    }
    return database.sections.filter((section) => section.organizationId === currentOrganization.id);
  }, [currentOrganization, database.sections]);

  const documents = useMemo(() => {
    if (!currentOrganization) {
      return [];
    }
    return database.documents.filter((document) => document.organizationId === currentOrganization.id);
  }, [currentOrganization, database.documents]);

  const organizationSpecialtyTags = useMemo(() => {
    const ids = currentOrganization?.specialtyTagIds ?? [];
    return database.specialtyTags.filter((tag) => ids.includes(tag.id));
  }, [currentOrganization, database.specialtyTags]);

  const organizationMembers = useMemo(() => {
    if (!currentOrganization) {
      return [];
    }

    const members = database.memberships.filter(
      (membership) => membership.organizationId === currentOrganization.id && membership.status === 'approved',
    );

    return members.map((membership) => ({
      membership,
      user: database.users.find((user) => user.id === membership.userId),
    }));
  }, [currentOrganization, database.memberships, database.users]);

  const pendingRequests = useMemo(() => {
    if (!currentOrganization) {
      return [];
    }
    return database.joinRequests.filter(
      (request) => request.organizationId === currentOrganization.id && request.status === 'pending',
    );
  }, [currentOrganization, database.joinRequests]);

  if (!isAllowed) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <StateBlock
          title="Раздел доступен только администратору организации"
          description="Выберите пользователя с ролью «Администратор организации», чтобы управлять разделами и заявками вашей организации."
        />
      </div>
    );
  }

  const handleCreateSection = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentOrganization || !sectionForm.name.trim()) {
      return;
    }

    await createSection({
      organizationId: currentOrganization.id,
      name: sectionForm.name.trim(),
      description: sectionForm.description.trim() || 'Описание раздела не заполнено.',
      kind: sectionForm.kind,
    });

    setSectionForm({ name: '', description: '', kind: sectionForm.kind });
  };

  const handleCreateOrganizationTag = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentOrganization || !tagForm.name.trim()) {
      return;
    }

    await createSpecialtyTag({
      organizationId: currentOrganization.id,
      name: tagForm.name.trim(),
      description: tagForm.description.trim() || 'Локальная специальность организации.',
      color: tagForm.color,
      features: tagForm.features,
    });

    setTagForm((prev) => ({ ...prev, name: '', description: '' }));
  };

  const handleCreateNotification = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentOrganization || !notificationForm.title.trim() || !notificationForm.message.trim()) return;

    await createNotification({
      title: notificationForm.title.trim(),
      message: notificationForm.message.trim(),
      senderLabel: currentOrganization.shortName,
      organizationId: currentOrganization.id,
      scope: notificationForm.target === 'user' ? 'organization_users' : 'organization',
      userIds: notificationForm.target === 'user' && notificationForm.userId ? [notificationForm.userId] : [],
    });

    setNotificationForm((prev) => ({ ...prev, title: '', message: '' }));
  };

  const handleDocumentFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileUrl = await readFileAsDataUrl(file);
    const ext = file.name.split('.').pop()?.toUpperCase();
    setDocForm((prev) => ({
      ...prev,
      fileUrl,
      fileName: file.name,
      size: `${Math.max(1, Math.round(file.size / 1024))} КБ`,
      type: ext === 'DOCX' || ext === 'XLSX' || ext === 'PPTX' || ext === 'PDF' ? ext : prev.type,
    }));
    event.target.value = '';
  };

  const handleCreateDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentOrganization || !docForm.sectionId || !docForm.title.trim()) {
      return;
    }

    const access: OrganizationDocument['access'] = {
      mode: docForm.accessMode,
      roles: docForm.accessMode === 'roles' ? docForm.roles : [],
      specialtyTagIds: docForm.accessMode === 'specialty_tags' ? docForm.specialtyTagIds : [],
      subjects: [],
      userIds: docForm.accessMode === 'users' && docForm.userId ? [docForm.userId] : [],
    };

    await createDocument({
      organizationId: currentOrganization.id,
      sectionId: docForm.sectionId,
      title: docForm.title.trim(),
      type: docForm.type,
      description: docForm.description.trim() || 'Описание документа не заполнено.',
      size: docForm.size.trim() || '50 КБ',
      subject: docForm.subject.trim() || null,
      access,
      fileUrl: docForm.fileUrl || undefined,
      fileName: docForm.fileName || undefined,
    });

    setDocForm((prev) => ({ ...prev, title: '', description: '', fileUrl: '', fileName: '' }));
  };

  const describeAccess = (document: OrganizationDocument) => {
    if (document.access.mode === 'all') {
      return 'Доступно всем участникам';
    }
    if (document.access.mode === 'roles') {
      return `По ролям: ${document.access.roles.map((role) => organizationRoleLabels[role]).join(', ')}`;
    }
    if (document.access.mode === 'specialty_tags') {
      const names = (document.access.specialtyTagIds ?? [])
        .map((tagId) => database.specialtyTags.find((tag) => tag.id === tagId)?.name)
        .filter(Boolean)
        .join(', ');
      return names ? `По специальностям: ${names}` : 'По специальностям';
    }
    const users = document.access.userIds
      .map((userId) => database.users.find((user) => user.id === userId)?.fullName)
      .filter(Boolean)
      .join(', ');
    return users ? `Точечный доступ: ${users}` : 'Точечный доступ';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Главная</Link>
        <ChevronRight size={14} />
        <Link to="/organization" className="hover:text-blue-600">Организация</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800">Админка организации</span>
      </nav>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center">
          <Shield size={22} className="text-purple-700" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Админ-панель организации</h1>
          <p className="text-sm text-slate-500">{currentOrganization.fullName}</p>
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
            type="button"
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? 'bg-purple-700 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Обзор' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Участников', value: organizationMembers.length, icon: UserCheck },
            { label: 'Разделов документов', value: sections.length, icon: FolderPlus },
            { label: 'Документов', value: documents.length, icon: FileText },
            { label: 'Новых заявок', value: pendingRequests.length, icon: UserCheck },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-4">
              <item.icon size={16} className="text-purple-600 mb-2" />
              <p className="text-xl font-bold text-slate-900">{item.value}</p>
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'Участники' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Участники и теги специальностей</h2>
            <p className="text-xs text-slate-500 mt-1">
              Один участник может иметь несколько тегов в рамках организации. Эти теги используются для доступа к документам и функциям кабинета.
            </p>
          </div>
          <div className="divide-y divide-slate-100">
            {organizationMembers.map(({ membership, user }) => {
              const memberTagIds = membership.specialtyTagIds ?? [];
              return (
                <div key={membership.id} className="px-5 py-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user?.fullName ?? 'Пользователь не найден'}</p>
                      <p className="text-xs text-slate-500">
                        {user?.email} • {organizationRoleLabels[membership.role]} • вступил {formatDate(membership.joinedAt)}
                      </p>
                    </div>
                    <div className="min-w-full space-y-2 lg:min-w-[340px]">
                      {membership.role === 'organization_admin' ? (
                        <div className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs text-purple-700">
                          Администратор организации (роль назначается глобальным администратором)
                        </div>
                      ) : (
                        <label className="block">
                          <span className="mb-1 block text-xs font-medium text-slate-600">Роль в организации</span>
                          <select
                            value={membership.role}
                            onChange={(event) => setMemberRole(membership.id, event.target.value as typeof membership.role)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                          >
                            <option value="teacher">Преподаватель</option>
                            <option value="general_specialist">Общий специалист</option>
                            <option value="member">Участник</option>
                          </select>
                        </label>
                      )}
                      <select
                        value=""
                        onChange={(event) => {
                          if (!event.target.value) return;
                          assignMemberSpecialtyTags(membership.id, Array.from(new Set([...memberTagIds, event.target.value])));
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      >
                        <option value="">Назначить специальность</option>
                        {organizationSpecialtyTags
                          .filter((tag) => !memberTagIds.includes(tag.id))
                          .map((tag) => (
                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                          ))}
                      </select>
                      <div className="flex flex-wrap gap-2 lg:justify-end">
                        {memberTagIds.map((tagId) => {
                          const tag = database.specialtyTags.find((item) => item.id === tagId);
                          if (!tag) return null;
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              onClick={() => assignMemberSpecialtyTags(membership.id, memberTagIds.filter((id) => id !== tag.id))}
                              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700"
                            >
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                              {tag.name}
                              <span className="text-blue-400">×</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {activeTab === 'Специальности' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5">
          <form onSubmit={handleCreateOrganizationTag} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Plus size={16} className="text-purple-700" /> Создать специальность организации
            </h2>
            <input
              value={tagForm.name}
              onChange={(event) => setTagForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Например: Психолог, Классный руководитель"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
            <textarea
              value={tagForm.description}
              onChange={(event) => setTagForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Описание и область применения"
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />
            <input
              type="color"
              value={tagForm.color}
              onChange={(event) => setTagForm((prev) => ({ ...prev, color: event.target.value }))}
              className="h-10 w-16 rounded border border-slate-300 bg-white"
            />
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(tagForm.features).map(([feature, enabled]) => (
                <label key={feature} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(event) =>
                      setTagForm((prev) => ({
                        ...prev,
                        features: { ...prev.features, [feature]: event.target.checked },
                      }))
                    }
                  />
                  {feature}
                </label>
              ))}
            </div>
            <button className="px-4 py-2 rounded-lg bg-purple-700 text-white text-sm font-medium hover:bg-purple-800" type="submit">
              Создать локальный тег
            </button>
          </form>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2">
                <Tags size={16} className="text-purple-700" /> Теги специальностей организации
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Выберите глобальные и локальные теги, которые организация может назначать своим участникам.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5">
            {database.specialtyTags
              .filter((tag) => !tag.organizationId || tag.organizationId === currentOrganization.id)
              .map((tag) => {
              const checked = (currentOrganization.specialtyTagIds ?? []).includes(tag.id);
              return (
                <label
                  key={tag.id}
                  className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                    checked ? 'border-purple-200 bg-purple-50' : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={(event) => {
                        const next = new Set(currentOrganization.specialtyTagIds ?? []);
                        if (event.target.checked) {
                          next.add(tag.id);
                        } else {
                          next.delete(tag.id);
                        }
                        assignOrganizationSpecialtyTags(currentOrganization.id, Array.from(next));
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
                        <p className="text-sm font-semibold text-slate-900">{tag.name}</p>
                        {tag.organizationId ? (
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] text-purple-700">локальный</span>
                        ) : null}
                        {tag.organizationId === currentOrganization.id ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              deleteSpecialtyTag(tag.id);
                            }}
                            className="ml-auto shrink-0 rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Удалить специальность"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{tag.description}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        Функции: {Object.entries(tag.features).filter(([, enabled]) => enabled).map(([key]) => key).join(', ') || 'нет'}
                      </p>
                    </div>
                  </div>
                </label>
              );
            })}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'Уведомления' ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[420px_1fr]">
          <form onSubmit={handleCreateNotification} className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-slate-900">Создать уведомление организации</h2>
            <p className="text-xs text-slate-500">
              Его увидят только сотрудники, привязанные к {currentOrganization.shortName}. Можно отправить всем сотрудникам или одному участнику.
            </p>
            <input
              value={notificationForm.title}
              onChange={(event) => setNotificationForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Заголовок"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              value={notificationForm.message}
              onChange={(event) => setNotificationForm((prev) => ({ ...prev, message: event.target.value }))}
              placeholder="Текст уведомления"
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <select
              value={notificationForm.target}
              onChange={(event) => setNotificationForm((prev) => ({ ...prev, target: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="organization">Всем сотрудникам организации</option>
              <option value="user">Конкретному сотруднику</option>
            </select>
            {notificationForm.target === 'user' ? (
              <select
                value={notificationForm.userId}
                onChange={(event) => setNotificationForm((prev) => ({ ...prev, userId: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Выберите сотрудника</option>
                {organizationMembers.map(({ user }) =>
                  user ? <option key={user.id} value={user.id}>{user.fullName}</option> : null,
                )}
              </select>
            ) : null}
            <button className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-medium text-white" type="submit">
              Отправить уведомление
            </button>
          </form>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-100 px-5 py-3">
              <h2 className="font-semibold text-slate-900">Уведомления организации</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {database.notifications
                .filter((notification) => notification.organizationId === currentOrganization.id)
                .map((notification) => (
                  <div key={notification.id} className="px-5 py-3">
                    <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                    <p className="text-sm text-slate-600">{notification.message}</p>
                    <p className="mt-1 text-xs text-slate-400">{notification.scope === 'organization' ? 'Все сотрудники' : 'Конкретный сотрудник'}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'Заявки' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900">Заявки на вступление</h2>
          </div>
          {pendingRequests.length === 0 ? (
            <StateBlock title="Новых заявок нет" description="Когда преподаватели отправят заявки по коду приглашения, они появятся здесь." />
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingRequests.map((request) => {
                const user = database.users.find((item) => item.id === request.userId);
                return (
                  <div key={request.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{user?.fullName ?? 'Пользователь не найден'}</p>
                      <p className="text-xs text-slate-500">
                        {user?.email} • Предмет: {user?.subject ?? 'не указан'} • {formatDate(request.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => reviewJoinRequest(request.id, true, currentUser!.id)}
                        className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 flex items-center gap-1"
                      >
                        <UserCheck size={12} /> Одобрить
                      </button>
                      <button
                        onClick={async () => {
                          const isConfirmed = window.confirm('Отклонить заявку?');
                          if (!isConfirmed) {
                            return;
                          }
                          await reviewJoinRequest(request.id, false, currentUser!.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 flex items-center gap-1"
                      >
                        <UserX size={12} /> Отклонить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {activeTab === 'Разделы' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <form onSubmit={handleCreateSection} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h2 className="font-semibold text-slate-900">Создать раздел документов</h2>
            <input
              value={sectionForm.name}
              onChange={(event) => setSectionForm((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              placeholder="Название раздела"
            />
            <textarea
              value={sectionForm.description}
              onChange={(event) => setSectionForm((prev) => ({ ...prev, description: event.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              placeholder="Описание раздела"
            />
            <select
              value={sectionForm.kind}
              onChange={(event) => setSectionForm((prev) => ({ ...prev, kind: event.target.value as 'common' | 'specialized' }))}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
            >
              <option value="common">Общий раздел</option>
              <option value="specialized">Специализированный раздел</option>
            </select>
            <button className="px-4 py-2 rounded-lg bg-purple-700 text-white text-sm font-medium hover:bg-purple-800" type="submit">
              Добавить раздел
            </button>
          </form>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Существующие разделы</h2>
            </div>
            {sections.length === 0 ? (
              <StateBlock title="Разделов пока нет" description="Создайте первый раздел, чтобы распределять документы по структуре." />
            ) : (
              <div className="divide-y divide-slate-100">
                {sections.map((section) => (
                  <div key={section.id} className="px-5 py-3 flex items-start gap-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{section.name}</p>
                      <p className="text-xs text-slate-500">{section.description}</p>
                      <span className="inline-flex mt-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {section.kind === 'common' ? 'Общий' : 'Специализированный'}
                      </span>
                    </div>
                    <button
                      onClick={async () => {
                        const isConfirmed = window.confirm(`Удалить раздел «${section.name}» вместе с документами внутри?`);
                        if (!isConfirmed) {
                          return;
                        }
                        await deleteSection(section.id);
                      }}
                      className="w-8 h-8 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === 'Документы' ? (
        <div className="space-y-5">
          <form onSubmit={handleCreateDocument} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
            <h2 className="font-semibold text-slate-900">Добавить документ в раздел</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={docForm.title}
                onChange={(event) => setDocForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Название документа"
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
              <select
                value={docForm.sectionId}
                onChange={(event) => setDocForm((prev) => ({ ...prev, sectionId: event.target.value }))}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
              >
                <option value="">Выберите раздел</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>{section.name}</option>
                ))}
              </select>
              <select
                value={docForm.type}
                onChange={(event) => setDocForm((prev) => ({ ...prev, type: event.target.value as DocumentType }))}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
              >
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="XLSX">XLSX</option>
                <option value="PPTX">PPTX</option>
              </select>
              <input
                value={docForm.size}
                onChange={(event) => setDocForm((prev) => ({ ...prev, size: event.target.value }))}
                placeholder="Размер файла"
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
              <input
                value={docForm.subject}
                onChange={(event) => setDocForm((prev) => ({ ...prev, subject: event.target.value }))}
                placeholder="Предмет/направление (если нужно)"
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
              />
              <select
                value={docForm.accessMode}
                onChange={(event) => setDocForm((prev) => ({ ...prev, accessMode: event.target.value as AccessMode }))}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
              >
                {accessModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>{mode.label}</option>
                ))}
              </select>
            </div>

            <label className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <span className="font-medium">Файл документа</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={handleDocumentFileChange}
                className="text-sm"
              />
              {docForm.fileName ? (
                <span className="text-xs text-slate-500">Выбран файл: {docForm.fileName}</span>
              ) : null}
            </label>

            {docForm.accessMode === 'roles' ? (
              <div className="flex flex-wrap gap-2">
                {(['organization_admin', 'teacher', 'member'] as const).map((role) => (
                  <label key={role} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 text-xs">
                    <input
                      type="checkbox"
                      checked={docForm.roles.includes(role)}
                      onChange={(event) => {
                        setDocForm((prev) => {
                          const nextRoles = new Set(prev.roles);
                          if (event.target.checked) {
                            nextRoles.add(role);
                          } else {
                            nextRoles.delete(role);
                          }
                          return { ...prev, roles: Array.from(nextRoles) as typeof prev.roles };
                        });
                      }}
                    />
                    {organizationRoleLabels[role]}
                  </label>
                ))}
              </div>
            ) : null}

            <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Специальности документа
                </p>
                <select
                  value=""
                  onChange={(event) => {
                    if (!event.target.value) return;
                    setDocForm((prev) => ({
                      ...prev,
                      accessMode: 'specialty_tags',
                      specialtyTagIds: Array.from(new Set([...prev.specialtyTagIds, event.target.value])),
                    }));
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Добавить специальность для доступа</option>
                  {organizationSpecialtyTags
                    .filter((tag) => !docForm.specialtyTagIds.includes(tag.id))
                    .map((tag) => (
                      <option key={tag.id} value={tag.id}>{tag.name}</option>
                    ))}
                </select>
                <div className="flex flex-wrap gap-2">
                  {docForm.specialtyTagIds.map((tagId) => {
                    const tag = database.specialtyTags.find((item) => item.id === tagId);
                    if (!tag) return null;
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => setDocForm((prev) => ({ ...prev, specialtyTagIds: prev.specialtyTagIds.filter((id) => id !== tag.id) }))}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                      >
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                        {tag.name}
                        <span className="text-slate-400">×</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            {docForm.accessMode === 'users' ? (
              <select
                value={docForm.userId}
                onChange={(event) => setDocForm((prev) => ({ ...prev, userId: event.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
              >
                <option value="">Выберите пользователя</option>
                {organizationMembers.map((member) =>
                  member.user ? (
                    <option key={member.user.id} value={member.user.id}>{member.user.fullName}</option>
                  ) : null,
                )}
              </select>
            ) : null}

            <textarea
              value={docForm.description}
              onChange={(event) => setDocForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Краткое описание документа"
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm"
            />

            <button className="px-4 py-2 rounded-lg bg-purple-700 text-white text-sm font-medium hover:bg-purple-800" type="submit">
              Добавить документ
            </button>
          </form>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Документы организации</h2>
            </div>
            {documents.length === 0 ? (
              <StateBlock title="Документов пока нет" description="Добавьте первый документ и назначьте доступ для ролей, предметов или конкретных пользователей." />
            ) : (
              <div className="divide-y divide-slate-100">
                {documents.map((document) => {
                  const section = sections.find((sectionItem) => sectionItem.id === document.sectionId);
                  return (
                    <div key={document.id} className="px-5 py-3 flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{document.title}</p>
                        <p className="text-xs text-slate-500">{section?.name ?? 'Раздел удален'} • {document.type} • {document.size}{document.fileName ? ` • ${document.fileName}` : ''}</p>
                        <p className="text-xs text-slate-600 mt-1">{describeAccess(document)}</p>
                        {document.fileUrl ? (
                          <a href={document.fileUrl} download={document.fileName ?? document.title} className="mt-1 inline-flex text-xs text-purple-700 hover:underline">
                            Скачать файл
                          </a>
                        ) : null}
                      </div>
                      <button
                        onClick={async () => {
                          const isConfirmed = window.confirm(`Удалить документ «${document.title}»?`);
                          if (!isConfirmed) {
                            return;
                          }
                          await deleteDocument(document.id);
                        }}
                        className="w-8 h-8 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {activeTab === 'Код приглашения' ? (
        <div className="space-y-5 max-w-xl">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Building2 size={16} className="text-purple-700" /> Код приглашения в организацию
            </h2>
            <p className="text-sm text-slate-600 mb-4">Преподаватель вводит этот код, затем отправляет заявку на вступление.</p>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-4">
              <code className="flex-1 text-lg font-mono font-bold text-slate-900 tracking-widest">{inviteCode?.code ?? 'Код не создан'}</code>
              <button
                onClick={async () => {
                  if (!inviteCode) {
                    return;
                  }
                  await navigator.clipboard.writeText(inviteCode.code);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1800);
                }}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-700 hover:bg-white flex items-center gap-1"
              >
                <Copy size={14} /> {copied ? 'Скопировано' : 'Копировать'}
              </button>
            </div>
            <button
              onClick={() => generateOrganizationInviteCode(currentOrganization.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={16} /> Сгенерировать новый код
            </button>
            <p className="text-xs text-slate-500 mt-2">После генерации новый код заменит предыдущий.</p>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-4 text-sm text-slate-500 flex items-center gap-2">
          <Loader2 size={14} className="animate-spin" /> Обновляем данные организации...
        </div>
      ) : null}
    </div>
  );
}
