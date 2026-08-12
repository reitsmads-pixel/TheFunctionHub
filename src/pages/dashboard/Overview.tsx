import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard } from './DashboardLayout'
import { EmptyState, Notice, StatusText } from '../../components/ui'
import { listEnquiriesForVendor } from '../../lib/enquiries'
import { tierOf } from '../../lib/tiers'
import { shortDate } from '../../lib/format'

export default function Overview() {
  const { listing, loading } = useDashboard()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!listing) return
    listEnquiriesForVendor(listing.id)
      .then((list) => setUnread(list.filter((e) => !e.read).length))
      .catch(() => setUnread(0))
  }, [listing])

  if (loading) return <div className="skeleton" style={{ height: 240 }} />

  if (!listing) {
    return (
      <EmptyState title="You have not created a listing yet" action={{ to: '/dashboard/listing', label: 'Create my listing' }}>
        It takes about ten minutes. You can save a draft and come back to it.
      </EmptyState>
    )
  }

  const tier = tierOf(listing.tier)

  return (
    <div className="stack">
      {listing.status === 'draft' && (
        <Notice kind="warn">
          Your listing is a <strong>draft</strong> and is not visible to the public yet. Open{' '}
          <Link to="/dashboard/listing">My listing</Link> and submit it for review when you are ready.
        </Notice>
      )}
      {listing.status === 'pending' && (
        <Notice kind="info">
          Your listing is with our team for review. We usually approve within one business day.
        </Notice>
      )}
      {listing.status === 'rejected' && (
        <Notice kind="error">
          We could not publish this listing as it stands. Check your email for what needs changing,
          then resubmit.
        </Notice>
      )}

      <div className="panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <p style={{ marginBottom: '0.5rem' }}>
              <StatusText status={listing.status} />
              <span className="status" style={{ color: 'var(--faint)' }}>
                {' · '}
                {tier.name} plan
              </span>
            </p>
            <h2 style={{ fontSize: '1.4rem' }}>{listing.name || 'Untitled listing'}</h2>
            <p className="muted tiny">Last updated {shortDate(listing.updatedAt) || 'just now'}</p>
          </div>
          <div className="row">
            <Link className="btn btn-ghost btn-sm" to="/dashboard/listing">
              Edit
            </Link>
            {listing.status === 'published' && (
              <Link className="btn btn-primary btn-sm" to={`/supplier/${listing.slug}`}>
                View public page
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="figures compact">
        <div>
          <strong>{listing.views}</strong>
          <span>Page views</span>
        </div>
        <div>
          <strong>{listing.enquiryCount}</strong>
          <span>Total enquiries</span>
        </div>
        <div>
          <strong>{unread}</strong>
          <span>Unread</span>
        </div>
        <div>
          <strong>{tier.name}</strong>
          <span>Current plan</span>
        </div>
      </div>

      {listing.tier === 'free' && (
        <div className="panel">
          <h3>Getting fewer enquiries than you would like?</h3>
          <p className="muted" style={{ marginTop: '0.5rem' }}>
            Basic listings sit below every paid listing in search results, and your phone number and
            website stay hidden. Featured moves you above them and shows your contact details.
          </p>
          <Link className="btn btn-gold btn-sm" to="/dashboard/billing" style={{ marginTop: '1rem' }}>
            See upgrade options
          </Link>
        </div>
      )}

      <div className="panel">
        <h3>Get more out of your listing</h3>
        <ul className="tick-list" style={{ marginTop: '0.85rem' }}>
          <li>Publish a starting price — listings without one get roughly half the enquiries.</li>
          <li>Use your own photos. Stock images are the most common reason we reject a listing.</li>
          <li>Reply to enquiries within a day; most people book the first supplier who comes back.</li>
          <li>List every province you genuinely travel to, not the ones you wish you did.</li>
        </ul>
      </div>
    </div>
  )
}
