import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ListingStatus, TierId } from '../lib/types'
import { tierOf } from '../lib/tiers'

export function TierBadge({ tier }: { tier: TierId }) {
  const badge = tierOf(tier).limits.badge
  if (!badge) return null
  return <span className={`badge badge-${tier}`}>{badge}</span>
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  if (!verified) return null
  return (
    <span className="badge badge-verified" title="Identity and business details checked by our team">
      ✓ Verified
    </span>
  )
}

export function StatusBadge({ status }: { status: ListingStatus }) {
  const labels: Record<ListingStatus, string> = {
    draft: 'Draft',
    pending: 'Awaiting review',
    published: 'Live',
    rejected: 'Changes needed',
    suspended: 'Suspended',
  }
  return <span className={`badge badge-status-${status}`}>{labels[status]}</span>
}

export function Stars({ rating, count }: { rating: number; count: number }) {
  if (!count) return <span className="tiny muted">No reviews yet</span>
  const full = Math.round(rating)
  return (
    <span className="rating">
      <span className="stars" aria-hidden="true">
        {'★'.repeat(full)}
        {'☆'.repeat(Math.max(0, 5 - full))}
      </span>
      <span>{rating.toFixed(1)}</span>
      <span className="muted tiny">({count})</span>
    </span>
  )
}

export function Notice({
  kind = 'info',
  children,
}: {
  kind?: 'info' | 'success' | 'error' | 'warn'
  children: ReactNode
}) {
  return (
    <div className={`notice notice-${kind}`} role={kind === 'error' ? 'alert' : undefined}>
      {children}
    </div>
  )
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: string
  children?: ReactNode
  action?: { to: string; label: string }
}) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      {children && <p className="muted" style={{ marginTop: '0.5rem' }}>{children}</p>}
      {action && (
        <Link className="btn btn-primary" to={action.to} style={{ marginTop: '1.25rem' }}>
          {action.label}
        </Link>
      )}
    </div>
  )
}

export function CardSkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="skeleton" style={{ height: 340 }} />
      ))}
    </div>
  )
}
