import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Search, BookOpen, Briefcase, AlertTriangle, GraduationCap,
  ArrowRight, TrendingUp, FileText, Users, ChevronRight, Star,
  Clock, Eye, Bookmark, Newspaper, Shield, CheckCircle, Bell,
  Map as MapIcon
} from 'lucide-react';
import { usePortal } from '../state/PortalContext';
import { articles as knowledgeArticles } from './KnowledgeBasePage';

const quickLinks = [
  {
    icon: Newspaper,
    label: 'Новости',
    desc: 'Общие публикации и материалы редакции',
    path: '/news',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    icon: Briefcase,
    label: 'Рекомендации по трудоустройству',
    desc: 'Пошаговый план действий для первого трудоустройства',
    path: '/employment',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    icon: AlertTriangle,
    label: 'Центр инцидентов',
    desc: 'Алгоритмы действий в типовых ситуациях',
    path: '/incidents',
    color: '#D97706',
    bg: '#FFFBEB',
  },
  {
    icon: BookOpen,
    label: 'База знаний',
    desc: 'Справочные статьи и материалы',
    path: '/knowledge',
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    icon: MapIcon,
    label: 'Карта портала',
    desc: 'Все разделы, роли и маршрут первого знакомства',
    path: '/sitemap',
    color: '#0F766E',
    bg: '#CCFBF1',
  },
  {
    icon: GraduationCap,
    label: 'Педагогический кабинет',
    desc: 'Дневник, журнал, планирование, шаблоны',
    path: '/ped',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
];

const popularTopics = [
  'Трудовой договор', 'Должностная инструкция', 'Молодой специалист', 'Распределение',
  'Медосмотр', 'Пробный срок', 'Отпуск', 'Больничный лист', 'Охрана труда', 'КТП',
  'ПКОП', 'Буллинг', 'Трудовые права', 'Аттестация',
];

const feedArticles = [
  {
    id: 1, title: 'Какие документы нужны при первом трудоустройстве',
    category: 'Трудоустройство', time: '5 мин', views: 1240, tag: 'Новичок',
    tagColor: '#2563EB', updated: '28 мар 2026',
  },
  {
    id: 2, title: 'Права молодого специалиста по распределению',
    category: 'Правовой раздел', time: '8 мин', views: 876, tag: 'Право',
    tagColor: '#7C3AED', updated: '25 мар 2026',
  },
  {
    id: 3, title: 'Как составить КТП: пошаговое руководство',
    category: 'Педагогика', time: '12 мин', views: 2100, tag: 'Педагогика',
    tagColor: '#059669', updated: '20 мар 2026',
  },
  {
    id: 4, title: 'Конфликт с родителями: алгоритм действий',
    category: 'Инциденты', time: '6 мин', views: 1580, tag: 'Инцидент',
    tagColor: '#D97706', updated: '18 мар 2026',
  },
  {
    id: 5, title: 'Медицинский осмотр при приеме на работу',
    category: 'Трудоустройство', time: '4 мин', views: 940, tag: 'Новичок',
    tagColor: '#2563EB', updated: '15 мар 2026',
  },
  {
    id: 6, title: 'Охрана труда в образовательном учреждении',
    category: 'База знаний', time: '10 мин', views: 560, tag: 'Практика',
    tagColor: '#0891B2', updated: '10 мар 2026',
  },
];



const forPedagogs = [
  { icon: FileText, label: 'Шаблоны планов уроков', count: '48 шаблонов' },
  { icon: TrendingUp, label: 'Электронный журнал', count: 'Ведение оценок' },
  { icon: BookOpen, label: 'Библиотека КТП', count: '36 документов' },
  { icon: Users, label: 'Методические материалы', count: '124 статьи' },
];

const moduleSuggestions = [
  { title: 'Новости редакции', subtitle: 'Общие публикации и материалы', path: '/news', keywords: 'новости редакция публикации материалы' },
  { title: 'База знаний', subtitle: 'Статьи, теги, избранное', path: '/knowledge', keywords: 'база знаний статьи теги избранное' },
  { title: 'Трудоустройство', subtitle: 'Чек-лист документов и первых шагов', path: '/employment', keywords: 'трудоустройство документы медосмотр договор молодой специалист' },
  { title: 'Трудовой кодекс и документы', subtitle: 'Оглавление и правовые источники', path: '/labor-code', keywords: 'трудовой кодекс право статьи оглавление нпа' },
  { title: 'Центр инцидентов', subtitle: 'Алгоритмы действий в сложных ситуациях', path: '/incidents', keywords: 'инцидент конфликт травма буллинг родители администрация' },
  { title: 'Педагогический кабинет', subtitle: 'Дневник, календарь, журнал, заметки', path: '/ped', keywords: 'педагог кабинет дневник календарь журнал заметки ктп' },
  { title: 'Организация', subtitle: 'Invite-код, документы и локальные правила', path: '/organization', keywords: 'организация группа invite код документы локальные правила' },
  { title: 'Карта сайта', subtitle: 'Все разделы, доступы и маршрут новичка', path: '/sitemap', keywords: 'карта сайта навигация разделы роли доступ новичок' },
];

export default function HomePage() {
  const { currentUser, database } = usePortal();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const navigate = useNavigate();
  const isGuest = !currentUser;

  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const articleSuggestions = knowledgeArticles.map((article) => ({
      title: article.title,
      subtitle: `${article.category}, ${article.tags.join(', ')}`,
      path: `/knowledge?q=${encodeURIComponent(article.title)}`,
      keywords: `${article.title} ${article.category} ${article.tags.join(' ')} ${article.content.replace(/<[^>]+>/g, ' ')}`,
    }));

    const newsSuggestions = database.news
      .filter((article) => currentUser || article.isPublic)
      .map((article) => ({
        title: article.title,
        subtitle: `${article.category}, ${article.specialization ?? 'общая'}`,
        path: `/news/${article.id}`,
        keywords: `${article.title} ${article.summary} ${article.tags.join(' ')} ${article.category}`,
      }));

    return [...moduleSuggestions, ...articleSuggestions, ...newsSuggestions]
      .filter((item) => item.keywords.toLowerCase().includes(q) || item.title.toLowerCase().includes(q))
      .slice(0, 8);
  }, [currentUser, database.news, searchQuery]);

  const latestNews = useMemo(() => {
    return [...database.news]
      .filter((article) => currentUser || article.isPublic)
      .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt))
      .slice(0, 3);
  }, [currentUser, database.news]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      if (searchSuggestions[0]) {
        navigate(searchSuggestions[0].path);
      } else {
        navigate(`/knowledge?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleTagClick = (tag: string) => {
    navigate(`/knowledge?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #3730A3 50%, #1D4ED8 100%)' }} className="text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
          {/* Welcome badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm mb-6 backdrop-blur-sm">
            <Bell size={14} />
            <span>
              {isGuest
                ? 'Гостевой режим: новости, часть базы знаний и правовое оглавление'
                : `Добро пожаловать, ${currentUser.fullName}`}
            </span>
            <ChevronRight size={14} />
          </div>

          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight text-white">
              {isGuest ? 'ПрофБаза: знакомство с системой' : 'ПрофБаза: ваш помощник'}
              <br />
              <span style={{ color: '#93C5FD' }}>
                {isGuest ? 'для молодых специалистов' : 'на первых шагах в профессии'}
              </span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl">
              {isGuest
                ? 'Посмотрите общие новости, открытые материалы и правовое оглавление. Персональные разделы откроются после регистрации.'
                : 'Централизованная база знаний, рекомендации по трудоустройству, центр инцидентов и инструменты для педагогов в одном месте.'}
            </p>

            {/* Search */}
            <div className="relative max-w-xl">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                    placeholder="Поиск по порталу: статьи, документы, новости..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl text-slate-900 text-sm focus:outline-none"
                    style={{ background: 'white' }}
                  />
                </div>
                <button type="submit" className="px-5 py-3.5 rounded-xl font-medium text-sm transition-colors" style={{ background: '#F59E0B', color: '#1C1917' }}>
                  Найти
                </button>
              </form>
              {searchFocused && searchQuery.trim() ? (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-200 overflow-hidden z-20">
                  {searchSuggestions.length > 0 ? (
                    searchSuggestions.map((item) => (
                      <button
                        key={`${item.path}-${item.title}`}
                        onMouseDown={(event) => {
                          event.preventDefault();
                          navigate(item.path);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-start gap-3"
                      >
                        <Search size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <span>
                          <span className="block text-sm font-semibold text-slate-900">{item.title}</span>
                          <span className="block text-xs text-slate-500 mt-0.5">{item.subtitle}</span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-slate-500">Ничего не найдено. Попробуйте другой запрос.</div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-2 mt-4 text-xs text-blue-200">
              <span>Часто ищут:</span>
              {['Трудовой договор', 'Молодой специалист', 'КТП', 'Инцидент с родителем'].map(t => (
                <button 
                  key={t} 
                  onClick={() => handleTagClick(t)}
                  className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guest/public state or onboarding progress */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          {isGuest ? (
            <>
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-blue-600" />
                <span className="text-sm text-blue-800 font-medium">Открыто для гостя: новости, часть материалов, правовое оглавление</span>
              </div>
              <Link to="/register" className="text-xs font-medium text-blue-700 flex items-center gap-1 hover:underline">
                Создать аккаунт <ArrowRight size={12} />
              </Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <CheckCircle size={16} className="text-blue-600" />
                <span className="text-sm text-blue-800 font-medium">Первое знакомство: настройте профиль, организацию, специальность, документы и избранное</span>
                <div className="hidden sm:flex w-40 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: '60%', background: '#2563EB' }} />
                </div>
                <span className="text-xs text-blue-600">6 шагов</span>
              </div>
              <Link to="/onboarding" className="text-xs font-medium text-blue-700 flex items-center gap-1 hover:underline">
                Открыть чек-лист <ArrowRight size={12} />
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-14">
        {/* Quick links */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Быстрый доступ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all flex flex-col gap-3"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: item.bg }}>
                  <item.icon size={22} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">{item.label}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium mt-auto" style={{ color: item.color }}>
                  Перейти <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Последние новости</h2>
              <p className="text-sm text-slate-500 mt-1">Общие материалы и публикации по специализациям</p>
            </div>
            <Link to="/news" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
              Все новости <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {latestNews.map((article) => (
              <Link
                key={article.id}
                to={`/news/${article.id}`}
                className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                    {article.category}
                  </span>
                  <span className="text-xs text-slate-400">{article.publishedAt}</span>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm leading-snug">{article.title}</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">{article.summary}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Feed + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Рекомендуемые материалы</h2>
              <Link to="/knowledge" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                Все материалы <ChevronRight size={14} />
              </Link>
            </div>

            <div className="space-y-3">
              {feedArticles.map((article) => (
                <Link 
                  key={article.id} 
                  to={`/knowledge?id=${article.id}`}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 transition-all flex gap-4 block cursor-pointer group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ color: article.tagColor, background: article.tagColor + '15' }}>
                        {article.tag}
                      </span>
                      <span className="text-xs text-slate-400">{article.category}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 group-hover:text-blue-700 transition-colors">{article.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={11} />{article.time}</span>
                      <span className="flex items-center gap-1"><Eye size={11} />{article.views.toLocaleString('ru')}</span>
                      <span>Обновлено {article.updated}</span>
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-blue-500 transition-colors shrink-0 self-start">
                    <Bookmark size={18} />
                  </button>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular topics */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <Star size={16} className="text-yellow-500" />
                Популярные темы
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTopics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleTagClick(topic)}
                    className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 mb-4">Статистика портала</h3>
              <div className="space-y-3">
                {[
                  { label: 'Статей в базе знаний', value: '1 248', color: '#2563EB' },
                  { label: 'Сценариев инцидентов', value: '94', color: '#D97706' },
                  { label: 'Шаблонов документов', value: '312', color: '#059669' },
                  { label: 'Организаций', value: '187', color: '#7C3AED' },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{s.label}</span>
                    <span className="text-sm font-semibold" style={{ color: s.color }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>



        {/* For pedagogues */}
        <section className="rounded-2xl p-8 sm:p-10" style={{ background: 'linear-gradient(135deg, #F5F3FF, #EFF6FF)' }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <GraduationCap size={22} className="text-purple-600" />
                Для педагогов
              </h2>
              <p className="text-sm text-slate-600 mt-1">Специальный раздел с инструментами для работы учителя</p>
            </div>
            <Link to="/ped" className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors" style={{ background: '#7C3AED' }}>
              Открыть кабинет <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {forPedagogs.map((item) => (
              <div key={item.label} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <item.icon size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.count}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Legal disclaimer banner */}
        <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-xl p-5">
          <Shield size={20} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Важная информация</p>
            <p className="text-sm text-amber-800 mt-1">
              Материалы портала носят исключительно справочный и информационный характер. За официальным толкованием и применением
              норм законодательства обращайтесь к первоисточникам и компетентным органам.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
