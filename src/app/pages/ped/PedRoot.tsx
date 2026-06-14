import { Outlet, Link, useLocation } from 'react-router';
import { BookOpen, Calendar, FileText, BookMarked, LayoutDashboard, GraduationCap } from 'lucide-react';
import { usePortal } from '../../state/PortalContext';
import { StateBlock } from '../../components/common/StateBlock';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Кабинет', path: '/ped' },
  { icon: BookOpen, label: 'Дневник', path: '/ped/diary', feature: 'diary' },
  { icon: Calendar, label: 'Календарь', path: '/ped/calendar', feature: 'calendar' },
  { icon: FileText, label: 'Заметки', path: '/ped/notes', feature: 'notes' },
  { icon: BookMarked, label: 'Журнал', path: '/ped/journal', feature: 'journal' },
  { icon: FileText, label: 'Документы', path: '/ped/documents', feature: 'documents' },
];

export default function PedRoot() {
  const location = useLocation();
  const { currentUser, currentMembership, database } = usePortal();

  const activeTagIds = Array.from(new Set([...(currentUser?.specialtyTagIds ?? []), ...(currentMembership?.specialtyTagIds ?? [])]));
  const activeTags = database.specialtyTags.filter((tag) => activeTagIds.includes(tag.id));
  const enabledFeatures = activeTags.reduce<Record<string, boolean>>((features, tag) => {
    Object.entries(tag.features).forEach(([key, enabled]) => {
      features[key] = features[key] || enabled;
    });
    return features;
  }, {});

  const visibleSidebarItems = sidebarItems.filter((item) => !item.feature || enabledFeatures[item.feature]);
  const currentRouteItem = sidebarItems.find((item) => item.feature && location.pathname.startsWith(item.path));
  const blockedFeature = currentRouteItem?.feature && !enabledFeatures[currentRouteItem.feature] ? currentRouteItem : null;

  const isActive = (path: string) => {
    if (path === '/ped') return location.pathname === '/ped';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-6 text-sm text-slate-500">
        <Link to="/" className="hover:text-blue-600">Главная</Link>
        <span>/</span>
        <div className="flex items-center gap-1.5">
          <GraduationCap size={14} className="text-purple-600" />
          <span className="text-slate-800 font-medium">Профессиональный кабинет</span>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="hidden md:flex flex-col w-52 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 p-3 sticky top-24">
            <div className="px-3 py-2 mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Мой кабинет</p>
            </div>
            <nav className="space-y-1">
              {visibleSidebarItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive(item.path)
                      ? 'bg-purple-50 text-purple-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon size={16} className={isActive(item.path) ? 'text-purple-600' : 'text-slate-400'} />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-slate-100 px-3 py-2">
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs font-medium text-purple-800">{currentUser?.fullName ?? 'Пользователь'}</p>
                <p className="text-xs text-purple-600">
                  {activeTags.map((tag) => tag.name).join(', ') || 'Без специальности'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="md:hidden w-full mb-4 flex gap-2 overflow-x-auto pb-2">
          {visibleSidebarItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                isActive(item.path)
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <item.icon size={14} />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex-1 min-w-0">
          {blockedFeature ? (
            <StateBlock
              title="Раздел недоступен для вашей специальности"
              description={`Функция «${blockedFeature.label}» не включена в назначенных вам тегах специальности. Администратор организации может изменить доступ в настройках участников.`}
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Link
                    to="/ped"
                    className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    В кабинет
                  </Link>
                  <Link
                    to="/organization"
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Моя организация
                  </Link>
                </div>
              }
            />
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
}
