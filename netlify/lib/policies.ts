// The policies kept in the repo (policies/*.json). They are the starting point for the live
// policies at Google; the dashboard can push them, or edited copies of them.
import maintenance from '../../policies/maintenance.json' with { type: 'json' };

export const REPO_POLICIES: Record<string, Record<string, unknown>> = {
  maintenance,
};
