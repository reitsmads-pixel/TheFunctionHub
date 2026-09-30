import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { api } from '../api';

interface PolicyRow {
  id: string;
  live: boolean;
}

interface Result {
  image: string;
  expires: string | null;
  oneTimeOnly: boolean;
  policy: string;
  label: string;
}

export function Enroll() {
  const [policies, setPolicies] = useState<string[] | null>(null);
  const [policyId, setPolicyId] = useState('maintenance');
  const [label, setLabel] = useState('');
  const [hours, setHours] = useState(24);
  const [useWifi, setUseWifi] = useState(false);
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [security, setSecurity] = useState('WPA');
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    api<{ policies: PolicyRow[] }>('policies')
      .then(({ policies }) => {
        const live = policies.filter((p) => p.live).map((p) => p.id);
        setPolicies(live);
        if (live.length && !live.includes('maintenance')) setPolicyId(live[0]);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    setResult(null);
    try {
      const res = await api<{ qr: string; expires: string | null; oneTimeOnly: boolean }>('enrollment', {
        method: 'POST',
        body: {
          policyId,
          hours,
          label: label.trim() || undefined,
          wifi: useWifi ? { ssid, security, hidden, password: security === 'NONE' ? undefined : password } : undefined,
        },
      });
      const image = await QRCode.toDataURL(res.qr, { errorCorrectionLevel: 'M', margin: 2, width: 360 });
      setResult({ image, expires: res.expires, oneTimeOnly: res.oneTimeOnly, policy: policyId, label: label.trim() });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="card center">
        <h2>Scan this with the tablet</h2>
        <p className="muted">
          Policy <code>{result.policy}</code>
          {result.label && <> · {result.label}</>}
        </p>
        <img className="qr" src={result.image} alt="Enrollment QR code" />
        <p>
          {result.oneTimeOnly ? 'Works for one tablet only. ' : 'Works for any number of tablets. '}
          {result.expires && <>Valid until {new Date(result.expires).toLocaleString()}.</>}
        </p>
        <p className="warning">
          This code lets a tablet join your company{useWifi && ' and contains the Wi-Fi password'}. Don't share or
          print it.
        </p>
        <p className="muted small-text">
          On a freshly reset tablet: tap the welcome screen 6 times in the same spot, then point the camera at this
          code. Full steps are in ENROLLMENT.md.
        </p>
        <button onClick={() => setResult(null)}>Make another code</button>
      </div>
    );
  }

  return (
    <form className="card form" onSubmit={generate}>
      <h2>Enroll a tablet</h2>
      <p className="muted">Creates a QR code that a factory-reset tablet scans to join and receive a policy.</p>

      <label>
        Policy
        <select value={policyId} onChange={(e) => setPolicyId(e.target.value)} disabled={!policies?.length}>
          {(policies ?? []).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        {policies && !policies.length && (
          <span className="error-text">No policies at Google yet. Push one from the home page first.</span>
        )}
      </label>

      <label>
        Tablet name (optional)
        <input value={label} maxLength={60} placeholder="e.g. Site 3 – Tablet 1" onChange={(e) => setLabel(e.target.value)} />
        <span className="hint">With a name, the code works for that one tablet only, and the name shows on Devices.</span>
      </label>

      <label>
        Code valid for
        <select value={hours} onChange={(e) => setHours(Number(e.target.value))}>
          <option value={1}>1 hour</option>
          <option value={24}>24 hours</option>
          <option value={168}>7 days</option>
        </select>
      </label>

      <label className="check">
        <input type="checkbox" checked={useWifi} onChange={(e) => setUseWifi(e.target.checked)} />
        Include Wi-Fi, so the tablet connects by itself during setup
      </label>

      {useWifi && (
        <fieldset>
          <label>
            Network name (SSID)
            <input value={ssid} required maxLength={32} onChange={(e) => setSsid(e.target.value)} />
          </label>
          <label>
            Security
            <select value={security} onChange={(e) => setSecurity(e.target.value)}>
              <option value="WPA">WPA / WPA2 / WPA3 (most networks)</option>
              <option value="WEP">WEP (old)</option>
              <option value="NONE">None (open network)</option>
            </select>
          </label>
          {security !== 'NONE' && (
            <label>
              Password
              <input type="password" value={password} required minLength={5} maxLength={63} autoComplete="off" onChange={(e) => setPassword(e.target.value)} />
            </label>
          )}
          <label className="check">
            <input type="checkbox" checked={hidden} onChange={(e) => setHidden(e.target.checked)} />
            Hidden network
          </label>
        </fieldset>
      )}

      {error && <p className="error-text">{error}</p>}
      <button type="submit" disabled={busy || !policies?.length}>
        {busy ? 'Creating…' : 'Create QR code'}
      </button>
    </form>
  );
}
