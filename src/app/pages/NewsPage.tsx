import { ChangeEvent, FormEvent, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  ExternalLink,
  Eye,
  FileImage,
  Newspaper,
  Plus,
  Save,
  Shield,
  Tag,
  Trash2,
  UserRound,
  Video,
  X,
} from 'lucide-react';
import { canManageNews } from '../lib/portalHelpers';
import { usePortal } from '../state/PortalContext';
import { NewsArticle, NewsSubmission } from '../types/portal';

type NewsFormState = {
  title: string;
  summary: string;
  body: string;
  category: string;
  specialization: string;
  audience: NewsArticle['audience'];
  author: string;
  publishedAt: string;
  tags: string;
  sourceLabel: string;
  sourceUrl: string;
  isPublic: boolean;
  coverImageUrl: string;
  galleryImageUrls: string;
  videoUrl: string;
  guestPreview: string;
  registeredOnly: string;
};

const emptyForm: NewsFormState = {
  title: '',
  summary: '',
  body: '',
  category: 'Новости портала',
  specialization: '',
  audience: 'Все',
  author: 'Редакция ПрофБазы',
  publishedAt: new Date().toISOString().slice(0, 10),
  tags: '',
  sourceLabel: 'Официальный источник',
  sourceUrl: 'https://pravo.by/',
  isPublic: true,
  coverImageUrl: '',
  galleryImageUrls: '',
  videoUrl: '',
  guestPreview: '',
  registeredOnly: '',
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function stripContentPrefix(value: string, prefix: string) {
  return value.replace(new RegExp(`^${prefix}:\\s*`, 'i'), '').trim();
}

function articleToForm(article: Omit<NewsArticle, 'id'>): NewsFormState {
  return {
    title: article.title,
    summary: article.summary,
    body: article.body.join('\n\n'),
    category: article.category,
    specialization: article.specialization ?? '',
    audience: article.audience,
    author: article.author,
    publishedAt: article.publishedAt,
    tags: article.tags.join(', '),
    sourceLabel: article.sources[0]?.label ?? 'Официальный источник',
    sourceUrl: article.sources[0]?.url ?? 'https://pravo.by/',
    isPublic: article.isPublic,
    coverImageUrl: article.coverImageUrl ?? '',
    galleryImageUrls: article.galleryImageUrls?.join('\n') ?? '',
    videoUrl: article.videoUrl ?? '',
    guestPreview: article.guestPreview ?? '',
    registeredOnly: article.registeredOnly ?? '',
  };
}

function formToArticlePayload(form: NewsFormState): Omit<NewsArticle, 'id'> {
  return {
    title: form.title.trim(),
    summary: form.summary.trim(),
    body: form.body
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean),
    category: form.category.trim() || 'Новости портала',
    specialization: form.specialization.trim() || null,
    audience: form.audience,
    author: form.author.trim() || 'Редакция ПрофБазы',
    publishedAt: form.publishedAt || new Date().toISOString().slice(0, 10),
    tags: form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    sources: [
      {
        label: form.sourceLabel.trim() || 'Официальный источник',
        url: form.sourceUrl.trim() || 'https://pravo.by/',
      },
    ],
    isPublic: form.isPublic,
    coverImageUrl: form.coverImageUrl.trim() || undefined,
    galleryImageUrls: form.galleryImageUrls
      .split('\n')
      .map((url) => url.trim())
      .filter(Boolean),
    videoUrl: form.videoUrl.trim() || undefined,
    guestPreview: form.guestPreview.trim() || undefined,
    registeredOnly: form.registeredOnly.trim() || undefined,
  };
}

function scoreForUser(article: NewsArticle, specialization: string | null, audience: NewsArticle['audience']) {
  let score = 0;
  if (!article.specialization || article.specialization === specialization) score += 2;
  if (article.specialization && article.specialization === specialization) score += 3;
  if (article.audience === 'Все' || article.audience === audience) score += 2;
  if (article.isPublic) score += 1;
  return score;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function parseGalleryUrls(value: string) {
  return value
    .split('\n')
    .map((url) => url.trim())
    .filter(Boolean);
}

function getVideoEmbedUrl(value: string) {
  const url = value.trim();
  if (!url) return null;

  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{6,})/);
  if (youtubeMatch?.[1]) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  }

  const rutubeMatch = url.match(/rutube\.ru\/video\/([A-Za-z0-9]+)/);
  if (rutubeMatch?.[1]) {
    return `https://rutube.ru/play/embed/${rutubeMatch[1]}`;
  }

  return null;
}

function isDirectVideoUrl(value: string) {
  return /^data:video\//.test(value) || /\.(mp4|webm|ogg)(\?.*)?$/i.test(value);
}

