import type { Config } from '@netlify/functions';
import type { androidmanagement_v1 } from '@googleapis/androidmanagement';
import { requireAdmin } from '../lib/auth.js';
import { amapi, enterpriseName } from '../lib/amapi.js';
import { HttpError, handler, json, requireMethod } from '../lib/http.js';
import { POLICY_ID, lastSegment } from '../lib/ids.js';
import { REPO_POLICIES } from '../lib/policies.js';

// GET /api/policies          → every policy in the repo and/or live at Google
// GET /api/policies?id=kiosk → one policy: the repo copy and the live copy
export default handler(async (req) => {
  requireMethod(req, 'GET');
  await requireAdmin(req);
  const id = new URL(req.url).searchParams.get('id');

  if (id !== null) {
    if (!POLICY_ID.test(id)) throw new HttpError(400, 'Invalid policy id.');
    let live: androidmanagement_v1.Schema$Policy | null = null;
    try {
      live = (await amapi().enterprises.policies.get({ name: `${enterpriseName()}/policies/${id}` })).data;
    } catch (err) {
      if ((err as { status?: number }).status !== 404) throw err;
    }
    const repo = REPO_POLICIES[id] ?? null;
    if (!repo && !live) throw new HttpError(404, 'No such policy.');
    return json({ id, repo, live });
  }

  const live: androidmanagement_v1.Schema$Policy[] = [];
  let pageToken: string | undefined;
  do {
    const { data } = await amapi().enterprises.policies.list({ parent: enterpriseName(), pageSize: 100, pageToken });
    live.push(...(data.policies ?? []));
    pageToken = data.nextPageToken ?? undefined;
  } while (pageToken);

  const liveById = new Map(live.map((p) => [lastSegment(p.name), p]));
  const ids = [...new Set([...Object.keys(REPO_POLICIES), ...liveById.keys()])].sort();
  return json({
    policies: ids.map((pid) => ({
      id: pid,
      inRepo: pid in REPO_POLICIES,
      live: liveById.has(pid),
      version: liveById.get(pid)?.version ?? null,
    })),
  });
});

export const config: Config = { path: '/api/policies' };
