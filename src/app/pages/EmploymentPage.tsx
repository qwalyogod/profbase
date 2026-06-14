import { Link } from 'react-router';
import {
  CheckCircle, Circle, Shield, Download, ExternalLink,
  ChevronRight, AlertTriangle, FileText, Stethoscope, Star, Info
} from 'lucide-react';
import { useUserState } from '../lib/useUserState';

type CheckItem = { id: string; label: string; done: boolean; note?: string };

const initialDocs: CheckItem[] = [
  { id: 'd1', label: 'Паспорт гражданина РБ, ID-карта или вид на жительство', done: true },
  { id: 'd2', label: 'Трудовая книжка, если она уже оформлялась', done: true },
  { id: 'd3', label: 'Документы воинского учета для военнообязанных', done: true },
  { id: 'd4', label: 'Документ об образовании (диплом)', done: false },
  { id: 'd5', label: 'Направление на работу или справка о самостоятельном трудоустройстве', done: false, note: 'Для выпускников по распределению' },
  { id: 'd6', label: 'Медицинская справка о состоянии здоровья', done: false, note: 'Если требуется по должности' },
  { id: 'd7', label: 'Справка об отсутствии судимости (для пед. работников)', done: false, note: 'Запрашивается в порядке, установленном законодательством' },
  { id: 'd8', label: 'Иные документы только если они прямо предусмотрены законодательством РБ', done: false },
];

const firstSteps: CheckItem[] = [
  { id: 's1', label: 'Ознакомиться с должностной инструкцией под подпись', done: false },
  { id: 's2', label: 'Пройти инструктаж по охране труда', done: false },
  { id: 's3', label: 'Ознакомиться с локальными нормативными актами', done: false },
  { id: 's4', label: 'Получить расписание / план работы', done: false },
  { id: 's5', label: 'Пройти вводный инструктаж о внутреннем распорядке', done: false },
  { id: 's6', label: 'Получить корпоративный email и доступы', done: false },
];

