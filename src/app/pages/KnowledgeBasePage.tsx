import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router';
import {
  Search, BookOpen, ChevronRight, Eye, Clock, Bookmark,
  BookmarkCheck, ExternalLink, Tag, Filter, Star, Share2,
  ArrowLeft, Calendar, ThumbsUp, Printer, Check, Edit3, Plus, Trash2, AlertCircle
} from 'lucide-react';
import { canManageNews } from '../lib/portalHelpers';
import { usePortal } from '../state/PortalContext';

const categories = [
  { id: 'all', label: 'Все материалы', count: 6 },
  { id: 'employment', label: 'Трудоустройство', count: 2, catName: 'Трудоустройство' },
  { id: 'law', label: 'Трудовое право', count: 2, catName: 'Трудовое право' },
  { id: 'pedagogy', label: 'Педагогика', count: 2, catName: 'Педагогика' },
  { id: 'health', label: 'Охрана труда', count: 1, catName: 'Охрана труда' },
];

const tags = ['Молодой специалист', 'Договор', 'КТП', 'Отпуск', 'Распределение', 'Аттестация', 'Охрана труда', 'Льготы'];

const getSavedArticleStorageKey = (userId: string) => `saved_article_ids:${userId}`;

interface Article {
  id: number;
  title: string;
  category: string;
  categoryColor: string;
  level: string;
  updated: string;
  views: number;
  time: string;
  source: string;
  tags: string[];
  content: string;
  related: { id: number; title: string }[];
}

