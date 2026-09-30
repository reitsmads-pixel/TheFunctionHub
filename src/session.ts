// Holds the Google ID token for this browser tab only. It expires after about an hour, after which
// the user signs in again. The server verifies it on every request; this file only decides when to
// show the sign-in screen.

const KEY = 'idToken';

export interface Session {
  token: string;
  email: string;
  expiresAt: number;
}

export function loadSession(): Session | null {
  try {
    const token = sessionStorage.getItem(KEY);
    return token ? parse(token) : null;
  } catch {
    return null;
  }
}

export function saveSession(token: string): Session | null {
  const session = parse(token);
  try {
    if (session) sessionStorage.setItem(KEY, token);
  } catch {
    // Storage unavailable: the session still works until the page is reloaded.
  }
  return session;
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  window.google?.accounts.id.disableAutoSelect();
}

function parse(token: string): Session | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const expiresAt = Number(payload.exp) * 1000;
    if (!payload.email || !(expiresAt > Date.now() + 30_000)) return null;
    return { token, email: String(payload.email), expiresAt };
  } catch {
    return null;
  }
}
