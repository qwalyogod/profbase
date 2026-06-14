export type SiteRole = 'site_admin' | 'organization_admin' | 'editor' | 'user';

export type OrganizationRole = 'organization_admin' | 'teacher' | 'general_specialist' | 'member';

// Roles that a notification can be addressed to (cross-organization).
export type NotificationTargetRole = 'user' | 'editor' | 'organization_admin' | 'teacher' | 'general_specialist';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export type AccessMode = 'all' | 'roles' | 'specialty_tags' | 'subjects' | 'users';

export type MembershipStatus = 'approved' | 'blocked';

export type DocumentType = 'PDF' | 'DOCX' | 'XLSX' | 'PPTX';

export interface PortalUser {
  id: string;
  fullName: string;
  email: string;
  role: SiteRole;
  subject?: string;
  specialtyTagIds?: string[];
  favoriteItemIds?: string[];
  isYoungSpecialist?: boolean;
  isFirstEmployment?: boolean;
  isBanned: boolean;
  createdAt: string;
  avatarUrl?: string | null;
}

export interface NewsSource {
  label: string;
  url: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  body: string[];
  category: string;
  specialization: string | null;
  audience: 'Новичок' | 'Опытный' | 'Все';
  author: string;
  publishedAt: string;
  tags: string[];
  sources: NewsSource[];
  isPublic: boolean;
  organizationId?: string | null;
  specialtyTagIds?: string[];
  coverImageUrl?: string;
  galleryImageUrls?: string[];
  videoUrl?: string;
  guestPreview?: string;
  registeredOnly?: string;
}

export type NewsSubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface NewsSubmission {
  id: string;
  article: Omit<NewsArticle, 'id'>;
  submittedByUserId: string;
  submittedAt: string;
  status: NewsSubmissionStatus;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  reviewerComment: string | null;
}

export interface SpecialtyFeatureFlags {
  diary: boolean;
  calendar: boolean;
  notes: boolean;
  documents: boolean;
  journal: boolean;
}

export interface SpecialtyTag {
  id: string;
  organizationId?: string | null;
  name: string;
  description: string;
  color: string;
  features: SpecialtyFeatureFlags;
  createdAt: string;
}

export interface OrganizationInviteCode {
  id: string;
  organizationId: string;
  code: string;
  createdAt: string;
  expiresAt: string | null;
  isActive: boolean;
}

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: OrganizationRole;
  specialtyTagIds?: string[];
  status: MembershipStatus;
  joinedAt: string;
}

export interface JoinRequest {
  id: string;
  organizationId: string;
  userId: string;
  inviteCode: string;
  status: RequestStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  comment: string | null;
}

export interface DocumentSection {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  kind: 'common' | 'specialized';
}

export interface DocumentAccess {
  mode: AccessMode;
  roles: OrganizationRole[];
  specialtyTagIds?: string[];
  subjects: string[];
  userIds: string[];
}

export interface OrganizationDocument {
  id: string;
  organizationId: string;
  sectionId: string;
  title: string;
  type: DocumentType;
  subject: string | null;
  description: string;
  size: string;
  updatedAt: string;
  fileUrl?: string;
  fileName?: string;
  access: DocumentAccess;
}

export type NotificationScope = 'all' | 'users' | 'roles' | 'organization' | 'organization_users';

export interface PortalNotification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  senderLabel: string;
  organizationId?: string | null;
  scope: NotificationScope;
  userIds?: string[];
  targetRoles?: NotificationTargetRole[];
  dismissedByUserIds?: string[];
}

export type SupportTicketStatus = 'open' | 'approved' | 'rejected';

export interface SupportAttachment {
  name: string;
  dataUrl: string;
  type: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  organizationId?: string | null;
  subject: string;
  message: string;
  attachments: SupportAttachment[];
  status: SupportTicketStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  adminResponse: string | null;
}

export interface OrgCreationRequest {
  id: string;
  userId: string;
  shortName: string;
  fullName: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewedByUserId: string | null;
  comment: string | null;
  createdOrganizationId?: string | null;
}

export interface Organization {
  id: string;
  shortName: string;
  fullName: string;
  description: string;
  specialtyTagIds?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface SiteSettings {
  portalName: string;
  importantNoteTitle: string;
  firstLoginHelpTitle: string;
  supportEmail: string;
}

export type IncidentLevel = 'Низкий' | 'Средний' | 'Высокий';
export type IncidentOwner = 'Редакция' | 'Организация';

export interface Incident {
  id: string;
  title: string;
  category: string;
  level: IncidentLevel;
  audience: string;
  summary: string;
  firstSteps: string;
  documents: string;
  owner: IncidentOwner;
  attachmentName?: string;
  attachmentUrl?: string;
  createdAt: string;
}

export interface PortalDatabase {
  users: PortalUser[];
  specialtyTags: SpecialtyTag[];
  organizations: Organization[];
  memberships: OrganizationMembership[];
  inviteCodes: OrganizationInviteCode[];
  joinRequests: JoinRequest[];
  sections: DocumentSection[];
  documents: OrganizationDocument[];
  notifications: PortalNotification[];
  supportTickets: SupportTicket[];
  orgCreationRequests: OrgCreationRequest[];
  news: NewsArticle[];
  newsSubmissions: NewsSubmission[];
  incidents: Incident[];
  siteSettings: SiteSettings;
  currentUserId: string;
}
