import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { Building2, ChevronRight, FileText, Search, Shield, Users } from 'lucide-react';
import { StateBlock } from '../components/common/StateBlock';
import { usePortal } from '../state/PortalContext';
import { formatDate, organizationRoleLabels } from '../lib/portalHelpers';

export default function OrganizationPage() {
  const {
    database,
    currentUser,
    currentOrganization,
    currentMembership,
    submitJoinRequest,
    submitOrgCreationRequest,
    getVisibleDocuments,
    isLoading,
    errorMessage,
    clearError,
  } = usePortal();

  const [inviteCode, setInviteCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [orgProposal, setOrgProposal] = useState({ shortName: '', fullName: '', description: '' });
  const [proposeMessage, setProposeMessage] = useState('');

  const myOrgRequests = useMemo(
    () => (currentUser ? database.orgCreationRequests.filter((request) => request.userId === currentUser.id) : []),
    [currentUser, database.orgCreationRequests],
  );

  const handleProposeOrg = async (event: React.FormEvent) => {
    event.preventDefault();
    setProposeMessage('');
    if (!orgProposal.shortName.trim() || !orgProposal.fullName.trim()) {
      setProposeMessage('Укажите короткое и полное название организации.');
      return;
    }
    try {
      await submitOrgCreationRequest(orgProposal);
      setProposeMessage('Заявка отправлена. Ожидайте решение глобального администратора.');
      setOrgProposal({ shortName: '', fullName: '', description: '' });
    } catch {
      // ошибка показана в общем сообщении
    }
  };

  const latestRequest = useMemo(() => {
    if (!currentUser) {
      return null;
    }

    return database.joinRequests
      .filter((request) => request.userId === currentUser.id)
      .sort((left, right) => (left.createdAt < right.createdAt ? 1 : -1))[0] ?? null;
  }, [currentUser, database.joinRequests]);

  const visibleDocuments = useMemo(() => {
    if (!currentOrganization || !currentUser) {
      return [];
    }
    return getVisibleDocuments(currentOrganization.id, currentUser.id);
  }, [currentOrganization, currentUser, getVisibleDocuments]);

  const orgMembers = useMemo(() => {
    if (!currentOrganization) {
      return [];
    }

    return database.memberships.filter(
      (membership) => membership.organizationId === currentOrganization.id && membership.status === 'approved',
    );
  }, [currentOrganization, database.memberships]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Главная</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800">Организация</span>
      </nav>

      {errorMessage ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{errorMessage}</span>
          <button onClick={clearError} className="text-red-600 hover:underline">Закрыть</button>
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      {currentOrganization && currentMembership ? (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                <Building2 size={28} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-slate-900">{currentOrganization.fullName}</h1>
                <p className="text-slate-500 text-sm mt-1">{currentOrganization.description}</p>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Users size={14} className="text-slate-400" />
                    <span>{orgMembers.length} участников</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileText size={14} className="text-slate-400" />
                    <span>{visibleDocuments.length} доступных документов</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield size={14} className="text-slate-400" />
                    <span>Ваша роль: {organizationRoleLabels[currentMembership.role]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-3">Доступные разделы и документы</h2>
              {visibleDocuments.length === 0 ? (
                <StateBlock
                  title="Пока нет доступных документов"
                  description="Администратор организации еще не выдал вам доступ к разделам или документам."
                />
              ) : (
                <div className="space-y-3">
                  {visibleDocuments.slice(0, 6).map((document) => {
                    const section = database.sections.find((item) => item.id === document.sectionId);
                    return (
                      <div key={document.id} className="p-3 rounded-lg border border-slate-200">
                        <p className="text-sm font-medium text-slate-900">{document.title}</p>
                        <p className="text-xs text-slate-500">{section?.name ?? 'Раздел не найден'} • {document.type} • {document.size}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              <Link
                to="/ped/documents"
                className="mt-4 inline-flex items-center gap-1 text-sm text-blue-700 hover:underline"
              >
                <Search size={14} /> Открыть полный каталог документов
              </Link>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900 mb-3">Состояние доступа</h2>
              <div className="space-y-2 text-sm text-slate-600">
                <p>Статус участия: <span className="font-medium text-green-700">Одобрено</span></p>
                <p>Дата вступления: {formatDate(currentMembership.joinedAt)}</p>
                <p>Роль в организации: {organizationRoleLabels[currentMembership.role]}</p>
              </div>
              {currentUser?.role === 'organization_admin' ? (
                <Link
                  to="/org-admin"
                  className="mt-4 inline-flex items-center gap-1 text-sm text-purple-700 hover:underline"
                >
                  Открыть админку организации
                </Link>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h1 className="text-xl font-bold text-slate-900 mb-2">Вступление в организацию</h1>
            <p className="text-sm text-slate-600 mb-4">
              Введите код приглашения от вашей организации. После отправки заявки администратор организации примет решение.
            </p>

            <form
              onSubmit={async (event) => {
                event.preventDefault();
                setSuccessMessage('');
                try {
                  await submitJoinRequest(inviteCode);
                  setSuccessMessage('Заявка отправлена. Ожидайте решение администратора организации.');
                  setInviteCode('');
                } catch {
                  // Ошибка уже показана в общем сообщении из контекста.
                }
              }}
              className="space-y-3"
            >
              <input
                value={inviteCode}
                onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                placeholder="Например: SCH-2026-K8X4"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800"
                disabled={isLoading}
              >
                Отправить заявку
              </button>
            </form>

            <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
              Порядок доступа: код приглашения → заявка → проверка администратором организации → доступ к документам.
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-3">Последняя заявка</h2>
            {!latestRequest ? (
              <StateBlock title="Заявок еще нет" description="После отправки кода приглашения здесь появится статус заявки." />
            ) : (
              <div className="space-y-2 text-sm">
                <p className="text-slate-700">Код: <code className="font-mono">{latestRequest.inviteCode}</code></p>
                <p className="text-slate-700">Дата: {formatDate(latestRequest.createdAt)}</p>
                <p>
                  Статус:{' '}
                  {latestRequest.status === 'pending' ? <span className="text-amber-700 font-medium">Ожидает решения</span> : null}
                  {latestRequest.status === 'approved' ? <span className="text-green-700 font-medium">Одобрена</span> : null}
                  {latestRequest.status === 'rejected' ? <span className="text-red-700 font-medium">Отклонена</span> : null}
                </p>
              </div>
            )}

            <div className="mt-4">
              <h3 className="font-medium text-slate-900 mb-2">Организации на сайте</h3>
              <div className="space-y-2">
                {database.organizations.map((organization) => (
                  <div key={organization.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="text-sm font-medium text-slate-900">{organization.shortName}</p>
                    <p className="text-xs text-slate-500">{organization.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-semibold text-slate-900 mb-1">Предложить подключение организации</h2>
            <p className="text-sm text-slate-600 mb-4">
              Оставьте заявку — глобальный администратор рассмотрит её. После одобрения вы автоматически станете
              администратором новой организации.
            </p>
            <form onSubmit={handleProposeOrg} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input value={orgProposal.shortName} onChange={(e) => setOrgProposal((p) => ({ ...p, shortName: e.target.value }))} placeholder="Короткое название" className="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              <input value={orgProposal.fullName} onChange={(e) => setOrgProposal((p) => ({ ...p, fullName: e.target.value }))} placeholder="Полное название" className="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
              <textarea value={orgProposal.description} onChange={(e) => setOrgProposal((p) => ({ ...p, description: e.target.value }))} placeholder="Кратко об организации" rows={2} className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300 text-sm resize-none" />
              <button type="submit" className="md:col-span-2 justify-self-start px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-medium hover:bg-blue-800">Отправить заявку</button>
            </form>
            {proposeMessage ? <p className="mt-3 text-sm text-green-700">{proposeMessage}</p> : null}
            {myOrgRequests.length > 0 ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Мои заявки на организации</p>
                {myOrgRequests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <span className="text-slate-700">{r.shortName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'approved' ? 'bg-green-50 text-green-700' : r.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                      {r.status === 'approved' ? 'Одобрена' : r.status === 'rejected' ? 'Отклонена' : 'Ожидает'}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
