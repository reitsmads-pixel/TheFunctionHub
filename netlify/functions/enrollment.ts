import type { Config } from '@netlify/functions';
import { requireAdmin } from '../lib/auth.js';
import { amapi, enterpriseName } from '../lib/amapi.js';
import { HttpError, handler, json, readJsonBody, requireMethod, requireString } from '../lib/http.js';
import { POLICY_ID } from '../lib/ids.js';

const WIFI_SECURITY = new Set(['WPA', 'WEP', 'NONE']);

// Creates an enrollment token for a policy and returns the QR code contents. Optionally adds Wi-Fi
// details to the QR so the tablet connects by itself during setup.
export default handler(async (req) => {
  requireMethod(req, 'POST');
  const admin = await requireAdmin(req);
  const body = await readJsonBody(req);
  const policyId = requireString(body, 'policyId', POLICY_ID);

  const hours = body.hours ?? 24;
  if (typeof hours !== 'number' || !Number.isInteger(hours) || hours < 1 || hours > 24 * 30) {
    throw new HttpError(400, '"hours" must be a whole number from 1 to 720.');
  }

  let label: string | null = null;
  if (body.label !== undefined && body.label !== '') {
    label = requireString(body, 'label', /^[\p{L}\p{N} ._#()-]{1,60}$/u).trim();
  }

  const policyName = `${enterpriseName()}/policies/${policyId}`;
  await amapi().enterprises.policies.get({ name: policyName }); // 404 if not pushed yet

  const { data } = await amapi().enterprises.enrollmentTokens.create({
    parent: enterpriseName(),
    requestBody: {
      policyName,
      duration: `${hours * 3600}s`,
      allowPersonalUsage: 'PERSONAL_USAGE_DISALLOWED',
      // A labelled token names one specific tablet, so it can only be used once.
      oneTimeOnly: label !== null,
      additionalData: label !== null ? JSON.stringify({ label }) : undefined,
    },
  });
  if (!data.qrCode) throw new HttpError(502, 'Google did not return a QR code.');

  const qr = JSON.parse(data.qrCode) as Record<string, unknown>;
  if (body.wifi !== undefined && body.wifi !== null) {
    if (typeof body.wifi !== 'object' || Array.isArray(body.wifi)) throw new HttpError(400, 'Invalid "wifi".');
    const wifi = body.wifi as Record<string, unknown>;
    const ssid = requireString(wifi, 'ssid', /^[\x20-\x7e]{1,32}$/);
    const security = requireString(wifi, 'security', /^[A-Z]{3,4}$/);
    if (!WIFI_SECURITY.has(security)) throw new HttpError(400, 'Wi-Fi security must be WPA, WEP or NONE.');
    qr['android.app.extra.PROVISIONING_WIFI_SSID'] = ssid;
    qr['android.app.extra.PROVISIONING_WIFI_SECURITY_TYPE'] = security;
    qr['android.app.extra.PROVISIONING_WIFI_HIDDEN'] = wifi.hidden === true;
    if (security !== 'NONE') {
      qr['android.app.extra.PROVISIONING_WIFI_PASSWORD'] = requireString(wifi, 'password', /^[\x20-\x7e]{5,63}$/);
    }
  }

  console.log(`${admin} created an enrollment token for policy ${policyId}${label ? ` (${label})` : ''}`);
  return json({ qr: JSON.stringify(qr), expires: data.expirationTimestamp ?? null, oneTimeOnly: label !== null });
});

export const config: Config = { path: '/api/enrollment' };
