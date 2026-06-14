// Central API client for the PHP backend.
// - Injects the auth token (Bearer) from localStorage on every request.
// - Parses JSON safely and turns non-2xx / dead-backend responses into a
//   typed ApiError carrying the server message + HTTP status.
// Components/state never call fetch() directly — they go through the per-module
// api objects which are built on top of this client.
import { apiUrl } from '../lib/api';

export const AUTH_TOKEN_KEY = 'api_token';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function authHeaders(): Record<string, string> {
  if (typeof localStorage === 'undefined') return {};
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parse(res: Response): Promise<any> {
  const text = await res.text();
  if (!text) {
    if (res.ok) return {};
    throw new ApiError(
      `Сервер вернул пустой ответ (HTTP ${res.status}). Проверьте, что запущены Apache и MySQL (XAMPP).`,
      res.status,
    );
  }
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new ApiError(`Сервер вернул некорректный ответ (HTTP ${res.status}). Проверьте backend и базу данных.`, res.status);
  }
  if (!res.ok || (data && data.error)) {
    throw new ApiError(data?.error || `Ошибка запроса (HTTP ${res.status})`, res.status);
  }
  return data;
}

export async function apiGet<T = any>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), { headers: { ...authHeaders() } });
  return parse(res);
}

export async function apiPost<T = any>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parse(res);
}

/** Call a module router (api/<module>/index.php) with an { action, ...payload } body. */
export function apiAction<T = any>(module: string, action: string, payload: Record<string, unknown> = {}): Promise<T> {
  return apiPost<T>(`/${module}/index.php`, { action, ...payload });
}
