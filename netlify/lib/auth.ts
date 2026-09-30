import { OAuth2Client } from 'google-auth-library';
import { HttpError, env } from './http.js';

const client = new OAuth2Client();

/**
 * Verifies the Google ID token sent by the dashboard and checks the email against ADMIN_EMAILS.
 * Every function calls this first; nothing is reachable without a valid, allowlisted sign-in.
 */
export async function requireAdmin(req: Request): Promise<string> {
  const header = req.headers.get('authorization') ?? '';
  const match = /^Bearer ([A-Za-z0-9_.-]{20,4096})$/.exec(header);
  if (!match) throw new HttpError(401, 'Not signed in.');

  let email: string | undefined;
  try {
    const ticket = await client.verifyIdToken({ idToken: match[1], audience: env('GOOGLE_OAUTH_CLIENT_ID') });
    const payload = ticket.getPayload();
    if (payload?.email_verified) email = payload.email?.toLowerCase();
  } catch (err) {
    if (err instanceof HttpError) throw err;
    throw new HttpError(401, 'Sign-in expired or invalid. Please sign in again.');
  }
  if (!email) throw new HttpError(401, 'Sign-in expired or invalid. Please sign in again.');

  if (!adminEmails().has(email)) throw new HttpError(403, `${email} is not allowed to use this dashboard.`);
  return email;
}

export function adminEmails(): Set<string> {
  return new Set(
    env('ADMIN_EMAILS')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}
