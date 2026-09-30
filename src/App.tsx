import { useEffect, useState } from 'react';
import { api } from './api';
import { SignIn } from './pages/SignIn';
import { Home } from './pages/Home';
import { Setup } from './pages/Setup';
import { Devices } from './pages/Devices';
import { Enroll } from './pages/Enroll';
import { linkProps, usePath } from './router';
import { clearSession, loadSession, type Session } from './session';

export interface Me {
  email: string;
  enterprise: string | null;
}

export function App() {
  const [session, setSession] = useState<Session | null>(loadSession);
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState('');
  const path = usePath();

  useEffect(() => {
    const onSignedOut = () => {
      setSession(null);
      setMe(null);
    };
    window.addEventListener('signed-out', onSignedOut);
    return () => window.removeEventListener('signed-out', onSignedOut);
  }, []);

  // Sign out automatically when the Google token expires.
  useEffect(() => {
    if (!session) return;
    const timer = window.setTimeout(() => {
      clearSession();
      setSession(null);
      setMe(null);
    }, session.expiresAt - Date.now() - 30_000);
    return () => window.clearTimeout(timer);
  }, [session]);

  // Ask the server who we are: this is where the allowlist is enforced.
  useEffect(() => {
    if (!session) return;
    setError('');
    api<Me>('me')
      .then(setMe)
      .catch((e: Error) => setError(e.message));
  }, [session]);

  const signOut = () => {
    clearSession();
    setSession(null);
    setMe(null);
    setError('');
  };

  if (!session) return <SignIn onSignedIn={setSession} />;

  return (
    <div className="shell">
      <header className="topbar">
        <a className="brand" {...linkProps('/')}>
          Preform Tablets
        </a>
        {me?.enterprise && (
          <nav className="nav">
            {[
              ['/devices', 'Devices'],
              ['/enroll', 'Enroll'],
            ].map(([href, label]) => (
              <a key={href} className={path === href ? 'active' : ''} {...linkProps(href)}>
                {label}
              </a>
            ))}
          </nav>
        )}
        <div className="who">
          <span className="email">{session.email}</span>
          <button className="link" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>
      <main className="content">
        {error ? (
          <div className="card error">
            <h2>Access denied</h2>
            <p>{error}</p>
            <button onClick={signOut}>Use a different account</button>
          </div>
        ) : !me ? (
          <p className="muted">Checking access…</p>
        ) : path === '/setup' ? (
          <Setup me={me} />
        ) : me.enterprise && path === '/devices' ? (
          <Devices />
        ) : me.enterprise && path === '/enroll' ? (
          <Enroll />
        ) : (
          <Home me={me} />
        )}
      </main>
    </div>
  );
}
