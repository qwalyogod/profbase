import { PortalUser } from '../types/portal';
import { apiAction } from './client';

export const usersApi = {
  update: (userId: string, patch: Partial<PortalUser>) => apiAction('users', 'updateUser', { userId, patch }),
  remove: (userId: string) => apiAction('users', 'deleteUser', { userId }),
  setBanState: (userId: string, isBanned: boolean) => apiAction('users', 'setUserBanState', { userId, isBanned }),
  toggleFavorite: (itemId: string) => apiAction<{ favorited: boolean }>('users', 'toggleFavoriteItem', { itemId }),
};