export const articles: Article[] = [
  {
    id: 1,
    title: 'Какие документы нужны при первом трудоустройстве',
    category: 'Трудоустройство',
    categoryColor: '#2563EB',
    level: 'Новичок',
    updated: '28 мар 2026',
    views: 1240,
    time: '5 мин',
    source: 'Трудовой кодекс РБ, статья 26',
    tags: ['Новичок', 'Документы', 'Трудоустройство'],
    content: `
      <p class="text-slate-800 text-lg font-medium leading-relaxed mb-6">
        При первом трудоустройстве наниматель имеет право требовать от соискателя только документы, прямо предусмотренные законодательством. Избыточные требования являются нарушением трудовых прав.
      </p>
      <p class="text-slate-700 leading-relaxed mb-4">
        В соответствии со статьей 26 Трудового кодекса Республики Беларусь, при заключении трудового договора наниматель обязан потребовать, а гражданин обязан предъявить следующие документы:
      </p>
      <h3 class="text-xl font-bold text-slate-900 mt-8 mb-3">Обязательные документы:</h3>
      <ol class="list-decimal pl-6 space-y-2 text-slate-700 mb-6">
        <li><strong>Документ, удостоверяющий личность:</strong> Паспорт гражданина Республики Беларусь, идентификационная карта (ID-карта) либо вид на жительство.</li>
        <li><strong>Документы воинского учета:</strong> Для военнообязанных и лиц, подлежащих призыву на воинскую службу (военный билет, удостоверение призывника).</li>
        <li><strong>Документ об образовании:</strong> Диплом об образовании, свидетельство о повышении квалификации, документ, подтверждающий обучение (если применимо).</li>
        <li><strong>Направление на работу:</strong> Для выпускников государственных учебных заведений, распределенных на обязательное место работы.</li>
      </ol>
      <h3 class="text-xl font-bold text-slate-900 mt-8 mb-3">Дополнительно для отдельных категорий:</h3>
      <p class="text-slate-700 leading-relaxed mb-4">
        Для работы в сфере образования, здравоохранения и общественного питания наниматель вправе потребовать медицинскую справку о состоянии здоровья (медицинскую книжку). Для педагогических работников также обязательна справка об отсутствии судимости, запрашиваемая нанимателем в органах внутренних дел.
      </p>
      <h3 class="text-xl font-bold text-slate-900 mt-8 mb-3">Что наниматель НЕ имеет права требовать:</h3>
      <p class="text-slate-700 leading-relaxed mb-4">
        Запрещается требовать при заключении трудового договора документы, не предусмотренные законодательством. Например: справки о семейном положении, характеристику с предыдущего места учебы (за исключением случаев, прямо установленных Декретом № 5), информацию об имуществе или планы на рождение детей.
      </p>
    `,
    related: [
      { id: 4, title: 'Трудовой договор: на что обратить внимание' },
      { id: 2, title: 'Права молодого специалиста по распределению' }
    ]
  },
  {
    id: 2,
    title: 'Права молодого специалиста по распределению',
    category: 'Трудовое право',
    categoryColor: '#7C3AED',
    level: 'Новичок',
    updated: '25 мар 2026',
    views: 876,
    time: '8 мин',
    source: 'Кодекс об образовании РБ, акты о распределении выпускников',
    tags: ['Распределение', 'Льготы', 'Право'],
    content: `
      <p class="text-slate-800 text-lg font-medium leading-relaxed mb-6">
        Молодые специалисты в Республике Беларусь обладают особым юридическим статусом, который гарантирует им социальную защиту, защиту от необоснованного увольнения и обязательные компенсационные выплаты.
      </p>
      <p class="text-slate-700 leading-relaxed mb-4">
        Статус молодого специалиста присваивается выпускникам, получившим образование в дневной форме за счет средств республиканского или местных бюджетов и направленным на работу по распределению. Срок обязательной отработки составляет <strong>2 года</strong> для высшего образования.
      </p>
      <h3 class="text-xl font-bold text-slate-900 mt-8 mb-3">Гарантии и компенсации:</h3>
      <ul class="list-disc pl-6 space-y-2 text-slate-700 mb-6">
        <li><strong>Денежная помощь (подъемные):</strong> Выплачивается в размере месячной стипендии, назначенной в последнем семестре, в течение месяца после заключения договора. Если стипендия не выплачивалась — в размере социальной стипендии.</li>
        <li><strong>Компенсация за переезд:</strong> Наниматель компенсирует расходы на проезд выпускника и членов его семьи, а также провоз имущества к новому месту жительства.</li>
        <li><strong>Защита от увольнения:</strong> Увольнение молодого специалиста в период отработки по инициативе нанимателя допускается только в исключительных случаях (ликвидация организации, длительная болезнь или грубое нарушение дисциплины). Сокращение штата в этот период запрещено.</li>
      </ul>
      <h3 class="text-xl font-bold text-slate-900 mt-8 mb-3">Перераспределение:</h3>
      <p class="text-slate-700 leading-relaxed mb-4">
        Если условия труда нарушаются, либо у выпускника изменились семейные обстоятельства (вступление в брак с распределенным в другой город, медицинские противопоказания), он имеет право обратиться в комиссию своего вуза для прохождения процедуры перераспределения и получения нового направления на работу.
      </p>
    `,
    related: [
      { id: 1, title: 'Какие документы нужны при первом трудоустройстве' },
      { id: 4, title: 'Трудовой договор: на что обратить внимание' }
    ]
  },
  {
    id: 3,
    title: 'Как составить календарно-тематический план (КТП)',
    category: 'Педагогика',
    categoryColor: '#059669',
    level: 'Новичок',
    updated: '20 мар 2026',
    views: 2100,
    time: '12 мин',
    source: 'Инструктивно-методическое письмо Министерства образования',
    tags: ['КТП', 'Планирование', 'Педагогика'],
    content: `
      <p class="text-slate-800 text-lg font-medium leading-relaxed mb-6">
        Календарно-тематическое планирование (КТП) является ключевым методическим документом учителя, определяющим структуру и последовательность изучения разделов школьного предмета.
      </p>
      <p class="text-slate-700 leading-relaxed mb-4">
        Правильно составленное КТП позволяет оптимизировать учебный процесс и гарантирует полное прохождение программы учебного курса в отведенное количество часов.
      </p>
      <h3 class="text-xl font-bold text-slate-900 mt-8 mb-3">Этапы составления КТП:</h3>
      <ol class="list-decimal pl-6 space-y-2 text-slate-700 mb-6">
        <li><strong>Изучение учебной программы:</strong> Темы и количество часов в плане должны строго соответствовать государственному образовательному стандарту по вашему предмету.</li>
        <li><strong>Определение структуры уроков:</strong> Разбейте общие темы на отдельные уроки. Запланируйте резервные часы на повторение.</li>
        <li><strong>Планирование форм контроля:</strong> Равномерно распределите самостоятельные работы, тесты, диктанты и практические работы по четвертям.</li>
        <li><strong>Формулировка целей:</strong> Укажите обучающие, развивающие и воспитательные цели для каждого урока.</li>
      </ol>
      <h3 class="text-xl font-bold text-slate-900 mt-8 mb-3">Утверждение КТП:</h3>
      <p class="text-slate-700 leading-relaxed mb-4">
        Календарно-тематический план составляется до начала учебного года, рассматривается на заседании школьного методического объединения учителей-предметников и утверждается заместителем директора по учебной работе не позднее 31 августа.
      </p>
    `,
    related: [
      { id: 6, title: 'Порядок прохождения аттестации педагога' }
    ]
  },
  {
    id: 4,
    title: 'Трудовой договор: на что обратить внимание',
    category: 'Трудовое право',
    categoryColor: '#7C3AED',
    level: 'Новичок',
    updated: '18 мар 2026',
    views: 3200,
    time: '10 мин',
    source: 'Трудовой кодекс РБ, глава 2',
    tags: ['Договор', 'Трудовое право'],
    content: `
      <p class="text-slate-800 text-lg font-medium leading-relaxed mb-6">
        Трудовой договор (контракт) — это основное соглашение между вами и работодателем. Подписывая его, вы соглашаетесь со всеми условиями работы, поэтому важно изучить его до подписания.
      </p>
      <p class="text-slate-700 leading-relaxed mb-4">
        Для молодых специалистов законодательство РБ устанавливает, что срок контракта не должен быть меньше срока обязательной отработки по распределению (как правило, 2 года).
      </p>
      <h3 class="text-xl font-bold text-slate-900 mt-8 mb-3">Критически важные условия контракта:</h3>
      <ul class="list-disc pl-6 space-y-2 text-slate-700 mb-6">
        <li><strong>Трудовая функция:</strong> Проверьте, чтобы в контракте была указана именно та должность и специальность, по которой вас распределили. Вас не могут заставить выполнять другую работу без вашего согласия.</li>
        <li><strong>Оплата труда:</strong> В контракте должен быть указан оклад, условия премирования, а также размер надбавки за работу по контракту (не менее 10% оклада согласно Декрету № 29).</li>
        <li><strong>Сроки выплаты зарплаты:</strong> Зарплата должна выплачиваться регулярно в установленные дни не реже 2 раз в месяц.</li>
        <li><strong>Режим работы:</strong> Убедитесь, что зафиксировано точное время начала и окончания рабочего дня, перерывы и количество выходных дней.</li>
      </ul>
      <p class="text-slate-700 leading-relaxed mb-4">
        При возникновении вопросов или спорных пунктов вы имеете право взять проект контракта домой на изучение и проконсультироваться с юристом профсоюза.
      </p>
    `,
    related: [
      { id: 1, title: 'Какие документы нужны при первом трудоустройстве' },
      { id: 2, title: 'Права молодого специалиста по распределению' }
    ]
  },
  {
    id: 5,
    title: 'Охрана труда в образовательной организации',
    category: 'Охрана труда',
    categoryColor: '#0891B2',
    level: 'Практика',
    updated: '15 мар 2026',
    views: 560,
    time: '7 мин',
    source: 'Закон РБ «Об охране труда», санитарно-эпидемиологические требования',
    tags: ['Охрана труда', 'Инструктаж', 'Безопасность'],
    content: `
      <p class="text-slate-800 text-lg font-medium leading-relaxed mb-6">
        Соблюдение правил охраны труда и техники безопасности — это персональная юридическая ответственность каждого педагогического работника в целях сохранения жизни и здоровья учащихся.
      </p>
      <p class="text-slate-700 leading-relaxed mb-4">
        Учитель несет ответственность за безопасность детей во время проведения урока, а также на переменах во время своего дежурства по школе.
      </p>
      <h3 class="text-xl font-bold text-slate-900 mt-8 mb-3">Обязанности учителя по охране труда:</h3>
      <ol class="list-decimal pl-6 space-y-2 text-slate-700 mb-6">
        <li><strong>Инструктаж учащихся:</strong> Перед началом учебного года, а также перед практическими, лабораторными работами и экскурсиями учитель обязан провести инструктаж по технике безопасности и сделать отметку в классном журнале.</li>
        <li><strong>Контроль рабочего места:</strong> Перед началом урока визуально проверьте исправность розеток, мебели, освещения в кабинете. При обнаружении неполадок сообщите завхозу.</li>
        <li><strong>Действия при несчастном случае:</strong> Немедленно остановить учебный процесс, оказать первую помощь пострадавшему ребенку, вызвать медицинского работника, доложить руководству школы и известить родителей.</li>
      </ol>
    `,
    related: [
      { id: 3, title: 'Как составить календарно-тематический план (КТП)' }
    ]
  },
  {
    id: 6,
    title: 'Порядок прохождения аттестации педагога',
    category: 'Педагогика',
    categoryColor: '#059669',
    level: 'Практика',
    updated: '10 мар 2026',
    views: 1100,
    time: '15 мин',
    source: 'Инструкция о порядке аттестации педработников Министерства образования РБ',
    tags: ['Аттестация', 'Карьера', 'Педагогика'],
    content: `
      <p class="text-slate-800 text-lg font-medium leading-relaxed mb-6">
        Аттестация — это процедура подтверждения квалификации педагога для присвоения квалификационных категорий (вторая, первая, высшая, учитель-методист).
      </p>
      <p class="text-slate-700 leading-relaxed mb-4">
        Присвоение категории напрямую влияет на размер заработной платы педагога (надбавка составляет от 15% за вторую категорию до 50% за категорию учителя-методиста).
      </p>
      <h3 class="text-xl font-bold text-slate-900 mt-8 mb-3">Категории и условия получения:</h3>
      <ul class="list-disc pl-6 space-y-2 text-slate-700 mb-6">
        <li><strong>Вторая категория:</strong> Допускается прохождение аттестации после 2 лет работы по специальности при наличии положительного отзыва руководства.</li>
        <li><strong>Первая категория:</strong> Срок работы в предыдущей категории — не менее 3 лет, успешное ведение методической работы в школе.</li>
        <li><strong>Высшая категория:</strong> Срок работы в первой категории — не менее 3 лет, сдача квалификационного экзамена в Академии образования.</li>
      </ul>
      <h3 class="text-xl font-bold text-slate-900 mt-8 mb-3">Этапы аттестации:</h3>
      <p class="text-slate-700 leading-relaxed mb-4">
        Процесс включает подачу заявления в аттестационную комиссию школы, проведение открытых уроков, предоставление портфолио с методическими разработками и собеседование.
      </p>
    `,
    related: [
      { id: 3, title: 'Как составить календарно-тематический план (КТП)' }
    ]
  }
];

