import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Plus, Settings, TrendingUp, Users, AlertCircle, CheckCircle2, Trash2, BookOpen } from 'lucide-react';
import { StateBlock } from '../../components/common/StateBlock';
import { usePortal } from '../../state/PortalContext';
import { useUserState } from '../../lib/useUserState';
import { getJournalSeed, JournalSeed, JournalLesson } from '../../data/cabinetSeed';

type GradeVal = string;
const NUMERIC = ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];

function keyFor(groupId: string, subjectId: string, period: string) {
  return `${groupId}:${subjectId}:${period}`;
}

function gradeColor(grade: string): string {
  const n = Number(grade);
  if (!n) return 'text-slate-700';
  if (n >= 8) return 'text-emerald-600';
  if (n >= 6) return 'text-lime-600';
  if (n >= 4) return 'text-amber-600';
  return 'text-red-600';
}

export default function JournalPage() {
  const { currentUser, currentMembership, database } = usePortal();
  const [journal, setJournal] = useUserState<JournalSeed>('journal', (id) => getJournalSeed(id));

  const [selectedGroupId, setSelectedGroupId] = useState(journal.groups[0]?.id ?? '');
  const [selectedSubjectId, setSelectedSubjectId] = useState(journal.subjects[0]?.id ?? '');
  const [selectedPeriod, setSelectedPeriod] = useState('IV четверть');
  const [setupOpen, setSetupOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newLesson, setNewLesson] = useState({ date: '', topic: '', homework: '' });
  const [setupForm, setSetupForm] = useState({ group: '', subject: '', period: 'IV четверть' });

  const activeTagIds = Array.from(new Set([...(currentUser?.specialtyTagIds ?? []), ...(currentMembership?.specialtyTagIds ?? [])]));
  const hasJournal = database.specialtyTags.filter((tag) => activeTagIds.includes(tag.id)).some((tag) => tag.features.journal);

  // Keep selections valid when the active user (and their journal) changes.
  useEffect(() => {
    if (journal.groups.length && !journal.groups.some((g) => g.id === selectedGroupId)) {
      setSelectedGroupId(journal.groups[0].id);
    }
    if (journal.subjects.length && !journal.subjects.some((s) => s.id === selectedSubjectId)) {
      setSelectedSubjectId(journal.subjects[0].id);
    }
  }, [journal, selectedGroupId, selectedSubjectId]);

  const selectedGroup = journal.groups.find((g) => g.id === selectedGroupId) ?? journal.groups[0];
  const selectedSubject = journal.subjects.find((s) => s.id === selectedSubjectId) ?? journal.subjects[0];
  const currentKey = selectedGroup && selectedSubject ? keyFor(selectedGroup.id, selectedSubject.id, selectedPeriod) : '';
  const lessons = (currentKey && journal.lessonsByKey[currentKey]) ?? [];

  const gradeAt = (student: string, lessonId: string): GradeVal => journal.grades[`${currentKey}:${student}:${lessonId}`] ?? '';

  const numericGrades = useMemo(() => {
    if (!selectedGroup) return [] as string[];
    return selectedGroup.students.flatMap((student) =>
      lessons.map((lesson) => gradeAt(student, lesson.id)).filter((g) => NUMERIC.includes(g)),
    );
  }, [journal.grades, lessons, selectedGroup, currentKey]);

  const totalAbsences = selectedGroup
    ? selectedGroup.students.reduce((sum, student) => sum + lessons.filter((lesson) => gradeAt(student, lesson.id) === 'н').length, 0)
    : 0;
  const average = numericGrades.length ? (numericGrades.reduce((s, g) => s + Number(g), 0) / numericGrades.length).toFixed(1) : '—';
  const quality = numericGrades.length ? Math.round((numericGrades.filter((g) => Number(g) >= 6).length / numericGrades.length) * 100) : 0;
  const absolute = numericGrades.length ? Math.round((numericGrades.filter((g) => Number(g) >= 3).length / numericGrades.length) * 100) : 0;
  const attendance = lessons.length && selectedGroup?.students.length
    ? Math.round(100 - (totalAbsences / (lessons.length * selectedGroup.students.length)) * 100)
    : 100;

  if (!hasJournal) {
    return (
      <StateBlock
        title="Журнал недоступен для текущей специальности"
        description="Администратор может включить журнал в настройках тега специальности и назначить этот тег участнику организации."
      />
    );
  }

  function setGrade(student: string, lessonId: string, value: GradeVal) {
    setJournal((prev) => ({ ...prev, grades: { ...prev.grades, [`${currentKey}:${student}:${lessonId}`]: value } }));
  }

  function periodGrade(student: string): string {
    const grades = lessons.map((lesson) => gradeAt(student, lesson.id)).filter((g) => NUMERIC.includes(g)).map(Number);
    if (!grades.length) return '—';
    return String(Math.round(grades.reduce((s, g) => s + g, 0) / grades.length));
  }

  function addStudent(event: FormEvent) {
    event.preventDefault();
    if (!newStudentName.trim() || !selectedGroup) return;
    setJournal((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === selectedGroup.id ? { ...g, students: [...g.students, newStudentName.trim()] } : g)),
    }));
    setNewStudentName('');
  }

  function deleteStudent(student: string) {
    if (!selectedGroup || !window.confirm(`Удалить ученика «${student}» из журнала?`)) return;
    setJournal((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => (g.id === selectedGroup.id ? { ...g, students: g.students.filter((s) => s !== student) } : g)),
    }));
  }

  function addLesson(event: FormEvent) {
    event.preventDefault();
    if (!newLesson.date.trim() || !currentKey) return;
    const parsed = new Date(newLesson.date);
    const display = !Number.isNaN(parsed.getTime()) ? `${String(parsed.getDate()).padStart(2, '0')}.${String(parsed.getMonth() + 1).padStart(2, '0')}` : newLesson.date.trim();
    const lesson: JournalLesson = { id: `l-${Date.now()}`, date: display, topic: newLesson.topic.trim(), homework: newLesson.homework.trim() || undefined };
    setJournal((prev) => ({ ...prev, lessonsByKey: { ...prev.lessonsByKey, [currentKey]: [...(prev.lessonsByKey[currentKey] ?? []), lesson] } }));
    setNewLesson({ date: '', topic: '', homework: '' });
  }

  function deleteLesson(lessonId: string) {
    if (!currentKey || !window.confirm('Удалить занятие и связанные оценки?')) return;
    setJournal((prev) => ({
      ...prev,
      lessonsByKey: { ...prev.lessonsByKey, [currentKey]: (prev.lessonsByKey[currentKey] ?? []).filter((l) => l.id !== lessonId) },
    }));
  }

  function addSetup(event: FormEvent) {
    event.preventDefault();
    if (!setupForm.group.trim() || !setupForm.subject.trim() || !setupForm.period.trim()) return;
    const group = { id: `g-${Date.now()}`, name: setupForm.group.trim(), students: [] as string[] };
    const subject = { id: `s-${Date.now()}`, name: setupForm.subject.trim() };
    setJournal((prev) => ({
      ...prev,
      groups: [...prev.groups, group],
      subjects: [...prev.subjects, subject],
      periods: Array.from(new Set([...prev.periods, setupForm.period.trim()])),
    }));
    setSelectedGroupId(group.id);
    setSelectedSubjectId(subject.id);
    setSelectedPeriod(setupForm.period.trim());
    setSetupForm({ group: '', subject: '', period: 'IV четверть' });
    setSetupOpen(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2"><BookOpen size={20} className="text-purple-600" /> Электронный журнал</h1>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
            {journal.groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
          </select>
          <select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
            {journal.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
            {journal.periods.map((period) => <option key={period}>{period}</option>)}
          </select>
        </div>
      </div>

      {currentUser ? (
        <p className="text-sm text-slate-500">Журнал пользователя <span className="font-medium text-slate-700">{currentUser.fullName}</span>. 10-балльная шкала Республики Беларусь.</p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          { icon: TrendingUp, label: 'Средний балл', value: average },
          { icon: CheckCircle2, label: 'Качественная', value: `${quality}%` },
          { icon: CheckCircle2, label: 'Абсолютная', value: `${absolute}%` },
          { icon: AlertCircle, label: 'Посещаемость', value: `${attendance}%` },
          { icon: Users, label: 'Занятий', value: String(lessons.length) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
            <Icon size={16} className="mb-2 text-blue-600" />
            <p className="text-lg font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900"><Settings size={16} /> Настройка</h2>
          <button type="button" onClick={() => setSetupOpen(true)} className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Добавить группу и предмет</button>
          <form onSubmit={addStudent} className="flex gap-2">
            <input value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Добавить ученика" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button className="rounded-lg bg-blue-600 px-3 text-white"><Plus size={15} /></button>
          </form>
          <form onSubmit={addLesson} className="space-y-2">
            <input type="date" value={newLesson.date} onChange={(e) => setNewLesson((p) => ({ ...p, date: e.target.value }))} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input value={newLesson.topic} onChange={(e) => setNewLesson((p) => ({ ...p, topic: e.target.value }))} placeholder="Тема занятия" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input value={newLesson.homework} onChange={(e) => setNewLesson((p) => ({ ...p, homework: e.target.value }))} placeholder="Домашнее задание" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Добавить занятие</button>
          </form>
          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Текущая связка</p>
            <p>{selectedGroup?.name ?? '—'} · {selectedSubject?.name ?? '—'} · {selectedPeriod}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white xl:col-span-3">
          <div className="border-b border-slate-100 px-5 py-3">
            <p className="font-semibold text-slate-900">{selectedGroup?.name ?? '—'} · {selectedSubject?.name ?? '—'} · {selectedPeriod}</p>
            <p className="text-xs text-slate-500">Оценки редактируются прямо в таблице. Для пропуска выберите «н». Наведите на дату занятия, чтобы увидеть тему и ДЗ.</p>
          </div>
          {!selectedGroup || selectedGroup.students.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-400">Добавьте учеников и занятия в блоке «Настройка», чтобы заполнить журнал.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="sticky left-0 z-10 bg-white px-4 py-3 text-left text-xs font-semibold text-slate-500">Ученик</th>
                    {lessons.map((lesson) => (
                      <th key={lesson.id} className="min-w-[88px] px-2 py-3 text-center text-xs font-semibold text-slate-500" title={`${lesson.topic || 'Занятие'}${lesson.homework ? ` · ДЗ: ${lesson.homework}` : ''}`}>
                        <div className="flex items-center justify-center gap-1">
                          <span>{lesson.date}</span>
                          <button onClick={() => deleteLesson(lesson.id)} className="text-slate-300 hover:text-red-500" title="Удалить занятие"><Trash2 size={11} /></button>
                        </div>
                        <span className="block truncate font-normal">{lesson.topic || 'Занятие'}</span>
                      </th>
                    ))}
                    <th className="bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-600">Средний</th>
                    <th className="bg-purple-50 px-3 py-3 text-xs font-semibold text-purple-700">Четверть</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGroup.students.map((student) => {
                    const rowGrades = lessons.map((lesson) => gradeAt(student, lesson.id)).filter((g) => NUMERIC.includes(g));
                    const rowAvg = rowGrades.length ? (rowGrades.reduce((s, g) => s + Number(g), 0) / rowGrades.length).toFixed(1) : '—';
                    return (
                      <tr key={student} className="border-b border-slate-50 group">
                        <td className="sticky left-0 bg-white px-4 py-2.5 text-sm font-medium text-slate-800">
                          <div className="flex items-center justify-between gap-2">
                            <span>{student}</span>
                            <button onClick={() => deleteStudent(student)} className="text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-500" title="Удалить ученика"><Trash2 size={12} /></button>
                          </div>
                        </td>
                        {lessons.map((lesson) => (
                          <td key={lesson.id} className="px-2 py-2 text-center">
                            <select
                              value={gradeAt(student, lesson.id)}
                              onChange={(e) => setGrade(student, lesson.id, e.target.value)}
                              className={`h-9 w-16 rounded-lg border border-slate-300 bg-white text-center text-sm font-semibold ${gradeColor(gradeAt(student, lesson.id))}`}
                            >
                              {['', ...NUMERIC, 'н'].map((grade) => <option key={grade} value={grade}>{grade || '—'}</option>)}
                            </select>
                          </td>
                        ))}
                        <td className="bg-slate-50 px-3 py-2 text-center text-sm font-bold text-blue-700">{rowAvg}</td>
                        <td className={`bg-purple-50 px-3 py-2 text-center text-sm font-bold ${gradeColor(periodGrade(student))}`}>{periodGrade(student)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {setupOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={addSetup} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Настроить журнал</h2>
              <button type="button" onClick={() => setSetupOpen(false)} className="text-slate-400 hover:text-slate-700">×</button>
            </div>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Группа/класс</span>
                <input value={setupForm.group} onChange={(e) => setSetupForm((p) => ({ ...p, group: e.target.value }))} placeholder="Например: 10Б" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Предмет</span>
                <input value={setupForm.subject} onChange={(e) => setSetupForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Например: Биология" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-slate-600">Период</span>
                <input value={setupForm.period} onChange={(e) => setSetupForm((p) => ({ ...p, period: e.target.value }))} placeholder="Например: I четверть" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="submit" className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">Создать связку</button>
              <button type="button" onClick={() => setSetupOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">Отмена</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
