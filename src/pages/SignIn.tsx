import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { isDemoMode } from '../lib/firebase'
import { Notice } from '../components/ui'
import { useSeo } from '../lib/seo'

export default function SignIn() {
  const { user, signIn, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useSeo({ title: 'Supplier login', description: 'Sign in to manage your listing on The Function Hub SA.' })

  if (!loading && user) {
    const to = (location.state as { from?: string } | null)?.from ?? '/dashboard'
    return <Navigate to={to} replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? friendly(err.message) : 'Could not sign in.')
      setBusy(false)
    }
  }

  return (
    <section className="section">
      <div className="wrap" style={{ maxWidth: 460 }}>
        <h1 style={{ fontSize: '2rem' }}>Supplier login</h1>
        <p className="muted" style={{ marginTop: '0.5rem', marginBottom: '1.75rem' }}>
          Manage your listing, read your enquiries and change your plan.
        </p>

        {isDemoMode && (
          <div style={{ marginBottom: '1.25rem' }}>
            <Notice kind="info">
              Demo mode — any email and password will sign you in. Use an address starting with{' '}
              <strong>admin@</strong> to see the admin area.
            </Notice>
          </div>
        )}

        <form className="card card-pad" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ marginBottom: '1rem' }}>
              <Notice kind="error">{error}</Notice>
            </div>
          )}

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="muted center" style={{ marginTop: '1.25rem' }}>
          No account yet? <Link to="/list-your-business">List your business</Link>
        </p>
      </div>
    </section>
  )
}

function friendly(message: string): string {
  if (message.includes('invalid-credential') || message.includes('wrong-password')) {
    return 'That email and password combination does not match an account.'
  }
  if (message.includes('user-not-found')) return 'We have no account with that email address.'
  if (message.includes('too-many-requests')) return 'Too many attempts. Try again in a few minutes.'
  return 'Could not sign in. Please try again.'
}
