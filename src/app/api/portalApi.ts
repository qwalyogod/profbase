// Aggregate read endpoint: the whole PortalDatabase assembled by the backend
// from MySQL. Replaces the old localStorage loadDatabase(). Works for guests
// (public catalog) and authenticated users (their scoped private data).
import { PortalDatabase } from '../types/portal';
import { apiGet } from './client';

export const portalApi = {
  fetchState: (): Promise<PortalDatabase> => apiGet<PortalDatabase>('/portal/state.php'),
};
