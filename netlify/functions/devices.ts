import type { Config } from '@netlify/functions';
import type { androidmanagement_v1 } from '@googleapis/androidmanagement';
import { requireAdmin } from '../lib/auth.js';
import { amapi, enterpriseName } from '../lib/amapi.js';
import { handler, json, requireMethod } from '../lib/http.js';
import { lastSegment } from '../lib/ids.js';

// Lists every enrolled device with the details the dashboard shows.
export default handler(async (req) => {
  requireMethod(req, 'GET');
  await requireAdmin(req);

  const devices: androidmanagement_v1.Schema$Device[] = [];
  let pageToken: string | undefined;
  do {
    const { data } = await amapi().enterprises.devices.list({ parent: enterpriseName(), pageSize: 100, pageToken });
    devices.push(...(data.devices ?? []));
    pageToken = data.nextPageToken ?? undefined;
  } while (pageToken);

  return json({ devices: devices.map(summarise) });
});

function summarise(d: androidmanagement_v1.Schema$Device) {
  const battery = [...(d.powerManagementEvents ?? [])]
    .filter((e) => e.eventType === 'BATTERY_LEVEL_COLLECTED' && typeof e.batteryLevel === 'number')
    .sort((a, b) => (b.createTime ?? '').localeCompare(a.createTime ?? ''))[0];
  return {
    id: lastSegment(d.name),
    label: labelOf(d.enrollmentTokenData),
    serial: d.hardwareInfo?.serialNumber ?? null,
    brand: d.hardwareInfo?.brand ?? null,
    model: d.hardwareInfo?.model ?? null,
    androidVersion: d.softwareInfo?.androidVersion ?? null,
    state: d.state ?? null,
    appliedState: d.appliedState ?? null,
    policy: lastSegment(d.policyName),
    appliedPolicy: lastSegment(d.appliedPolicyName),
    appliedPolicyVersion: d.appliedPolicyVersion ?? null,
    compliant: d.policyCompliant ?? null,
    nonCompliance: (d.nonComplianceDetails ?? []).map((n) => ({
      setting: n.settingName ?? null,
      reason: n.nonComplianceReason ?? null,
      packageName: n.packageName ?? null,
    })),
    lastSeen: d.lastStatusReportTime ?? d.lastPolicySyncTime ?? null,
    enrolled: d.enrollmentTime ?? null,
    battery: battery ? { level: battery.batteryLevel, at: battery.createTime } : null,
  };
}

function labelOf(data: string | null | undefined): string | null {
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return typeof parsed.label === 'string' ? parsed.label : null;
  } catch {
    return null;
  }
}

export const config: Config = { path: '/api/devices' };
