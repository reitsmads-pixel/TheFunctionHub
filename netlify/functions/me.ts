import type { Config } from '@netlify/functions';
import { requireAdmin } from '../lib/auth.js';
import { enterpriseConfigured } from '../lib/amapi.js';
import { handler, json, requireMethod } from '../lib/http.js';

export default handler(async (req) => {
  requireMethod(req, 'GET');
  const email = await requireAdmin(req);
  return json({
    email,
    enterprise: enterpriseConfigured() ? process.env.AMAPI_ENTERPRISE : null,
  });
});

export const config: Config = { path: '/api/me' };
