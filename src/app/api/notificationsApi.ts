import { PortalNotification } from '../types/portal';
import { apiAction } from './client';

export const notificationsApi = {
  create: (payload: Omit<PortalNotification, 'id' | 'createdAt' | 'dismissedByUserIds'> & { id?: string }) =>
    apiAction<{ id: string }>('notifications', 'createNotification', payload as Record<string, unknown>),
  dismiss: (notificationId: string) => apiAction('notifications', 'dismissNotification', { notificationId }),
};
