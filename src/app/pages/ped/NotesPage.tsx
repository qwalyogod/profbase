import { useMemo, useState } from 'react';
import { Search, Plus, X, Tag, Pin, Link2, CheckSquare, Square, Pencil, Trash2 } from 'lucide-react';
import { usePortal } from '../../state/PortalContext';
import { useUserState } from '../../lib/useUserState';
import { CabinetNote, getNotesSeed } from '../../data/cabinetSeed';

const noteColors = ['#FFFBF0', '#EFF6FF', '#F0FDF4', '#FFF7ED', '#F5F3FF', '#FFF0F3'];

export default function NotesPage() {
  const { currentUser } = usePortal();
  const [notes, setNotes] = useUserState<CabinetNote[]>('notes', (id) => getNotesSeed(id));
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('Все');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', content: '', tags: '', color: noteColors[0] });

  const tagFilters = useMemo(() => {
    const set = new Set<string>();
    notes.forEach((note) => note.tags.forEach((tag) => set.add(tag)));
    return ['Все', ...Array.from(set)];
  }, [notes]);

  const filtered = notes.filter((note) => {
    const matchSearch = !search || note.title.toLowerCase().includes(search.toLowerCase()) || note.content.toLowerCase().includes(search.toLowerCase());
    const matchTag = activeTag === 'Все' || note.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  const pinned = filtered.filter((n) => n.pinned);
  const regular = filtered.filter((n) => !n.pinned);

  const toggleItem = (noteId: string, itemIdx: number) => {
    setNotes((prev) => prev.map((n) => {
      if (n.id !== noteId || !n.items) return n;
      return { ...n, items: n.items.map((item, i) => (i === itemIdx ? { ...item, done: !item.done } : item)) };
    }));
  };

  const togglePin = (noteId: string) => {
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n)));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ title: '', content: '', tags: '', color: noteColors[0] });
    setShowForm(true);
  };

  const openEdit = (note: CabinetNote) => {
    setEditingId(note.id);
    setForm({ title: note.title, content: note.content, tags: note.tags.join(', '), color: note.color || noteColors[0] });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (editingId) {
      setNotes((prev) => prev.map((n) => (n.id === editingId ? { ...n, title: form.title.trim(), content: form.content.trim(), tags: tags.length ? tags : n.tags, color: form.color } : n)));
    } else {
      setNotes((prev) => [{ id: `n-${Date.now()}`, title: form.title.trim(), content: form.content.trim(), type: 'text', tags: tags.length ? tags : ['Общее'], color: form.color, pinned: false, date: new Date().toISOString().slice(0, 10) }, ...prev]);
    }
    setShowForm(false);
    setEditingId(null);
    setForm({ title: '', content: '', tags: '', color: noteColors[0] });
  };

  const handleDelete = (noteId: string) => {
    if (!window.confirm('Удалить заметку?')) return;
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const NoteCard = ({ note }: { note: CabinetNote }) => (
    <div className="rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-all" style={{ background: note.color || 'white' }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-slate-900 text-sm">{note.title}</h3>
        <button onClick={() => togglePin(note.id)} title={note.pinned ? 'Открепить' : 'Закрепить'} className={`shrink-0 ${note.pinned ? 'text-orange-400' : 'text-slate-300 hover:text-orange-400'}`}>
          <Pin size={13} />
        </button>
      </div>

      {note.type === 'checklist' && note.items ? (
        <div className="space-y-1.5 mb-3">
          {note.items.map((item, i) => (
            <button key={i} onClick={() => toggleItem(note.id, i)} className="flex items-start gap-2 w-full text-left">
              {item.done ? <CheckSquare size={14} className="text-green-500 mt-0.5 shrink-0" /> : <Square size={14} className="text-slate-300 mt-0.5 shrink-0" />}
              <span className={`text-xs ${item.done ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.text}</span>
            </button>
          ))}
          <p className="text-xs text-slate-400 mt-1">{note.items.filter((i) => i.done).length}/{note.items.length} выполнено</p>
        </div>
      ) : (
        <p className="text-xs text-slate-600 leading-relaxed mb-3 whitespace-pre-line">{note.content}</p>
      )}

      {note.link && (
        <a href={`https://${note.link}`} className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-2">
          <Link2 size={11} /> {note.link}
        </a>
      )}

      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-wrap gap-1">
          {note.tags.map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/60 text-slate-600 border border-slate-200/60">{t}</span>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => openEdit(note)} className="rounded-md p-1 text-slate-400 hover:bg-white/60 hover:text-slate-700" title="Редактировать"><Pencil size={13} /></button>
          <button onClick={() => handleDelete(note.id)} className="rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500" title="Удалить"><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Заметки</h1>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7C3AED' }}>
          <Plus size={16} /> Заметка
        </button>
      </div>

      {currentUser ? (
        <p className="text-sm text-slate-500">Личные заметки пользователя <span className="font-medium text-slate-700">{currentUser.fullName}</span>.</p>
      ) : null}

      {showForm && (
        <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5">
          <div className="flex justify-between mb-3">
            <h3 className="font-semibold text-slate-900">{editingId ? 'Редактировать заметку' : 'Новая заметка'}</h3>
            <button onClick={() => setShowForm(false)}><X size={16} className="text-slate-400" /></button>
          </div>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Заголовок..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
          <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Текст заметки..." rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
          <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="Теги через запятую..." className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-purple-400" />
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs text-slate-500">Цвет:</span>
            {noteColors.map((c) => (
              <button key={c} onClick={() => setForm({ ...form, color: c })} className={`h-6 w-6 rounded-full border ${form.color === c ? 'ring-2 ring-purple-400 ring-offset-1' : 'border-slate-200'}`} style={{ background: c }} />
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-slate-600 border border-slate-200">Отмена</button>
            <button onClick={handleSave} className="px-5 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7C3AED' }}>Сохранить</button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск заметок..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tagFilters.map((tag) => (
          <button key={tag} onClick={() => setActiveTag(tag)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTag === tag ? 'text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`} style={activeTag === tag ? { background: '#7C3AED' } : {}}>
            {tag !== 'Все' && <Tag size={10} />} {tag}
          </button>
        ))}
      </div>

      {pinned.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-1.5"><Pin size={12} /> Закреплённые</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {pinned.map((n) => <NoteCard key={n.id} note={n} />)}
          </div>
        </div>
      )}

      {regular.length > 0 && (
        <div>
          {pinned.length > 0 && <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Остальные</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {regular.map((n) => <NoteCard key={n.id} note={n} />)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-slate-400">Заметок не найдено</p>
        </div>
      )}
    </div>
  );
}
