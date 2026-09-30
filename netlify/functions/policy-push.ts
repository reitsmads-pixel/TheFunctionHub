import type { Config } from '@netlify/functions';
import { requireAdmin } from '../lib/auth.js';
import { amapi, enterpriseName } from '../lib/amapi.js';
import { HttpError, handler, json, readJsonBody, requireMethod, requireString } from '../lib/http.js';
import { POLICY_ID } from '../lib/ids.js';
import { REPO_POLICIES } from '../lib/policies.js';

// Pushes a policy to Google: either the repo copy ({ id, fromRepo: true }) or an edited copy
// ({ id, policy: {...} }). Google validates every field and rejects anything invalid.
export default handler(async (req) => {
  requireMethod(req, 'POST');
  const admin = await requireAdmin(req);
  const body = await readJsonBody(req, 256 * 1024);
  const id = requireString(body, 'id', POLICY_ID);

  let policy: Record<string, unknown>;
  if (body.fromRepo === true) {
    const repo = REPO_POLICIES[id];
    if (!repo) throw new HttpError(404, `There is no "${id}" policy in the repo.`);
    policy = structuredClone(repo);
  } else {
    if (typeof body.policy !== 'object' || body.policy === null || Array.isArray(body.policy)) {
      throw new HttpError(400, '"policy" must be a JSON object.');
    }
    policy = { ...(body.policy as Record<string, unknown>) };
  }
  // Read-only fields Google sets itself.
  delete policy.name;
  delete policy.version;

  const { data } = await amapi().enterprises.policies.patch({
    name: `${enterpriseName()}/policies/${id}`,
    requestBody: policy,
  });
  console.log(`${admin} pushed policy ${id} (version ${data.version})`);
  return json({ ok: true, id, version: data.version ?? null, policy: data });
});

export const config: Config = { path: '/api/policies/push' };
