import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  BookOpen,
  Home,
  Briefcase,
  AlertTriangle,
  Newspaper,
  GraduationCap,
  Building2,
  Bell,
  Search,
  X,
  ChevronDown,
  User,
  Shield,
  Building,
  MoreHorizontal,
  LogIn,
  LogOut,
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
} from 'lucide-react';
import { usePortal } from '../../state/PortalContext';
import { describeUserRole } from '../../lib/portalHelpers';
import { articles as knowledgeArticles } from '../../pages/KnowledgeBasePage';
import type { PortalUser } from '../../types/portal';

const navItems = [
  { label: 'Главная', path: '/', icon: Home },
  { label: 'Новости', path: '/news', icon: Newspaper },
  { label: 'База знаний', path: '/knowledge', icon: BookOpen },
  { label: 'Трудоустройство', path: '/employment', icon: Briefcase },
  { label: 'Инциденты', path: '/incidents', icon: AlertTriangle },
  { label: 'Кабинет', path: '/ped', icon: GraduationCap },
  { label: 'Организация', path: '/organization', icon: Building2 },
];

const searchableSections = [
  { title: 'Главная', label: 'Раздел', path: '/', keywords: 'главная старт поиск быстрый доступ новости' },
  { title: 'Карта сайта', label: 'Навигация', path: '/sitemap', keywords: 'карта сайта разделы навигация доступ роли' },
  { title: 'Новости', label: 'Раздел', path: '/news', keywords: 'новости редакция публикации материалы' },
  { title: 'База знаний', label: 'Раздел', path: '/knowledge', keywords: 'база знаний статьи теги избранное инструкции' },
  { title: 'Трудоустройство', label: 'Раздел', path: '/employment', keywords: 'трудоустройство документы распределение молодой специалист' },
  { title: 'Правовые документы', label: 'Раздел', path: '/labor-code', keywords: 'тк рб кодекс образование право нпа pravo by' },
  { title: 'Центр инцидентов', label: 'Раздел', path: '/incidents', keywords: 'инцидент конфликт травма буллинг алгоритм', requiresAuth: true },
  { title: 'Педагогический кабинет', label: 'Раздел', path: '/ped', keywords: 'педагог кабинет журнал календарь заметки документы', requiresAuth: true },
  { title: 'Организация', label: 'Раздел', path: '/organization', keywords: 'организация участники invite документы локальные теги', requiresAuth: true },
  { title: 'Профиль', label: 'Раздел', path: '/profile', keywords: 'профиль уведомления избранное аккаунт', requiresAuth: true },
];

const desktopMorePaths = ['/employment', '/incidents'];
const desktopPrimaryItems = navItems.filter((item) => !desktopMorePaths.includes(item.path));
const desktopMoreItems = navItems.filter((item) => desktopMorePaths.includes(item.path));
const mobilePrimaryItems = navItems.filter((item) =>
  ['/', '/news', '/knowledge', '/employment'].includes(item.path),
);
const mobileMoreItems = navItems.filter((item) => !mobilePrimaryItems.includes(item));

type HeaderProps = {
  tabletNavExpanded: boolean;
  onTabletNavToggle: () => void;
};

