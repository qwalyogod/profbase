// Personal specialist cabinet (per-user). The backend keys everything by the
// authenticated identity, so there is no userId in these calls.
import { apiGet, apiPost } from './client';

export type CabinetFeature = 'calendar' | 'notes' | 'diary' | 'journal' | 'employment-docs' | 'employment-steps';

export const cabinetApi = {
  fetchAll: () => apiGet<{ success: boolean; features: Partial<Record<CabinetFeature, unknown>> }>('/cabinet/index.php'),
  save: (feature: CabinetFeature, payload: unknown) => apiPost('/cabinet/index.php', { feature, payload }),
};
