import { DocumentSection, OrganizationDocument } from '../types/portal';
import { apiAction } from './client';

export const documentsApi = {
  createSection: (payload: { organizationId: string; name: string; description?: string; kind?: string }) =>
    apiAction('documents', 'createSection', payload),
  updateSection: (sectionId: string, patch: Partial<DocumentSection>) =>
    apiAction('documents', 'updateSection', { sectionId, patch }),
  deleteSection: (sectionId: string) => apiAction('documents', 'deleteSection', { sectionId }),

  createDocument: (payload: Partial<OrganizationDocument> & { organizationId: string; sectionId: string; title: string }) =>
    apiAction('documents', 'createDocument', payload),
  updateDocument: (documentId: string, patch: Partial<OrganizationDocument>) =>
    apiAction('documents', 'updateDocument', { documentId, patch }),
  deleteDocument: (documentId: string) => apiAction('documents', 'deleteDocument', { documentId }),
};
