import { useEffect, useState } from 'react'
import { useDashboard } from './DashboardLayout'
import { listEnquiriesForVendor, markEnquiryRead } from '../../lib/enquiries'
import { EmptyState } from '../../components/ui'
import { shortDate, telLink, whatsappLink } from '../../lib/format'
import type { Enquiry } from '../../lib/types'

export default function Enquiries() {
  const { listing, loading } = useDashboard()
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null)

  useEffect(() => {
    if (!listing) {
      setEnquiries([])
      return
    }
    listEnquiriesForVendor(listing.id)
      .then(setEnquiries)
      .catch(() => setEnquiries([]))
  }, [listing])

  if (loading || enquiries === null) return <div className="skeleton" style={{ height: 280 }} />

  if (!listing) {
    return (
      <EmptyState title="No listing yet" action={{ to: '/dashboard/listing', label: 'Create my listing' }}>
        Enquiries arrive once your listing is live.
      </EmptyState>
    )
  }

  if (enquiries.length === 0) {
    return (
      <EmptyState title="No enquiries yet">
        {listing.status === 'published'
          ? 'Your listing is live. Adding a starting price and more photos is the fastest way to get the first enquiry.'
          : 'Your listing is not live yet, so nobody can enquire. Submit it for review to start receiving enquiries.'}
      </EmptyState>
    )
  }

  async function toggle(enquiry: Enquiry) {
    await markEnquiryRead(enquiry.id, !enquiry.read)
    setEnquiries((prev) =>
      (prev ?? []).map((e) => (e.id === enquiry.id ? { ...e, read: !e.read } : e)),
    )
  }

  return (
    <div className="stack">
      <div className="panel">
        <h2 style={{ fontSize: '1.4rem' }}>Enquiries</h2>
        <p className="muted tiny">
          {enquiries.filter((e) => !e.read).length} unread of {enquiries.length}. Reply directly —
          we do not sit in the middle.
        </p>
      </div>

      {enquiries.map((e) => (
        <article key={e.id} className={`enquiry${e.read ? '' : ' is-unread'}`}>
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>{e.name}</h3>
              <p className="tiny muted">
                {shortDate(e.createdAt)}
                {e.eventType && ` · ${e.eventType}`}
                {e.eventDate && ` · ${e.eventDate}`}
                {e.guests ? ` · ${e.guests} guests` : ''}
              </p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => void toggle(e)}>
              {e.read ? 'Mark unread' : 'Mark read'}
            </button>
          </div>

          <p style={{ marginTop: '0.85rem', whiteSpace: 'pre-line' }}>{e.message}</p>

          <div className="row" style={{ marginTop: '1rem' }}>
            <a className="btn btn-primary btn-sm" href={`mailto:${e.email}?subject=Re: your enquiry`}>
              Email {e.email}
            </a>
            {e.phone && (
              <>
                <a className="btn btn-ghost btn-sm" href={telLink(e.phone)}>
                  Call {e.phone}
                </a>
                <a
                  className="btn btn-ghost btn-sm"
                  href={whatsappLink(e.phone, `Hi ${e.name}, thanks for your enquiry via The Function Hub SA.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
