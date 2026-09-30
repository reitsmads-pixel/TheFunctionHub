import { useEffect, useRef, useState } from 'react';
import { saveSession, type Session } from '../session';

export function SignIn({ onSignedIn }: { onSignedIn: (s: Session) => void }) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(__GOOGLE_CLIENT_ID__ ? '' : 'GOOGLE_OAUTH_CLIENT_ID is not set in Netlify.');

  useEffect(() => {
    if (!__GOOGLE_CLIENT_ID__) return;
    let cancelled = false;
    const render = () => {
      const gis = window.google?.accounts.id;
      if (!gis) {
        if (!cancelled) window.setTimeout(render, 100);
        return;
      }
      gis.initialize({
        client_id: __GOOGLE_CLIENT_ID__,
        callback: ({ credential }) => {
          const session = saveSession(credential);
          if (session) onSignedIn(session);
          else setError('Google sign-in did not return a usable account.');
        },
      });
      if (buttonRef.current) gis.renderButton(buttonRef.current, { theme: 'outline', size: 'large', text: 'signin_with' });
    };
    render();
    return () => {
      cancelled = true;
    };
  }, [onSignedIn]);

  return (
    <div className="signin">
      <div className="card">
        <h1>Preform Tablets</h1>
        <p className="muted">Tablet management for Preform (Pty) Ltd. Authorised staff only.</p>
        <div ref={buttonRef} className="gbutton" />
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