function NewsVideo({ url }: { url: string }) {
  const embedUrl = getVideoEmbedUrl(url);

  if (embedUrl) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
        <iframe
          src={embedUrl}
          title="Видео к публикации"
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  if (isDirectVideoUrl(url)) {
    return (
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
        <video src={url} controls className="aspect-video w-full" />
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">Видео к публикации</p>
      <p className="mt-1 text-sm text-slate-600">
        Ссылка не распознана как встраиваемое видео. Откройте её в отдельной вкладке.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
      >
        <ExternalLink size={15} /> Открыть видео
      </a>
    </div>
  );
}

function GallerySlider({ images }: { images: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const activeImage = activeImageIndex === null ? null : images[activeImageIndex];
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };
  if (images.length === 0) return null;
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">Галерея</p>
        <span className="text-xs font-medium text-slate-500">{images.length} фото</span>
      </div>
      <div className="group relative">
        {images.length > 1 ? (
          <button
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md opacity-0 transition-opacity hover:bg-slate-50 group-hover:opacity-100"
            aria-label="Прокрутить галерею влево"
          >
            <ChevronLeft size={19} />
          </button>
        ) : null}
        <div ref={scrollRef} className="flex snap-x gap-3 overflow-x-auto pb-2 scroll-smooth">
          {images.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveImageIndex(index)}
              className="group/image relative h-44 w-72 shrink-0 snap-start overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-left shadow-sm outline-none transition hover:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label={`Открыть фото ${index + 1} из ${images.length}`}
            >
              <img src={url} alt="" className="h-full w-full object-cover transition duration-300 group-hover/image:scale-[1.03]" />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/75 to-transparent px-3 pb-3 pt-10 text-xs font-semibold text-white opacity-0 transition-opacity group-hover/image:opacity-100 group-focus-visible/image:opacity-100">
                <span>Фото {index + 1}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-1 backdrop-blur">
                  <Eye size={13} /> Открыть
                </span>
              </span>
            </button>
          ))}
        </div>
        {images.length > 1 ? (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-md opacity-0 transition-opacity hover:bg-slate-50 group-hover:opacity-100"
            aria-label="Прокрутить галерею вправо"
          >
            <ChevronRight size={19} />
          </button>
        ) : null}
      </div>

      {activeImage ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Просмотр фотографии"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/85"
            onClick={() => setActiveImageIndex(null)}
            aria-label="Закрыть просмотр фотографии"
          />
          <div className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <span className="text-sm font-semibold text-slate-700">
                Фото {(activeImageIndex ?? 0) + 1} из {images.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveImageIndex(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-slate-950">
              <img src={activeImage} alt="" className="max-h-[72vh] w-full object-contain" />
            </div>
            {images.length > 1 ? (
              <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3">
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((index) => (index === null ? 0 : (index - 1 + images.length) % images.length))}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <ChevronLeft size={16} /> Предыдущее
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImageIndex((index) => (index === null ? 0 : (index + 1) % images.length))}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Следующее <ChevronRight size={16} />
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

type EditorTab = 'content' | 'media' | 'settings';
const editorTabs: { id: EditorTab; label: string }[] = [
  { id: 'content', label: 'Контент' },
  { id: 'media', label: 'Медиа' },
  { id: 'settings', label: 'Публикация' },
];
type RequiredNewsField = 'title' | 'summary' | 'body';

const requiredNewsFields: { field: RequiredNewsField; label: string }[] = [
  { field: 'title', label: 'Заголовок публикации' },
  { field: 'summary', label: 'Краткое описание' },
  { field: 'body', label: 'Текст публикации' },
];

function TagChips({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [input, setInput] = useState('');
  const chips = value.split(',').map(t => t.trim()).filter(Boolean);
  function add() {
    const tag = input.trim();
    if (!tag || chips.includes(tag)) return;
    onChange([...chips, tag].join(', '));
    setInput('');
  }
  function remove(index: number) {
    onChange(chips.filter((_, i) => i !== index).join(', '));
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip, i) => (
          <span key={chip} className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
            {chip}
            <button type="button" onClick={() => remove(i)} className="ml-0.5 text-blue-400 hover:text-red-500"><X size={12} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          placeholder="Добавить тег..."
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        />
        <button type="button" onClick={add} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200">+</button>
      </div>
    </div>
  );
}

function NewsEditorForm({
  initialValue,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initialValue: NewsFormState;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (form: NewsFormState) => Promise<void>;
}) {
  const [form, setForm] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<EditorTab>('content');
  const [showPreview, setShowPreview] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState('');
  const [validationErrors, setValidationErrors] = useState<RequiredNewsField[]>([]);
  const [submitError, setSubmitError] = useState('');
  const galleryUrls = parseGalleryUrls(form.galleryImageUrls);

  const wordCount = form.body.trim().split(/\s+/).filter(Boolean).length;
  const charCount = form.body.length;
  const readTime = Math.max(1, Math.round(wordCount / 200));
  const missingFieldLabels = validationErrors
    .map((field) => requiredNewsFields.find((item) => item.field === field)?.label)
    .filter(Boolean)
    .join(', ');

  function hasFieldError(field: RequiredNewsField) {
    return validationErrors.includes(field);
  }

  function updateFormField<K extends keyof NewsFormState>(field: K, value: NewsFormState[K]) {
    setSubmitError('');
    setValidationErrors((prev) => prev.filter((item) => item !== field));
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = requiredNewsFields
      .filter(({ field }) => !form[field].trim())
      .map(({ field }) => field);

    if (nextErrors.length > 0) {
      setValidationErrors(nextErrors);
      setSubmitError('');
      setActiveTab('content');
      return;
    }

    setIsSaving(true);
    setValidationErrors([]);
    setSubmitError('');
    try {
      await onSubmit(form);
    } catch (error) {
      setActiveTab('content');
      setSubmitError(error instanceof Error ? error.message : 'Не удалось отправить материал. Попробуйте еще раз.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleCoverFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    setForm((prev) => ({ ...prev, coverImageUrl: url }));
    event.target.value = '';
  }

  async function handleVideoFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    setForm((prev) => ({ ...prev, videoUrl: url }));
    event.target.value = '';
  }

  async function handleGalleryFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    const urls = await Promise.all(files.map(readFileAsDataUrl));
    setForm((prev) => ({
      ...prev,
      galleryImageUrls: [...parseGalleryUrls(prev.galleryImageUrls), ...urls].join('\n'),
    }));
    event.target.value = '';
  }

  function removeGalleryImage(index: number) {
    setForm((prev) => ({
      ...prev,
      galleryImageUrls: parseGalleryUrls(prev.galleryImageUrls)
        .filter((_, currentIndex) => currentIndex !== index)
        .join('\n'),
    }));
  }

  function addGalleryUrl() {
    const nextUrl = galleryUrlInput.trim();
    if (!nextUrl) return;

    setForm((prev) => ({
      ...prev,
      galleryImageUrls: Array.from(new Set([...parseGalleryUrls(prev.galleryImageUrls), nextUrl])).join('\n'),
    }));
    setGalleryUrlInput('');
  }

  if (showPreview) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 className="font-semibold text-slate-900">Предпросмотр публикации</h3>
          <button type="button" onClick={() => setShowPreview(false)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">Назад к редактору</button>
        </div>
        <div className="p-6 max-w-3xl mx-auto space-y-4">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{form.category || 'Без категории'}</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{form.audience}</span>
            {form.specialization ? <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">{form.specialization}</span> : null}
          </div>
          <h1 className="text-2xl font-bold text-slate-950">{form.title || 'Без заголовка'}</h1>
          <p className="text-base text-slate-600 leading-relaxed">{form.summary}</p>
          {form.coverImageUrl ? <img src={form.coverImageUrl} alt="" className="aspect-[16/9] w-full rounded-2xl object-cover" /> : null}
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <span>{form.author}</span>
            <span>{form.publishedAt ? formatDate(form.publishedAt) : 'Сегодня'}</span>
            <span>{readTime} мин чтения</span>
          </div>
          <div className="prose prose-slate max-w-none">
            {form.body.split('\n').filter(Boolean).map((p, i) => <p key={i} className="text-slate-700 leading-relaxed">{p}</p>)}
          </div>
          {galleryUrls.length > 0 ? <GallerySlider images={galleryUrls} /> : null}
          {form.videoUrl ? <NewsVideo url={form.videoUrl} /> : null}
          <div className="flex flex-wrap gap-1.5 pt-2">
            {form.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
              <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-blue-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
          {editorTabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setShowPreview(true)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50">
          <Eye size={13} className="inline -mt-0.5 mr-1" />Предпросмотр
        </button>
      </div>

      <div className="p-5 space-y-4">
        {activeTab === 'content' ? (
          <>
            {validationErrors.length > 0 ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                <p className="font-semibold">Материал не отправлен. Заполните обязательные поля перед отправкой.</p>
                <p className="mt-1">Нужно заполнить: {missingFieldLabels}.</p>
              </div>
            ) : null}
            {submitError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                Материал не отправлен. {submitError}
              </div>
            ) : null}
            <input
              value={form.title}
              onChange={(event) => updateFormField('title', event.target.value)}
              placeholder="Заголовок публикации"
              aria-invalid={hasFieldError('title')}
              className={`w-full border-0 border-b-2 bg-transparent px-0 py-3 text-xl font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0 ${
                hasFieldError('title') ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-500'
              }`}
            />
            <textarea
              value={form.summary}
              onChange={(event) => updateFormField('summary', event.target.value)}
              rows={2}
              placeholder="Краткое описание — будет показано в карточке и в поиске"
              aria-invalid={hasFieldError('summary')}
              className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm leading-relaxed focus:bg-white focus:outline-none ${
                hasFieldError('summary') ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-300'
              }`}
            />
            <div className="relative">
              <textarea
                value={form.body}
                onChange={(event) => updateFormField('body', event.target.value)}
                rows={12}
                placeholder="Текст публикации. Используйте абзацы для структуры — каждая пустая строка создаёт новый параграф."
                aria-invalid={hasFieldError('body')}
                className={`w-full rounded-xl border px-4 py-3 text-sm leading-relaxed focus:outline-none ${
                  hasFieldError('body') ? 'border-red-300 focus:border-red-500' : 'border-slate-200 focus:border-blue-300'
                }`}
              />
              <div className="absolute bottom-3 right-3 flex gap-3 text-xs text-slate-400">
                <span>{charCount} символов</span>
                <span>{wordCount} слов</span>
                <span>~{readTime} мин</span>
              </div>
            </div>
            <div>
              <p className="mb-1.5 text-sm font-medium text-slate-700">Теги</p>
              <TagChips value={form.tags} onChange={v => setForm(prev => ({ ...prev, tags: v }))} />
            </div>
          </>
        ) : null}

        {activeTab === 'media' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-800">Обложка</p>
                <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                  {form.coverImageUrl ? (
                    <>
                      <img src={form.coverImageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, coverImageUrl: '' }))} className="absolute top-2 right-2 z-10 rounded-full bg-white/90 p-1.5 shadow-md text-slate-600 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center gap-2 p-6 text-center">
                      <FileImage size={28} className="text-slate-300" />
                      <span className="text-sm font-medium text-slate-500">Нажмите для загрузки</span>
                      <span className="text-xs text-slate-400">JPG, PNG, WebP, GIF</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleCoverFileChange} className="hidden" />
                    </label>
                  )}
                </div>
                <input
                  value={form.coverImageUrl.startsWith('data:') ? '' : form.coverImageUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, coverImageUrl: event.target.value }))}
                  placeholder="Или вставьте URL: https://..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-800">Видео</p>
                <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center">
                  {form.videoUrl ? (
                    <>
                      <video src={form.videoUrl} controls className="absolute inset-0 w-full h-full object-cover bg-slate-950" />
                      <button type="button" onClick={() => setForm(prev => ({ ...prev, videoUrl: '' }))} className="absolute top-2 right-2 z-10 rounded-full bg-white/90 p-1.5 shadow-md text-slate-600 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center gap-2 p-6 text-center">
                      <Video size={28} className="text-slate-300" />
                      <span className="text-sm font-medium text-slate-500">Нажмите для загрузки</span>
                      <span className="text-xs text-slate-400">MP4, WebM, OGG</span>
                      <input type="file" accept="video/mp4,video/webm,video/ogg" onChange={handleVideoFileChange} className="hidden" />
                    </label>
                  )}
                </div>
                <input
                  value={form.videoUrl.startsWith('data:') ? '' : form.videoUrl}
                  onChange={(event) => setForm((prev) => ({ ...prev, videoUrl: event.target.value }))}
                  placeholder="Или вставьте URL: https://..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Лента фото для слайдера</p>
                  <p className="text-xs text-slate-500">{galleryUrls.length} фото добавлено</p>
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50">
                  <FileImage size={14} /> Добавить фото
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={handleGalleryFilesChange} className="hidden" />
                </label>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={galleryUrlInput}
                  onChange={(event) => setGalleryUrlInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addGalleryUrl();
                    }
                  }}
                  placeholder="URL фото для галереи: https://..."
                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
                />
                <button
                  type="button"
                  onClick={addGalleryUrl}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Добавить URL
                </button>
              </div>
              {galleryUrls.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {galleryUrls.map((url, index) => (
                    <div key={`${url}-${index}`} className="relative h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeGalleryImage(index)} className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 shadow-sm hover:bg-red-50 hover:text-red-600">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white py-8 text-center text-xs text-slate-400">
                  Загрузите фото кнопкой выше или перетащите файлы
                </div>
              )}
            </div>
          </>
        ) : null}

        {activeTab === 'settings' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Категория</span>
                <input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Специализация</span>
                <input value={form.specialization} onChange={(event) => setForm((prev) => ({ ...prev, specialization: event.target.value }))} placeholder="Педагогика или пусто" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Аудитория</span>
                <select value={form.audience} onChange={(event) => setForm((prev) => ({ ...prev, audience: event.target.value as NewsArticle['audience'] }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white">
                  <option>Все</option>
                  <option>Новичок</option>
                  <option>Опытный</option>
                </select>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Автор</span>
                <input value={form.author} onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Дата публикации</span>
                <input type="date" value={form.publishedAt} onChange={(event) => setForm((prev) => ({ ...prev, publishedAt: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 cursor-pointer hover:bg-slate-50">
                  <input type="checkbox" checked={form.isPublic} onChange={(event) => setForm((prev) => ({ ...prev, isPublic: event.target.checked }))} className="w-4 h-4 rounded" />
                  Видно гостям
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Источник</span>
                <input value={form.sourceLabel} onChange={(event) => setForm((prev) => ({ ...prev, sourceLabel: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Ссылка на источник</span>
                <input value={form.sourceUrl} onChange={(event) => setForm((prev) => ({ ...prev, sourceUrl: event.target.value }))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Текст для гостя</span>
                <textarea value={form.guestPreview} onChange={(event) => setForm((prev) => ({ ...prev, guestPreview: event.target.value }))} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Текст после входа</span>
                <textarea value={form.registeredOnly} onChange={(event) => setForm((prev) => ({ ...prev, registeredOnly: event.target.value }))} rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
              </label>
            </div>
          </>
        ) : null}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 bg-slate-50/50">
        <div className="flex flex-wrap gap-2">
          <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60">
            <Save size={15} /> {isSaving ? 'Сохранение...' : submitLabel}
          </button>
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Отмена</button>
        </div>
        <span className="hidden text-xs text-slate-400 sm:inline">{form.title ? '✓ Заголовок' : '○ Заголовок'} · {form.body ? '✓ Текст' : '○ Текст'} · {form.coverImageUrl ? '✓ Обложка' : '○ Обложка'}</span>
      </div>
    </form>
  );
}

export default function NewsPage() {
  const navigate = useNavigate();
  const { newsId } = useParams();
  const {
    database,
    currentUser,
    createNewsArticle,
    updateNewsArticle,
    deleteNewsArticle,
    createNewsSubmission,
    updateNewsSubmission,
    reviewNewsSubmission,
    isLoading,
  } = usePortal();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSubmissionId, setEditingSubmissionId] = useState<string | null>(null);
  const [submissionSuccess, setSubmissionSuccess] = useState('');
  const [newsSearch, setNewsSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Все категории');
  const [specializationFilter, setSpecializationFilter] = useState('Все специальности');

  const canEdit = canManageNews(currentUser);
  const canSubmitNews = !!currentUser && !currentUser.isBanned;
  const pendingSubmissions = useMemo(
    () => database.newsSubmissions.filter((submission) => submission.status === 'pending'),
    [database.newsSubmissions],
  );
  const reviewedSubmissions = useMemo(
    () =>
      database.newsSubmissions
        .filter((submission) => submission.status !== 'pending')
        .sort((left, right) => (right.reviewedAt ?? '').localeCompare(left.reviewedAt ?? ''))
        .slice(0, 8),
    [database.newsSubmissions],
  );
  const userSpecialization = currentUser?.subject ?? null;
  const userAudience: NewsArticle['audience'] =
    currentUser?.isYoungSpecialist || currentUser?.isFirstEmployment ? 'Новичок' : 'Опытный';

  const visibleNews = useMemo(() => {
    const list = currentUser ? database.news : database.news.filter((article) => article.isPublic);
    const query = newsSearch.trim().toLowerCase();
    return [...list]
      .filter((article) => {
        const bySearch =
          !query ||
          [article.title, article.summary, article.category, article.author, article.tags.join(' ')]
            .join(' ')
            .toLowerCase()
            .includes(query);
        const byCategory = categoryFilter === 'Все категории' || article.category === categoryFilter;
        const specialization = article.specialization ?? 'Общая';
        const bySpecialization = specializationFilter === 'Все специальности' || specialization === specializationFilter;
        return bySearch && byCategory && bySpecialization;
      })
      .sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
  }, [categoryFilter, currentUser, database.news, newsSearch, specializationFilter]);

  const newsCategories = useMemo(
    () => ['Все категории', ...Array.from(new Set(database.news.map((article) => article.category)))],
    [database.news],
  );
  const newsSpecializations = useMemo(
    () => ['Все специальности', ...Array.from(new Set(database.news.map((article) => article.specialization ?? 'Общая')))],
    [database.news],
  );

  const recommendedNews = useMemo(() => {
    return [...visibleNews]
      .sort((left, right) => {
        const scoreDelta =
          scoreForUser(right, userSpecialization, userAudience) - scoreForUser(left, userSpecialization, userAudience);
        return scoreDelta || right.publishedAt.localeCompare(left.publishedAt);
      })
      .slice(0, 3);
  }, [visibleNews, userAudience, userSpecialization]);

  const selectedArticle = newsId ? database.news.find((article) => article.id === newsId) ?? null : null;
  const selectedIsVisible = selectedArticle && (currentUser || selectedArticle.isPublic);

  async function handleCreate(form: NewsFormState) {
    await createNewsArticle(formToArticlePayload(form));
    setShowCreateForm(false);
  }

  async function handleUpdate(article: NewsArticle, form: NewsFormState) {
    await updateNewsArticle(article.id, formToArticlePayload(form));
    setEditingId(null);
  }

  async function handleDelete(article: NewsArticle) {
    const confirmed = window.confirm(`Удалить публикацию «${article.title}»?`);
    if (!confirmed) return;
    await deleteNewsArticle(article.id);
    navigate('/news');
  }

  async function handleCreateSubmission(form: NewsFormState) {
    if (!currentUser) return;
    await createNewsSubmission({
      submittedByUserId: currentUser.id,
      article: {
        ...formToArticlePayload(form),
        author: form.author.trim() || currentUser.fullName,
        publishedAt: new Date().toISOString().slice(0, 10),
      },
    });
    setShowSubmissionForm(false);
    setSubmissionSuccess('Отправлено на проверку. Материал передан редактору и после одобрения появится в ленте.');
  }

  async function handleUpdateSubmission(submission: NewsSubmission, form: NewsFormState) {
    await updateNewsSubmission(submission.id, formToArticlePayload(form));
    setEditingSubmissionId(null);
  }

  async function handleApproveSubmission(submission: NewsSubmission) {
    if (!currentUser) return;
    const confirmed = window.confirm(`Опубликовать предложенную новость «${submission.article.title}»?`);
    if (!confirmed) return;
    await reviewNewsSubmission(submission.id, true, currentUser.id, 'Одобрено редактором');
  }

  async function handleRejectSubmission(submission: NewsSubmission) {
    if (!currentUser) return;
    const confirmed = window.confirm(`Отклонить предложенную новость «${submission.article.title}»?`);
    if (!confirmed) return;
    await reviewNewsSubmission(submission.id, false, currentUser.id, 'Отклонено редактором');
  }

  if (newsId) {
    if (!selectedArticle || !selectedIsVisible) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <Link to="/news" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline mb-6">
            <ArrowLeft size={16} /> Вернуться к новостям
          </Link>
          <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Материал недоступен</h1>
            <p className="mt-2 text-slate-600">
              Часть публикаций открывается после входа. Войдите или зарегистрируйтесь, чтобы увидеть закрытые материалы.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/login" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
                Войти
              </Link>
              <Link to="/register" className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700">
                Зарегистрироваться
              </Link>
            </div>
          </div>
        </div>
      );
    }

    const isEditing = editingId === selectedArticle.id;

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
          <Link to="/" className="hover:text-blue-600">Главная</Link>
          <ChevronRight size={14} />
          <Link to="/news" className="hover:text-blue-600">Новости</Link>
          <ChevronRight size={14} />
          <span className="text-slate-800 line-clamp-1">{selectedArticle.title}</span>
        </nav>

        <Link to="/news" className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline mb-6">
          <ArrowLeft size={16} /> К списку новостей
        </Link>

        {isEditing ? (
          <NewsEditorForm
            initialValue={articleToForm(selectedArticle)}
            submitLabel="Сохранить публикацию"
            onCancel={() => setEditingId(null)}
            onSubmit={(form) => handleUpdate(selectedArticle, form)}
          />
        ) : (
          <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {selectedArticle.category}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {selectedArticle.specialization ?? 'Общая'}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {selectedArticle.audience}
              </span>
              {!selectedArticle.isPublic ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Только после входа
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 leading-tight">{selectedArticle.title}</h1>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">{selectedArticle.summary}</p>

            {selectedArticle.coverImageUrl ? (
              <img
                src={selectedArticle.coverImageUrl}
                alt=""
                className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover"
              />
            ) : null}

            {(selectedArticle.galleryImageUrls ?? []).length > 0 ? (
              <GallerySlider images={selectedArticle.galleryImageUrls ?? []} />
            ) : null}

            {selectedArticle.videoUrl ? (
              <NewsVideo url={selectedArticle.videoUrl} />
            ) : null}

            <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5"><CalendarDays size={15} /> {formatDate(selectedArticle.publishedAt)}</span>
              <span className="inline-flex items-center gap-1.5"><UserRound size={15} /> {selectedArticle.author}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {selectedArticle.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                  <Tag size={12} /> {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 space-y-4 text-slate-700 leading-relaxed">
              {selectedArticle.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>

            {selectedArticle.guestPreview ? (
              <div className="mt-8 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-sm font-semibold text-slate-900">Открыто гостю</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {stripContentPrefix(selectedArticle.guestPreview, 'Гостю')}
                </p>
              </div>
            ) : null}

            {selectedArticle.registeredOnly ? (
              <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50/70 p-4">
                <p className="text-sm font-semibold text-slate-900">После входа</p>
                {currentUser ? (
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    {stripContentPrefix(selectedArticle.registeredOnly, 'После входа')}
                  </p>
                ) : (
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm leading-relaxed text-slate-700">
                      Войдите или зарегистрируйтесь, чтобы открыть персональные чек-листы и закрытую часть материала.
                    </p>
                    <div className="flex shrink-0 gap-2">
                      <Link to="/login" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
                        Войти
                      </Link>
                      <Link to="/register" className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
                        Регистрация
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900 mb-3">Источники</p>
              <div className="space-y-2">
                {selectedArticle.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-blue-700 hover:underline"
                  >
                    <ExternalLink size={14} /> {source.label}
                  </a>
                ))}
              </div>
            </div>

            {canEdit ? (
              <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
                <button
                  onClick={() => setEditingId(selectedArticle.id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  <Edit3 size={15} /> Редактировать
                </button>
                <button
                  onClick={() => handleDelete(selectedArticle)}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                >
                  <Trash2 size={15} /> Удалить
                </button>
              </div>
            ) : null}
          </article>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Главная</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800">Новости</span>
      </nav>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 mb-8">
        <div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <Newspaper size={24} className="text-blue-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-950">Новости и полезные материалы</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Публикации редакции ПрофБазы: адаптация, трудоустройство, педагогика, правовые источники и работа с организациями.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canEdit ? (
            <>
              <button
                onClick={() => {
                  setShowCreateForm((value) => !value);
                  setShowSubmissionForm(false);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Plus size={16} /> Новая публикация
              </button>
              <button
                onClick={() => setShowModerationPanel((value) => !value)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Shield size={16} /> Модерация
                {pendingSubmissions.length > 0 ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{pendingSubmissions.length}</span>
                ) : null}
              </button>
            </>
          ) : null}
          {canSubmitNews && !canEdit ? (
            <button
              onClick={() => {
                setShowSubmissionForm((value) => !value);
                setSubmissionSuccess('');
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={16} /> Предложить новость
            </button>
          ) : null}
        </div>
      </div>

      {showCreateForm ? (
        <div className="mb-8">
          <NewsEditorForm
            initialValue={emptyForm}
            submitLabel="Опубликовать"
            onCancel={() => setShowCreateForm(false)}
            onSubmit={handleCreate}
          />
        </div>
      ) : null}

      {submissionSuccess ? (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
          {submissionSuccess}
        </div>
      ) : null}

      {showSubmissionForm && currentUser ? (
        <div className="mb-8">
          <div className="mb-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Предложить новость редакции</h2>
            <p className="mt-1 text-sm text-slate-600">
              Материал не появится в ленте сразу. Редактор проверит текст, медиа, источники и опубликует его после модерации.
            </p>
          </div>
          <NewsEditorForm
            initialValue={{
              ...emptyForm,
              author: currentUser.fullName,
              category: 'Предложение пользователя',
              sourceLabel: 'Предложение пользователя',
              sourceUrl: '',
            }}
            submitLabel="Отправить на проверку"
            onCancel={() => setShowSubmissionForm(false)}
            onSubmit={handleCreateSubmission}
          />
        </div>
      ) : null}

      {showModerationPanel && canEdit ? (
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-950">Модерация предложенных новостей</h2>
              <p className="text-sm text-slate-600">
                Проверьте материал, при необходимости отредактируйте и опубликуйте в общей ленте.
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              {pendingSubmissions.length} ожидает проверки
            </span>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
              <p className="font-semibold text-slate-900">Очередь модерации пуста</p>
              <p className="mt-1 text-sm text-slate-500">Новые предложения пользователей появятся здесь.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSubmissions.map((submission) => {
                const submitter = database.users.find((user) => user.id === submission.submittedByUserId);
                const isEditingSubmission = editingSubmissionId === submission.id;

                return (
                  <div key={submission.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Ожидает проверки</p>
                        <h3 className="mt-1 text-base font-bold text-slate-950">{submission.article.title}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-slate-600">{submission.article.summary}</p>
                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
                          <span>Автор: {submitter?.fullName ?? 'Пользователь удален'}</span>
                          <span>Отправлено: {formatDate(submission.submittedAt)}</span>
                          <span>Категория: {submission.article.category}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingSubmissionId(isEditingSubmission ? null : submission.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Edit3 size={15} /> {isEditingSubmission ? 'Скрыть правку' : 'Править'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApproveSubmission(submission)}
                          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                        >
                          <Save size={15} /> Одобрить
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectSubmission(submission)}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                        >
                          <X size={15} /> Отклонить
                        </button>
                      </div>
                    </div>

                    {isEditingSubmission ? (
                      <div className="mt-4">
                        <NewsEditorForm
                          initialValue={articleToForm(submission.article)}
                          submitLabel="Сохранить правки заявки"
                          onCancel={() => setEditingSubmissionId(null)}
                          onSubmit={(form) => handleUpdateSubmission(submission, form)}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {reviewedSubmissions.length > 0 ? (
            <div className="mt-6 border-t border-slate-100 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Последние решения</h3>
              <div className="space-y-2">
                {reviewedSubmissions.map((submission) => (
                  <div key={submission.id} className="flex flex-col gap-1 rounded-xl border border-slate-200 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-medium text-slate-800">{submission.article.title}</span>
                    <span className={`text-xs font-semibold ${submission.status === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                      {submission.status === 'approved' ? 'Одобрена' : 'Отклонена'} · {submission.reviewedAt ? formatDate(submission.reviewedAt) : 'без даты'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_220px_220px]">
        <input
          value={newsSearch}
          onChange={(event) => setNewsSearch(event.target.value)}
          placeholder="Поиск по новостям, авторам и тегам"
          className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm"
        />
        <select
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
        >
          {newsCategories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
        <select
          value={specializationFilter}
          onChange={(event) => setSpecializationFilter(event.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
        >
          {newsSpecializations.map((specialization) => (
            <option key={specialization}>{specialization}</option>
          ))}
        </select>
      </div>

      <section className="mb-8 rounded-2xl border border-blue-100 bg-blue-50/70 p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-slate-900">Рекомендации в ленте</h2>
            <p className="text-sm text-slate-600">
              {currentUser
                ? `Подборка учитывает специализацию: ${userSpecialization ?? 'общая'}, статус: ${userAudience.toLowerCase()}.`
                : 'Гостю показаны только общедоступные публикации.'}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recommendedNews.map((article) => (
            <Link key={article.id} to={`/news/${article.id}`} className="rounded-xl bg-white p-4 border border-blue-100 hover:border-blue-300 transition-colors">
              <p className="text-xs font-semibold text-blue-700">{article.category}</p>
              <h3 className="mt-1 text-sm font-semibold text-slate-950 leading-snug">{article.title}</h3>
              <p className="mt-2 text-xs text-slate-500">{formatDate(article.publishedAt)}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="space-y-4">
        {visibleNews.map((article) => (
          <Link
            key={article.id}
            to={`/news/${article.id}`}
            className="block rounded-2xl border border-slate-200 bg-white p-5 hover:border-blue-200 hover:shadow-sm transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              {article.coverImageUrl ? (
                <img src={article.coverImageUrl} alt="" className="h-36 w-full rounded-xl object-cover md:w-56" />
              ) : null}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {article.category}
                  </span>
                  <span className="text-xs text-slate-500">{formatDate(article.publishedAt)}</span>
                  {!article.isPublic ? <span className="text-xs text-amber-700">после входа</span> : null}
                </div>
                <h2 className="text-lg font-bold text-slate-950 leading-snug">{article.title}</h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{article.summary}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>Автор: {article.author}</span>
                  <span>Специализация: {article.specialization ?? 'общая'}</span>
                  <span>Аудитория: {article.audience}</span>
                </div>
              </div>
              <div className="flex md:flex-col flex-wrap gap-2 md:items-end shrink-0">
                {article.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-lg bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {visibleNews.length === 0 && !isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <p className="font-semibold text-slate-900">Публикаций пока нет</p>
          <p className="mt-1 text-sm text-slate-500">Редактор сможет добавить первую новость из этой страницы.</p>
        </div>
      ) : null}
    </div>
  );
}
