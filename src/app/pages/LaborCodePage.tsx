import { useState } from 'react';
import { Link } from 'react-router';
import {
  Search, Scale, ChevronRight, Bookmark, BookmarkCheck,
  ExternalLink, Shield, ChevronDown, ChevronUp, ArrowLeft
} from 'lucide-react';

const sections = [
  { id: 'general', label: 'Общие положения', articles: ['Официальный текст ТК РБ на pravo.by'] },
  { id: 'employment', label: 'Трудоустройство и договор', articles: ['Ст. 26 — документы при заключении трудового договора'] },
  { id: 'worktime', label: 'Рабочее время', articles: ['Рабочее время — смотреть актуальный текст'] },
  { id: 'vacation', label: 'Отпуска', articles: ['Трудовые отпуска — смотреть актуальный текст'] },
  { id: 'salary', label: 'Оплата труда', articles: ['Оплата труда — смотреть актуальный текст'] },
  { id: 'safety', label: 'Охрана труда', articles: ['Закон РБ «Об охране труда»'] },
  { id: 'education', label: 'Сфера образования', articles: ['Кодекс об образовании', 'Распределение', 'Аттестация', 'Контракт'] },
];

const documents = [
  { id: 1, title: 'Трудовой кодекс Республики Беларусь', number: '296-З', date: '26.07.1999', updated: 'Актуальная редакция', type: 'Кодекс', url: 'pravo.by', href: 'https://pravo.by/document/?guid=3871&p0=hk9900296' },
  { id: 2, title: 'Кодекс Республики Беларусь об образовании', number: '243-З', date: '13.01.2011', updated: 'Актуальная редакция', type: 'Кодекс', url: 'pravo.by', href: 'https://pravo.by/document/?guid=3871&p0=hk1100243' },
  { id: 3, title: 'Положение о распределении, перераспределении и направлении на работу выпускников', number: '572', date: '31.08.2022', updated: 'Актуально', type: 'Постановление', url: 'pravo.by', href: 'https://pravo.by/document/?guid=3871&p0=C22200572' },
  { id: 4, title: 'Закон Республики Беларусь «Об охране труда»', number: '356-З', date: '23.06.2008', updated: 'Актуальная редакция', type: 'Закон', url: 'pravo.by', href: 'https://pravo.by/document/?guid=3871&p0=h10800356' },
  { id: 5, title: 'Аттестация педагогических работников системы образования', number: '101', date: '22.08.2012', updated: 'Раздел Минобразования', type: 'Инструкция', url: 'edu.gov.by', href: 'https://edu.gov.by/sistema-obrazovaniya/upr-kadr/attestatsiya/' },
];

const articleDetail = {
  id: 26,
  title: 'Статья 26 ТК РБ. Документы, предъявляемые при заключении трудового договора',
  text: `При заключении трудового договора лицо, поступающее на работу, предъявляет работодателю:

документ, удостоверяющий личность;
документы воинского учета для военнообязанных и лиц, подлежащих призыву;
трудовую книжку, за исключением случаев первого поступления на работу и иных случаев, установленных законодательством;
документ об образовании или документ об обучении, если работа требует специальных знаний;
направление на работу либо справку о самостоятельном трудоустройстве для выпускников, которым место работы предоставляется по распределению;
индивидуальную программу реабилитации инвалида, если она необходима для определения условий труда;
декларацию о доходах и имуществе, медицинскую справку и другие документы только в случаях, прямо предусмотренных законодательными актами.

Запрещается требовать документы, не предусмотренные законодательством Республики Беларусь. Для официального применения необходимо сверять текст нормы на Национальном правовом Интернет-портале.`,
  source: 'Официальный текст на pravo.by',
  related: ['Ст. 19 — Содержание и условия трудового договора', 'Ст. 28 — Испытательный срок', 'Положение о распределении выпускников'],
};

