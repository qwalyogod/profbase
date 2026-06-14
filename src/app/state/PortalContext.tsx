import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  DocumentAccess,
  DocumentSection,
  NewsArticle,
  NewsSubmission,
  Organization,
  OrganizationDocument,
  OrganizationMembership,
  OrganizationRole,
  PortalDatabase,
  PortalNotification,
  PortalUser,
  SpecialtyTag,
  SupportAttachment,
} from '../types/portal';
import { emptyDatabase } from './portalStorage';
import { API_BASE } from '../lib/api';
import { portalApi } from '../api/portalApi';
import { authApi } from '../api/authApi';
import { usersApi } from '../api/usersApi';
import { organizationsApi } from '../api/organizationsApi';
import { documentsApi } from '../api/documentsApi';
import { newsApi } from '../api/newsApi';
import { notificationsApi } from '../api/notificationsApi';
import { incidentsApi } from '../api/incidentsApi';
import { supportApi } from '../api/supportApi';
import { adminApi } from '../api/adminApi';
import { apiGet } from '../api/client';

const DEMO_USER_STORAGE_KEY = 'profbaza.demo-user-id';
const AUTH_TOKEN_KEY = 'api_token';

// ─── pure helpers (used by the read-only selectors below) ───────────────────

function getMembership(
  memberships: OrganizationMembership[],
  userId: string,
  organizationId: string,
): OrganizationMembership | undefined {
  return memberships.find(
    (membership) =>
      membership.userId === userId &&
      membership.organizationId === organizationId &&
      membership.status === 'approved',
  );
}

// Roles a user belongs to for notification targeting: their global site role
// plus any approved organisation-local roles (teacher / general specialist / admin).
function computeUserRoleSet(
  userId: string,
  siteRole: string,
  memberships: OrganizationMembership[],
): Set<string> {
  const roles = new Set<string>([siteRole]);
  memberships
    .filter((membership) => membership.userId === userId && membership.status === 'approved')
    .forEach((membership) => roles.add(membership.role));
  return roles;
}

function hasDocumentAccess(
  documentAccess: DocumentAccess,
  user: PortalUser,
  organizationRole: OrganizationRole | null,
  userSpecialtyTagIds: string[] = [],
): boolean {
  if (user.role === 'site_admin') {
    return true;
  }
  if (!organizationRole) {
    return false;
  }
  if (organizationRole === 'organization_admin') {
    return true;
  }
  if (documentAccess.mode === 'all') {
    return true;
  }
  if (documentAccess.mode === 'roles') {
    return documentAccess.roles.includes(organizationRole);
  }
  if (documentAccess.mode === 'subjects') {
    return !!user.subject && documentAccess.subjects.includes(user.subject);
  }
  if (documentAccess.mode === 'specialty_tags') {
    const allowedTagIds = documentAccess.specialtyTagIds ?? [];
    return allowedTagIds.some((tagId) => userSpecialtyTagIds.includes(tagId));
  }
  if (documentAccess.mode === 'users') {
    return documentAccess.userIds.includes(user.id);
  }
  return false;
}

// ─── input types (unchanged public shapes) ──────────────────────────────────

type CreateOrganizationInput = {
  shortName: string;
  fullName: string;
  description: string;
};

type CreateSectionInput = {
  organizationId: string;
  name: string;
  description: string;
  kind: 'common' | 'specialized';
};

type CreateDocumentInput = {
  organizationId: string;
  sectionId: string;
  title: string;
  type: OrganizationDocument['type'];
  description: string;
  size: string;
  subject: string | null;
  access: DocumentAccess;
  fileUrl?: string;
  fileName?: string;
};

type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  specialization?: string;
  isYoungSpecialist?: boolean;
  isFirstEmployment?: boolean;
  inviteCode?: string;
};

type NewsArticleInput = Omit<NewsArticle, 'id'>;
type NewsSubmissionInput = Omit<NewsSubmission, 'id' | 'submittedAt' | 'status' | 'reviewedAt' | 'reviewedByUserId' | 'reviewerComment'>;
type NotificationInput = Omit<PortalNotification, 'id' | 'createdAt'>;
type CreateSpecialtyTagInput = Omit<SpecialtyTag, 'id' | 'createdAt'>;