export function Header({ tabletNavExpanded, onTabletNavToggle }: HeaderProps) {
  // A single open-menu key keeps the header dropdowns mutually exclusive:
  // opening one closes the others, and clicking the same trigger toggles it off.
  type MenuKey = 'mobileMore' | 'user' | 'notifications' | 'testRole' | 'desktopMore';
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const toggleMenu = (key: MenuKey) => setOpenMenu((current) => (current === key ? null : key));
  const closeMenus = () => setOpenMenu(null);
  const mobileMoreOpen = openMenu === 'mobileMore';
  const userMenuOpen = openMenu === 'user';
  const notificationsOpen = openMenu === 'notifications';
  const testRoleMenuOpen = openMenu === 'testRole';
  const desktopMoreOpen = openMenu === 'desktopMore';
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [navSearchOpen, setNavSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, database, logout, switchCurrentUser, getVisibleNotifications, dismissNotification } = usePortal();
  const roleLabel = (user: PortalUser) => describeUserRole(user, database.memberships, database.organizations);
  const visibleNotifications = currentUser ? getVisibleNotifications(currentUser.id) : [];
  const previewNotifications = visibleNotifications.slice(0, 5);
  const normalizedSearchQuery = navSearchQuery.trim().toLowerCase();
  const searchResults = useMemo(() => {
    if (!normalizedSearchQuery) return [];

    const sectionResults = searchableSections
      .filter((section) => [section.title, section.keywords].join(' ').toLowerCase().includes(normalizedSearchQuery))
      .map((section) => ({
        title: section.title,
        label: section.requiresAuth && !currentUser ? `${section.label} · нужен вход` : section.label,
        path: section.path,
      }));

    const newsResults = database.news
      .filter((article) => currentUser || article.isPublic)
      .filter((article) =>
        [article.title, article.summary, article.category, article.specialization ?? '', article.tags.join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearchQuery),
      )
      .slice(0, 4)
      .map((article) => ({ title: article.title, label: 'Новость', path: `/news/${article.id}` }));

    const knowledgeResults = knowledgeArticles
      .filter((article) =>
        [article.title, article.category, article.tags.join(' '), article.content.replace(/<[^>]+>/g, ' ')]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearchQuery),
      )
      .slice(0, 4)
      .map((article) => ({ title: article.title, label: 'База знаний', path: `/knowledge?id=${article.id}` }));

    return [...sectionResults, ...newsResults, ...knowledgeResults].slice(0, 8);
  }, [currentUser, database.news, normalizedSearchQuery]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  useEffect(() => {
    setOpenMenu(null);
    setNavSearchOpen(false);
  }, [location.pathname]);

  // Close any open dropdown when clicking outside the header chrome.
  useEffect(() => {
    if (!openMenu) return;
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target && !target.closest('[data-header-menu]')) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [openMenu]);

  async function handleLogout() {
    await logout();
    closeMenus();
    navigate('/');
  }

  function handleDemoLogin(userId: string) {
    switchCurrentUser(userId);
    closeMenus();
  }

  function handleNavSearch(event: FormEvent) {
    event.preventDefault();
    const query = navSearchQuery.trim();
    if (!query) {
      setNavSearchOpen((value) => !value);
      return;
    }
    if (searchResults.length > 0) {
      navigate(searchResults[0].path);
    } else {
      navigate(`/knowledge?q=${encodeURIComponent(query)}`);
    }
    setNavSearchOpen(false);
  }

  function renderNavLink(item: (typeof navItems)[number], compact = false) {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <Link
        key={item.path}
        to={item.path}
        aria-label={item.label}
        title={compact ? item.label : undefined}
        className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
          compact ? 'justify-center px-3 py-3' : 'px-4 py-3'
        } ${
          active
            ? 'bg-blue-50 text-blue-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`}
      >
        <Icon size={19} strokeWidth={1.9} />
        {!compact ? <span>{item.label}</span> : null}
      </Link>
    );
  }

  return (
    <>
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="w-full px-4 sm:px-6 xl:px-8">
        <div className="flex items-center h-16 gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
            >
              <BookOpen size={16} className="text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">
              Проф<span style={{ color: '#2563EB' }}>База</span>
            </span>
          </Link>

          <nav className="hidden xl:flex min-w-0 flex-1 items-center gap-1">
            {desktopPrimaryItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium leading-none transition-colors 2xl:px-3 ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="relative" data-header-menu>
              <button
                type="button"
                onClick={() => toggleMenu('desktopMore')}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium leading-none transition-colors 2xl:px-3 ${
                  desktopMoreItems.some((item) => isActive(item.path))
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                aria-haspopup="menu"
                aria-expanded={desktopMoreOpen}
              >
                <MoreHorizontal size={17} />
                Разделы
                <ChevronDown size={14} />
              </button>
              {desktopMoreOpen ? (
                <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
                  {desktopMoreItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                          isActive(item.path)
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        <Icon size={17} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onTabletNavToggle}
              className="hidden md:flex xl:hidden w-9 h-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label={tabletNavExpanded ? 'Свернуть меню' : 'Показать меню'}
              title={tabletNavExpanded ? 'Свернуть меню' : 'Показать меню'}
            >
              {tabletNavExpanded ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}
            </button>

            <button
              type="button"
              onClick={() => setNavSearchOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 sm:hidden"
              aria-label="Открыть поиск по порталу"
              title="Поиск"
            >
              <Search size={19} />
            </button>

            <form
              onSubmit={handleNavSearch}
              className="relative hidden w-48 items-center rounded-lg border border-slate-200 bg-slate-50 px-2 sm:flex lg:w-56 2xl:w-64"
            >
              <button
                type="submit"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                aria-label="Поиск по порталу"
                title="Поиск"
              >
                <Search size={18} />
              </button>
              <input
                value={navSearchQuery}
                onChange={(event) => setNavSearchQuery(event.target.value)}
                onFocus={() => setNavSearchOpen(true)}
                placeholder="Поиск..."
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none"
              />
              {navSearchOpen && navSearchQuery.trim() ? (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <Link
                        key={`${result.label}-${result.path}`}
                        to={result.path}
                        onClick={() => {
                          setNavSearchOpen(false);
                          setNavSearchQuery('');
                        }}
                        className="block px-4 py-3 text-left hover:bg-blue-50"
                      >
                        <span className="block truncate text-sm font-semibold text-slate-900">{result.title}</span>
                        <span className="text-xs text-slate-500">{result.label}</span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">Ничего не найдено</div>
                  )}
                </div>
              ) : null}
            </form>

            {currentUser ? (
              <div className="relative block" data-header-menu>
                <button
                  type="button"
                  onClick={() => toggleMenu('notifications')}
                  className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100"
                  aria-label="Уведомления"
                >
                  <Bell size={18} />
                  {visibleNotifications.length > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                      {visibleNotifications.length}
                    </span>
                  ) : null}
                </button>
                {notificationsOpen ? (
                  <div className="absolute right-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-3">
                      <div>
                      <p className="text-sm font-semibold text-slate-900">Уведомления</p>
                      <p className="text-xs text-slate-500">
                        {visibleNotifications.length ? `${visibleNotifications.length} доступно для вашей роли` : 'Новых уведомлений нет'}
                      </p>
                      </div>
                      <button
                        type="button"
                        onClick={closeMenus}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Закрыть уведомления"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {previewNotifications.length > 0 ? (
                        previewNotifications.map((notification) => (
                          <div key={notification.id} className="border-b border-slate-100 px-4 py-3 last:border-0">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                              <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
                                {notification.organizationId ? 'Организация' : 'Админ'}
                              </span>
                            </div>
                            <p className="mt-1 text-sm leading-relaxed text-slate-600">{notification.message}</p>
                            <p className="mt-2 text-xs text-slate-400">
                              {notification.senderLabel} · {new Date(notification.createdAt).toLocaleDateString('ru-RU')}
                            </p>
                            <button
                              type="button"
                              onClick={() => currentUser && dismissNotification(notification.id, currentUser.id)}
                              className="mt-2 text-xs font-medium text-slate-500 hover:text-red-600"
                            >
                              Скрыть
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-sm text-slate-500">Пока пусто.</div>
                      )}
                    </div>
                    {visibleNotifications.length > 5 ? (
                      <Link
                        to="/profile#notifications"
                        onClick={closeMenus}
                        className="block border-t border-slate-100 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        Смотреть все уведомления
                      </Link>
                    ) : (
                      <Link
                        to="/profile#notifications"
                        onClick={closeMenus}
                        className="block border-t border-slate-100 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        История уведомлений
                      </Link>
                    )}
                  </div>
                ) : null}
              </div>
            ) : null}



            {currentUser?.role === 'site_admin' ? (
              <Link
                to="/site-admin"
                className="hidden xl:flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-semibold text-white shadow-sm"
                style={{ background: '#1D4ED8' }}
              >
                <Shield size={14} /> Админка
              </Link>
            ) : null}

            {currentUser?.role === 'editor' ? (
              <Link
                to="/editor-admin"
                className="hidden xl:flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-semibold text-white shadow-sm"
                style={{ background: '#047857' }}
              >
                <Shield size={14} /> Ред. админка
              </Link>
            ) : null}

            {currentUser?.role === 'organization_admin' ? (
              <Link
                to="/org-admin"
                className="hidden xl:flex h-9 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-xs font-semibold text-white shadow-sm"
                style={{ background: '#7C3AED' }}
              >
                <Building size={14} /> Орг. админ
              </Link>
            ) : null}

            <div className="relative hidden md:block" data-header-menu>
              <button
                type="button"
                onClick={() => toggleMenu('testRole')}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 bg-amber-50 text-amber-800 transition-colors hover:bg-amber-100"
                aria-label="Тестовый вход по ролям"
                title="Тест роли"
              >
                <Users size={16} />
              </button>
              {testRoleMenuOpen ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">Войти как тестовый пользователь</p>
                    <p className="mt-0.5 text-xs text-slate-500">Быстрое переключение ролей для проверки разделов</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1">
                    {database.users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleDemoLogin(user.id)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-blue-50 ${
                          currentUser?.id === user.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                          <User size={15} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-900">{user.fullName}</span>
                          <span className="block text-xs text-slate-500">{roleLabel(user)}</span>
                          <span className="block truncate text-xs text-slate-400">{user.email}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {currentUser ? (
              <div className="relative hidden md:block" data-header-menu>
                <button
                  onClick={() => toggleMenu('user')}
                  className="flex h-9 items-center gap-2 rounded-lg px-2 text-slate-600 transition-colors hover:bg-slate-100"
                  aria-label="Меню пользователя"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={14} className="text-blue-600" />
                    )}
                  </div>
                  <span className="hidden max-w-28 truncate text-xs font-medium text-slate-700 2xl:block">
                    {currentUser.fullName}
                  </span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                {userMenuOpen ? (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-sm font-medium text-slate-900">{currentUser.fullName}</p>
                      <p className="text-xs text-slate-500">{roleLabel(currentUser)}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={closeMenus}
                      className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Мой профиль
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Выйти
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Регистрация
                </Link>
              </div>
            )}

            <div className="relative md:hidden" data-header-menu>
              <button
                type="button"
                onClick={() => toggleMenu('testRole')}
                className="mr-1 flex h-9 w-9 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-800 transition-colors hover:bg-amber-100"
                aria-label="Тестовый вход по ролям"
                title="Тест роли"
              >
                <Users size={18} strokeWidth={1.9} />
              </button>
              {testRoleMenuOpen ? (
                <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">Тестовый вход</p>
                    <p className="mt-0.5 text-xs text-slate-500">Выберите роль для проверки</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {database.users.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => handleDemoLogin(user.id)}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-blue-50 ${
                          currentUser?.id === user.id ? 'bg-blue-50 text-blue-700' : ''
                        }`}
                      >
                        <Users size={17} strokeWidth={1.9} />
                        <span className="min-w-0">
                          <span className="block truncate">{roleLabel(user)}</span>
                          <span className="block truncate text-xs font-normal text-slate-500">{user.fullName}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="relative md:hidden" data-header-menu>
              <button
                type="button"
                onClick={() => toggleMenu('user')}
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-blue-100 bg-blue-50 text-blue-700 transition-colors hover:bg-blue-100"
                aria-label="Меню профиля"
              >
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User size={18} strokeWidth={1.9} />
                )}
              </button>

              {userMenuOpen ? (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                  {currentUser ? (
                    <>
                      <div className="border-b border-slate-100 px-3 py-2">
                        <p className="truncate text-sm font-semibold text-slate-900">{currentUser.fullName}</p>
                        <p className="text-xs text-slate-500">{roleLabel(currentUser)}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={closeMenus}
                        className="mt-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <User size={18} strokeWidth={1.9} />
                        Мой профиль
                      </Link>
                      <Link
                        to="/profile#settings"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Settings size={18} strokeWidth={1.9} />
                        Настройки
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={18} strokeWidth={1.9} />
                        Выйти
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="px-3 py-2 text-sm font-semibold text-slate-900">Аккаунт</p>
                      <Link
                        to="/login"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <LogIn size={18} strokeWidth={1.9} />
                        Войти
                      </Link>
                      <Link
                        to="/register"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-xl bg-blue-600 px-3 py-3 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        <UserPlus size={18} strokeWidth={1.9} />
                        Регистрация
                      </Link>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>

    {navSearchOpen ? (
      <div className="fixed inset-x-3 top-20 z-[60] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl sm:hidden">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-900">Поиск по порталу</p>
          <button
            type="button"
            onClick={() => setNavSearchOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Закрыть поиск"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleNavSearch} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
          <Search size={18} className="shrink-0 text-slate-400" />
          <input
            autoFocus
            value={navSearchQuery}
            onChange={(event) => setNavSearchQuery(event.target.value)}
            placeholder="Статья, раздел, документ..."
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-800 outline-none"
          />
        </form>
        {navSearchQuery.trim() ? (
          <div className="mt-3 max-h-[60vh] overflow-y-auto">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <Link
                  key={`${result.label}-${result.path}`}
                  to={result.path}
                  onClick={() => {
                    setNavSearchOpen(false);
                    setNavSearchQuery('');
                  }}
                  className="block rounded-xl px-3 py-3 text-left hover:bg-blue-50"
                >
                  <span className="block text-sm font-semibold text-slate-900">{result.title}</span>
                  <span className="text-xs text-slate-500">{result.label}</span>
                </Link>
              ))
            ) : (
              <div className="rounded-xl bg-slate-50 px-3 py-4 text-sm text-slate-500">
                Ничего не найдено. Попробуйте другое слово.
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 rounded-xl bg-blue-50 px-3 py-3 text-xs leading-relaxed text-blue-800">
            Попробуйте: трудовой договор, КТП, инцидент, организация, карта сайта.
          </div>
        )}
      </div>
    ) : null}

    <aside
      className={`hidden md:flex xl:hidden fixed left-0 top-16 bottom-0 z-40 flex-col border-r border-slate-200 bg-white shadow-sm transition-[width] duration-200 ${
        tabletNavExpanded ? 'w-72' : 'w-20'
      }`}
    >
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => renderNavLink(item, !tabletNavExpanded))}

        {currentUser?.role === 'site_admin' ? (
          <Link
            to="/site-admin"
            title={!tabletNavExpanded ? 'Админка сайта' : undefined}
            className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
              tabletNavExpanded ? 'px-4 py-3' : 'justify-center px-3 py-3'
            } ${
              isActive('/site-admin')
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Shield size={19} strokeWidth={1.9} />
            {tabletNavExpanded ? <span>Админка сайта</span> : null}
          </Link>
        ) : null}

        {currentUser?.role === 'editor' ? (
          <Link
            to="/editor-admin"
            title={!tabletNavExpanded ? 'Админка редактора' : undefined}
            className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
              tabletNavExpanded ? 'px-4 py-3' : 'justify-center px-3 py-3'
            } ${
              isActive('/editor-admin')
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Shield size={19} strokeWidth={1.9} />
            {tabletNavExpanded ? <span>Админка редактора</span> : null}
          </Link>
        ) : null}

        {currentUser?.role === 'organization_admin' ? (
          <Link
            to="/org-admin"
            title={!tabletNavExpanded ? 'Админка организации' : undefined}
            className={`flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
              tabletNavExpanded ? 'px-4 py-3' : 'justify-center px-3 py-3'
            } ${
              isActive('/org-admin')
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Building size={19} strokeWidth={1.9} />
            {tabletNavExpanded ? <span>Админка организации</span> : null}
          </Link>
        ) : null}
      </nav>

      <div className="border-t border-slate-100 p-3">
        {currentUser ? (
          <div className={tabletNavExpanded ? 'space-y-3' : 'space-y-2'}>
            {tabletNavExpanded ? (
              <div className="px-2">
                <p className="truncate text-sm font-semibold text-slate-900">{currentUser.fullName}</p>
                <p className="text-xs text-slate-500">{roleLabel(currentUser)}</p>
              </div>
            ) : null}
            <Link
              to="/profile"
              title={!tabletNavExpanded ? 'Мой профиль' : undefined}
              className={`flex items-center gap-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 ${
                tabletNavExpanded ? 'px-4 py-3' : 'justify-center px-3 py-3'
              }`}
            >
              <User size={19} strokeWidth={1.9} />
              {tabletNavExpanded ? <span>Мой профиль</span> : null}
            </Link>
            <button
              onClick={handleLogout}
              title={!tabletNavExpanded ? 'Выйти' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 ${
                tabletNavExpanded ? 'px-4 py-3' : 'justify-center px-3 py-3'
              }`}
            >
              <LogOut size={19} strokeWidth={1.9} />
              {tabletNavExpanded ? <span>Выйти</span> : null}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              to="/login"
              title={!tabletNavExpanded ? 'Войти' : undefined}
              className={`flex items-center gap-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 ${
                tabletNavExpanded ? 'px-4 py-3' : 'justify-center px-3 py-3'
              }`}
            >
              <LogIn size={19} strokeWidth={1.9} />
              {tabletNavExpanded ? <span>Войти</span> : null}
            </Link>
            <Link
              to="/register"
              title={!tabletNavExpanded ? 'Регистрация' : undefined}
              className={`flex items-center gap-3 rounded-xl text-sm font-medium ${
                tabletNavExpanded
                  ? 'px-4 py-3 bg-blue-600 text-white hover:bg-blue-700'
                  : 'justify-center px-3 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              <UserPlus size={19} strokeWidth={1.9} />
              {tabletNavExpanded ? <span>Регистрация</span> : null}
            </Link>
          </div>
        )}
      </div>
    </aside>

    {mobileMoreOpen ? (
      <div className="fixed inset-x-3 bottom-24 z-50 md:hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-xl" data-header-menu>
        <div className="mb-2 flex items-center justify-between px-1">
          <p className="text-sm font-semibold text-slate-900">Меню</p>
          <button
            type="button"
            onClick={closeMenus}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Закрыть меню"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-1">
          {mobileMoreItems.map((item) => renderNavLink(item))}
          {currentUser ? (
            <>
              {currentUser.role === 'editor' ? (
                <Link
                  to="/editor-admin"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  <Shield size={19} strokeWidth={1.9} />
                  Админка редактора
                </Link>
              ) : null}
              <Link
                to="/profile"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <User size={19} strokeWidth={1.9} />
                Мой профиль
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={19} strokeWidth={1.9} />
                Выйти
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              >
                <LogIn size={19} strokeWidth={1.9} />
                Войти
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700"
              >
                <UserPlus size={19} strokeWidth={1.9} />
                Регистрация
              </Link>
            </>
          )}
        </div>
      </div>
    ) : null}

    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur md:hidden">
      <div className="grid h-20 grid-cols-5 px-2">
        {mobilePrimaryItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors ${
                active ? 'text-blue-700' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span
                className={`flex h-9 w-11 items-center justify-center rounded-2xl ${
                  active ? 'bg-blue-50' : 'bg-transparent'
                }`}
              >
                <Icon size={20} strokeWidth={1.9} />
              </span>
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          data-header-menu
          onClick={() => toggleMenu('mobileMore')}
          className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium transition-colors ${
            mobileMoreOpen || mobileMoreItems.some((item) => isActive(item.path))
              ? 'text-blue-700'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <span
            className={`flex h-9 w-11 items-center justify-center rounded-2xl ${
              mobileMoreOpen || mobileMoreItems.some((item) => isActive(item.path))
                ? 'bg-blue-50'
                : 'bg-transparent'
            }`}
          >
            <MoreHorizontal size={21} strokeWidth={1.9} />
          </span>
          <span>Ещё</span>
        </button>
      </div>
    </nav>
    </>
  );
}
