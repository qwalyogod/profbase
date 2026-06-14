import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Newspaper,
  ShieldCheck,
  UserRound,
  XCircle,
} from 'lucide-react';
import { StateBlock } from '../components/common/StateBlock';
import { formatDate, isUserAllowedForEditorAdmin } from '../lib/portalHelpers';
import { usePortal } from '../state/PortalContext';
import { NewsSubmission } from '../types/portal';
import { articles as knowledgeArticles } from './KnowledgeBasePage';

export default function EditorAdminPage() {
  const {
    database,
    currentUser,
    errorMessage,
    clearError,
    reviewNewsSubmission,
  } = usePortal();

  const isAllowed = isUserAllowedForEditorAdmin(currentUser);

  const usersById = useMemo(() => {
    return Object.fromEntries(database.users.map((user) => [user.id, user]));
  }, [database.users]);

  const pendingSubmissions = useMemo(
    () =>
      database.newsSubmissions
        .filter((submission) => submission.status === 'pending')
        .sort((left, right) => right.submittedAt.localeCompare(left.submittedAt)),
    [database.newsSubmissions],
  );

  const reviewedSubmissions = useMemo(
    () =>
      database.newsSubmissions
        .filter((submission) => submission.status !== 'pending')
        .sort((left, right) => (right.reviewedAt ?? '').localeCompare(left.reviewedAt ?? ''))
        .slice(0, 6),
    [database.newsSubmissions],
  );

  const editorialLinks = [
    {
      title: 'Новости',
      description: 'Создание публикаций, правка материалов и полная очередь модерации.',
      path: '/news',
      icon: Newspaper,
      meta: `${pendingSubmissions.length} на проверке`,
    },
    {
      title: 'База знаний',
      description: 'Редактирование справочных материалов и быстрый доступ к редактору базы.',
      path: '/knowledge',
      icon: BookOpen,
      meta: `${knowledgeArticles.length} материалов`,
    },
    {
      title: 'Инциденты',
      description: 'Редакторские сценарии, карточки инцидентов и материалы для реагирования.',
      path: '/incidents',
      icon: AlertTriangle,
      meta: `${database.incidents.length} сценариев`,
    },
  ];

  async function handleReviewSubmission(submission: NewsSubmission, approve: boolean) {
    if (!currentUser) return;

    const action = approve ? 'одобрить и опубликовать' : 'отклонить';
    const isConfirmed = window.confirm(`Подтвердите действие: ${action} материал «${submission.article.title}».`);
    if (!isConfirmed) return;

    await reviewNewsSubmission(
      submission.id,
      approve,
      currentUser.id,
      approve ? 'Одобрено через админку редактора' : 'Отклонено через админку редактора',
    );
  }

  if (!isAllowed) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <StateBlock
          title="Раздел доступен только редактору"
          description="У этой админки ограниченные права: новости, база знаний и редакционные материалы. Управление пользователями остается в глобальной админке."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/" className="hover:text-blue-600">Главная</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800">Админка редактора</span>
      </nav>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
            <ShieldCheck size={23} className="text-emerald-700" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Редакторская админ-панель</h1>
            <p className="text-sm text-slate-500">Ограниченные действия: публикации, модерация и редакционные разделы</p>
          </div>
        </div>
        <Link
          to="/news"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <Newspaper size={16} /> Открыть редактор новостей
        </Link>
      </div>

      {errorMessage ? (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{errorMessage}</span>
          <button type="button" onClick={clearError} className="font-semibold hover:underline">Закрыть</button>
        </div>
      ) : null}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">На модерации</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{pendingSubmissions.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Опубликовано новостей</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{database.news.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Разделы редактора</p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{editorialLinks.length}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {editorialLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon size={20} />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{item.meta}</span>
              </div>
              <h2 className="mt-4 text-base font-bold text-slate-950">{item.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700">
                Перейти <ExternalLink size={14} />
              </span>
            </Link>
          );
        })}
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Предложенные новости</h2>
            <p className="text-sm text-slate-500">Здесь редактор видит материалы, которые пользователи отправили на проверку.</p>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <Clock3 size={13} /> {pendingSubmissions.length} ожидает
          </span>
        </div>

        {pendingSubmissions.length === 0 ? (
          <div className="px-5 py-8">
            <StateBlock
              title="Очередь модерации пуста"
              description="Когда пользователь предложит новость, редактор увидит ее здесь и сможет принять решение."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingSubmissions.map((submission) => {
              const submitter = usersById[submission.submittedByUserId];
              return (
                <div key={submission.id} className="px-5 py-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <UserRound size={13} /> {submitter?.fullName ?? 'Пользователь удален'}
                        </span>
                        <span>{formatDate(submission.submittedAt)}</span>
                        <span>{submission.article.category}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-950">{submission.article.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">{submission.article.summary}</p>
                      {submission.article.tags.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {submission.article.tags.slice(0, 6).map((tag) => (
                            <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{tag}</span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleReviewSubmission(submission, true)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                      >
                        <CheckCircle2 size={15} /> Одобрить
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReviewSubmission(submission, false)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                      >
                        <XCircle size={15} /> Отклонить
                      </button>
                      <Link
                        to="/news"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Править в новостях
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {reviewedSubmissions.length > 0 ? (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Последние решения</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {reviewedSubmissions.map((submission) => (
              <div key={submission.id} className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{submission.article.title}</p>
                  <p className="text-xs text-slate-500">
                    {submission.reviewedAt ? formatDate(submission.reviewedAt) : 'Дата не указана'}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${
                    submission.status === 'approved'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  {submission.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
