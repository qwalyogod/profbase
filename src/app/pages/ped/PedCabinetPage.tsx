import { Link } from 'react-router';
import {
  Calendar, FileText, BookOpen, TrendingUp, Plus, Users, BookMarked, Clock,
} from 'lucide-react';
import { usePortal } from '../../state/PortalContext';
import { useUserState } from '../../lib/useUserState';
import {
  CabinetNote, CalendarEvent, DiaryEntry, JournalSeed,
  getCabinetProfile, getCalendarSeed, getNotesSeed, getDiarySeed, getJournalSeed, formatEntryDate,
} from '../../data/cabinetSeed';

const NUMERIC = ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];

export default function PedCabinetPage() {
  const { currentUser, currentMembership, database } = usePortal();
  const [events] = useUserState<CalendarEvent[]>('calendar', (id) => getCalendarSeed(id));
  const [notes] = useUserState<CabinetNote[]>('notes', (id) => getNotesSeed(id));
  const [diary] = useUserState<DiaryEntry[]>('diary', (id) => getDiarySeed(id));
  const [journal] = useUserState<JournalSeed>('journal', (id) => getJournalSeed(id));

  const profile = getCabinetProfile(currentUser?.id ?? 'guest');
  const greetingName = currentUser?.fullName ?? profile.greetingName;
  const today = new Date();
  const todayLabel = today.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
  const todayIso = today.toISOString().slice(0, 10);

  const activeTagIds = Array.from(new Set([...(currentUser?.specialtyTagIds ?? []), ...(currentMembership?.specialtyTagIds ?? [])]));
  const hasJournal = database.specialtyTags.filter((tag) => activeTagIds.includes(tag.id)).some((tag) => tag.features.journal);

  const sortedEvents = [...events].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`));
  const upcoming = sortedEvents.filter((e) => e.date >= todayIso);
  const shownEvents = (upcoming.length ? upcoming : sortedEvents.slice(-4)).slice(0, 4);

  const recentNotes = notes.slice(0, 3);
  const recentDiary = [...diary].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 2);

  const studentsTotal = journal.groups.reduce((sum, g) => sum + g.students.length, 0);
  const journalStats = journal.groups.map((group) => {
    const entries = Object.entries(journal.grades).filter(([key]) => key.startsWith(`${group.id}:`));
    const nums = entries.map(([, v]) => v).filter((v) => NUMERIC.includes(v)).map(Number);
    const avg = nums.length ? Number((nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(1)) : 0;
    const absences = entries.filter(([, v]) => v === 'н').length;
    return { class: group.name, avg, absences, students: group.students.length };
  });

  const stats = [
    { label: 'Ближайших занятий', value: String(shownEvents.length), icon: BookOpen, color: '#7C3AED', bg: '#F5F3FF' },
    { label: hasJournal ? 'Учеников' : 'Записей дневника', value: String(hasJournal ? studentsTotal : diary.length), icon: Users, color: '#2563EB', bg: '#EFF6FF' },
    { label: 'Заметок', value: String(notes.length), icon: FileText, color: '#059669', bg: '#ECFDF5' },
    { label: 'Записей в дневнике', value: String(diary.length), icon: BookOpen, color: '#D97706', bg: '#FFFBEB' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <p className="text-purple-200 text-sm mb-1">Сегодня: {todayLabel}</p>
        <h1 className="text-xl font-bold mb-1">Добро пожаловать, {greetingName}!</h1>
        <p className="text-purple-100 text-sm">
          {profile.subjectLabel} · {shownEvents.length} ближайших событий · {notes.length} заметок
        </p>

        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: 'Создать событие', icon: Plus, path: '/ped/calendar' },
            { label: 'Новая заметка', icon: Plus, path: '/ped/notes' },
            { label: 'Открыть журнал', icon: BookMarked, path: '/ped/journal' },
          ].filter((item) => hasJournal || item.path !== '/ped/journal').map(({ label, icon: Icon, path }) => (
            <Link key={label} to={path} className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-lg text-sm transition-colors">
              <Icon size={14} /> {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ближайшие события */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Calendar size={16} className="text-purple-600" /> Ближайшие занятия</h2>
            <Link to="/ped/calendar" className="text-xs text-blue-600 hover:underline">Открыть →</Link>
          </div>
          {shownEvents.length === 0 ? (
            <p className="text-sm text-slate-400">Событий пока нет. Добавьте их в календаре.</p>
          ) : (
            <div className="space-y-2">
              {shownEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                  <div className="text-center shrink-0 w-12">
                    <p className="text-sm font-bold text-slate-600">{event.time}</p>
                    <p className="text-xs text-slate-400">{event.room || '—'}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{event.subject}{event.group ? ` · ${event.group}` : ''}</p>
                    <p className="text-xs text-slate-500 truncate flex items-center gap-1"><Clock size={10} /> {formatEntryDate(event.date)} · {event.topic}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Статистика по классам */}
        {hasJournal && journalStats.length > 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2"><TrendingUp size={16} className="text-blue-600" /> Статистика по классам</h2>
              <Link to="/ped/journal" className="text-xs text-blue-600 hover:underline">Журнал →</Link>
            </div>
            <div className="space-y-3">
              {journalStats.map((j) => (
                <div key={j.class} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 shrink-0">{j.class}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-600">{j.students} учеников</span>
                      <span className="font-medium" style={{ color: j.avg >= 8 ? '#059669' : j.avg >= 6 ? '#D97706' : j.avg ? '#DC2626' : '#94A3B8' }}>{j.avg ? `ср. ${j.avg}` : 'нет оценок'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(j.avg / 10) * 100}%`, background: j.avg >= 8 ? '#059669' : '#D97706' }} />
                    </div>
                  </div>
                  <div className="text-xs text-right shrink-0"><p className="text-slate-400">{j.absences} н</p></div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Последние заметки */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2"><FileText size={16} className="text-green-600" /> Последние заметки</h2>
            <Link to="/ped/notes" className="text-xs text-blue-600 hover:underline">Все →</Link>
          </div>
          {recentNotes.length === 0 ? (
            <p className="text-sm text-slate-400">Заметок пока нет.</p>
          ) : (
            <div className="space-y-2">
              {recentNotes.map((note) => (
                <div key={note.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{note.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {note.tags.slice(0, 2).map((t) => <span key={t} className="text-xs text-slate-400">#{t}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link to="/ped/notes" className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline mt-3"><Plus size={12} /> Создать заметку</Link>
        </div>

        {/* Дневник */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2"><BookOpen size={16} className="text-amber-600" /> Последние записи дневника</h2>
            <Link to="/ped/diary" className="text-xs text-blue-600 hover:underline">Дневник →</Link>
          </div>
          {recentDiary.length === 0 ? (
            <p className="text-sm text-slate-400">Записей пока нет.</p>
          ) : (
            <div className="space-y-3">
              {recentDiary.map((entry) => (
                <div key={entry.id} className="p-3 rounded-xl border border-slate-100 hover:border-amber-200 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-slate-900">{entry.mood} {entry.title}</p>
                    <span className="text-xs text-slate-400">{formatEntryDate(entry.date)}</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{entry.content}</p>
                </div>
              ))}
            </div>
          )}
          <Link to="/ped/diary" className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline mt-3"><Plus size={12} /> Новая запись</Link>
        </div>
      </div>
    </div>
  );
}