interface PortalContextValue {
  database: PortalDatabase;
  currentUser: PortalUser | null;
  currentOrganization: Organization | null;
  currentMembership: OrganizationMembership | null;
  isLoading: boolean;
  errorMessage: string | null;
  switchCurrentUser: (userId: string) => void;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  registerUser: (input: RegisterInput) => Promise<void>;
  clearError: () => void;
  resetDemoData: () => void;
  createSpecialtyTag: (payload: CreateSpecialtyTagInput) => Promise<void>;
  deleteSpecialtyTag: (tagId: string) => Promise<void>;
  updateUser: (userId: string, patch: Partial<PortalUser>) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  assignOrganizationSpecialtyTags: (organizationId: string, specialtyTagIds: string[]) => Promise<void>;
  assignMemberSpecialtyTags: (membershipId: string, specialtyTagIds: string[]) => Promise<void>;
  toggleFavoriteItem: (itemId: string) => Promise<void>;
  updateProfile: (input: { fullName?: string; email?: string; currentPassword?: string }) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  setUserBanState: (userId: string, isBanned: boolean) => Promise<void>;
  updateSiteSettings: (patch: Partial<PortalDatabase['siteSettings']>) => Promise<void>;
  createOrganization: (payload: CreateOrganizationInput) => Promise<void>;
  updateOrganization: (organizationId: string, patch: Partial<Organization>) => Promise<void>;
  deleteOrganization: (organizationId: string) => Promise<void>;
  assignOrganizationAdmin: (organizationId: string, userId: string) => Promise<void>;
  removeOrganizationAdmin: (organizationId: string, userId: string) => Promise<void>;
  setMemberRole: (membershipId: string, role: OrganizationRole) => Promise<void>;
  generateOrganizationInviteCode: (organizationId: string) => Promise<string>;
  submitJoinRequest: (inviteCode: string) => Promise<void>;
  reviewJoinRequest: (requestId: string, approve: boolean, reviewerId: string) => Promise<void>;
  submitOrgCreationRequest: (payload: { shortName: string; fullName: string; description: string }) => Promise<void>;
  reviewOrgCreationRequest: (requestId: string, approve: boolean, reviewerId: string, comment?: string) => Promise<void>;
  createSupportTicket: (payload: { subject: string; message: string; attachments: SupportAttachment[]; organizationId?: string | null }) => Promise<void>;
  reviewSupportTicket: (ticketId: string, approve: boolean, reviewerId: string, response: string) => Promise<void>;
  createSection: (payload: CreateSectionInput) => Promise<void>;
  updateSection: (sectionId: string, patch: Partial<DocumentSection>) => Promise<void>;
  deleteSection: (sectionId: string) => Promise<void>;
  createDocument: (payload: CreateDocumentInput) => Promise<void>;
  updateDocument: (documentId: string, patch: Partial<OrganizationDocument>) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  createNewsArticle: (payload: NewsArticleInput) => Promise<void>;
  updateNewsArticle: (articleId: string, patch: Partial<NewsArticle>) => Promise<void>;
  deleteNewsArticle: (articleId: string) => Promise<void>;
  createNewsSubmission: (payload: NewsSubmissionInput) => Promise<void>;
  updateNewsSubmission: (submissionId: string, article: NewsArticleInput) => Promise<void>;
  reviewNewsSubmission: (submissionId: string, approve: boolean, reviewerId: string, comment?: string) => Promise<void>;
  createNotification: (payload: NotificationInput) => Promise<void>;
  dismissNotification: (notificationId: string, userId: string) => Promise<void>;
  createIncident: (payload: Omit<import('../types/portal').Incident, 'id' | 'createdAt'>) => Promise<void>;
  updateIncident: (incidentId: string, patch: Partial<import('../types/portal').Incident>) => Promise<void>;
  deleteIncident: (incidentId: string) => Promise<void>;
  getVisibleDocuments: (organizationId: string, userId: string) => OrganizationDocument[];
  getVisibleNotifications: (userId: string) => PortalNotification[];
  getNotificationHistory: (userId: string) => PortalNotification[];
}

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalProvider({ children }: { children: React.ReactNode }) {
  // The portal database is loaded from the backend; localStorage no longer holds
  // domain data. We start from an empty shape and fill it from the API on mount.
  const [database, setDatabase] = useState<PortalDatabase>(() => emptyDatabase());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [backendUser, setBackendUser] = useState<PortalUser | null>(null);

  // Re-pull the authoritative state from MySQL. This is the single source of
  // truth: every mutation calls a backend endpoint and then refreshes.
  const refreshDatabase = useCallback(async (): Promise<PortalDatabase> => {
    const next = await portalApi.fetchState();
    setDatabase(next);
    setBackendUser((previous) => {
      if (!next.currentUserId) return previous;
      const fresh = next.users.find((user) => user.id === next.currentUserId);
      return fresh ?? previous;
    });
    return next;
  }, []);

  // Bootstrap: restore session (token or demo user) then load the database.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let token = localStorage.getItem(AUTH_TOKEN_KEY);
        // Restore a previously selected demo user (header role switcher).
        if (!token) {
          const demoId = localStorage.getItem(DEMO_USER_STORAGE_KEY);
          if (demoId) {
            try {
              const dl = await authApi.demoLogin(demoId);
              if (dl.success && dl.token) {
                localStorage.setItem(AUTH_TOKEN_KEY, dl.token);
                token = dl.token;
              } else {
                localStorage.removeItem(DEMO_USER_STORAGE_KEY);
              }
            } catch {
              localStorage.removeItem(DEMO_USER_STORAGE_KEY);
            }
          }
        }
        if (token) {
          try {
            const me = await authApi.me();
            if (me.success && me.user) {
              if (!cancelled) setBackendUser(me.user);
            } else {
              localStorage.removeItem(AUTH_TOKEN_KEY);
            }
          } catch {
            localStorage.removeItem(AUTH_TOKEN_KEY);
          }
        }
        await refreshDatabase();
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Не удалось загрузить данные портала.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wrap a backend-backed mutation with loading/error handling.
  const runMutation = useCallback(async (mutation: () => void | Promise<void>) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await mutation();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Произошла ошибка при выполнении действия.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── auth ──────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (email: string, password?: string): Promise<boolean> => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await authApi.login(email, password ?? '');
        if (data.success && data.token) {
          localStorage.setItem(AUTH_TOKEN_KEY, data.token);
          localStorage.removeItem(DEMO_USER_STORAGE_KEY);
          const me = await authApi.me();
          if (me.success) {
            setBackendUser(me.user);
            await refreshDatabase();
            return true;
          }
        } else {
          setErrorMessage(data.error || 'Ошибка авторизации');
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Сетевая ошибка. Проверьте, что Apache и MySQL запущены.');
      } finally {
        setIsLoading(false);
      }
      return false;
    },
    [refreshDatabase],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore — clear locally regardless */
    }
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    setBackendUser(null);
    await refreshDatabase();
  }, [refreshDatabase]);

  const registerUser = useCallback(
    async (input: RegisterInput): Promise<void> => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await authApi.register({
          email: input.email,
          password: input.password ?? '',
          fullName: `${input.firstName} ${input.lastName}`.trim(),
          specialization: input.specialization,
          isYoungSpecialist: input.isYoungSpecialist,
          isFirstEmployment: input.isFirstEmployment,
        });
        if (data.success && data.token) {
          localStorage.setItem(AUTH_TOKEN_KEY, data.token);
          localStorage.removeItem(DEMO_USER_STORAGE_KEY);
          const me = await authApi.me();
          if (me.success) setBackendUser(me.user);
          // Optional invite code: submit a join request (best effort).
          const inviteCode = input.inviteCode?.trim();
          if (inviteCode) {
            try {
              await organizationsApi.submitJoinRequest(inviteCode);
            } catch (joinError) {
              setErrorMessage(joinError instanceof Error ? joinError.message : null);
            }
          }
          await refreshDatabase();
        } else {
          throw new Error(data.error || 'Ошибка регистрации');
        }
      } catch (error) {
        if (error instanceof Error) setErrorMessage(error.message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshDatabase],
  );

  const switchCurrentUser = useCallback(
    (userId: string) => {
      void runMutation(async () => {
        const target = database.users.find((user) => user.id === userId);
        if (target?.isBanned) {
          throw new Error('Аккаунт заблокирован. Вход под этим пользователем недоступен.');
        }
        const dl = await authApi.demoLogin(userId);
        if (!dl.success || !dl.token) {
          throw new Error(dl.error || 'Не удалось войти под выбранным пользователем.');
        }
        localStorage.setItem(AUTH_TOKEN_KEY, dl.token);
        localStorage.setItem(DEMO_USER_STORAGE_KEY, userId);
        try {
          const me = await authApi.me();
          if (me.success) setBackendUser(me.user);
        } catch {
          /* state refresh will populate the user */
        }
        await refreshDatabase();
      });
    },
    [database.users, runMutation, refreshDatabase],
  );

  const clearError = useCallback(() => setErrorMessage(null), []);

  const resetDemoData = useCallback(() => {
    void runMutation(async () => {
      // Re-seed the demo dataset from the bundled JSON (dev convenience endpoint).
      await apiGet('/migrations/import_seed.php?key=profbaza-seed');
      const demoId = localStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (demoId) {
        try {
          const dl = await authApi.demoLogin(demoId);
          if (dl.token) localStorage.setItem(AUTH_TOKEN_KEY, dl.token);
        } catch {
          /* ignore */
        }
      }
      await refreshDatabase();
    });
  }, [runMutation, refreshDatabase]);

  // ─── specialty tags ──────────────────────────────────────────────────────────

  const createSpecialtyTag = useCallback(
    async (payload: CreateSpecialtyTagInput) => {
      await runMutation(async () => {
        await adminApi.createSpecialtyTag(payload as Partial<SpecialtyTag> & { name: string });
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const deleteSpecialtyTag = useCallback(
    async (tagId: string) => {
      await runMutation(async () => {
        await adminApi.deleteSpecialtyTag(tagId);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  // ─── users ───────────────────────────────────────────────────────────────────

  const updateUser = useCallback(
    async (userId: string, patch: Partial<PortalUser>) => {
      await runMutation(async () => {
        await usersApi.update(userId, patch);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      await runMutation(async () => {
        await usersApi.remove(userId);
        if (localStorage.getItem(DEMO_USER_STORAGE_KEY) === userId) {
          localStorage.removeItem(DEMO_USER_STORAGE_KEY);
        }
        setBackendUser((previous) => (previous?.id === userId ? null : previous));
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const setUserBanState = useCallback(
    async (userId: string, isBanned: boolean) => {
      await runMutation(async () => {
        await usersApi.setBanState(userId, isBanned);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const toggleFavoriteItem = useCallback(
    async (itemId: string) => {
      if (!backendUser) return;
      await usersApi.toggleFavorite(itemId);
      await refreshDatabase();
    },
    [backendUser, refreshDatabase],
  );

  const assignOrganizationSpecialtyTags = useCallback(
    async (organizationId: string, specialtyTagIds: string[]) => {
      await runMutation(async () => {
        await organizationsApi.assignOrganizationTags(organizationId, specialtyTagIds);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const assignMemberSpecialtyTags = useCallback(
    async (membershipId: string, specialtyTagIds: string[]) => {
      await runMutation(async () => {
        await organizationsApi.assignMemberTags(membershipId, specialtyTagIds);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  // ─── profile / password / avatar (backend-backed) ────────────────────────────

  const updateProfile = useCallback(
    async (input: { fullName?: string; email?: string; currentPassword?: string }): Promise<void> => {
      await authApi.updateProfile(input);
      await refreshDatabase();
    },
    [refreshDatabase],
  );

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await authApi.updatePassword(currentPassword, newPassword);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Ошибка смены пароля');
      throw err;
    }
  }, []);

  const uploadAvatar = useCallback(
    async (file: File): Promise<void> => {
      try {
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await fetch(`${API_BASE}/user/upload_avatar.php`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem(AUTH_TOKEN_KEY)}` },
          body: formData,
        });
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        if (!response.ok) {
          throw new Error(data.error || 'Ошибка загрузки аватара');
        }
        setBackendUser((prev) => (prev ? { ...prev, avatarUrl: data.avatarUrl } : prev));
        await refreshDatabase();
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Ошибка загрузки аватара');
        throw err;
      }
    },
    [refreshDatabase],
  );

  // ─── site settings ────────────────────────────────────────────────────────────

  const updateSiteSettings = useCallback(
    async (patch: Partial<PortalDatabase['siteSettings']>) => {
      await runMutation(async () => {
        await adminApi.updateSiteSettings(patch);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  // ─── organizations ────────────────────────────────────────────────────────────

  const createOrganizationAction = useCallback(
    async (payload: CreateOrganizationInput) => {
      await runMutation(async () => {
        await organizationsApi.create(payload);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const updateOrganizationAction = useCallback(
    async (organizationId: string, patch: Partial<Organization>) => {
      await runMutation(async () => {
        await organizationsApi.update(organizationId, patch);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const deleteOrganizationAction = useCallback(
    async (organizationId: string) => {
      await runMutation(async () => {
        await organizationsApi.remove(organizationId);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const assignOrganizationAdmin = useCallback(
    async (organizationId: string, userId: string) => {
      await runMutation(async () => {
        await organizationsApi.assignAdmin(organizationId, userId);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const removeOrganizationAdmin = useCallback(
    async (organizationId: string, userId: string) => {
      await runMutation(async () => {
        await organizationsApi.removeAdmin(organizationId, userId);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const setMemberRole = useCallback(
    async (membershipId: string, role: OrganizationRole) => {
      await runMutation(async () => {
        await organizationsApi.setMemberRole(membershipId, role);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const generateOrganizationInviteCode = useCallback(
    async (organizationId: string): Promise<string> => {
      let code = '';
      await runMutation(async () => {
        const result = await organizationsApi.generateInviteCode(organizationId);
        code = result.code;
        await refreshDatabase();
      });
      return code;
    },
    [runMutation, refreshDatabase],
  );

  const submitJoinRequest = useCallback(
    async (inviteCode: string) => {
      const code = inviteCode.trim();
      if (!code) {
        setErrorMessage('Введите код приглашения.');
        throw new Error('Введите код приглашения.');
      }
      await runMutation(async () => {
        await organizationsApi.submitJoinRequest(code);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const reviewJoinRequest = useCallback(
    async (requestId: string, approve: boolean) => {
      await runMutation(async () => {
        await organizationsApi.reviewJoinRequest(requestId, approve);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const submitOrgCreationRequest = useCallback(
    async (payload: { shortName: string; fullName: string; description: string }) => {
      await runMutation(async () => {
        await organizationsApi.submitOrgCreationRequest(payload);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const reviewOrgCreationRequest = useCallback(
    async (requestId: string, approve: boolean, _reviewerId: string, comment = '') => {
      await runMutation(async () => {
        await organizationsApi.reviewOrgCreationRequest(requestId, approve, comment);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  // ─── support tickets ──────────────────────────────────────────────────────────

  const createSupportTicket = useCallback(
    async (payload: { subject: string; message: string; attachments: SupportAttachment[]; organizationId?: string | null }) => {
      await runMutation(async () => {
        await supportApi.create(payload);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const reviewSupportTicket = useCallback(
    async (ticketId: string, approve: boolean, _reviewerId: string, response: string) => {
      await runMutation(async () => {
        await supportApi.review(ticketId, approve, response);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  // ─── document sections & documents ────────────────────────────────────────────

  const createSection = useCallback(
    async (payload: CreateSectionInput) => {
      await runMutation(async () => {
        await documentsApi.createSection(payload);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const updateSection = useCallback(
    async (sectionId: string, patch: Partial<DocumentSection>) => {
      await runMutation(async () => {
        await documentsApi.updateSection(sectionId, patch);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const deleteSection = useCallback(
    async (sectionId: string) => {
      await runMutation(async () => {
        await documentsApi.deleteSection(sectionId);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const createDocument = useCallback(
    async (payload: CreateDocumentInput) => {
      await runMutation(async () => {
        await documentsApi.createDocument(payload);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const updateDocument = useCallback(
    async (documentId: string, patch: Partial<OrganizationDocument>) => {
      await runMutation(async () => {
        await documentsApi.updateDocument(documentId, patch);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const deleteDocument = useCallback(
    async (documentId: string) => {
      await runMutation(async () => {
        await documentsApi.deleteDocument(documentId);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  // ─── news ─────────────────────────────────────────────────────────────────────

  const createNewsArticle = useCallback(
    async (payload: NewsArticleInput) => {
      await runMutation(async () => {
        await newsApi.create(payload);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const updateNewsArticle = useCallback(
    async (articleId: string, patch: Partial<NewsArticle>) => {
      await runMutation(async () => {
        await newsApi.update(articleId, patch);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const deleteNewsArticle = useCallback(
    async (articleId: string) => {
      await runMutation(async () => {
        await newsApi.remove(articleId);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const createNewsSubmission = useCallback(
    async (payload: NewsSubmissionInput) => {
      await runMutation(async () => {
        await newsApi.createSubmission(payload.article);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const updateNewsSubmission = useCallback(
    async (submissionId: string, article: NewsArticleInput) => {
      await runMutation(async () => {
        await newsApi.updateSubmission(submissionId, article);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const reviewNewsSubmission = useCallback(
    async (submissionId: string, approve: boolean, _reviewerId: string, comment = '') => {
      await runMutation(async () => {
        await newsApi.reviewSubmission(submissionId, approve, comment);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  // ─── notifications ──────────────────────────────────────────────────────────────

  const createNotification = useCallback(
    async (payload: NotificationInput) => {
      await runMutation(async () => {
        await notificationsApi.create(payload);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const dismissNotification = useCallback(
    async (notificationId: string) => {
      await runMutation(async () => {
        await notificationsApi.dismiss(notificationId);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  // ─── incidents ──────────────────────────────────────────────────────────────────

  const createIncident = useCallback(
    async (payload: Omit<import('../types/portal').Incident, 'id' | 'createdAt'>) => {
      await runMutation(async () => {
        await incidentsApi.create(payload);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const updateIncident = useCallback(
    async (incidentId: string, patch: Partial<import('../types/portal').Incident>) => {
      await runMutation(async () => {
        await incidentsApi.update(incidentId, patch);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  const deleteIncident = useCallback(
    async (incidentId: string) => {
      await runMutation(async () => {
        await incidentsApi.remove(incidentId);
        await refreshDatabase();
      });
    },
    [runMutation, refreshDatabase],
  );

  // ─── derived current user / organization ────────────────────────────────────────

  const currentUser = useMemo<PortalUser | null>(() => {
    const fromDb = database.users.find((user) => user.id === database.currentUserId) ?? null;
    return fromDb ?? backendUser ?? null;
  }, [database.users, database.currentUserId, backendUser]);

  const currentMembership = useMemo(() => {
    if (!currentUser) {
      return null;
    }
    const approved = database.memberships.filter(
      (membership) => membership.userId === currentUser.id && membership.status === 'approved',
    );
    // Prefer an organisation where the user is an administrator.
    return approved.find((membership) => membership.role === 'organization_admin') ?? approved[0] ?? null;
  }, [currentUser, database.memberships]);

  const currentOrganization = useMemo(() => {
    if (!currentMembership) {
      return null;
    }
    return database.organizations.find((organization) => organization.id === currentMembership.organizationId) ?? null;
  }, [currentMembership, database.organizations]);

  // ─── read-only selectors (unchanged role-based visibility logic) ──────────────────

  const getVisibleDocuments = useCallback(
    (organizationId: string, userId: string) => {
      const user = database.users.find((item) => item.id === userId);
      if (!user) {
        return [];
      }
      const membership = getMembership(database.memberships, userId, organizationId);
      const organizationRole = membership?.role ?? null;
      const userSpecialtyTagIds = Array.from(new Set([...(user.specialtyTagIds ?? []), ...(membership?.specialtyTagIds ?? [])]));
      return database.documents.filter((document) => {
        if (document.organizationId !== organizationId) {
          return false;
        }
        return hasDocumentAccess(document.access, user, organizationRole, userSpecialtyTagIds);
      });
    },
    [database.documents, database.memberships, database.users],
  );

  const getVisibleNotifications = useCallback(
    (userId: string) => {
      const userMemberships = database.memberships.filter(
        (membership) => membership.userId === userId && membership.status === 'approved',
      );
      const organizationIds = new Set(userMemberships.map((membership) => membership.organizationId));
      const user = database.users.find((item) => item.id === userId);
      const roleSet = user ? computeUserRoleSet(userId, user.role, database.memberships) : new Set<string>();
      return database.notifications
        .filter((notification) => {
          if ((notification.dismissedByUserIds ?? []).includes(userId)) return false;
          if (notification.scope === 'all') return true;
          if (notification.scope === 'users') return (notification.userIds ?? []).includes(userId);
          if (notification.scope === 'roles') {
            return (notification.targetRoles ?? []).some((role) => roleSet.has(role));
          }
          if (notification.scope === 'organization') {
            return !!notification.organizationId && organizationIds.has(notification.organizationId);
          }
          if (notification.scope === 'organization_users') {
            return (
              !!notification.organizationId &&
              organizationIds.has(notification.organizationId) &&
              (notification.userIds ?? []).includes(userId)
            );
          }
          return false;
        })
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    },
    [database.memberships, database.notifications, database.users],
  );

  const getNotificationHistory = useCallback(
    (userId: string) => {
      const userMemberships = database.memberships.filter(
        (membership) => membership.userId === userId && membership.status === 'approved',
      );
      const organizationIds = new Set(userMemberships.map((membership) => membership.organizationId));
      const user = database.users.find((item) => item.id === userId);
      const roleSet = user ? computeUserRoleSet(userId, user.role, database.memberships) : new Set<string>();
      return database.notifications
        .filter((notification) => {
          if (notification.scope === 'all') return true;
          if (notification.scope === 'users') return (notification.userIds ?? []).includes(userId);
          if (notification.scope === 'roles') {
            return (notification.targetRoles ?? []).some((role) => roleSet.has(role));
          }
          if (notification.scope === 'organization') {
            return !!notification.organizationId && organizationIds.has(notification.organizationId);
          }
          if (notification.scope === 'organization_users') {
            return (
              !!notification.organizationId &&
              organizationIds.has(notification.organizationId) &&
              (notification.userIds ?? []).includes(userId)
            );
          }
          return false;
        })
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    },
    [database.memberships, database.notifications, database.users],
  );

  const value = useMemo<PortalContextValue>(
    () => ({
      database,
      currentUser,
      currentOrganization,
      currentMembership,
      isLoading,
      errorMessage,
      switchCurrentUser,
      login,
      logout,
      registerUser,
      clearError,
      resetDemoData,
      createSpecialtyTag,
      deleteSpecialtyTag,
      updateUser,
      deleteUser,
      assignOrganizationSpecialtyTags,
      assignMemberSpecialtyTags,
      toggleFavoriteItem,
      updateProfile,
      updatePassword,
      uploadAvatar,
      setUserBanState,
      updateSiteSettings,
      createOrganization: createOrganizationAction,
      updateOrganization: updateOrganizationAction,
      deleteOrganization: deleteOrganizationAction,
      assignOrganizationAdmin,
      removeOrganizationAdmin,
      setMemberRole,
      generateOrganizationInviteCode,
      submitJoinRequest,
      reviewJoinRequest,
      submitOrgCreationRequest,
      reviewOrgCreationRequest,
      createSupportTicket,
      reviewSupportTicket,
      createSection,
      updateSection,
      deleteSection,
      createDocument,
      updateDocument,
      deleteDocument,
      createNewsArticle,
      updateNewsArticle,
      deleteNewsArticle,
      createNewsSubmission,
      updateNewsSubmission,
      reviewNewsSubmission,
      createNotification,
      dismissNotification,
      createIncident,
      updateIncident,
      deleteIncident,
      getVisibleDocuments,
      getVisibleNotifications,
      getNotificationHistory,
    }),
    [
      assignOrganizationAdmin,
      assignOrganizationSpecialtyTags,
      assignMemberSpecialtyTags,
      clearError,
      createSpecialtyTag,
      deleteSpecialtyTag,
      deleteUser,
      createDocument,
      createNewsArticle,
      createNotification,
      createNewsSubmission,
      createIncident,
      updateIncident,
      deleteIncident,
      createOrganizationAction,
      createSection,
      currentMembership,
      currentOrganization,
      currentUser,
      database,
      deleteDocument,
      deleteNewsArticle,
      deleteOrganizationAction,
      deleteSection,
      dismissNotification,
      errorMessage,
      generateOrganizationInviteCode,
      getVisibleDocuments,
      getVisibleNotifications,
      getNotificationHistory,
      isLoading,
      login,
      logout,
      registerUser,
      resetDemoData,
      updateProfile,
      reviewJoinRequest,
      reviewNewsSubmission,
      removeOrganizationAdmin,
      setMemberRole,
      submitOrgCreationRequest,
      reviewOrgCreationRequest,
      createSupportTicket,
      reviewSupportTicket,
      setUserBanState,
      toggleFavoriteItem,
      updateSiteSettings,
      updatePassword,
      uploadAvatar,
      submitJoinRequest,
      switchCurrentUser,
      updateDocument,
      updateNewsArticle,
      updateNewsSubmission,
      updateOrganizationAction,
      updateSection,
      updateUser,
    ],
  );

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within PortalProvider');
  }
  return context;
}
