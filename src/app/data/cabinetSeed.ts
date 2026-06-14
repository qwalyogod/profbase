// Per-user demo data for the pedagogical cabinet. Each account sees distinct
// diary entries, notes, calendar events and journal so the cabinet feels
// personal. Data spans April–June 2026 to support the diary month switcher.

export interface DiaryEntry {
  id: string;
  date: string; // ISO yyyy-mm-dd
  title: string;
  content: string;
  tags: string[];
  mood: string;
}

export interface CabinetNoteItem {
  text: string;
  done: boolean;
}

export interface CabinetNote {
  id: string;
  title: string;
  content: string;
  type: 'text' | 'checklist';
  tags: string[];
  color: string;
  pinned: boolean;
  date: string;
  link?: string;
  items?: CabinetNoteItem[];
}

export interface CalendarEvent {
  id: string;
  date: string; // ISO yyyy-mm-dd
  time: string;
  endTime: string;
  group: string;
  subject: string;
  topic: string;
  room: string;
  color: string;
  note?: string;
}

export interface JournalGroup {
  id: string;
  name: string;
  students: string[];
}

export interface JournalLesson {
  id: string;
  date: string;
  topic: string;
  homework?: string;
}

export interface JournalSeed {
  groups: JournalGroup[];
  subjects: { id: string; name: string }[];
  periods: string[];
  lessonsByKey: Record<string, JournalLesson[]>;
  grades: Record<string, string>;
}

export interface CabinetProfile {
  firstName: string;
  greetingName: string;
  subjectLabel: string;
  classesLabel: string;
  diary: DiaryEntry[];
  notes: CabinetNote[];
  events: CalendarEvent[];
  journal: JournalSeed;
}

const palette = ['#7C3AED', '#2563EB', '#059669', '#DC2626', '#D97706', '#EC4899'];

function emptyJournal(): JournalSeed {
  return { groups: [], subjects: [], periods: ['I четверть', 'II четверть', 'III четверть', 'IV четверть', 'Год'], lessonsByKey: {}, grades: {} };
}

