import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EnquiryForm from '../components/EnquiryForm'
import VendorCard from '../components/VendorCard'
import { EmptyState, Stars, TierBadge, VerifiedBadge } from '../components/ui'
import { categoryName } from '../data/taxonomy'
import { externalUrl, rands, shortDate, telLink, whatsappLink } from '../lib/format'
import { placeholderImage } from '../lib/placeholder'
import { useSeo } from '../lib/seo'
import { tierOf } from '../lib/tiers'
import { getVendorBySlug, listVendors, recordView } from '../lib/vendors'
import { SITE } from '../lib/firebase'
import type { Vendor } from '../lib/types'

export default function VendorDetail() {
  const { slug = '' } = useParams()
  const [vendor, setVendor] = useState<Vendor | null | 'missing'>(null)
  const [related, setRelated] = useState<Vendor[]>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    let alive = true
    setVendor(null)
    setActive(0)
    getVendorBySlug(slug)
      .then((found) => {
        if (!alive) return
        if (!found || found.status !== 'published') {
          setVendor('missing')
          return
        }
        setVendor(found)
        void recordView(found)
        return listVendors({ category: found.categories[0] }).then((list) => {
          if (alive) setRelated(list.filter((v) => v.id !== found.id).slice(0, 3))
        })
      })
      .catch(() => alive && setVendor('missing'))
    return () => {
      alive = false
    }
  }, [slug])

  const v = vendor && vendor !== 'missing' ? vendor : null
  const tier = tierOf(v?.tier)

  useSeo({
    title: v ? `${v.name} — ${categoryName(v.categories[0] ?? '')} in ${v.town}` : 'Supplier',
    description: v ? `${v.tagline} ${v.town}. Starting from ${rands(v.priceFrom)}.` : undefined,
    jsonLd: useMemo(
      () =>
        v
          ? {
              '@context': 'https://schema.org',
              '@type': 'LocalBusiness',
              name: v.name,
              description: v.description,
              address: { '@type': 'PostalAddress', addressLocality: v.town, addressCountry: 'ZA' },
              url: `${SITE.url}/supplier/${v.slug}`,
              ...(tier.limits.showContactDetails && v.phone ? { telephone: v.phone } : {}),
              ...(v.reviewCount
                ? {
                    aggregateRating: {
                      '@type': 'AggregateRating',
                      ratingValue: v.rating,
                      reviewCount: v.reviewCount,
                    },
                  }
                : {}),
            }
          : undefined,
      [v, tier],
    ),
  })

  if (vendor === 'missing') {
    return (
      <section className="section">
        <div className="wrap">
          <EmptyState title="We could not find that supplier" action={{ to: '/browse', label: 'Browse all suppliers' }}>
            The listing may have been removed or is awaiting review.
          </EmptyState>
        </div>
      </section>
    )
  }

  if (!v) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="skeleton" style={{ height: 400 }} />
        </div>
      </section>
    )
  }

  const images = (v.images.length ? v.images : [placeholderImage(v.slug || v.name)]).slice(
    0,
    tier.limits.images,
  )
  const description = v.description.slice(0, tier.limits.descriptionChars)

  return (
    <>
      <section className="vendor-hero">
        <div className="wrap">
          <p className="tiny" style={{ color: 'rgb(255 255 255 / 60%)', marginBottom: '0.6rem' }}>
            <Link to="/browse">Suppliers</Link>
            {' / '}
            <Link to={`/browse?category=${v.categories[0]}`}>{categoryName(v.categories[0] ?? '')}</Link>
          </p>

          <div className="row" style={{ marginBottom: '0.75rem' }}>
            <TierBadge tier={v.tier} />
            <VerifiedBadge verified={v.verified} />
          </div>

          <h1>{v.name}</h1>
          <p className="tagline">{v.tagline}</p>

          <div className="row" style={{ marginTop: '1.25rem' }}>
            <span className="badge badge-soft">📍 {v.town}</span>
            {v.provinces.map((p) => (
              <span key={p} className="badge badge-soft">
                {p}
              </span>
            ))}
            <Stars rating={v.rating} count={v.reviewCount} />
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className="vendor-layout">
            <div>
              <div className="gallery">
                <img className="main" src={images[active] ?? images[0]} alt={`${v.name} — photo ${active + 1}`} />
                {images.length > 1 &&
                  images.map((src, i) => (
                    <button
                      key={src.slice(0, 40) + i}
                      className={i === active ? 'is-on' : ''}
                      onClick={() => setActive(i)}
                      aria-label={`Show photo ${i + 1}`}
                    >
                      <img src={src} alt="" loading="lazy" />
                    </button>
                  ))}
              </div>

              {tier.limits.video && v.videoUrl && (
                <div style={{ marginTop: '1.5rem', aspectRatio: '16 / 9' }}>
                  <iframe
                    src={v.videoUrl}
                    title={`${v.name} video`}
                    style={{ width: '100%', height: '100%', border: 0, borderRadius: 'var(--radius)' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="card card-pad" style={{ marginTop: '1.75rem' }}>
                <h2 style={{ fontSize: '1.5rem' }}>About {v.name}</h2>
                <p className="muted" style={{ marginTop: '0.85rem', whiteSpace: 'pre-line' }}>
                  {description}
                </p>

                {v.services.length > 0 && (
                  <>
                    <h3 style={{ marginTop: '1.75rem', marginBottom: '0.85rem' }}>What's included</h3>
                    <ul className="tick-list">
                      {v.services.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </>
                )}

                <h3 style={{ marginTop: '1.75rem' }}>Details</h3>
                <div className="spec-list">
                  <div>
                    <span className="k">Starting price</span>
                    <span>
                      <strong>{rands(v.priceFrom)}</strong>
                      {v.priceNote && <span className="muted tiny"> — {v.priceNote}</span>}
                    </span>
                  </div>
                  {(v.capacityMin || v.capacityMax) && (
                    <div>
                      <span className="k">Capacity</span>
                      <span>
                        {v.capacityMin ?? '—'} – {v.capacityMax ?? '—'} guests
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="k">Categories</span>
                    <span>{v.categories.map((c) => categoryName(c)).join(', ')}</span>
                  </div>
                  <div>
                    <span className="k">Serves</span>
                    <span>{v.provinces.join(', ')}</span>
                  </div>
                  <div>
                    <span className="k">On the hub since</span>
                    <span>{shortDate(v.createdAt) || 'Recently'}</span>
                  </div>
                </div>
              </div>
            </div>

            <aside>
              <div className="card card-pad sidebar-card">
                <h2 style={{ fontSize: '1.25rem' }}>Enquire with {v.name}</h2>
                <p className="tiny muted" style={{ marginTop: '0.35rem', marginBottom: '1.25rem' }}>
                  Free, and it goes straight to the supplier.
                </p>

                <EnquiryForm vendor={v} />

                {tier.limits.showContactDetails ? (
                  <div className="contact-list">
                    {v.phone && (
                      <a href={telLink(v.phone)}>
                        <span aria-hidden="true">📞</span> {v.phone}
                      </a>
                    )}
                    {v.whatsapp && (
                      <a
                        href={whatsappLink(v.whatsapp, `Hi ${v.name}, I found you on The Function Hub SA.`)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span aria-hidden="true">💬</span> WhatsApp
                      </a>
                    )}
                    {v.email && (
                      <a href={`mailto:${v.email}`}>
                        <span aria-hidden="true">✉️</span> {v.email}
                      </a>
                    )}
                    {tier.limits.showWebsite && v.website && (
                      <a href={externalUrl(v.website)} target="_blank" rel="noopener noreferrer nofollow">
                        <span aria-hidden="true">🔗</span> Visit website
                      </a>
                    )}
                    {tier.limits.showSocials && v.instagram && (
                      <a
                        href={`https://instagram.com/${v.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        <span aria-hidden="true">📸</span> @{v.instagram.replace('@', '')}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="locked" style={{ marginTop: '1.25rem' }}>
                    <strong>Direct contact details are hidden</strong> on Basic listings. Use the form
                    above — {v.name} gets your enquiry by email either way.
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-tight" style={{ paddingBottom: '3rem' }}>
          <div className="wrap">
            <div className="browse-head">
              <h2 style={{ fontSize: '1.6rem' }}>
                More {categoryName(v.categories[0] ?? '').toLowerCase()} to compare
              </h2>
              <Link className="btn btn-ghost btn-sm" to={`/browse?category=${v.categories[0]}`}>
                See all
              </Link>
            </div>
            <div className="grid grid-3">
              {related.map((r) => (
                <VendorCard key={r.id} vendor={r} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
