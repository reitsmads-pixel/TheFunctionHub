import type { Config } from '@netlify/functions';
import { requireAdmin } from '../lib/auth.js';
import { amapi, enterpriseName } from '../lib/amapi.js';
import { HttpError, handler, json, readJsonBody, requireMethod, requireString } from '../lib/http.js';
import { DEVICE_ID } from '../lib/ids.js';

// Wipes a company-owned tablet back to factory settings and removes it from the enterprise.
// The caller must type the tablet's serial number (or its device ID if no serial is reported).
export default handler(async (req) => {
  requireMethod(req, 'POST');
  const admin = await requireAdmin(req);
  const body = await readJsonBody(req);
  const deviceId = requireString(body, 'deviceId', DEVICE_ID);
  const confirm = requireString(body, 'confirm', /^[\x20-\x7e]{1,100}$/);

  const name = `${enterpriseName()}/devices/${deviceId}`;
  const { data: device } = await amapi().enterprises.devices.get({ name });
  const expected = device.hardwareInfo?.serialNumber || deviceId;
  if (confirm.trim().toUpperCase() !== expected.toUpperCase()) {
    throw new HttpError(400, 'The confirmation does not match this tablet. Nothing was wiped.');
  }

  await amapi().enterprises.devices.delete({ name, wipeDataFlags: ['WIPE_EXTERNAL_STORAGE'] });
  console.log(`${admin} wiped and deleted device ${deviceId} (${expected})`);
  return json({ ok: true });
});

export const config: Config = { path: '/api/devices/delete' };
