// Auth endpoints (already backend-backed). Wrapped here so the context and
// pages share one typed surface instead of scattering fetch() calls.
import { PortalUser } from '../types/portal';
import { apiGet, apiPost } from './client';

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  isYoungSpecialist?: boolean;
  isFirstEmployment?: boolean;
  specialization?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiPost<{ success: boolean; token?: string; error?: string }>('/auth/login.php', { email, password }),

  register: (payload: RegisterPayload) =>
    apiPost<{ success: boolean; token?: string; error?: string }>('/auth/register.php', payload),

  me: () => apiGet<{ success: boolean; user: PortalUser }>('/user/me.php'),

  logout: () => apiPost('/auth/logout.php'),

  demoLogin: (userId: string) =>
    apiPost<{ success: boolean; token?: string; error?: string }>('/auth/demo_login.php', { userId }),

  updateProfile: (payload: { fullName?: string; email?: string; currentPassword?: string }) =>
    apiPost('/user/update_profile.php', payload),

  updatePassword: (currentPassword: string, newPassword: string) =>
    apiPost('/user/update_password.php', { currentPassword, newPassword }),
};
