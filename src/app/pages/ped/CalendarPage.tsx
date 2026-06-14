import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Users, BookOpen, Pencil, Trash2, MapPin } from 'lucide-react';
import { usePortal } from '../../state/PortalContext';
import { useUserState } from '../../lib/useUserState';
import { CalendarEvent, getCalendarSeed } from '../../data/cabinetSeed';

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const eventColors = ['#7C3AED', '#2563EB', '#059669', '#DC2626', '#D97706', '#EC4899'];

const pad = (n: number) => String(n).padStart(2, '0');
const isoFor = (year: number, month: number, day: number) => `${year}-${pad(month + 1)}-${pad(day)}`;
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
};

const emptyEvent = { id: '', date: '2026-04-01', time: '09:00', endTime: '09:45', group: '', subject: '', topic: '', room: '', note: '', color: eventColors[0] };

export default function CalendarPage() {
  const { currentUser } = usePortal();
  const [events, setEvents] = useUserState<CalendarEvent[]>('calendar', (id) => getCalendarSeed(id));

  const [currentMonth, setCurrentMonth] = useState(3); // April
  const [currentYear, setCurrentYear] = useState(2026);
  const [selectedDate, setSelectedDate] = useState('2026-04-06');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyEvent);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
  const monthPrefix = `${currentYear}-${pad(currentMonth + 1)}`;

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    events.forEach((event) => {
      (map[event.date] ??= []).push(event);
    });
    Object.values(map).forEach((list) => list.sort((a, b) => a.time.localeCompare(b.time)));
    return map;
  }, [events]);

  const selectedEvents = (eventsByDate[selectedDate] ?? []).slice();

  const changeMonth = (delta: number) => {
    let m = currentMonth + delta;
    let y = currentYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setCurrentMonth(m);
    setCurrentYear(y);
  };

  const openCreate = (date?: string) => {
    setForm({ ...emptyEvent, date: date ?? selectedDate, color: eventColors[Math.floor(Math.random() * eventColors.length)] });
    setShowModal(true);
  };

  const openEdit = (event: CalendarEvent) => {
    setForm({ ...emptyEvent, ...event, note: event.note ?? '' });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.subject.trim() && !form.topic.trim()) return;
    if (form.id) {
      setEvents((prev) => prev.map((e) => (e.id === form.id ? { ...form } : e)));
    } else {
      setEvents((prev) => [...prev, { ...form, id: `e-${Date.now()}` }]);
    }
    setSelectedDate(form.date);
    if (form.date.slice(0, 7) !== monthPrefix) {
      const [y, m] = form.date.split('-');
      setCurrentYear(Number(y));
      setCurrentMonth(Number(m) - 1);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Удалить событие?')) return;
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen size={20} className="text-purple-600" /> Календарь
        </h1>
        <button onClick={() => openCreate()} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white" style={{ background: '#7C3AED' }}>
          <Plus size={16} /> Добавить событие
        </button>
      </div>

      {currentUser ? (
        <p className="text-sm text-slate-500">Личный календарь пользователя <span className="font-medium text-slate-700">{currentUser.fullName}</span>.</p>
      ) : null}

      <div className="flex items-center gap-2">
        <button onClick={() => changeMonth(-1)} className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"><ChevronLeft size={14} /></button>
        <span className="text-sm font-medium text-slate-800 capitalize min-w-36 text-center">{monthName}</span>
        <button onClick={() => changeMonth(1)} className="w-8 h-8 rounded-lg border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50"><ChevronRight size={14} /></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* Сетка месяца */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-100">
            {weekDays.map((d) => (
              <div key={d} className="py-3 text-center text-xs font-semibold text-slate-400 uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} className="border-r border-b border-slate-50 min-h-[84px] bg-slate-50/50" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const iso = isoFor(currentYear, currentMonth, day);
              const dayEvents = eventsByDate[iso] ?? [];
              const isSelected = iso === selectedDate;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDate(iso)}
                  className={`border-r border-b border-slate-100 min-h-[84px] p-2 text-left transition-colors hover:bg-slate-50 ${isSelected ? 'bg-purple-50/60 ring-1 ring-inset ring-purple-200' : ''}`}
                >
                  <p className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isSelected ? 'bg-purple-600 text-white' : 'text-slate-700'}`}>{day}</p>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map((e) => (
                      <div key={e.id} className="text-[11px] px-1.5 py-0.5 rounded truncate text-white" style={{ background: e.color }}>{e.time} {e.group}</div>
                    ))}
                    {dayEvents.length > 2 && <p className="text-[11px] text-slate-400">+{dayEvents.length - 2}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* События выбранного дня */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">
              {new Date(selectedDate).toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
            </h2>
            <button onClick={() => openCreate(selectedDate)} className="inline-flex items-center gap-1 text-xs font-medium text-purple-700 hover:underline"><Plus size={13} /> Событие</button>
          </div>
          {selectedEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">На этот день событий нет</div>
          ) : (
            selectedEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: event.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900">{event.subject || 'Событие'}{event.group ? ` — ${event.group}` : ''}</p>
                    {event.topic ? <p className="text-sm text-slate-600 mt-0.5">{event.topic}</p> : null}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><Clock size={11} />{event.time}–{event.endTime}</span>
                      {event.group ? <span className="flex items-center gap-1"><Users size={11} />{event.group}</span> : null}
                      {event.room ? <span className="flex items-center gap-1"><MapPin size={11} />{event.room}</span> : null}
                    </div>
                    {event.note ? <p className="mt-2 text-xs text-slate-500">{event.note}</p> : null}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <button onClick={() => openEdit(event)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700" title="Редактировать"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(event.id)} className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500" title="Удалить"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Модалка добавления/редактирования */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900">{form.id ? 'Редактировать событие' : 'Добавить событие'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Дата</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Начало</label>
                  <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">Конец</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
              </div>
              {[
                { key: 'group', label: 'Группа/участники', placeholder: 'Команда, 7А, отдел' },
                { key: 'subject', label: 'Направление', placeholder: 'Встреча, занятие, предмет' },
                { key: 'topic', label: 'Тема события', placeholder: 'Планирование, консультация' },
                { key: 'room', label: 'Место', placeholder: 'Кабинет 214 или онлайн' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">{label}</label>
                  <input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Заметка</label>
                <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} placeholder="Цели, задачи или комментарий..." className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Цвет:</span>
                {eventColors.map((c) => (
                  <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} className={`h-6 w-6 rounded-full ${form.color === c ? 'ring-2 ring-offset-1 ring-slate-400' : ''}`} style={{ background: c }} />
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">Отмена</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: '#7C3AED' }}>Сохранить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
