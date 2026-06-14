import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  FileText,
  GraduationCap,
  HelpCircle,
  Lock,
  Map,
  Newspaper,
  Shield,
  Tag,
  Users,
  AlertTriangle,
} from 'lucide-react';
import { usePortal } from '../state/PortalContext';
import { siteRoleLabels } from '../lib/portalHelpers';

type MapItem = {
  title: string;
  description: string;
  path: string;
  icon: typeof BookOpen;
  access: 'open' | 'account' | 'role';
  roles?: string[];
  keywords: string[];
};

const mapGroups: { title: string; description: string; items: MapItem[] }[] = [
  {
    title: 'Открытая часть',
    description: 'Разделы, с которых удобно начать знакомство с порталом.',
    items: [
      {
        title: 'Главная',
        description: 'Новости, быстрые ссылки, поиск и стартовые рекомендации.',
        path: '/',
        icon: Map,
        access: 'open',
        keywords: ['старт', 'поиск', 'новичок', 'главная'],
      },
      {
        title: 'Новости',
        description: 'Публичные материалы редакции и публикации по специальностям.',
        path: '/news',
        icon: Newspaper,
        access: 'open',
        keywords: ['новости', 'публикации', 'редакция'],
      },
      {
        title: 'База знаний',
        description: 'Справочные статьи, теги, избранное и предложения материалов.',
        path: '/knowledge',
        icon: BookOpen,
        access: 'open',
        keywords: ['статьи', 'теги', 'инструкции', 'материалы'],
      },
      {
        title: 'Правовые документы',
        description: 'ТК РБ, Кодекс об образовании РБ и ссылки на официальные источники.',
        path: '/labor-code',
        icon: Shield,
        access: 'open',
        keywords: ['тк рб', 'нпа', 'право', 'pravo.by'],
      },
    ],
  },
  {
    title: 'После входа',
    description: 'Персональные разделы, где учитываются организация, роль и локальные теги.',
    items: [
      {
        title: 'Трудоустройство',
        description: 'Чек-лист документов и первых шагов молодого специалиста в РБ.',
        path: '/employment',
        icon: Briefcase,
        access: 'account',
        keywords: ['документы', 'распределение', 'молодой специалист'],
      },
      {
        title: 'Центр инцидентов',
        description: 'Алгоритмы действий, документы и сценарии для сложных ситуаций.',
        path: '/incidents',
        icon: AlertTriangle,
        access: 'account',
        keywords: ['инцидент', 'конфликт', 'травма', 'алгоритм'],
      },
      {
        title: 'Педагогический кабинет',
        description: 'Календарь, дневник, заметки, документы и журнал по 10-балльной шкале.',
        path: '/ped',
        icon: GraduationCap,
        access: 'account',
        keywords: ['кабинет', 'журнал', 'календарь', 'заметки'],
      },
      {
        title: 'Организация',
        description: 'Участники, документы, invite-код и локальные специальности организации.',
        path: '/organization',
        icon: Building2,
        access: 'account',
        keywords: ['организация', 'документы', 'участники', 'теги'],
      },
      {
        title: 'Профиль',
        description: 'Личные данные, уведомления, сохранённые материалы и настройки аккаунта.',
        path: '/profile',
        icon: Users,
        access: 'account',
        keywords: ['профиль', 'уведомления', 'избранное', 'аккаунт'],
      },
      {
        title: 'Чек-лист знакомства',
        description: 'Короткий маршрут настройки профиля, организации и полезных разделов.',
        path: '/onboarding',
        icon: CheckCircle2,
        access: 'account',
        keywords: ['онбординг', 'первые шаги', 'чек-лист'],
      },
    ],
  },
  {
    title: 'Администрирование',
    description: 'Разделы видны пользователям с соответствующими правами.',
    items: [
      {
        title: 'Админка сайта',
        description: 'Глобальные настройки, пользователи, новости, уведомления и справочники.',
        path: '/site-admin',
        icon: Shield,
        access: 'role',
        roles: ['Суперадминистратор'],
        keywords: ['сайт', 'админ', 'пользователи', 'уведомления'],
      },
      {
        title: 'Админка редактора',
        description: 'Модерация предложенных новостей и редакционная работа.',
        path: '/editor-admin',
        icon: FileText,
        access: 'role',
        roles: ['Редактор'],
        keywords: ['редактор', 'модерация', 'предложенные новости'],
      },
      {
        title: 'Админка организации',
        description: 'Заявки, участники, локальные теги, документы и права доступа.',
        path: '/org-admin',
        icon: Building2,
        access: 'role',
        roles: ['Администратор организации'],
        keywords: ['организация', 'локальные теги', 'доступ', 'заявки'],
      },
    ],
  },
];

