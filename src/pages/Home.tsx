import type { Me } from '../App';

export function Home({ me }: { me: Me }) {
  return (
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
  );
}
