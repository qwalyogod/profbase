import { PortalDatabase } from '../types/portal';

// ─────────────────────────────────────────────────────────────────────────────
// Domain data now lives in MySQL and is loaded through the PHP API
// (`GET /api/portal/state.php`). localStorage is NO LONGER the source of truth
// for the portal database — only the auth token (`api_token`), the demo-user id
// and small UI settings live in localStorage now.
//
// This module only provides the empty initial shape used for the first render
// before the backend state arrives. The old loadDatabase/saveDatabase/
// resetDatabase exports are kept as no-op/compat shims so nothing that imported
// them breaks, but they never touch domain data anymore.
// ─────────────────────────────────────────────────────────────────────────────

export function emptyDatabase(): PortalDatabase {
  return {
    users: [],
    specialtyTags: [],
    organizations: [],
    memberships: [],
    inviteCodes: [],
    joinRequests: [],
    sections: [],
    documents: [],
    notifications: [],
    supportTickets: [],
    orgCreationRequests: [],
    news: [],
    newsSubmissions: [],
    incidents: [],
    siteSettings: {
      portalName: 'ПрофБаза',
      importantNoteTitle: 'Важная информация',
      firstLoginHelpTitle: 'Помощь при первом входе',
      supportEmail: 'info@profbaza.by',
    },
    currentUserId: '',
  };
}

/** @deprecated domain data is loaded from the backend; returns an empty shape. */
export function loadDatabase(): PortalDatabase {
  return emptyDatabase();
}

/** @deprecated domain data is persisted on the backend; this is a no-op. */
export function saveDatabase(_database: PortalDatabase): void {
  /* intentionally empty — see module header */
}

/** @deprecated kept for compatibility; returns an empty shape. */
export function resetDatabase(): PortalDatabase {
  return emptyDatabase();
}
