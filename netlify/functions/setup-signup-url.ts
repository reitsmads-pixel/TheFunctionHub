import type { Config } from '@netlify/functions';
import { adminEmails, requireAdmin } from '../lib/auth.js';
import { amapi, enterpriseConfigured } from '../lib/amapi.js';
import { HttpError, env, handler, json, requireMethod } from '../lib/http.js';

// Step 1 of the one-off enterprise signup: ask Google for a signup page for this project.
export default handler(async (req) => {
  requireMethod(req, 'POST');
  await requireAdmin(req);
  if (enterpriseConfigured()) throw new HttpError(409, 'An enterprise is already configured (AMAPI_ENTERPRISE).');

  // Netlify sets URL to the site's main address; never trust the request's Host header for this.
  const callbackUrl = new URL('/setup', env('URL')).toString();
  const { data } = await amapi().signupUrls.create({
    projectId: env('GCP_PROJECT_ID'),
    callbackUrl,
    adminEmail: [...adminEmails()][0],
  });
  if (!data.name || !data.url) throw new HttpError(502, 'Google did not return a signup URL.');
  return json({ name: data.name, url: data.url });
});

export const config: Config = { path: '/api/setup/signup-url' };
