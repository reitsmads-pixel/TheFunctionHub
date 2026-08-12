import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { isDemoMode } from '../lib/firebase'
import { TIERS, tierOf } from '../lib/tiers'
import { rands } from '../lib/format'
import { Notice } from '../components/ui'
import { useSeo } from '../lib/seo'
import type { TierId } from '../lib/types'

const SELLING_POINTS = [
  {
    title: 'People arrive already looking',
    body: 'Nobody browses a supplier directory for fun. Every visitor is planning something and needs what you sell.',
  },
  {
    title: 'Enquiries come to you directly',
    body: 'Name, number, date and guest count land in your inbox and your dashboard. No commission, no gatekeeping.',
  },
  {
    title: 'You control the listing',
    body: 'Update prices, photos and the areas you cover whenever you like. Changes go live as soon as you save.',
  },
]

export default function ListYourBusiness() {
  const [params] = useSearchParams()
  const planParam = (params.get('plan') as TierId) || 'free'
  const billing = params.get('billing') === 'annual' ? 'annual' : 'monthly'
  const plan = tierOf(planParam)

  const { user, signUp, loading } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useSeo({
    title: 'Add your business',
    description:
      'List your South African event business on The Function Hub SA. Free Basic listings, paid Featured and Premium placement, no commission on bookings.',
    path: '/list-your-business',
  })

  if (!loading && user) {
    return <Navigate to={`/dashboard/listing?plan=${planParam}&billing=${billing}`} replace />
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signUp(name, email, password)
      navigate(`/dashboard/listing?plan=${planParam}&billing=${billing}`)
    } catch (err) {
      setError(err instanceof Error ? friendly(err.message) : 'Could not create that account.')
      setBusy(false)
    }
  }

  return (
    <>
      <section className="hero" style={{ paddingBlock: '3.25rem' }}>
        <div className="wrap">
          <div className="hero-grid">
            <h1>
              Put your business where <em>people are looking</em>
            </h1>
            <p>
              Create your listing in about ten minutes. Start on the free plan — upgrade when the
              enquiries make it worth it.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="vendor-layout">
            <div className="stack">
              {SELLING_POINTS.map((point) => (
                <div key={point.title} className="panel">
                  <h3 style={{ fontSize: '1.15rem' }}>{point.title}</h3>
                  <p className="muted" style={{ marginTop: '0.5rem' }}>
                    {point.body}
                  </p>
                </div>
              ))}

              <div className="panel">
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>What you will need</h3>
                <ul className="tick-list">
                  <li>Your business name and the town you work from</li>
                  <li>A short description of what you offer</li>
                  <li>At least one photo of your own work</li>
                  <li>A starting price — listings with prices get far more enquiries</li>
                  <li>Contact details for enquiries</li>
                </ul>
              </div>
            </div>

            <aside>
              <div className="sidebar">
                <h2 style={{ fontSize: '1.3rem' }}>Create your account</h2>

                <div
                  className="notice notice-info"
                  style={{ marginTop: '1rem', marginBottom: '1.25rem' }}
                >
                  Selected plan: <strong>{plan.name}</strong>
                  {plan.monthly > 0 && (
                    <>
                      {' '}
                      — {rands(billing === 'annual' ? plan.annual : plan.monthly)} /{' '}
                      {billing === 'annual' ? 'year' : 'month'}
                    </>
                  )}
                  . <Link to="/pricing">Change</Link>
                  {plan.monthly > 0 && (
                    <div className="tiny" style={{ marginTop: '0.4rem' }}>
                      You will not be charged until your listing is ready to publish.
                    </div>
                  )}
                </div>

                {isDemoMode && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <Notice kind="warn">
                      Demo mode — the account lives in this browser only.
                    </Notice>
                  </div>
                )}

                <form onSubmit={onSubmit}>
                  <div className="field">
                    <label htmlFor="su-name">Your name</label>
                    <input
                      id="su-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="su-email">Email</label>
                    <input
                      id="su-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <span className="hint">Enquiries and your invoices go to this address.</span>
                  </div>
                  <div className="field">
                    <label htmlFor="su-password">Password</label>
                    <input
                      id="su-password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span className="hint">At least 6 characters.</span>
                  </div>

                  {error && (
                    <div style={{ marginBottom: '1rem' }}>
                      <Notice kind="error">{error}</Notice>
                    </div>
                  )}

                  <button className="btn btn-gold btn-block" disabled={busy}>
                    {busy ? 'Creating…' : 'Create account'}
                  </button>

                  <p className="tiny muted" style={{ marginTop: '0.85rem' }}>
                    By continuing you agree to our <Link to="/terms">terms</Link>. Already
                    registered? <Link to="/signin">Sign in</Link>.
                  </p>
                </form>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section-tight" style={{ paddingBottom: '4rem' }}>
        <div className="wrap">
          <div className="head">
            <h2>Start free, upgrade when it pays</h2>
          </div>
          <div className="grid grid-3">
            {TIERS.map((t) => (
              <div key={t.id} className="panel">
                <h3>{t.name}</h3>
                <p className="muted tiny">{t.tagline}</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', marginTop: '0.6rem' }}>
                  {t.monthly === 0 ? 'Free' : `${rands(t.monthly)}/mo`}
                </p>
                <Link
                  className="btn btn-ghost btn-sm"
                  to={`/list-your-business?plan=${t.id}`}
                  style={{ marginTop: '0.85rem' }}
                >
                  Choose {t.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function friendly(message: string): string {
  if (message.includes('email-already-in-use')) {
    return 'That email already has an account. Sign in instead.'
  }
  if (message.includes('weak-password')) return 'Please use a password of at least 6 characters.'
  if (message.includes('invalid-email')) return 'That email address does not look right.'
  return 'Could not create that account. Please try again.'
}
