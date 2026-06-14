// Resolve the PHP API base relative to where the app is served.
// - On the Vite dev server (127.0.0.1:5173 or localhost:5173) the PHP API is
//   served by Apache on the same hostname at port 80 → keep the hostname so the
//   browser origin stays consistent (avoids localhost/127.0.0.1 CORS mismatch).
// - When the built app is served by Apache directly, use the same origin.
function resolveApiBase(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost/profbase/api';
  }
  const { protocol, hostname, port, origin } = window.location;
  if (port === '5173' || port === '3000') {
    return `${protocol}//${hostname}/profbase/api`;
  }
  return `${origin}/profbase/api`;
}

export const API_BASE = resolveApiBase();

export function apiUrl(path: string) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}
