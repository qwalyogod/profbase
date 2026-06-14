import { Fragment, ReactNode, useMemo } from 'react';
import { Link } from 'react-router';
import { ChevronRight, FileText } from 'lucide-react';
import { termsOfUseMarkdown } from '../data/termsOfUse';

// Render inline **bold** segments without dangerouslySetInnerHTML.
function renderInline(text: string): ReactNode {
  return text.split(/\*\*/).map((part, index) =>
    index % 2 === 1 ? <strong key={index} className="font-semibold text-slate-900">{part}</strong> : <Fragment key={index}>{part}</Fragment>,
  );
}

export default function TermsPage() {
  const blocks = useMemo(() => {
    const lines = termsOfUseMarkdown.replace(/\r\n/g, '\n').split('\n');
    return lines.map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      if (/^---+$/.test(trimmed)) return <hr key={index} className="my-6 border-slate-200" />;
      if (trimmed.startsWith('### ')) return <h3 key={index} className="mt-6 mb-2 text-base font-semibold text-slate-900">{renderInline(trimmed.slice(4))}</h3>;
      if (trimmed.startsWith('## ')) return <h2 key={index} className="mt-8 mb-3 text-lg font-bold text-slate-900">{renderInline(trimmed.slice(3))}</h2>;
      if (trimmed.startsWith('# ')) return <h1 key={index} className="mt-2 mb-4 text-2xl font-bold text-slate-950">{renderInline(trimmed.slice(2))}</h1>;
      if (/^[-*]\s+/.test(trimmed)) return <li key={index} className="ml-5 list-disc text-sm leading-relaxed text-slate-600">{renderInline(trimmed.replace(/^[-*]\s+/, ''))}</li>;
      return <p key={index} className="mb-2 text-sm leading-relaxed text-slate-600">{renderInline(trimmed)}</p>;
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <nav className="flex items-center gap-1.5 text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-blue-600">Главная</Link>
        <ChevronRight size={14} />
        <span className="text-slate-800">Пользовательское соглашение</span>
      </nav>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><FileText size={22} /></div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Условия использования</h1>
          <p className="text-sm text-slate-500">Пользовательское соглашение портала «ПрофБаза»</p>
        </div>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {blocks}
      </article>
    </div>
  );
}
