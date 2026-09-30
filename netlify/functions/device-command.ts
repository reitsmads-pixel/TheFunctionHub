import type { Config } from '@netlify/functions';
import { requireAdmin } from '../lib/auth.js';
import { amapi, enterpriseName } from '../lib/amapi.js';
import { HttpError, handler, json, readJsonBody, requireMethod, requireString } from '../lib/http.js';
import { DEVICE_ID } from '../lib/ids.js';

const COMMANDS = new Set(['LOCK', 'REBOOT', 'RESET_PASSWORD']);

// Sends lock / reboot / reset-PIN. Commands expire after AMAPI's default of 10 minutes if the
// tablet is offline, so a reboot never fires unexpectedly hours later.
export default handler(async (req) => {
  requireMethod(req, 'POST');
  const admin = await requireAdmin(req);
  const body = await readJsonBody(req);
  const deviceId = requireString(body, 'deviceId', DEVICE_ID);
  const type = requireString(body, 'type', /^[A-Z_]{1,20}$/);
  if (!COMMANDS.has(type)) throw new HttpError(400, 'Unknown command.');

  const command: { type: string; newPassword?: string } = { type };
  if (type === 'RESET_PASSWORD') {
    // Matches the policies' numeric PIN rule; Android 14+ rejects numeric PINs shorter than 6.
    command.newPassword = requireString(body, 'newPassword', /^[0-9]{6,16}$/);
  }

  const { data } = await amapi().enterprises.devices.issueCommand({
    name: `${enterpriseName()}/devices/${deviceId}`,
    requestBody: command,
  });
  console.log(`${admin} sent ${type} to device ${deviceId}`);
  return json({ ok: true, operation: data.name ?? null });
});

export const config: Config = { path: '/api/devices/command' };
