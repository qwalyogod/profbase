import { ReactNode } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

interface StateBlockProps {
  title: string;
  description: string;
  loading?: boolean;
  action?: ReactNode;
}

export function StateBlock({ title, description, loading, action }: StateBlockProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center">
        {loading ? <Loader2 size={20} className="text-slate-500 animate-spin" /> : <AlertCircle size={20} className="text-slate-500" />}
      </div>
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