// ─── Анна Сергеевна (математика) — основной демо-преподаватель ──────────────
const annaProfile: CabinetProfile = {
  firstName: 'Анна',
  greetingName: 'Анна Сергеевна',
  subjectLabel: 'Математика и алгебра',
  classesLabel: '7А · 8Б · 9В',
  diary: [
    { id: 'd-a1', date: '2026-04-01', title: 'Сложный урок в 8Б', content: 'Тема квадратных уравнений давалась классу трудно. Много вопросов по дискриминанту. На следующем уроке разберу методом «разбора ошибок» и визуальными схемами.', tags: ['8Б', 'Рефлексия', 'Методика'], mood: '😕' },
    { id: 'd-a2', date: '2026-04-08', title: 'Успех в 9В — теорема Пифагора', content: 'Ребята сами вывели доказательство через площади квадратов. Дискуссия была живой. Надо закрепить этот формат.', tags: ['9В', 'Успех', 'Методика'], mood: '😊' },
    { id: 'd-a3', date: '2026-04-21', title: 'Разговор с родителем Иванова М.', content: 'Обсудили дополнительные задания и индивидуальные консультации по средам. Родитель отнёсся позитивно.', tags: ['7А', 'Родители'], mood: '🙂' },
    { id: 'd-a4', date: '2026-05-06', title: 'Открытый урок', content: 'Провела открытый урок по функциям для методобъединения. Получила хорошую обратную связь от завуча.', tags: ['8Б', 'Открытый урок'], mood: '😊' },
    { id: 'd-a5', date: '2026-05-19', title: 'Подготовка к контрольной', content: 'Составила варианты итоговой контрольной для 7А. Нужно добавить задачи на повторение процентов.', tags: ['7А', 'Контроль'], mood: '😐' },
    { id: 'd-a6', date: '2026-06-02', title: 'Итоги четверти', content: 'Выставила годовые отметки. Качество знаний выросло по сравнению с прошлым годом. Отдельно отметила прогресс в 9В.', tags: ['Итоги', 'Год'], mood: '😊' },
    { id: 'd-a7', date: '2026-06-10', title: 'Планы на следующий год', content: 'Набросала идеи по проектной работе и геймификации для 8-х классов на сентябрь.', tags: ['Планы', 'Методика'], mood: '🙂' },
  ],
  notes: [
    { id: 'n-a1', title: 'Идеи для урока по теореме Пифагора', type: 'text', content: 'Показать визуальное доказательство через квадраты. Использовать интерактивную доску. Дать задачи из архитектуры.', tags: ['9В', 'Методика'], color: '#EFF6FF', pinned: true, date: '2026-04-01' },
    { id: 'n-a2', title: 'Чек-лист: родительское собрание', type: 'checklist', content: '', tags: ['7А', 'Родители'], color: '#F0FDF4', pinned: true, date: '2026-04-10', items: [
      { text: 'Подготовить статистику успеваемости', done: true },
      { text: 'Распечатать табели', done: true },
      { text: 'Записать вопросы для обсуждения', done: false },
      { text: 'Подготовить список рекомендаций', done: false },
    ] },
    { id: 'n-a3', title: 'Напоминание: сдать журнал', type: 'text', content: 'Журнал сдать до конца четверти. Проверить все оценки и пропуски.', tags: ['Срочно', 'Отчёт'], color: '#FFF7ED', pinned: false, date: '2026-05-30' },
    { id: 'n-a4', title: 'Полезный ресурс — задачи по геометрии', type: 'text', content: 'Сайт с интерактивными задачами для подготовки.', tags: ['9В', 'Ресурс'], color: '#F5F3FF', pinned: false, date: '2026-05-12', link: 'geometry.edu.by/tasks' },
  ],
  events: [
    { id: 'e-a1', date: '2026-04-06', time: '08:00', endTime: '08:45', group: '7А', subject: 'Математика', topic: 'Линейные уравнения', room: '214', color: palette[0] },
    { id: 'e-a2', date: '2026-04-06', time: '09:45', endTime: '10:30', group: '8Б', subject: 'Алгебра', topic: 'Квадратные уравнения', room: '214', color: palette[1] },
    { id: 'e-a3', date: '2026-04-07', time: '11:30', endTime: '12:15', group: '9В', subject: 'Геометрия', topic: 'Теорема Пифагора', room: '215', color: palette[2] },
    { id: 'e-a4', date: '2026-05-13', time: '08:00', endTime: '08:45', group: '7А', subject: 'Математика', topic: 'Проценты', room: '214', color: palette[0] },
    { id: 'e-a5', date: '2026-06-03', time: '10:35', endTime: '11:20', group: '9В', subject: 'Геометрия', topic: 'Итоговое повторение', room: '215', color: palette[3] },
  ],
  journal: {
    groups: [
      { id: 'g-7a', name: '7А', students: ['Алексеев Д.', 'Борисова М.', 'Васильев К.', 'Гончарова А.', 'Дмитриев Р.', 'Ковалёва Н.'] },
      { id: 'g-8b', name: '8Б', students: ['Ефимова С.', 'Жуков П.', 'Зайцева Т.', 'Иванов М.', 'Козлова О.', 'Лебедев А.'] },
      { id: 'g-9v', name: '9В', students: ['Морозов И.', 'Новикова Е.', 'Орлов С.', 'Павлова Д.', 'Романов Г.'] },
    ],
    subjects: [
      { id: 's-math', name: 'Математика' },
      { id: 's-algebra', name: 'Алгебра' },
      { id: 's-geom', name: 'Геометрия' },
    ],
    periods: ['I четверть', 'II четверть', 'III четверть', 'IV четверть', 'Год'],
    lessonsByKey: {
      'g-7a:s-math:IV четверть': [
        { id: 'l-1', date: '01.04', topic: 'Линейные уравнения' },
        { id: 'l-2', date: '08.04', topic: 'Задачи на уравнения' },
        { id: 'l-3', date: '15.04', topic: 'Проценты' },
        { id: 'l-4', date: '22.04', topic: 'Контрольная работа' },
        { id: 'l-5', date: '06.05', topic: 'Работа над ошибками' },
      ],
    },
    grades: {},
  },
};

