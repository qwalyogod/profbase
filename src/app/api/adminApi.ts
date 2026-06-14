import { SiteSettings, SpecialtyTag } from '../types/portal';
import { apiAction } from './client';

export const adminApi = {
  updateSiteSettings: (patch: Partial<SiteSettings>) => apiAction('admin', 'updateSiteSettings', { patch }),
  createSpecialtyTag: (payload: Partial<SpecialtyTag> & { name: string }) =>
    apiAction<{ id: string }>('admin', 'createSpecialtyTag', payload as Record<string, unknown>),
  deleteSpecialtyTag: (tagId: string) => apiAction('admin', 'deleteSpecialtyTag', { tagId }),
};