export default function LaborCodePage() {
  const [search, setSearch] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>('employment');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['employment']));
  const [selectedDoc, setSelectedDoc] = useState<number | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());

  const toggleSection = (id: string) => {
    const n = new Set(expandedSections);
    n.has(id) ? n.delete(id) : n.add(id);
    setExpandedSections(n);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Главная</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800">Трудовой кодекс и документы</span>
      </nav>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Scale size={22} className="text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Трудовой кодекс и правовые документы</h1>
          <p className="text-sm text-slate-500">Правовой раздел для специалистов</p>
        </div>
      </div>

      {/* Important note */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
        <Shield size={18} className="text-amber-600 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-900">Важная правовая информация</p>
          <p className="text-sm text-amber-800 mt-0.5">
            Тексты документов приводятся в справочных целях и могут не отражать последних изменений.
            Для официального применения обращайтесь к актуальным текстам на <a href="https://pravo.by/" target="_blank" rel="noreferrer" className="underline">pravo.by</a> и ресурсам компетентных органов Республики Беларусь.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          type="text"
          placeholder="Поиск по статьям, ключевым словам..."
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Оглавление ТК РБ</h3>
            </div>
            <div className="py-2">
              {sections.map(section => (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      selectedSection === section.id ? 'text-blue-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{section.label}</span>
                    {expandedSections.has(section.id) ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </button>
                  {expandedSections.has(section.id) && (
                    <div className="pl-6 pr-4 pb-2">
                      {section.articles.map(art => (
                        <button
                          key={art}
                          onClick={() => {
                            setSelectedSection(section.id);
                            if (art.startsWith('Ст. 26')) {
                              setSelectedDoc(26);
                            }
                          }}
                          className="block py-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                        >
                          {art}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="lg:col-span-3 space-y-5">
          {selectedDoc ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <button onClick={() => setSelectedDoc(null)} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline mb-5">
                <ArrowLeft size={14} /> К списку документов
              </button>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 className="text-lg font-bold text-slate-900">{articleDetail.title}</h2>
                <button
                  onClick={() => {
                    const b = new Set(bookmarks);
                    b.has(26) ? b.delete(26) : b.add(26);
                    setBookmarks(b);
                  }}
                  className="text-slate-300 hover:text-blue-500 transition-colors shrink-0"
                >
                  {bookmarks.has(26) ? <BookmarkCheck size={20} className="text-blue-500" /> : <Bookmark size={20} />}
                </button>
              </div>

              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line border-l-4 border-indigo-200 pl-4 bg-indigo-50/30 p-4 rounded-r-xl mb-5">
                {articleDetail.text}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a href="https://pravo.by/document/?guid=3871&p0=hk9900296" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                  <ExternalLink size={14} /> {articleDetail.source}
                </a>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-900 mb-3">Связанные статьи</h4>
                <div className="space-y-2">
                  {articleDetail.related.map(r => (
                    <div key={r} className="flex items-center gap-2 text-sm text-blue-600 hover:underline cursor-pointer">
                      <ChevronRight size={12} className="text-slate-400" />
                      {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Documents list */}
              <h2 className="font-semibold text-slate-900">Нормативно-правовые акты</h2>
              <div className="space-y-3">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-sm hover:border-indigo-200 transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium">
                            {doc.type}
                          </span>
                          <span className="text-xs text-slate-400">№{doc.number} от {doc.date}</span>
                          <span className="text-xs text-green-600">{doc.updated}</span>
                        </div>
                        {doc.id === 1 ? (
                          <button
                            onClick={() => setSelectedDoc(26)}
                            className="font-semibold text-slate-900 hover:text-indigo-700 text-sm leading-snug text-left block mb-3"
                          >
                            {doc.title}
                          </button>
                        ) : (
                          <p className="font-semibold text-slate-900 text-sm leading-snug mb-3">{doc.title}</p>
                        )}
                        <div className="flex items-center gap-3">
                          {doc.id === 1 ? (
                            <button onClick={() => setSelectedDoc(26)} className="text-xs text-indigo-600 hover:underline">
                              Открыть статью 26
                            </button>
                          ) : null}
                          <a href={doc.href} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600">
                            <ExternalLink size={11} /> Официальный источник: {doc.url}
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const b = new Set(bookmarks);
                          b.has(doc.id) ? b.delete(doc.id) : b.add(doc.id);
                          setBookmarks(b);
                        }}
                        className="text-slate-300 hover:text-blue-500 transition-colors shrink-0"
                      >
                        {bookmarks.has(doc.id) ? <BookmarkCheck size={18} className="text-blue-500" /> : <Bookmark size={18} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