function CheckList({ items, onToggle }: { items: CheckItem[]; onToggle: (id: string) => void }) {
  const done = items.filter(i => i.done).length;
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${(done / items.length) * 100}%` }} />
        </div>
        <span className="text-xs text-slate-500 whitespace-nowrap">{done}/{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
          >
            <div className="mt-0.5 shrink-0">
              {item.done
                ? <CheckCircle size={18} className="text-green-500" />
                : <Circle size={18} className="text-slate-300" />
              }
            </div>
            <div>
              <span className={`text-sm ${item.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>{item.label}</span>
              {item.note && <p className="text-xs text-amber-600 mt-0.5">{item.note}</p>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EmploymentPage() {
  const [docs, setDocs] = useUserState<CheckItem[]>('employment-docs', initialDocs);
  const [steps, setSteps] = useUserState<CheckItem[]>('employment-steps', firstSteps);

  const toggle = (list: CheckItem[], setList: (v: CheckItem[]) => void) => (id: string) => {
    setList(list.map(i => i.id === id ? { ...i, done: !i.done } : i));
  };

  const totalDone = [...docs, ...steps].filter(i => i.done).length;
  const totalItems = docs.length + steps.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Главная</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800">Рекомендации по трудоустройству</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Рекомендации по трудоустройству</h1>
          <p className="text-slate-500 mt-1">Персональный список шагов для молодого специалиста. Нажмите на пункт, чтобы отметить выполненным.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap">
          <Download size={16} />
          Скачать PDF
        </button>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <Shield size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Справочный характер информации</p>
          <p className="text-sm text-amber-800 mt-0.5">
            Материалы носят справочный характер. За официальным толкованием и применением норм обращайтесь к правовым актам и компетентным органам.
            Законодательство Республики Беларусь может изменяться — проверяйте актуальность данных на pravo.by и сайтах компетентных органов.
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900">Общий прогресс</h2>
          <span className="text-sm font-bold text-blue-600">{Math.round((totalDone / totalItems) * 100)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${(totalDone / totalItems) * 100}%`, background: 'linear-gradient(90deg, #2563EB, #4F46E5)' }}
          />
        </div>
        <p className="text-xs text-slate-500">Выполнено {totalDone} из {totalItems} пунктов</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stage 1: Documents */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Этап 1: Документы при приёме</h2>
                <p className="text-xs text-slate-500">Подготовьте все документы заранее</p>
              </div>
            </div>
            <CheckList items={docs} onToggle={toggle(docs, setDocs)} />
          </div>

          {/* Stage 2: Young specialist */}
          <div className="bg-white rounded-xl border border-blue-200 p-6" style={{ background: 'linear-gradient(135deg, #F0F9FF, white)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                <Star size={18} className="text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Для молодого специалиста по распределению</h2>
                <p className="text-xs text-blue-600">Дополнительные шаги для выпускников</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon: '📄', text: 'Получить направление на работу или справку о самостоятельном трудоустройстве' },
                { icon: '🏢', text: 'Передать направление нанимателю и уточнить дату начала работы' },
                { icon: '💰', text: 'Уточнить выплаты и гарантии молодому специалисту по локальным документам организации' },
                { icon: '🏠', text: 'Узнать о поддержке молодых специалистов в регионе и организации' },
                { icon: '📋', text: 'Ознакомиться с условиями обязательной работы по распределению и возможностями перераспределения' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-sm text-slate-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stage 3: Medical exam */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                <Stethoscope size={18} className="text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Этап 2: Медицинский осмотр</h2>
                <p className="text-xs text-slate-500">Обязателен до начала трудовой деятельности</p>
              </div>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">Для педагогических работников медосмотр проводится по требованиям законодательства Республики Беларусь и локальных документов организации.</p>
            </div>
            <div className="space-y-2">
              {[
                'Терапевт (общий осмотр)',
                'Психиатрическое освидетельствование',
                'Нарколог',
                'Флюорография',
                'Клинический анализ крови',
                'Профилактические прививки по календарю Республики Беларусь, если они требуются для должности',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-700 py-1.5 border-b border-slate-50 last:border-0">
                  <CheckCircle size={14} className="text-green-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Stage 4: First steps */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                <CheckCircle size={18} className="text-purple-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">Этап 3: Первые шаги после трудоустройства</h2>
                <p className="text-xs text-slate-500">Важные действия в первые дни работы</p>
              </div>
            </div>
            <CheckList items={steps} onToggle={toggle(steps, setSteps)} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Stages */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Этапы трудоустройства</h3>
            <div className="space-y-2">
              {[
                ['1', 'Подготовка документов', '#2563EB'],
                ['2', 'Медицинский осмотр', '#059669'],
                ['3', 'Оформление трудового договора или контракта', '#7C3AED'],
                ['4', 'Знакомство с организацией', '#D97706'],
                ['5', 'Начало работы', '#0891B2'],
              ].map(([num, label, color]) => (
                <div key={num} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold shrink-0" style={{ background: color }}>
                    {num}
                  </div>
                  <span className="text-sm text-slate-700">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Official sources */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ExternalLink size={16} className="text-blue-600" />
              Официальные источники
            </h3>
            <div className="space-y-2">
              {[
                { label: 'Трудовой кодекс РБ', note: 'pravo.by', href: 'https://pravo.by/document/?guid=3871&p0=hk9900296' },
                { label: 'Кодекс об образовании РБ', note: 'pravo.by', href: 'https://pravo.by/document/?guid=3871&p0=hk1100243' },
                { label: 'Минтруда и соцзащиты РБ', note: 'mintrud.gov.by', href: 'https://mintrud.gov.by/' },
                { label: 'Минобразования РБ', note: 'edu.gov.by', href: 'https://edu.gov.by/' },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="flex items-start gap-2 p-2.5 rounded-lg hover:bg-blue-50 transition-colors">
                  <ExternalLink size={13} className="text-blue-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">{s.label}</p>
                    <p className="text-xs text-slate-400">{s.note}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-800">
              Обратитесь в раздел <Link to="/knowledge" className="underline font-medium">Базы знаний</Link> за подробными статьями по каждому этапу трудоустройства.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
