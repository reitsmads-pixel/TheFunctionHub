import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';

export interface Device {
  id: string;
  label: string | null;
  serial: string | null;
  brand: string | null;
  model: string | null;
  androidVersion: string | null;
  state: string | null;
  policy: string;
  appliedPolicy: string;
  compliant: boolean | null;
  nonCompliance: { setting: string | null; reason: string | null; packageName: string | null }[];
  lastSeen: string | null;
  enrolled: string | null;
  battery: { level: number; at: string } | null;
}

export function Devices() {
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setDevices((await api<{ devices: Device[] }>('devices')).devices);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const command = async (d: Device, type: 'LOCK' | 'REBOOT') => {
    const what = type === 'LOCK' ? 'Lock' : 'Restart';
    if (!window.confirm(`${what} ${nameOf(d)} now?`)) return;
    setBusy(d.id);
    setError('');
    setNotice('');
    try {
      await api('devices/command', { method: 'POST', body: { deviceId: d.id, type } });
      setNotice(`${what} sent to ${nameOf(d)}. If the tablet is offline, it expires after 10 minutes.`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy('');
    }
  };

  return (
    <>
      <div className="page-head">
        <h1>Devices</h1>
        <button className="small" onClick={load}>
          Refresh
        </button>
      </div>
      {error && <p className="error-text">{error}</p>}
      {notice && <p className="notice">{notice}</p>}
      {devices === null ? (
        !error && <p className="muted">Loading…</p>
      ) : devices.length === 0 ? (
        <div className="card">
          <p>No tablets enrolled yet. Create a QR code on the Enroll page.</p>
        </div>
      ) : (
        <div className="devices">
          {devices.map((d) => (
            <div className="card device" key={d.id}>
              <div className="device-head">
                <h2>{nameOf(d)}</h2>
                <span className={`pill ${d.compliant === false ? 'bad' : d.compliant ? 'good' : ''}`}>
                  {d.compliant === false ? 'Not compliant' : d.compliant ? 'Compliant' : 'Unknown'}
                </span>
              </div>
              <dl className="facts">
                <dt>Model</dt>
                <dd>{[d.brand, d.model].filter(Boolean).join(' ') || '—'}</dd>
                <dt>Serial</dt>
                <dd>{d.serial ?? '—'}</dd>
                <dt>Policy</dt>
                <dd>
                  <code>{d.policy}</code>
                  {d.appliedPolicy && d.appliedPolicy !== d.policy && (
                    <span className="muted"> (still applying; tablet has {d.appliedPolicy})</span>
                  )}
                </dd>
                <dt>State</dt>
                <dd>{d.state ?? '—'}</dd>
                <dt>Last seen</dt>
                <dd>{d.lastSeen ? ago(d.lastSeen) : '—'}</dd>
                <dt>Battery</dt>
                <dd>{d.battery ? `${d.battery.level}% (${ago(d.battery.at)})` : '—'}</dd>
                <dt>Android</dt>
                <dd>{d.androidVersion ?? '—'}</dd>
              </dl>
              {d.nonCompliance.length > 0 && (
                <details>
                  <summary>Why not compliant</summary>
                  <ul>
                    {d.nonCompliance.map((n, i) => (
                      <li key={i}>
                        {n.setting}: {n.reason}
                        {n.packageName && ` (${n.packageName})`}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
              <div className="actions">
                <button className="small" disabled={busy !== ''} onClick={() => command(d, 'LOCK')}>
                  Lock
                </button>
                <button className="small" disabled={busy !== ''} onClick={() => command(d, 'REBOOT')}>
                  Restart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function nameOf(d: Device): string {
  return d.label || d.serial || d.model || d.id;
}

function ago(iso: string): string {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString();
}
