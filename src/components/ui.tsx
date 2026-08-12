import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ListingStatus } from '../lib/types'

/**
 * Status, tier and rating are all set in type rather than in coloured pills —
 * a results page should be photographs and words, not a field of badges.
 */

export function StatusText({ status }: { status: ListingStatus }) {
  const labels: Record<ListingStatus, string> = {
    draft: 'Draft',
    pending: 'Awaiting review',
    published: 'Live',
    rejected: 'Changes needed',
    suspended: 'Suspended',
  }
  return <span className={`status status-${status}`}>{labels[status]}</span>
}

export function Rating({ rating, count }: { rating: number; count: number }) {
  if (!count) return <span className="tiny muted">No reviews yet</span>
  return (
    <span className="rating">
      <b>{rating.toFixed(1)}</b>
      <span>
        / 5 · {count} review{count === 1 ? '' : 's'}
      </span>
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
      <h3 style={{ fontSize: '1.4rem' }}>{title}</h3>
      {children && (
        <p className="muted" style={{ marginTop: '0.65rem', maxWidth: '52ch' }}>
          {children}
        </p>
      )}
      {action && (
        <Link className="btn btn-primary" to={action.to} style={{ marginTop: '1.5rem' }}>
          {action.label}
        </Link>
      )}
    </div>
  )
}

export function CardSkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-results">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <div className="skeleton" style={{ aspectRatio: '4 / 5' }} />
          <div className="skeleton" style={{ height: 14, marginTop: '1rem', width: '65%' }} />
          <div className="skeleton" style={{ height: 12, marginTop: '0.6rem', width: '90%' }} />
        </div>
      ))}
    </div>
  )
}
