import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import type { Me } from '../App';

interface PolicyRow {
  id: string;
  inRepo: boolean;
  live: boolean;
  version: string | null;
}

export function Home({ me }: { me: Me }) {
  return (
    <>
      <div className="card">
        <h2>Status</h2>
        <dl className="facts">
          <dt>Signed in as</dt>
          <dd>{me.email}</dd>
          <dt>Enterprise</dt>
          <dd>{me.enterprise ? <code>{me.enterprise}</code> : 'Not set up yet'}</dd>
        </dl>
        {!me.enterprise && (
          <p>
            <a className="button" href="/setup">
              Set up the enterprise
            </a>
          </p>
        )}
      </div>
      {me.enterprise && <ConnectionCheck />}
    </>
  );
}

/** Phase 2 check: proves the functions can reach Google with the service account. */
function ConnectionCheck() {
  const [devices, setDevices] = useState<number | null>(null);
  const [policies, setPolicies] = useState<PolicyRow[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [d, p] = await Promise.all([
        api<{ devices: unknown[] }>('devices'),
        api<{ policies: PolicyRow[] }>('policies'),
      ]);
      setDevices(d.devices.length);
      setPolicies(p.policies);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const push = async (id: string) => {
    setBusy(id);
    setError('');
    try {
      await api('policies/push', { method: 'POST', body: { id, fromRepo: true } });
      await load();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="card">
      <h2>Connection to Google</h2>
      {error && <p className="error-text">{error}</p>}
      {devices === null || policies === null ? (
        !error && <p className="muted">Checking…</p>
      ) : (
        <>
          <p>
            Connected. <strong>{devices}</strong> enrolled {devices === 1 ? 'tablet' : 'tablets'}.
          </p>
          <table className="table">
            <thead>
              <tr>
                <th>Policy</th>
                <th>At Google</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {policies.map((p) => (
                <tr key={p.id}>
                  <td>
                    <code>{p.id}</code>
                  </td>
                  <td>{p.live ? `Yes (version ${p.version})` : 'Not pushed yet'}</td>
                  <td className="right">
                    {p.inRepo && (
                      <button className="small" disabled={busy !== ''} onClick={() => push(p.id)}>
                        {busy === p.id ? 'Pushing…' : 'Push repo version'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <p>
        <button className="link" onClick={load}>
          Refresh
        </button>
      </p>
    </div>
  );
}