// ─── Козлова Марина (информатика) ───────────────────────────────────────────
const kozlovaProfile: CabinetProfile = {
  firstName: 'Марина',
  greetingName: 'Марина Николаевна',
  subjectLabel: 'Информатика',
  classesLabel: '8А · 9А · 10Б',
  diary: [
    { id: 'd-k1', date: '2026-04-03', title: 'Первый урок по алгоритмам', content: 'Ввела блок-схемы. Ученики 8А быстро поняли ветвления, но циклы вызвали трудности.', tags: ['8А', 'Алгоритмы'], mood: '🙂' },
    { id: 'd-k2', date: '2026-04-17', title: 'Практика по Python', content: 'Первая практическая на ПК. Часть учеников опережает программу — дала им дополнительные задачи.', tags: ['9А', 'Практика'], mood: '😊' },
    { id: 'd-k3', date: '2026-05-12', title: 'Проектная неделя', content: 'Запустили мини-проекты: калькуляторы и игры. Высокая вовлечённость в 10Б.', tags: ['10Б', 'Проект'], mood: '😊' },
    { id: 'd-k4', date: '2026-06-04', title: 'Защита проектов', content: 'Ребята защитили проекты. Несколько работ отправим на конкурс.', tags: ['10Б', 'Итоги'], mood: '😊' },
  ],
  notes: [
    { id: 'n-k1', title: 'Идея: соревнование по алгоритмам', type: 'text', content: 'Организовать брейн-ринг по алгоритмам между 9А и 10Б.', tags: ['9А', 'Идея'], color: '#EFF6FF', pinned: true, date: '2026-04-15' },
    { id: 'n-k2', title: 'Чек-лист: кабинет информатики', type: 'checklist', content: '', tags: ['Кабинет'], color: '#F0FDF4', pinned: false, date: '2026-05-05', items: [
      { text: 'Проверить ПК', done: true },
      { text: 'Обновить ПО', done: false },
      { text: 'Подготовить раздаточный материал', done: false },
    ] },
  ],
  events: [
    { id: 'e-k1', date: '2026-04-07', time: '09:00', endTime: '09:45', group: '8А', subject: 'Информатика', topic: 'Алгоритмы и блок-схемы', room: '301', color: palette[1] },
    { id: 'e-k2', date: '2026-05-14', time: '10:00', endTime: '10:45', group: '9А', subject: 'Информатика', topic: 'Python: циклы', room: '301', color: palette[2] },
    { id: 'e-k3', date: '2026-06-05', time: '11:00', endTime: '11:45', group: '10Б', subject: 'Информатика', topic: 'Защита проектов', room: '301', color: palette[4] },
  ],
  journal: {
    groups: [
      { id: 'g-8a', name: '8А', students: ['Антонов В.', 'Белова К.', 'Громов Д.', 'Дроздова Л.', 'Егоров П.'] },
      { id: 'g-10b', name: '10Б', students: ['Зуева М.', 'Ильин Р.', 'Кузнецов А.', 'Лазарева Т.', 'Минин С.'] },
    ],
    subjects: [{ id: 's-inf', name: 'Информатика' }],
    periods: ['I четверть', 'II четверть', 'III четверть', 'IV четверть', 'Год'],
    lessonsByKey: {
      'g-8a:s-inf:IV четверть': [
        { id: 'lk-1', date: '03.04', topic: 'Алгоритмы' },
        { id: 'lk-2', date: '10.04', topic: 'Ветвления' },
        { id: 'lk-3', date: '17.04', topic: 'Циклы' },
        { id: 'lk-4', date: '24.04', topic: 'Практическая' },
      ],
    },
    grades: {},
  },
};

// ─── Петрова Ирина (математика, администратор организации) ───────────────────
const petrovaProfile: CabinetProfile = {
  firstName: 'Ирина',
  greetingName: 'Ирина Викторовна',
  subjectLabel: 'Математика',
  classesLabel: '10А · 11А',
  diary: [
    { id: 'd-p1', date: '2026-04-05', title: 'Подготовка к ЦТ', content: 'Начали интенсив по подготовке к ЦТ с 11А. Разобрали типовые задачи части B.', tags: ['11А', 'ЦТ'], mood: '🙂' },
    { id: 'd-p2', date: '2026-05-09', title: 'Методический совет', content: 'Провела методсовет по обновлению КТП. Распределили нагрузку на следующий год.', tags: ['Администрация'], mood: '😐' },
    { id: 'd-p3', date: '2026-06-01', title: 'Анализ результатов', content: 'Проанализировала результаты пробного ЦТ. Средний балл вырос. Сильные результаты у 11А.', tags: ['11А', 'Итоги'], mood: '😊' },
  ],
  notes: [
    { id: 'n-p1', title: 'Распределение нагрузки', type: 'text', content: 'Согласовать часы и кабинеты с завучем до 20 числа.', tags: ['Администрация', 'Срочно'], color: '#FFF7ED', pinned: true, date: '2026-05-10' },
  ],
  events: [
    { id: 'e-p1', date: '2026-04-08', time: '08:00', endTime: '08:45', group: '11А', subject: 'Математика', topic: 'Подготовка к ЦТ', room: '210', color: palette[0] },
    { id: 'e-p2', date: '2026-05-20', time: '09:00', endTime: '09:45', group: '10А', subject: 'Математика', topic: 'Производная', room: '210', color: palette[1] },
  ],
  journal: {
    groups: [
      { id: 'g-11a', name: '11А', students: ['Авдеев К.', 'Беляева М.', 'Власов Д.', 'Гусева А.', 'Денисов Р.'] },
    ],
    subjects: [{ id: 's-math', name: 'Математика' }],
    periods: ['I четверть', 'II четверть', 'III четверть', 'IV четверть', 'Год'],
    lessonsByKey: {
      'g-11a:s-math:IV четверть': [
        { id: 'lp-1', date: '05.04', topic: 'Тригонометрия' },
        { id: 'lp-2', date: '12.04', topic: 'Производная' },
        { id: 'lp-3', date: '19.04', topic: 'Пробный ЦТ' },
      ],
    },
    grades: {},
  },
};

