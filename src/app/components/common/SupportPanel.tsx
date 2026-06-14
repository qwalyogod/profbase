import { FormEvent, useState } from 'react';
import { Paperclip, Send, X, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { usePortal } from '../../state/PortalContext';
import { formatDate } from '../../lib/portalHelpers';
import type { SupportAttachment, SupportTicketStatus } from '../../types/portal';

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const statusMeta: Record<SupportTicketStatus, { label: string; className: string; icon: typeof Clock }> = {
  open: { label: 'На рассмотрении', className: 'bg-amber-50 text-amber-700', icon: Clock },
  approved: { label: 'Выполнено', className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Отклонено', className: 'bg-red-50 text-red-700', icon: AlertCircle },
};

export default function SupportPanel() {
  const { currentUser, currentOrganization, database, createSupportTicket } = usePortal();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<SupportAttachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  if (!currentUser) return null;

  const myTickets = database.supportTickets
    .filter((ticket) => ticket.userId === currentUser.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const next: SupportAttachment[] = [];
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setStatus({ ok: false, text: `Файл «${file.name}» больше 5 МБ.` });
        continue;
      }
      next.push({ name: file.name, dataUrl: await readFileAsDataUrl(file), type: file.type });
    }
    setAttachments((prev) => [...prev, ...next]);
    event.target.value = '';
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus(null);
    if (!subject.trim() || !message.trim()) {
      setStatus({ ok: false, text: 'Заполните тему и текст обращения.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await createSupportTicket({
        subject: subject.trim(),
        message: message.trim(),
        attachments,
        organizationId: currentOrganization?.id ?? null,
      });
      setSubject('');
      setMessage('');
      setAttachments([]);
      setStatus({ ok: true, text: 'Обращение отправлено администратору.' });
    } catch (err) {
      setStatus({ ok: false, text: err instanceof Error ? err.message : 'Не удалось отправить обращение.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-3">
        {status ? (
          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${status.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {status.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {status.text}
          </div>
        ) : null}
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Тема обращения"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Опишите проблему или вопрос..."
          rows={4}
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
        />
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Paperclip size={13} /> Прикрепить файлы/фото
            <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" onChange={handleFiles} className="hidden" />
          </label>
          {attachments.map((file, index) => (
            <span key={`${file.name}-${index}`} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              {file.name}
              <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== index))} className="text-slate-400 hover:text-red-500">
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400"
        >
          {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Отправить обращение
        </button>
      </form>

      {myTickets.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Мои обращения</p>
          {myTickets.map((ticket) => {
            const meta = statusMeta[ticket.status];
            const StatusIcon = meta.icon;
            return (
              <div key={ticket.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{ticket.subject}</p>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${meta.className}`}>
                    <StatusIcon size={11} /> {meta.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{ticket.message}</p>
                {ticket.attachments.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {ticket.attachments.map((file, index) => (
                      <a key={index} href={file.dataUrl} download={file.name} className="text-xs text-blue-700 hover:underline">
                        {file.name}
                      </a>
                    ))}
                  </div>
                ) : null}
                {ticket.adminResponse ? (
                  <div className="mt-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Ответ администратора:</span> {ticket.adminResponse}
                  </div>
                ) : null}
                <p className="mt-2 text-xs text-slate-400">Отправлено {formatDate(ticket.createdAt)}</p>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
