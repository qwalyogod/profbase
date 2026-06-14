import { SupportAttachment } from '../types/portal';
import { apiAction } from './client';

export const supportApi = {
  create: (payload: { subject: string; message: string; attachments: SupportAttachment[]; organizationId?: string | null }) =>
    apiAction<{ id: string }>('support', 'createSupportTicket', payload as Record<string, unknown>),
  review: (ticketId: string, approve: boolean, response: string) =>
    apiAction('support', 'reviewSupportTicket', { ticketId, approve, response }),
};
