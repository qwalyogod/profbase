import { Organization, OrganizationRole } from '../types/portal';
import { apiAction } from './client';

export const organizationsApi = {
  create: (payload: { shortName: string; fullName: string; description: string }) =>
    apiAction('organizations', 'createOrganization', payload),
  update: (organizationId: string, patch: Partial<Organization>) =>
    apiAction('organizations', 'updateOrganization', { organizationId, patch }),
  remove: (organizationId: string) => apiAction('organizations', 'deleteOrganization', { organizationId }),

  assignAdmin: (organizationId: string, userId: string) =>
    apiAction('organizations', 'assignOrganizationAdmin', { organizationId, userId }),
  removeAdmin: (organizationId: string, userId: string) =>
    apiAction('organizations', 'removeOrganizationAdmin', { organizationId, userId }),
  setMemberRole: (membershipId: string, role: OrganizationRole) =>
    apiAction('organizations', 'setMemberRole', { membershipId, role }),
  assignOrganizationTags: (organizationId: string, specialtyTagIds: string[]) =>
    apiAction('organizations', 'assignOrganizationSpecialtyTags', { organizationId, specialtyTagIds }),
  assignMemberTags: (membershipId: string, specialtyTagIds: string[]) =>
    apiAction('organizations', 'assignMemberSpecialtyTags', { membershipId, specialtyTagIds }),
  generateInviteCode: (organizationId: string) =>
    apiAction<{ code: string }>('organizations', 'generateOrganizationInviteCode', { organizationId }),

  submitJoinRequest: (inviteCode: string) =>
    apiAction<{ organizationId: string }>('organizations', 'submitJoinRequest', { inviteCode }),
  reviewJoinRequest: (requestId: string, approve: boolean) =>
    apiAction('organizations', 'reviewJoinRequest', { requestId, approve }),
  submitOrgCreationRequest: (payload: { shortName: string; fullName: string; description: string }) =>
    apiAction('organizations', 'submitOrgCreationRequest', payload),
  reviewOrgCreationRequest: (requestId: string, approve: boolean, comment = '') =>
    apiAction('organizations', 'reviewOrgCreationRequest', { requestId, approve, comment }),
};
