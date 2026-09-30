import { clearSession, loadSession } from './session';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Calls one of our Netlify Functions with the signed-in user's Google ID token. */
export async function api<T>(path: string, init: { method?: 'GET' | 'POST'; body?: unknown } = {}): Promise<T> {
  const session = loadSession();
  if (!session) {
    window.dispatchEvent(new Event('signed-out'));
    throw new ApiError(401, 'Please sign in again.');
  }
  const res = await fetch(`/api/${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${session.token}`,
      ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearSession();
    window.dispatchEvent(new Event('signed-out'));
  }
  if (!res.ok) throw new ApiError(res.status, data.error ?? `Request failed (${res.status}).`);
  return data as T;
}
