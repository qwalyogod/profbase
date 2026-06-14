import {
  NotificationTargetRole,
  Organization,
  OrganizationMembership,
  OrganizationRole,
  PortalUser,
  SiteRole,
} from '../types/portal';

export const siteRoleLabels: Record<SiteRole, string> = {
  site_admin: 'Глобальный администратор',
  organization_admin: 'Администратор организации',
  editor: 'Редактор',
  user: 'Пользователь',
};

export const organizationRoleLabels: Record<OrganizationRole, string> = {
  organization_admin: 'Администратор организации',
  teacher: 'Преподаватель',
  general_specialist: 'Общий специалист',
  member: 'Участник',
};

export const notificationTargetRoleLabels: Record<NotificationTargetRole, string> = {
  user: 'Пользователи',
  editor: 'Редакторы',
  organization_admin: 'Администраторы организаций',
  teacher: 'Преподаватели',
  general_specialist: 'Общие специалисты',
};

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function isUserAllowedForSiteAdmin(user: PortalUser | null): boolean {
  return !!user && user.role === 'site_admin' && !user.isBanned;
}

export function isUserAllowedForOrganizationAdmin(user: PortalUser | null): boolean {
  return !!user && user.role === 'organization_admin' && !user.isBanned;
}

export function isUserAllowedForEditorAdmin(user: PortalUser | null): boolean {
  return !!user && !user.isBanned && ['site_admin', 'editor'].includes(user.role);
}

export function canManageNews(user: PortalUser | null): boolean {
  return !!user && !user.isBanned && ['site_admin', 'organization_admin', 'editor'].includes(user.role);
}

function quote(names: string[]): string {
  return names.map((name) => `«${name}»`).join(', ');
}

/**
 * Human-readable role for a user that accounts for organisation-local roles.
 * Globally a teacher is just a "Преподаватель", but inside one or more
 * organisations they read as `Преподаватель: «Орг 1», «Орг 2»`.
 */
export function describeUserRole(
  user: PortalUser,
  memberships: OrganizationMembership[],
  organizations: Organization[],
): string {
  if (user.role === 'site_admin') return siteRoleLabels.site_admin;
  if (user.role === 'editor') return siteRoleLabels.editor;

  const orgName = (organizationId: string) =>
    organizations.find((organization) => organization.id === organizationId)?.shortName ?? 'организация';

  const approved = memberships.filter(
    (membership) => membership.userId === user.id && membership.status === 'approved',
  );
  const byRole = (role: OrganizationRole) =>
    Array.from(new Set(approved.filter((m) => m.role === role).map((m) => orgName(m.organizationId))));

  const adminOrgs = byRole('organization_admin');
  const teacherOrgs = byRole('teacher');
  const generalOrgs = byRole('general_specialist');

  const segments: string[] = [];
  if (adminOrgs.length) segments.push(`Администратор организации: ${quote(adminOrgs)}`);
  if (teacherOrgs.length) segments.push(`Преподаватель: ${quote(teacherOrgs)}`);
  if (generalOrgs.length) segments.push(`Общий специалист: ${quote(generalOrgs)}`);

  if (segments.length) return segments.join(' · ');
  return siteRoleLabels[user.role];
}

/** Organisations where the given user is an approved organisation administrator. */
export function getAdminOrganizationIds(userId: string, memberships: OrganizationMembership[]): string[] {
  return memberships
    .filter((m) => m.userId === userId && m.status === 'approved' && m.role === 'organization_admin')
    .map((m) => m.organizationId);
}
