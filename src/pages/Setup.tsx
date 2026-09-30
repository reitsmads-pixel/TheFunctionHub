import { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import type { Me } from '../App';

const SIGNUP_KEY = 'signupUrlName';

/**
 * One-off enterprise signup. Google sends the admin back here with ?enterpriseToken=… appended,
 * which we exchange for the enterprise name that then goes into the AMAPI_ENTERPRISE setting.
 */
export function Setup({ me }: { me: Me }) {
  const enterpriseToken = new URLSearchParams(window.location.search).get('enterpriseToken');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (!enterpriseToken || started.current || me.enterprise) return;
    started.current = true;
    let signupUrlName: string | null = null;
    try {
      signupUrlName = sessionStorage.getItem(SIGNUP_KEY);
    } catch {
      // handled below
    }
    if (!signupUrlName) {
      setError('This browser tab lost track of the signup. Start again from the button below, in one tab.');
      return;
    }
    setBusy(true);
    api<{ name: string }>('setup/create-enterprise', { method: 'POST', body: { signupUrlName, enterpriseToken } })
      .then(({ name }) => {
        setCreated(name);
        try {
          sessionStorage.removeItem(SIGNUP_KEY);
        } catch {
          // ignore
        }
        window.history.replaceState(null, '', '/setup');
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setBusy(false));
  }, [enterpriseToken, me.enterprise]);

  const start = async () => {
    setBusy(true);
    setError('');
    try {
      const { name, url } = await api<{ name: string; url: string }>('setup/signup-url', { method: 'POST' });
      sessionStorage.setItem(SIGNUP_KEY, name);
      window.location.assign(url);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  if (me.enterprise) {
    return (
      <div className="card">
        <h2>Enterprise is set up</h2>
        <p>
          This dashboard manages <code>{me.enterprise}</code>. There is nothing more to do here.
        </p>
        <a href="/">Back to status</a>
      </div>
    );
  }

  if (created) {
    return (
      <div className="card success">
        <h2>Enterprise created</h2>
        <p>Your enterprise name is:</p>
        <p>
          <code className="big">{created}</code>{' '}
          <button className="small" onClick={() => navigator.clipboard?.writeText(created)}>
            Copy
          </button>
        </p>
        <p>
          Copy it now. In Netlify, add it as the <code>AMAPI_ENTERPRISE</code> environment variable and redeploy.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Set up the enterprise</h2>
      <p>
        This links your Google account to Android Enterprise so the dashboard can manage the tablets. It's done
        once.
      </p>
      <ol>
        <li>Click the button. Google's signup page opens in this tab.</li>
        <li>Sign in with {me.email} and follow Google's steps.</li>
        <li>Google sends you back here and the enterprise is created automatically.</li>
      </ol>
      {error && <p className="error-text">{error}</p>}
      <button onClick={start} disabled={busy}>
        {busy ? 'Working…' : 'Start enterprise signup'}
      </button>
    </div>
  );
}
