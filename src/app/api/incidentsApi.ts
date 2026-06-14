import { Incident } from '../types/portal';
import { apiAction } from './client';

export const incidentsApi = {
  create: (payload: Omit<Incident, 'id' | 'createdAt'> & { id?: string }) =>
    apiAction<{ id: string }>('incidents', 'createIncident', payload as Record<string, unknown>),
  update: (incidentId: string, patch: Partial<Incident>) => apiAction('incidents', 'updateIncident', { incidentId, patch }),
  remove: (incidentId: string) => apiAction('incidents', 'deleteIncident', { incidentId }),
};
