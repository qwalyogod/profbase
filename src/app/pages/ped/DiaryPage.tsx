import { useMemo, useRef, useState, useEffect } from 'react';
import { Search, Plus, Tag, Calendar, ChevronDown, BookOpen, X, Pencil, Trash2 } from 'lucide-react';
import { usePortal } from '../../state/PortalContext';
import { useUserState } from '../../lib/useUserState';
import { DiaryEntry, getDiarySeed, MONTHS_2026, formatEntryDate } from '../../data/cabinetSeed';

const moods = ['😊', '🙂', '😐', '😕', '😔'];
const emptyForm = { title: '', content: '', tags: '', mood: '🙂', date: '2026-04-01' };

export default function DiaryPage() {
  const { currentUser } = usePortal();
  const [entries, setEntries] = useUserState<DiaryEntry[]>('diary', (id) => getDiarySeed(id));

  const [selectedMonth, setSelectedMonth] = useState('2026-04');
  const [monthOpen, setMonthOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTag, setActiveTag] = useState('Все');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const monthRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (monthRef.current && !monthRef.current.contains(target)) setMonthOpen(false);
      if (searchRef.current && !searchRef.current.contains(target)) setSearchOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((entry) => entry.tags.forEach((tag) => set.add(tag)));
    return ['Все', ...Array.from(set)];
  }, [entries]);

  const monthLabel = MONTHS_2026.find((m) => m.value === selectedMonth)?.label ?? 'Месяц';

  const suggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return entries
      .filter((entry) =>
        [entry.title, entry.content, entry.tags.join(' ')].join(' ').toLowerCase().includes(query),
      )
      .slice(0, 6);
  }, [entries, search]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return entries
      .filter((entry) => entry.date.startsWith(selectedMonth))
      .filter((entry) => activeTag === 'Все' || entry.tags.includes(activeTag))
      .filter(
        (entry) =>
          !query ||
          [entry.title, entry.content, entry.tags.join(' ')].join(' ').toLowerCase().includes(query),
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, selectedMonth, activeTag, search]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, date: `${selectedMonth}-01` });
    setShowForm(true);
  };

  const openEdit = (entry: DiaryEntry) => {
    setEditingId(entry.id);
    setForm({ title: entry.title, content: entry.content, tags: entry.tags.join(', '), mood: entry.mood, date: entry.date });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (editingId) {
      setEntries((prev) => prev.map((e) => (e.id === editingId ? { ...e, title: form.title.trim(), content: form.content.trim(), tags, mood: form.mood, date: form.date } : e)));
    } else {
      setEntries((prev) => [{ id: `d-${Date.now()}`, title: form.title.trim(), content: form.content.trim(), tags, mood: form.mood, date: form.date }, ...prev]);
      if (form.date.slice(0, 7) !== selectedMonth && MONTHS_2026.some((m) => m.value === form.date.slice(0, 7))) {
        setSelectedMonth(form.date.slice(0, 7));
      }
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Удалить запись дневника?')) return;
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen size={20} className="text-amber-600" /> Личный дневник
        </h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors" style={{ background: '#7C3AED' }}>
          <Plus size={16} /> Новая запись
        </button>
      </div>

      {currentUser ? (
        <p className="text-sm text-slate-500">Дневник пользователя <span className="font-medium text-slate-700">{currentUser.fullName}</span>. Записи хранятся отдельно для каждого аккаунта.</p>
      ) : null}

      {/* Форма */}
      {showForm && (
        <div className="bg-white rounded-xl border border-purple-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">{editingId ? 'Редактировать запись' : 'Новая запись'}</h3>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-slate-700 w-16">Настрой</label>
              <div className="flex gap-2">
                {moods.map((m) => (
                  <button key={m} onClick={() => setForm({ ...form, mood: m })} className={`text-xl w-9 h-9 rounded-lg transition-all ${form.mood === m ? 'bg-purple-100 scale-110' : 'hover:bg-slate-50'}`}>{m}</button>
                ))}
              </div>
            </div>
            <input type="date" min="2026-04-01" max="2026-06-30" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Заголовок записи..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Что произошло сегодня? Ваши мысли и наблюдения..." rows={4} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Теги через запятую: 7А, Рефлексия..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 border border-slate-200">Отменить</button>
              <button onClick={handleSave} className="px-5 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7C3AED' }}>Сохранить</button>
            </div>
          </div>
        </div>
      )}

      {/* Поиск + переключатель месяца */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div ref={searchRef} className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            placeholder="Поиск по записям..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          {searchOpen && search.trim() && (
            <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
              {suggestions.length > 0 ? (
                suggestions.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => { setSelectedMonth(entry.date.slice(0, 7)); setExpandedId(entry.id); setSearchOpen(false); setSearch(''); }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-purple-50"
                  >
                    <span className="text-base">{entry.mood}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">{entry.title}</span>
                      <span className="block text-xs text-slate-400">{formatEntryDate(entry.date)}</span>
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500">Ничего не найдено</div>
              )}
            </div>
          )}
        </div>

        {/* Месяц — раскрываемый список в стиле проекта */}
        <div ref={monthRef} className="relative">
          <button
            type="button"
            onClick={() => setMonthOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 sm:w-48 hover:bg-slate-50"
          >
            <span className="flex items-center gap-2"><Calendar size={14} className="text-purple-500" /> {monthLabel}</span>
            <ChevronDown size={14} className={`text-slate-400 transition-transform ${monthOpen ? 'rotate-180' : ''}`} />
          </button>
          {monthOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:w-48">
              {MONTHS_2026.map((month) => {
                const count = entries.filter((e) => e.date.startsWith(month.value)).length;
                return (
                  <button
                    key={month.value}
                    type="button"
                    onClick={() => { setSelectedMonth(month.value); setMonthOpen(false); }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-purple-50 ${selectedMonth === month.value ? 'bg-purple-50 font-semibold text-purple-700' : 'text-slate-700'}`}
                  >
                    {month.label}
                    <span className="text-xs text-slate-400">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Теги */}
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTag === tag ? 'text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            style={activeTag === tag ? { background: '#7C3AED' } : {}}
          >
            {tag !== 'Все' && <Tag size={10} />} {tag}
          </button>
        ))}
      </div>

      {/* Записи */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <BookOpen size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Записей не найдено</p>
            <p className="text-slate-400 text-sm mt-1">Измените месяц/фильтры или создайте новую запись</p>
          </div>
        ) : (
          filtered.map((entry) => {
            const expanded = expandedId === entry.id;
            return (
              <div key={entry.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm transition-all">
                <button type="button" onClick={() => setExpandedId(expanded ? null : entry.id)} className="flex w-full items-start justify-between gap-4 text-left">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{entry.mood}</span>
                    <div>
                      <h3 className="font-semibold text-slate-900">{entry.title}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Calendar size={11} /> {formatEntryDate(entry.date)}</p>
                    </div>
                  </div>
                  <ChevronDown size={18} className={`mt-1 shrink-0 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
                <p className={`text-sm text-slate-600 leading-relaxed mt-3 ${expanded ? '' : 'line-clamp-2'}`}>{entry.content}</p>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">#{tag}</span>
                  ))}
                </div>
                {expanded && (
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                    <button onClick={() => openEdit(entry)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
                      <Pencil size={13} /> Редактировать
                    </button>
                    <button onClick={() => handleDelete(entry.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">
                      <Trash2 size={13} /> Удалить
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
