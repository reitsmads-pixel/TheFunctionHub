import { androidmanagement, auth, type androidmanagement_v1 } from '@googleapis/androidmanagement';
import { HttpError, env } from './http.js';

export const ENTERPRISE_PATTERN = /^enterprises\/[A-Za-z0-9_-]{1,100}$/;

let cached: androidmanagement_v1.Androidmanagement | undefined;

/** AMAPI client authenticated as the service account. The key only ever lives in Netlify env vars. */
export function amapi(): androidmanagement_v1.Androidmanagement {
  if (!cached) {
    const client = new auth.GoogleAuth({
      credentials: {
        client_email: env('GOOGLE_SA_CLIENT_EMAIL'),
        // Netlify stores the key with literal "\n" sequences when pasted from the JSON file.
        private_key: env('GOOGLE_SA_PRIVATE_KEY').replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/androidmanagement'],
    });
    cached = androidmanagement({ version: 'v1', auth: client });
  }
  return cached;
}

/** The enterprise this dashboard manages, e.g. "enterprises/LC0abc123". */
export function enterpriseName(): string {
  const name = env('AMAPI_ENTERPRISE');
  if (!ENTERPRISE_PATTERN.test(name)) throw new HttpError(500, 'AMAPI_ENTERPRISE is not in the form enterprises/…');
  return name;
}

export function enterpriseConfigured(): boolean {
  return ENTERPRISE_PATTERN.test(process.env.AMAPI_ENTERPRISE ?? '');
}
