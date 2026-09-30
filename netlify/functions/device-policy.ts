import type { Config } from '@netlify/functions';
import { requireAdmin } from '../lib/auth.js';
import { amapi, enterpriseName } from '../lib/amapi.js';
import { handler, json, readJsonBody, requireMethod, requireString } from '../lib/http.js';
import { DEVICE_ID, POLICY_ID } from '../lib/ids.js';

// Moves one device to another policy, e.g. kiosk-single → maintenance.
export default handler(async (req) => {
  requireMethod(req, 'POST');
  const admin = await requireAdmin(req);
  const body = await readJsonBody(req);
  const deviceId = requireString(body, 'deviceId', DEVICE_ID);
  const policyId = requireString(body, 'policyId', POLICY_ID);

  const policyName = `${enterpriseName()}/policies/${policyId}`;
  // Fails with 404 if the policy has never been pushed, instead of stranding the device.
  await amapi().enterprises.policies.get({ name: policyName });
  const { data } = await amapi().enterprises.devices.patch({
    name: `${enterpriseName()}/devices/${deviceId}`,
    updateMask: 'policyName',
    requestBody: { policyName },
  });
  console.log(`${admin} moved device ${deviceId} to policy ${policyId}`);
  return json({ ok: true, policy: policyId, state: data.state ?? null });
});

export const config: Config = { path: '/api/devices/policy' };