// ─── Общий специалист (Белов) — без журнала ─────────────────────────────────
const belovProfile: CabinetProfile = {
  firstName: 'Андрей',
  greetingName: 'Андрей Романович',
  subjectLabel: 'Специалист организации',
  classesLabel: 'Проектная работа',
  diary: [
    { id: 'd-b1', date: '2026-04-09', title: 'Адаптация на новом месте', content: 'Познакомился с коллективом и регламентами. Составил план задач на месяц.', tags: ['Адаптация'], mood: '🙂' },
    { id: 'd-b2', date: '2026-05-15', title: 'Рабочая встреча', content: 'Обсудили цели отдела на квартал и распределили ответственность.', tags: ['Команда'], mood: '😐' },
    { id: 'd-b3', date: '2026-06-08', title: 'Промежуточные итоги', content: 'Подвёл промежуточные итоги по задачам. Большая часть выполнена в срок.', tags: ['Итоги'], mood: '😊' },
  ],
  notes: [
    { id: 'n-b1', title: 'Список задач недели', type: 'checklist', content: '', tags: ['Задачи'], color: '#EFF6FF', pinned: true, date: '2026-05-04', items: [
      { text: 'Подготовить отчёт', done: true },
      { text: 'Согласовать документы', done: false },
      { text: 'Запланировать встречу', done: false },
    ] },
  ],
  events: [
    { id: 'e-b1', date: '2026-04-10', time: '10:00', endTime: '11:00', group: 'Отдел', subject: 'Планёрка', topic: 'Задачи на неделю', room: 'Онлайн', color: palette[1] },
    { id: 'e-b2', date: '2026-05-22', time: '14:00', endTime: '15:00', group: 'Команда', subject: 'Встреча', topic: 'Промежуточные итоги', room: '12', color: palette[2] },
  ],
  journal: emptyJournal(),
};

const profilesById: Record<string, CabinetProfile> = {
  'u-teacher-approved': annaProfile,
  'u-teacher-pending': kozlovaProfile,
  'u-org-admin': petrovaProfile,
  'u-user': belovProfile,
};

function defaultProfile(userId: string): CabinetProfile {
  return {
    firstName: 'Коллега',
    greetingName: 'Коллега',
    subjectLabel: 'Кабинет специалиста',
    classesLabel: '—',
    diary: [
      { id: `d-${userId}-1`, date: '2026-04-12', title: 'Старт работы в кабинете', content: 'Это ваш личный дневник. Записывайте наблюдения, идеи и рефлексию по рабочим дням.', tags: ['Старт'], mood: '🙂' },
      { id: `d-${userId}-2`, date: '2026-05-12', title: 'Заметка о неделе', content: 'Опишите, что удалось и что хотелось бы улучшить.', tags: ['Рефлексия'], mood: '😐' },
    ],
    notes: [
      { id: `n-${userId}-1`, title: 'Моя первая заметка', type: 'text', content: 'Здесь можно хранить идеи, ссылки и списки дел.', tags: ['Общее'], color: '#EFF6FF', pinned: false, date: '2026-04-12' },
    ],
    events: [
      { id: `e-${userId}-1`, date: '2026-04-13', time: '09:00', endTime: '10:00', group: 'Личное', subject: 'Планирование', topic: 'Цели на неделю', room: '—', color: palette[1] },
    ],
    journal: emptyJournal(),
  };
}

export function getCabinetProfile(userId: string): CabinetProfile {
  return profilesById[userId] ?? defaultProfile(userId);
}

export function getDiarySeed(userId: string): DiaryEntry[] {
  return getCabinetProfile(userId).diary;
}

export function getNotesSeed(userId: string): CabinetNote[] {
  return getCabinetProfile(userId).notes;
}

export function getCalendarSeed(userId: string): CalendarEvent[] {
  return getCabinetProfile(userId).events;
}

export function getJournalSeed(userId: string): JournalSeed {
  return getCabinetProfile(userId).journal;
}

export const MONTHS_2026 = [
  { value: '2026-04', label: 'Апрель 2026' },
  { value: '2026-05', label: 'Май 2026' },
  { value: '2026-06', label: 'Июнь 2026' },
];

export function formatEntryDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
}
