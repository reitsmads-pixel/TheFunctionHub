import type { Config } from '@netlify/functions';
import { requireAdmin } from '../lib/auth.js';
import { amapi, enterpriseConfigured } from '../lib/amapi.js';
import { HttpError, env, handler, json, readJsonBody, requireMethod, requireString } from '../lib/http.js';

// Step 2 of the one-off enterprise signup: exchange the token Google appended to /setup for an enterprise.
export default handler(async (req) => {
  requireMethod(req, 'POST');
  await requireAdmin(req);
  if (enterpriseConfigured()) throw new HttpError(409, 'An enterprise is already configured (AMAPI_ENTERPRISE).');

  const body = await readJsonBody(req);
  const signupUrlName = requireString(body, 'signupUrlName', /^signupUrls\/[A-Za-z0-9_-]{1,200}$/);
  const enterpriseToken = requireString(body, 'enterpriseToken', /^[A-Za-z0-9_-]{1,1024}$/);

  const { data } = await amapi().enterprises.create({
    projectId: env('GCP_PROJECT_ID'),
    signupUrlName,
    enterpriseToken,
    requestBody: { enterpriseDisplayName: 'Preform (Pty) Ltd' },
  });
  if (!data.name) throw new HttpError(502, 'Google did not return the enterprise name.');
  return json({ name: data.name });
});

export const config: Config = { path: '/api/setup/create-enterprise' };
