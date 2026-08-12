import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDashboard } from './DashboardLayout'
import { TIERS, annualSaving, tierOf } from '../../lib/tiers'
import { startCheckout, type Billing as BillingPeriod } from '../../lib/billing'
import { rands, shortDate } from '../../lib/format'
import { EmptyState, Notice } from '../../components/ui'
import { SITE, isDemoMode } from '../../lib/firebase'
import type { TierId } from '../../lib/types'

export default function Billing() {
  const { listing, loading, reload } = useDashboard()
  const [params] = useSearchParams()
  const [period, setPeriod] = useState<BillingPeriod>('monthly')
  const [busy, setBusy] = useState<TierId | null>(null)
  const [message, setMessage] = useState<{ kind: 'success' | 'error' | 'info'; text: string } | null>(
    params.get('status') === 'success'
      ? { kind: 'success', text: 'Payment received. Your new plan is active.' }
      : params.get('status') === 'cancelled'
        ? { kind: 'info', text: 'Payment cancelled — nothing was charged.' }
        : null,
  )

  if (loading) return <div className="skeleton" style={{ height: 320 }} />

  if (!listing) {
    return (
      <EmptyState title="Create your listing first" action={{ to: '/dashboard/listing', label: 'Create my listing' }}>
        Plans apply to a listing, so there is nothing to upgrade yet.
      </EmptyState>
    )
  }

  const current = tierOf(listing.tier)

  async function choose(tier: TierId) {
    if (!listing) return
    setBusy(tier)
    setMessage(null)
    try {
      const result = await startCheckout(listing, tier, period)
      if (result.outcome === 'simulated') {
        await reload()
        setMessage({ kind: 'success', text: `You are now on the ${tierOf(tier).name} plan. ${result.note ?? ''}` })
      }
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Could not start checkout.' })
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="stack">
      <div className="panel">
        <h2 style={{ fontSize: '1.4rem' }}>Plan &amp; billing</h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          You are on the <strong>{current.name}</strong> plan
          {listing.subscriptionEndsAt
            ? ` until ${shortDate(listing.subscriptionEndsAt)}`
            : current.monthly === 0
              ? ' — free, forever'
              : ''}
          .
        </p>
      </div>

      {message && <Notice kind={message.kind}>{message.text}</Notice>}

      {(!SITE.payfastEnabled || isDemoMode) && (
        <Notice kind="warn">
          <strong>Payments are not switched on.</strong> Changing plan here applies it immediately
          without charging. Add your PayFast keys in Netlify to take real payments — the steps are in
          the project README.
        </Notice>
      )}

      <div className="center">
        <div className="toggle" role="group" aria-label="Billing period">
          <button className={period === 'monthly' ? 'is-on' : ''} onClick={() => setPeriod('monthly')}>
            Monthly
          </button>
          <button className={period === 'annual' ? 'is-on' : ''} onClick={() => setPeriod('annual')}>
            Annual — 2 months free
          </button>
        </div>
      </div>

      <div className="pricing-grid">
        {TIERS.map((tier) => {
          const isCurrent = tier.id === listing.tier
          const price = period === 'annual' ? tier.annual : tier.monthly
          return (
            <div key={tier.id} className={`plan${isCurrent ? ' is-popular' : ''}`}>
              <h3>{tier.name}</h3>
              <p className="muted tiny">{tier.tagline}</p>
              <div className="price">
                {price === 0 ? 'Free' : rands(price)}
                {price > 0 && <span> / {period === 'annual' ? 'year' : 'month'}</span>}
              </div>
              {price > 0 && period === 'annual' && (
                <p className="tiny muted">Save {rands(annualSaving(tier))} versus monthly</p>
              )}

              <ul className="tick-list">
                {tier.features.slice(0, 5).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>

              <button
                className={`btn btn-block ${tier.id === 'premium' ? 'btn-gold' : 'btn-primary'}`}
                disabled={isCurrent || busy !== null}
                onClick={() => void choose(tier.id)}
              >
                {isCurrent
                  ? 'Current plan'
                  : busy === tier.id
                    ? 'Working…'
                    : tier.id === 'free'
                      ? 'Downgrade to Basic'
                      : `Switch to ${tier.name}`}
              </button>
            </div>
          )
        })}
      </div>

      <div className="panel">
        <h3>Billing questions</h3>
        <ul className="tick-list" style={{ marginTop: '0.85rem' }}>
          <li>Monthly plans renew automatically until you cancel; cancel any time from this page.</li>
          <li>Downgrades take effect at the end of the period you have paid for.</li>
          <li>Invoices are emailed to the address on your account.</li>
          <li>
            Anything else? <Link to="/contact">Get in touch</Link> and we will sort it out.
          </li>
        </ul>
      </div>
    </div>
  )
}