const newcomerSteps = [
  { title: 'Проверьте профиль', path: '/profile', icon: Users },
  { title: 'Найдите организацию', path: '/organization', icon: Building2 },
  { title: 'Откройте трудоустройство', path: '/employment', icon: Briefcase },
  { title: 'Сохраните важные материалы', path: '/knowledge', icon: BookOpen },
  { title: 'Посмотрите инциденты', path: '/incidents', icon: AlertTriangle },
  { title: 'Настройте кабинет', path: '/ped', icon: Calendar },
];

export default function SiteMapPage() {
  const { currentUser, database } = usePortal();
  const visibleNewsCount = database.news.filter((article) => currentUser || article.isPublic).length;
  const organization = currentUser
    ? database.memberships.find((membership) => membership.userId === currentUser.id && membership.status === 'approved')
    : null;

  const accessText = (item: MapItem) => {
    if (item.access === 'open') return 'Открыто';
    if (item.access === 'account') return currentUser ? 'Доступно' : 'Нужен вход';
    return item.roles?.join(', ') ?? 'По роли';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/" className="hover:text-blue-600">Главная</Link>
        <ArrowRight size={14} />
        <span className="text-slate-800">Карта сайта</span>
      </nav>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Map size={14} />
              Навигационный центр
            </div>
            <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">Карта сайта ПрофБаза</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Здесь собраны все основные разделы портала, их назначение и условия доступа. Страница помогает быстро понять,
              куда идти новичку, редактору, администратору организации или суперадминистратору.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-[480px]">
            {[
              { label: 'Новостей', value: String(visibleNewsCount), icon: Newspaper },
              { label: 'Организаций', value: String(database.organizations.length), icon: Building2 },
              { label: 'Тегов', value: String(database.specialtyTags.length), icon: Tag },
              { label: 'Документов', value: String(database.documents.length), icon: FileText },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <Icon size={16} className="mb-2 text-blue-600" />
                <p className="text-lg font-bold text-slate-950">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm font-semibold text-blue-900">Текущий доступ</p>
          <p className="mt-2 text-sm leading-relaxed text-blue-800">
            {currentUser
              ? `${currentUser.fullName}, роль: ${siteRoleLabels[currentUser.role]}. ${
                  organization ? 'Организация подключена.' : 'Организация пока не выбрана.'
                }`
              : 'Вы просматриваете портал как гость. Закрытые разделы покажут экран входа.'}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
          <p className="text-sm font-semibold text-emerald-900">Для новичка</p>
          <p className="mt-2 text-sm leading-relaxed text-emerald-800">
            Начните с трудоустройства, затем настройте профиль, подключите организацию и сохраните материалы по своей специальности.
          </p>
        </div>
        <div className="rounded-xl border border-amber-100 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900">Если не нашли раздел</p>
          <p className="mt-2 text-sm leading-relaxed text-amber-800">
            Используйте поиск в шапке сайта: он ищет по разделам, новостям и материалам базы знаний с учётом доступа.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        {mapGroups.map((group) => (
          <div key={group.title}>
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-slate-950">{group.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{group.description}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {group.items.map((item) => {
                const Icon = item.icon;
                const lockedForGuest = item.access !== 'open' && !currentUser;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="group flex min-h-[150px] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <Icon size={21} />
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          lockedForGuest
                            ? 'bg-amber-50 text-amber-700'
                            : item.access === 'role'
                              ? 'bg-violet-50 text-violet-700'
                              : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {lockedForGuest ? <Lock size={11} /> : null}
                        {accessText(item)}
                      </span>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-950 group-hover:text-blue-700">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{item.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-700">
                      Открыть <ArrowRight size={12} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <HelpCircle size={20} />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Маршрут первого знакомства</h2>
            <p className="text-sm text-slate-500">Короткая последовательность действий для нового пользователя.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {newcomerSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.path}
                to={step.path}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-blue-200 hover:bg-blue-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-blue-700">
                  {index + 1}
                </span>
                <Icon size={18} className="shrink-0 text-slate-500" />
                <span className="min-w-0 text-sm font-semibold text-slate-800">{step.title}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