export default function KnowledgeBasePage() {
  const { currentUser } = usePortal();
  const canEditKnowledge = canManageNews(currentUser);
  const [managedArticles, setManagedArticles] = useState(articles);
  const [knowledgeFormOpen, setKnowledgeFormOpen] = useState(false);
  const [editingKnowledgeId, setEditingKnowledgeId] = useState<number | null>(null);
  const [submissionQueue, setSubmissionQueue] = useState<Article[]>([]);
  const [knowledgeForm, setKnowledgeForm] = useState({
    title: '',
    category: 'Трудоустройство',
    level: 'Новичок',
    tags: '',
    content: '',
    source: '',
    readTime: '5 мин',
  });
  const [kbPreview, setKbPreview] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const articleIdParam = searchParams.get('id');

  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(
    articleIdParam ? parseInt(articleIdParam, 10) : null
  );
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const [likes, setLikes] = useState<Record<number, number>>({
    1: 45, 2: 89, 3: 112, 4: 76, 5: 32, 6: 54
  });
  const [hasLiked, setHasLiked] = useState<Record<number, boolean>>({});
  const [showShareToast, setShowShareToast] = useState(false);
  const [authActionMessage, setAuthActionMessage] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setBookmarks(new Set());
      return;
    }

    try {
      const saved = localStorage.getItem(getSavedArticleStorageKey(currentUser.id));
      setBookmarks(saved ? new Set(JSON.parse(saved)) : new Set());
    } catch {
      setBookmarks(new Set());
    }
  }, [currentUser]);

  useEffect(() => {
    const id = searchParams.get('id');
    const q = searchParams.get('q');
    
    if (id) {
      setSelectedArticleId(parseInt(id, 10));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setSelectedArticleId(null);
    }
    
    if (q !== null) {
      setSearch(q);
    }
  }, [searchParams]);

  const handleSelectArticle = (id: number | null) => {
    if (id) {
      setSearchParams({ id: String(id) });
    } else {
      setSearchParams({});
    }
  };

  const handleToggleBookmark = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!currentUser) {
      setAuthActionMessage('Войдите в аккаунт, чтобы сохранять материалы в избранное.');
      window.setTimeout(() => setAuthActionMessage(''), 3500);
      return;
    }

    const updated = new Set(bookmarks);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setBookmarks(updated);
    localStorage.setItem(getSavedArticleStorageKey(currentUser.id), JSON.stringify(Array.from(updated)));
  };

  const handleLike = (id: number) => {
    if (hasLiked[id]) {
      setLikes(prev => ({ ...prev, [id]: prev[id] - 1 }));
      setHasLiked(prev => ({ ...prev, [id]: false }));
    } else {
      setLikes(prev => ({ ...prev, [id]: prev[id] + 1 }));
      setHasLiked(prev => ({ ...prev, [id]: true }));
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3000);
  };

  const currentArticle = managedArticles.find(art => art.id === selectedArticleId);

  // Фильтрация статей
  const filteredArticles = managedArticles.filter(art => {
    // По категории
    if (selectedCat !== 'all') {
      const cat = categories.find(c => c.id === selectedCat);
      if (cat && art.category !== cat.catName) return false;
    }
    // По уровню
    if (selectedLevel !== 'all') {
      const levelCode = selectedLevel === 'beginner' ? 'Новичок' : 'Практика';
      if (art.level !== levelCode) return false;
    }
    // По поиску
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      const inTitle = art.title.toLowerCase().includes(q);
      const inTags = art.tags.some(t => t.toLowerCase().includes(q));
      if (!inTitle && !inTags) return false;
    }
    return true;
  });

  const resetKnowledgeForm = () => {
    setKnowledgeForm({ title: '', category: 'Трудоустройство', level: 'Новичок', tags: '', content: '', source: '', readTime: '5 мин' });
    setEditingKnowledgeId(null);
    setKbPreview(false);
  };

  const categoryColors: Record<string, string> = {
    'Трудоустройство': '#2563EB',
    'Трудовое право': '#D97706',
    'Педагогика': '#059669',
    'Охрана труда': '#DC2626',
  };

  const buildArticleFromForm = (id = Date.now()): Article => ({
    id,
    title: knowledgeForm.title.trim(),
    category: knowledgeForm.category.trim() || 'Трудоустройство',
    categoryColor: categoryColors[knowledgeForm.category.trim()] ?? '#2563EB',
    level: knowledgeForm.level as Article['level'],
    time: knowledgeForm.readTime || '5 мин',
    views: 0,
    updated: new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' }),
    source: knowledgeForm.source.trim() || 'Материал пользователя',
    tags: knowledgeForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    content: knowledgeForm.content.trim().replace(/\n/g, '<br />'),
    related: [],
  });

  const handleSaveKnowledge = () => {
    if (!knowledgeForm.title.trim() || !knowledgeForm.content.trim()) return;
    if (canEditKnowledge) {
      if (editingKnowledgeId) {
        setManagedArticles((prev) => prev.map((article) => article.id === editingKnowledgeId ? buildArticleFromForm(editingKnowledgeId) : article));
      } else {
        setManagedArticles((prev) => [buildArticleFromForm(), ...prev]);
      }
    } else {
      setSubmissionQueue((prev) => [buildArticleFromForm(), ...prev]);
    }
    resetKnowledgeForm();
    setKnowledgeFormOpen(false);
  };

  const handleEditKnowledge = (article: Article) => {
    setKnowledgeForm({
      title: article.title,
      category: article.category,
      level: article.level,
      tags: article.tags.join(', '),
      content: article.content.replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, ''),
      source: article.source,
      readTime: article.time,
    });
    setEditingKnowledgeId(article.id);
    setKnowledgeFormOpen(true);
    setKbPreview(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Toast Notification */}
      {showShareToast && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm z-50 animate-bounce">
          <Check size={16} className="text-green-400" />
          <span>Ссылка скопирована в буфер обмена!</span>
        </div>
      )}

      {authActionMessage ? (
        <div className="fixed bottom-5 right-5 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-xl">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-slate-900">Нужен вход</p>
            <p className="mt-0.5">{authActionMessage}</p>
            <Link to="/login" className="mt-2 inline-flex text-xs font-semibold text-blue-700 hover:underline">
              Перейти ко входу
            </Link>
          </div>
        </div>
      ) : null}

      {currentArticle ? (
        /* ==================== ARTICLE DETAIL VIEW ==================== */
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
            <Link to="/" className="hover:text-blue-600">Главная</Link>
            <ChevronRight size={14} />
            <span className="hover:text-blue-600 cursor-pointer" onClick={() => handleSelectArticle(null)}>База знаний</span>
            <ChevronRight size={14} />
            <span className="text-slate-800 line-clamp-1">{currentArticle.title}</span>
          </nav>

          <button
            onClick={() => handleSelectArticle(null)}
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 mb-6 font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Назад к списку статей
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Article Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {/* Header block with gradient */}
                <div
                  className="h-44 sm:h-56 p-6 sm:p-8 flex flex-col justify-end text-white relative"
                  style={{ background: `linear-gradient(135deg, ${currentArticle.categoryColor} 0%, #1e1b4b 100%)` }}
                >
                  <div className="absolute top-6 left-6 sm:left-8 flex gap-2">
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-md">
                      {currentArticle.category}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider bg-green-500/30 backdrop-blur-md">
                      {currentArticle.level}
                    </span>
                  </div>
                  <div className="max-w-2xl">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white leading-tight mb-3">
                      {currentArticle.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-white/80">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {currentArticle.updated}</span>
                      <span className="flex items-center gap-1"><Eye size={12} /> {currentArticle.views.toLocaleString('ru')}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {currentArticle.time} чтения</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                    <span className="text-xs text-slate-400 font-medium">Теги:</span>
                    {currentArticle.tags.map(t => (
                      <span key={t} className="text-xs px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">{t}</span>
                    ))}
                  </div>

                  <div 
                    className="prose prose-slate max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: currentArticle.content }}
                  />

                  {/* Document Source link */}
                  {currentArticle.source && (
                    <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-slate-600 flex items-center gap-1.5"><ExternalLink size={14} className="text-slate-400" /> Первоисточник: <strong>{currentArticle.source}</strong></span>
                      <span className="text-blue-600 hover:underline cursor-pointer">Открыть закон</span>
                    </div>
                  )}

                  {/* Actions Panel */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleLike(currentArticle.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          hasLiked[currentArticle.id]
                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <ThumbsUp size={16} className={hasLiked[currentArticle.id] ? 'fill-blue-600' : ''} />
                        <span>Полезно ({likes[currentArticle.id]})</span>
                      </button>

                      <button
                        onClick={(e) => handleToggleBookmark(currentArticle.id, e)}
                        aria-label={
                          currentUser
                            ? bookmarks.has(currentArticle.id)
                              ? 'Удалить материал из избранного'
                              : 'Добавить материал в избранное'
                            : 'Войдите, чтобы сохранить материал'
                        }
                        className={`p-2 rounded-xl border transition-colors ${
                          bookmarks.has(currentArticle.id)
                            ? 'bg-amber-50 border-amber-200 text-amber-600'
                            : 'border-slate-200 text-slate-400 hover:text-amber-500'
                        }`}
                        title={bookmarks.has(currentArticle.id) ? 'Удалить из избранного' : 'В избранное'}
                      >
                        <Bookmark size={18} className={bookmarks.has(currentArticle.id) ? 'fill-amber-500' : ''} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleShare}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                      >
                        <Share2 size={15} />
                        <span>Поделиться</span>
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 transition-colors hidden sm:block"
                        title="Печать статьи"
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Related Articles */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Похожие материалы</h3>
                <div className="space-y-4">
                  {currentArticle.related.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectArticle(item.id)}
                      className="group cursor-pointer flex flex-col gap-1 pb-3 border-b border-slate-100 last:border-0 last:pb-0"
                    >
                      <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">
                        {item.title}
                      </h4>
                      <span className="text-xs text-slate-400 mt-1 block">Читать далее &rarr;</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ==================== LIST VIEW ==================== */
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
            <Link to="/" className="hover:text-blue-600">Главная</Link>
            <ChevronRight size={14} />
            <span className="text-slate-800">База знаний</span>
          </nav>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen size={24} className="text-blue-600" /> База знаний
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm text-slate-500 font-medium">
                Показано: {filteredArticles.length} материалов
              </div>
              <button
                onClick={() => {
                  resetKnowledgeForm();
                  setKnowledgeFormOpen((value) => !value);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                <Plus size={15} /> {canEditKnowledge ? 'Новый материал' : 'Предложить материал'}
              </button>
            </div>
          </div>

          {canEditKnowledge ? (
            <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <h2 className="font-semibold text-slate-900">Админка редактора базы знаний</h2>
              <p className="mt-1 text-sm text-slate-600">Редактор может создавать, изменять, удалять материалы и одобрять заявки пользователей.</p>
              {submissionQueue.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {submissionQueue.map((article) => (
                    <div key={article.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{article.title}</p>
                        <p className="text-xs text-slate-500">{article.category}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setManagedArticles((prev) => [article, ...prev]);
                            setSubmissionQueue((prev) => prev.filter((item) => item.id !== article.id));
                          }}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          Одобрить
                        </button>
                        <button
                          onClick={() => setSubmissionQueue((prev) => prev.filter((item) => item.id !== article.id))}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                        >
                          Отклонить
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500">Новых заявок на материалы пока нет.</p>
              )}
            </div>
          ) : null}

          {knowledgeFormOpen ? (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
                <h2 className="font-semibold text-slate-900">
                  {canEditKnowledge ? (editingKnowledgeId ? 'Редактировать материал' : 'Создать материал') : 'Предложить материал'}
                </h2>
                <button type="button" onClick={() => setKbPreview(!kbPreview)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50">
                  <Eye size={13} className="inline -mt-0.5 mr-1" />{kbPreview ? 'Редактор' : 'Предпросмотр'}
                </button>
              </div>
              {kbPreview ? (
                <div className="p-6 max-w-3xl mx-auto space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ color: categoryColors[knowledgeForm.category] ?? '#2563EB', background: (categoryColors[knowledgeForm.category] ?? '#2563EB') + '15' }}>{knowledgeForm.category}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${knowledgeForm.level === 'Новичок' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{knowledgeForm.level}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-slate-950">{knowledgeForm.title || 'Без заголовка'}</h1>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={11} />{knowledgeForm.readTime || '5 мин'} чтения</span>
                    <span className="flex items-center gap-1"><BookOpen size={11} />{knowledgeForm.source || 'Материал пользователя'}</span>
                  </div>
                  <div className="prose prose-slate max-w-none">
                    {knowledgeForm.content.split('\n').filter(Boolean).map((p, i) => <p key={i} className="text-slate-700 leading-relaxed">{p}</p>)}
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {knowledgeForm.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"><Tag size={10} className="inline -mt-0.5 mr-0.5" />{tag}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-5 space-y-4">
                  <input
                    value={knowledgeForm.title}
                    onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Заголовок материала"
                    className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-0 py-3 text-xl font-bold text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:outline-none"
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="space-y-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Категория</span>
                      <select value={knowledgeForm.category} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, category: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                        <option>Трудоустройство</option>
                        <option>Трудовое право</option>
                        <option>Педагогика</option>
                        <option>Охрана труда</option>
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Уровень</span>
                      <select value={knowledgeForm.level} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, level: event.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm">
                        <option>Новичок</option>
                        <option>Практика</option>
                      </select>
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Время чтения</span>
                      <input value={knowledgeForm.readTime} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, readTime: event.target.value }))} placeholder="5 мин" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Источник</span>
                      <input value={knowledgeForm.source} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, source: event.target.value }))} placeholder="Закон, методичка..." className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                    </label>
                  </div>
                  <label className="space-y-1 block">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Теги через запятую</span>
                    <input value={knowledgeForm.tags} onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="Молодой специалист, Договор, Аттестация" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
                    {knowledgeForm.tags.trim() ? (
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {knowledgeForm.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                          <span key={tag} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </label>
                  <div className="relative">
                    <textarea
                      value={knowledgeForm.content}
                      onChange={(event) => setKnowledgeForm((prev) => ({ ...prev, content: event.target.value }))}
                      rows={10}
                      placeholder="Текст материала. Разделяйте абзацы пустой строкой для красивой структуры."
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-relaxed focus:border-blue-300 focus:outline-none"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                      {knowledgeForm.content.trim().split(/\s+/).filter(Boolean).length} слов
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3 bg-slate-50/50">
                <button onClick={handleSaveKnowledge} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                  {canEditKnowledge ? 'Сохранить' : 'Отправить на проверку'}
                </button>
                <button onClick={() => { resetKnowledgeForm(); setKnowledgeFormOpen(false); }} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Отмена</button>
              </div>
            </div>
          ) : null}

          {/* Search bar */}
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              type="text"
              placeholder="Поиск по базе знаний (например: договор, КТП)..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm transition-all"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column (Sidebar Filters) */}
            <div className="space-y-5">
              {/* Categories */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 text-sm">Категории</h3>
                <div className="space-y-1">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCat(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCat === cat.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${selectedCat === cat.id ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        {cat.id === 'all' ? managedArticles.length : managedArticles.filter(a => a.category === cat.catName).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2"><Filter size={14} /> Уровень</h3>
                <div className="space-y-1">
                  {[
                    { id: 'all', label: 'Все уровни' },
                    { id: 'beginner', label: 'Новичок' },
                    { id: 'practice', label: 'Практикующий' }
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      onClick={() => setSelectedLevel(lvl.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedLevel === lvl.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Cloud */}
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2"><Tag size={14} /> Теги</h3>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <button 
                      key={tag} 
                      onClick={() => setSearch(tag)}
                      className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (Articles List) */}
            <div className="lg:col-span-3 space-y-4">
              {filteredArticles.length > 0 ? (
                filteredArticles.map(article => (
                  <div
                    key={article.id}
                    onClick={() => handleSelectArticle(article.id)}
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-blue-200 cursor-pointer transition-all flex gap-4 group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ color: article.categoryColor, background: article.categoryColor + '15' }}>
                          {article.category}
                        </span>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${article.level === 'Новичок' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          {article.level}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-base leading-snug mb-2">
                        {article.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Clock size={11} />{article.time} чтения</span>
                        <span className="flex items-center gap-1"><Eye size={11} />{article.views.toLocaleString('ru')} просмотров</span>
                        <span className="flex items-center gap-1"><Calendar size={11} />Обновлено {article.updated}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-start gap-2">
                      {canEditKnowledge ? (
                        <>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              handleEditKnowledge(article);
                            }}
                            className="text-slate-400 hover:text-blue-600"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setManagedArticles((prev) => prev.filter((item) => item.id !== article.id));
                            }}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      ) : null}
                      <button
                        onClick={(e) => handleToggleBookmark(article.id, e)}
                        aria-label={
                          currentUser
                            ? bookmarks.has(article.id)
                              ? 'Удалить материал из избранного'
                              : 'Добавить материал в избранное'
                            : 'Войдите, чтобы сохранить материал'
                        }
                        className="text-slate-300 hover:text-blue-500 transition-colors"
                      >
                        {bookmarks.has(article.id)
                          ? <BookmarkCheck size={20} className="text-blue-500 fill-blue-500" />
                          : <Bookmark size={20} />
                        }
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-slate-500">По вашему запросу ничего не найдено.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
