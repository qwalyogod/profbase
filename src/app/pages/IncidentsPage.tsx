import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  Edit3,
  FileText,
  Plus,
  Search,
  Shield,
  Trash2,
  Upload,
} from 'lucide-react';
import { canManageNews } from '../lib/portalHelpers';
import { usePortal } from '../state/PortalContext';
import type { Incident, IncidentLevel, IncidentOwner } from '../types/portal';

type IncidentForm = Omit<Incident, 'id' | 'createdAt'>;

const emptyForm: IncidentForm = {
  title: '',
  category: 'Коммуникация',
  level: 'Средний',
  audience: 'Все специальности',
  summary: '',
  firstSteps: '',
  documents: '',
  owner: 'Редакция',
};

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function IncidentsPage() {
  const { currentUser, currentOrganization, database, createIncident, updateIncident, deleteIncident } = usePortal();
  const incidents = database.incidents;
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<IncidentForm>(emptyForm);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Все категории');
  const [level, setLevel] = useState('Все уровни');

  const canEdit = canManageNews(currentUser) || currentUser?.role === 'organization_admin';
  const selectedIncident = incidents.find((incident) => incident.id === selectedId) ?? null;
  const categories = ['Все категории', ...Array.from(new Set(incidents.map((incident) => incident.category)))];
  const filteredIncidents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return incidents.filter((incident) => {
      const bySearch =
        !query ||
        [incident.title, incident.summary, incident.category, incident.audience, incident.firstSteps]
          .join(' ')
          .toLowerCase()
          .includes(query);
      const byCategory = category === 'Все категории' || incident.category === category;
      const byLevel = level === 'Все уровни' || incident.level === level;
      return bySearch && byCategory && byLevel;
    });
  }, [category, incidents, level, search]);

  function startCreate() {
    setForm({
      ...emptyForm,
      owner: (currentUser?.role === 'organization_admin' ? 'Организация' : 'Редакция') as IncidentOwner,
      audience: currentOrganization?.shortName ?? 'Все специальности',
    });
    setEditingId('new');
    setSelectedId(null);
  }

  function startEdit(incident: Incident) {
    const { id: _id, createdAt: _ca, ...payload } = incident;
    setForm(payload);
    setEditingId(incident.id);
  }

  async function handleAttachment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const attachmentUrl = await readFileAsDataUrl(file);
    setForm((prev) => ({ ...prev, attachmentName: file.name, attachmentUrl }));
    event.target.value = '';
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.summary.trim()) return;

    if (editingId === 'new') {
      await createIncident({ ...form, title: form.title.trim(), summary: form.summary.trim() });
    } else if (typeof editingId === 'string') {
      await updateIncident(editingId, { ...form, title: form.title.trim(), summary: form.summary.trim() });
    }
    setEditingId(null);
  }

  const levelConfig: Record<IncidentLevel, { color: string; bg: string; border: string; label: string }> = {
    'Низкий': { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-300', label: 'Информационный' },
    'Средний': { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-300', label: 'Требует внимания' },
    'Высокий': { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-300', label: 'Критический' },
  };

  const stepsArray = form.firstSteps.split(';').map(s => s.trim()).filter(Boolean);
  const docsArray = form.documents.split(',').map(s => s.trim()).filter(Boolean);

  if (editingId !== null) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => setEditingId(null)} className="mb-5 inline-flex items-center gap-2 text-sm text-blue-700 hover:underline">
          <ArrowLeft size={15} /> Назад
        </button>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4">
            <h1 className="text-xl font-bold text-slate-900">{editingId === 'new' ? 'Новый инцидент' : 'Редактирование инцидента'}</h1>
            <p className="text-sm text-slate-500 mt-1">Заполните карточку инцидента — она поможет сотрудникам быстро сориентироваться в сложной ситуации</p>
          </div>

          <div className="p-6 space-y-5">
            <input
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Название инцидента"
              className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-3 text-xl font-bold text-slate-900 placeholder:text-slate-300 focus:border-red-500 focus:outline-none"
            />

            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Уровень критичности</p>
              <div className="grid grid-cols-3 gap-3">
                {(['Низкий', 'Средний', 'Высокий'] as IncidentLevel[]).map(lvl => {
                  const cfg = levelConfig[lvl];
                  const active = form.level === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, level: lvl }))}
                      className={`rounded-xl border-2 p-3 text-left transition-all ${active ? `${cfg.border} ${cfg.bg}` : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${lvl === 'Низкий' ? 'bg-emerald-500' : lvl === 'Средний' ? 'bg-amber-500' : 'bg-red-500'}`} />
                        <span className={`text-sm font-semibold ${active ? cfg.color : 'text-slate-700'}`}>{lvl}</span>
                      </div>
                      <p className={`mt-1 text-xs ${active ? cfg.color : 'text-slate-400'}`}>{cfg.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Категория</span>
                <input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} placeholder="Коммуникация, Безопасность..." className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Аудитория</span>
                <input value={form.audience} onChange={(event) => setForm((prev) => ({ ...prev, audience: event.target.value }))} placeholder="Все специальности" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
            </div>

            <label className="space-y-1 block">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Описание ситуации</span>
              <textarea value={form.summary} onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))} rows={3} placeholder="Опишите тип ситуации и при каких обстоятельствах она может произойти" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-relaxed" />
            </label>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Первые шаги</p>
                <p className="text-xs text-slate-500">Разделяйте шаги точкой с запятой (;) — каждый станет отдельным пунктом</p>
              </div>
              <textarea
                value={form.firstSteps}
                onChange={(event) => setForm((prev) => ({ ...prev, firstSteps: event.target.value }))}
                rows={4}
                placeholder="Сохранить спокойствие; Зафиксировать дату и суть; Сообщить руководителю; Предложить письменный формат"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed"
              />
              {stepsArray.length > 0 ? (
                <div className="space-y-1.5">
                  {stepsArray.map((step, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-lg bg-white px-3 py-2 border border-slate-100">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">{i + 1}</span>
                      <span className="text-sm text-slate-700">{step}</span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">Необходимые документы</p>
                <p className="text-xs text-slate-500">Разделяйте через запятую — каждый документ станет отдельным пунктом чек-листа</p>
              </div>
              <textarea
                value={form.documents}
                onChange={(event) => setForm((prev) => ({ ...prev, documents: event.target.value }))}
                rows={2}
                placeholder="Объяснительная, служебная записка, копии переписки, протокол"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed"
              />
              {docsArray.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {docsArray.map((doc, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700">
                      <FileText size={12} className="text-slate-400" /> {doc}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            <label className="flex flex-col gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm cursor-pointer hover:border-slate-300 transition-colors">
              <span className="inline-flex items-center gap-2 font-semibold text-slate-700"><Upload size={16} /> Приложить файл</span>
              <span className="text-xs text-slate-400">Шаблоны документов, бланки, инструкции</span>
              <input type="file" onChange={handleAttachment} className="hidden" />
              {form.attachmentName ? (
                <span className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700">
                  <FileText size={13} className="text-blue-500" /> {form.attachmentName}
                </span>
              ) : null}
            </label>
          </div>

          <div className="flex items-center gap-2 border-t border-slate-100 px-6 py-4 bg-slate-50/50">
            <button type="submit" className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700">Сохранить инцидент</button>
            <button type="button" onClick={() => setEditingId(null)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Отмена</button>
          </div>
        </form>
      </div>
    );
  }

  if (selectedIncident) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button onClick={() => setSelectedId(null)} className="mb-5 inline-flex items-center gap-2 text-sm text-blue-700 hover:underline">
          <ArrowLeft size={15} /> К списку инцидентов
        </button>
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className={`px-6 py-4 ${selectedIncident.level === 'Высокий' ? 'bg-red-50 border-b border-red-100' : selectedIncident.level === 'Средний' ? 'bg-amber-50 border-b border-amber-100' : 'bg-emerald-50 border-b border-emerald-100'}`}>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${selectedIncident.level === 'Высокий' ? 'bg-red-600 text-white' : selectedIncident.level === 'Средний' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'}`}>{selectedIncident.level}</span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">{selectedIncident.category}</span>
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700">{selectedIncident.audience}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-950">{selectedIncident.title}</h1>
          </div>
          <div className="p-6">
            <p className="text-base text-slate-600 leading-relaxed">{selectedIncident.summary}</p>
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <section className="rounded-xl border border-slate-200 p-5">
                <h2 className="flex items-center gap-2 font-semibold text-slate-900 mb-3">
                  <AlertTriangle size={16} className="text-red-500" /> Первые шаги
                </h2>
                <ol className="space-y-2.5">
                  {selectedIncident.firstSteps.split(';').map(s => s.trim()).filter(Boolean).map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">{i + 1}</span>
                      <span className="text-sm text-slate-700 leading-relaxed pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
              <section className="rounded-xl border border-slate-200 p-5">
                <h2 className="flex items-center gap-2 font-semibold text-slate-900 mb-3">
                  <FileText size={16} className="text-blue-500" /> Необходимые документы
                </h2>
                <div className="space-y-2">
                  {selectedIncident.documents.split(',').map(s => s.trim()).filter(Boolean).map((doc, i) => (
                    <div key={i} className="flex items-center gap-2.5 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-slate-300 bg-white">
                        <Check size={12} className="text-slate-300" />
                      </span>
                      <span className="text-sm text-slate-700">{doc}</span>
                    </div>
                  ))}
                </div>
                {selectedIncident.attachmentUrl ? (
                  <a href={selectedIncident.attachmentUrl} download={selectedIncident.attachmentName} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
                    <FileText size={15} /> {selectedIncident.attachmentName}
                  </a>
                ) : null}
              </section>
            </div>
          </div>
          {canEdit ? (
            <div className="mt-6 flex gap-2 border-t border-slate-100 pt-5">
              <button onClick={() => startEdit(selectedIncident)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
                <Edit3 size={15} /> Редактировать
              </button>
              <button
                onClick={async () => {
                  await deleteIncident(selectedIncident.id);
                  setSelectedId(null);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
              >
                <Trash2 size={15} /> Удалить
              </button>
            </div>
          ) : null}
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500">
        <Link to="/" className="hover:text-blue-600">Главная</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800">Центр инцидентов</span>
      </nav>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Центр инцидентов</h1>
          <p className="mt-2 max-w-2xl text-sm text-red-100">Сценарии, локальные инструкции, файлы и действия для сложных ситуаций.</p>
        </div>
        {canEdit ? (
          <button onClick={startCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-red-700">
            <Plus size={16} /> Создать инцидент
          </button>
        ) : null}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_180px]">
        <div className="relative">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск по инцидентам" className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm" />
        </div>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
        <select value={level} onChange={(event) => setLevel(event.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
          <option>Все уровни</option>
          <option>Низкий</option>
          <option>Средний</option>
          <option>Высокий</option>
        </select>
      </div>

      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Shield size={16} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">Инструкции носят справочный характер. Для критических случаев используйте локальный регламент организации и официальные каналы.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredIncidents.map((incident) => (
          <button key={incident.id} onClick={() => setSelectedId(incident.id)} className="rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-red-200 hover:shadow-sm">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{incident.level}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{incident.category}</span>
            </div>
            <h2 className="font-semibold text-slate-950">{incident.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{incident.summary}</p>
            <p className="mt-3 text-xs text-slate-500">Владелец: {incident.owner}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
