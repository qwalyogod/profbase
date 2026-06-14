import { FormEvent, useMemo, useState } from 'react';
import { Download, FolderOpen, Search, Shield, Trash2, Upload, Plus, X } from 'lucide-react';
import { StateBlock } from '../../components/common/StateBlock';
import { usePortal } from '../../state/PortalContext';
import { DocumentType, OrganizationDocument } from '../../types/portal';

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const emptyUpload = {
  title: '',
  sectionId: '',
  type: 'PDF' as DocumentType,
  size: '',
  description: '',
  fileUrl: '',
  fileName: '',
  restrictToTeachers: false,
};

export default function DocumentsPage() {
  const { database, currentUser, currentOrganization, currentMembership, getVisibleDocuments, createDocument, deleteDocument } = usePortal();
  const [search, setSearch] = useState('');
  const [sectionFilter, setSectionFilter] = useState('Все разделы');
  const [typeFilter, setTypeFilter] = useState('Все типы');
  const [showUpload, setShowUpload] = useState(false);
  const [upload, setUpload] = useState(emptyUpload);
  const [uploadError, setUploadError] = useState('');

  if (!currentUser) {
    return <StateBlock title="Пользователь не найден" description="Выберите пользователя в верхнем меню." />;
  }

  if (!currentOrganization || !currentMembership) {
    return (
      <StateBlock
        title="Нет доступа к документам организации"
        description="Сначала отправьте заявку по коду приглашения и дождитесь одобрения администратора организации."
      />
    );
  }

  const isAdmin = currentMembership.role === 'organization_admin';
  const canUpload = isAdmin || currentMembership.role === 'teacher' || currentMembership.role === 'general_specialist';

  const allDocuments = database.documents.filter((document) => document.organizationId === currentOrganization.id);
  const visibleDocuments = getVisibleDocuments(currentOrganization.id, currentUser.id);
  const sections = database.sections.filter((section) => section.organizationId === currentOrganization.id);

  const sectionNames = ['Все разделы', ...sections.map((section) => section.name)];
  const typeNames = ['Все типы', ...Array.from(new Set(allDocuments.map((document) => document.type)))];

  const scopedDocuments = isAdmin ? allDocuments : visibleDocuments;

  const filtered = useMemo(() => scopedDocuments.filter((document) => {
    const section = sections.find((item) => item.id === document.sectionId);
    const bySearch = !search || document.title.toLowerCase().includes(search.toLowerCase()) || document.description.toLowerCase().includes(search.toLowerCase());
    const bySection = sectionFilter === 'Все разделы' || section?.name === sectionFilter;
    const byType = typeFilter === 'Все типы' || document.type === typeFilter;
    return bySearch && bySection && byType;
  }), [scopedDocuments, sections, search, sectionFilter, typeFilter]);

  const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError('');
    const ext = file.name.split('.').pop()?.toUpperCase();
    const type: DocumentType = ext === 'DOCX' || ext === 'XLSX' || ext === 'PPTX' || ext === 'PDF' ? ext : 'PDF';
    try {
      const fileUrl = await readFileAsDataUrl(file);
      setUpload((prev) => ({
        ...prev,
        fileUrl,
        fileName: file.name,
        type,
        size: `${Math.max(1, Math.round(file.size / 1024))} КБ`,
        title: prev.title || file.name.replace(/\.[^.]+$/, ''),
      }));
    } catch {
      setUploadError('Не удалось прочитать файл.');
    }
    event.target.value = '';
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    setUploadError('');
    if (!upload.title.trim() || !upload.sectionId) {
      setUploadError('Укажите название и раздел.');
      return;
    }
    if (!upload.fileUrl) {
      setUploadError('Прикрепите файл (PDF, DOCX, скан и т.п.).');
      return;
    }
    const access: OrganizationDocument['access'] = upload.restrictToTeachers
      ? { mode: 'roles', roles: ['organization_admin', 'teacher'], subjects: [], userIds: [], specialtyTagIds: [] }
      : { mode: 'all', roles: [], subjects: [], userIds: [], specialtyTagIds: [] };
    await createDocument({
      organizationId: currentOrganization.id,
      sectionId: upload.sectionId,
      title: upload.title.trim(),
      type: upload.type,
      description: upload.description.trim() || 'Описание не заполнено.',
      size: upload.size || '—',
      subject: null,
      access,
      fileUrl: upload.fileUrl,
      fileName: upload.fileName,
    });
    setUpload(emptyUpload);
    setShowUpload(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FolderOpen size={20} className="text-indigo-600" /> Документы организации
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-700">
            {isAdmin ? 'Режим администратора организации' : currentMembership.role === 'teacher' ? 'Режим преподавателя' : 'Режим участника'}
          </span>
          {canUpload ? (
            <button onClick={() => setShowUpload((v) => !v)} className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
              <Plus size={14} /> Добавить документ
            </button>
          ) : null}
        </div>
      </div>

      {showUpload && canUpload ? (
        <form onSubmit={handleUpload} className="bg-white rounded-xl border border-indigo-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Загрузить документ (PDF, DOCX, скан)</h2>
            <button type="button" onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          {uploadError ? <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{uploadError}</div> : null}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={upload.title} onChange={(e) => setUpload((p) => ({ ...p, title: e.target.value }))} placeholder="Название документа" className="px-3 py-2 rounded-lg border border-slate-300 text-sm" />
            <select value={upload.sectionId} onChange={(e) => setUpload((p) => ({ ...p, sectionId: e.target.value }))} className="px-3 py-2 rounded-lg border border-slate-300 text-sm">
              <option value="">Выберите раздел</option>
              {sections.map((section) => <option key={section.id} value={section.id}>{section.name}</option>)}
            </select>
          </div>
          <label className="flex flex-col gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <span className="flex items-center gap-2 font-medium"><Upload size={15} /> Файл документа (.pdf, .docx, .xlsx, скан)</span>
            <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,image/*" onChange={handleFile} className="text-sm" />
            {upload.fileName ? <span className="text-xs text-slate-500">Выбран файл: {upload.fileName} · {upload.type} · {upload.size}</span> : null}
          </label>
          <textarea value={upload.description} onChange={(e) => setUpload((p) => ({ ...p, description: e.target.value }))} rows={2} placeholder="Краткое описание / информация о документе" className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm resize-none" />
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={upload.restrictToTeachers} onChange={(e) => setUpload((p) => ({ ...p, restrictToTeachers: e.target.checked }))} />
            Доступ только преподавателям и администраторам
          </label>
          <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Загрузить документ</button>
        </form>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        <div className="relative xl:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Поиск документов..." className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm" />
        </div>
        <select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm">
          {sectionNames.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm">
          {typeNames.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>

      {!isAdmin ? (
        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <Shield size={12} /> Вам показаны документы с одобренным доступом.
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((document) => {
          const section = sections.find((item) => item.id === document.sectionId);
          return (
            <div key={document.id} className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{document.title}</p>
                {isAdmin ? (
                  <button
                    onClick={async () => { if (window.confirm(`Удалить документ «${document.title}»?`)) await deleteDocument(document.id); }}
                    className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    title="Удалить"
                  >
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </div>
              <p className="text-xs text-slate-500 mt-1">{section?.name ?? 'Раздел удалён'} • {document.type} • {document.size}</p>
              {(document.access.specialtyTagIds ?? []).length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(document.access.specialtyTagIds ?? []).map((tagId) => {
                    const tag = database.specialtyTags.find((item) => item.id === tagId);
                    return tag ? <span key={tag.id} className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700">{tag.name}</span> : null;
                  })}
                </div>
              ) : null}
              <p className="text-xs text-slate-500 mt-2">{document.description}</p>
              {document.fileUrl ? (
                <a href={document.fileUrl} download={document.fileName ?? document.title} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 hover:underline">
                  <Download size={13} /> Скачать {document.fileName ? `(${document.fileName})` : ''}
                </a>
              ) : null}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <StateBlock title="Документы не найдены" description="Попробуйте изменить фильтры или очистить строку поиска." />
      ) : null}
    </div>
  );
}
