import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EnquiryForm from '../components/EnquiryForm'
import VendorCard from '../components/VendorCard'
import { EmptyState, Rating } from '../components/ui'
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
          if (alive) setRelated(list.filter((v) => v.id !== found.id).slice(0, 4))
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
          <EmptyState
            title="We could not find that supplier"
            action={{ to: '/browse', label: 'Browse all suppliers' }}
          >
            The listing may have been removed, or it is still awaiting review.
          </EmptyState>
        </div>
      </section>
    )
  }

  if (!v) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="skeleton" style={{ height: 420 }} />
        </div>
      </section>
    )
  }

  const images = (v.images.length ? v.images : [placeholderImage(v.slug || v.name, v.categories[0] ?? '')]).slice(
    0,
    tier.limits.images,
  )
  const description = v.description.slice(0, tier.limits.descriptionChars)
  const mark = tier.limits.badge

  return (
    <>
      <section className="section-tight">
        <div className="wrap">
          <p className="crumb">
            <Link to="/browse">Suppliers</Link>
            {' / '}
            <Link to={`/browse?category=${v.categories[0]}`}>
              {categoryName(v.categories[0] ?? '')}
            </Link>
          </p>

          <div className="vendor-title">
            <div>
              <h1 style={{ fontSize: 'clamp(2.2rem, 1.4rem + 2.6vw, 3.4rem)' }}>{v.name}</h1>
              <p className="tagline">{v.tagline}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              {mark && <p className="label-xs" style={{ color: 'var(--gold)' }}>{mark} listing</p>}
              {v.verified && <p className="verified-note">Verified supplier</p>}
            </div>
          </div>

          <div className="meta-line">
            <span>
              {v.town}
              {v.provinces.length ? ` · Serves ${v.provinces.join(', ')}` : ''}
            </span>
            <Rating rating={v.rating} count={v.reviewCount} />
            <span>
              From <strong>{rands(v.priceFrom)}</strong>
              {v.priceNote && ` — ${v.priceNote}`}
            </span>
          </div>
        </div>
      </section>

      <section style={{ paddingBottom: '4rem' }}>
        <div className="wrap">
          <div className="vendor-layout">
            <div>
              <div className="gallery">
                <img
                  className="main"
                  src={images[active] ?? images[0]}
                  alt={`${v.name} — photo ${active + 1}`}
                />
                {images.length > 1 &&
                  images.map((src, i) => (
                    <button
                      key={`${i}-${src.slice(-24)}`}
                      className={i === active ? 'is-on' : ''}
                      onClick={() => setActive(i)}
                      aria-label={`Show photo ${i + 1}`}
                    >
                      <img src={src} alt="" loading="lazy" />
                    </button>
                  ))}
              </div>

              {tier.limits.video && v.videoUrl && (
                <div style={{ marginTop: '2rem', aspectRatio: '16 / 9' }}>
                  <iframe
                    src={v.videoUrl}
                    title={`${v.name} video`}
                    style={{ width: '100%', height: '100%', border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="prose" style={{ marginTop: '2.5rem' }}>
                <div className="block">
                  <h2>About {v.name}</h2>
                  <p style={{ whiteSpace: 'pre-line' }}>{description}</p>
                </div>

                {v.services.length > 0 && (
                  <div className="block">
                    <h3>What's included</h3>
                    <ul className="tick-list two-col">
                      {v.services.map((s) => (
                        <li key={s}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="block">
                  <h3>Details</h3>
                  <div className="spec-list">
                    <div>
                      <span className="k">Starting price</span>
                      <span className="v">
                        <strong>{rands(v.priceFrom)}</strong>
                        {v.priceNote && <span className="muted"> — {v.priceNote}</span>}
                      </span>
                    </div>
                    {(v.capacityMin || v.capacityMax) && (
                      <div>
                        <span className="k">Capacity</span>
                        <span className="v">
                          {v.capacityMin ?? '—'} – {v.capacityMax ?? '—'} guests
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="k">Categories</span>
                      <span className="v">{v.categories.map((c) => categoryName(c)).join(', ')}</span>
                    </div>
                    <div>
                      <span className="k">Serves</span>
                      <span className="v">{v.provinces.join(', ')}</span>
                    </div>
                    <div>
                      <span className="k">On the hub since</span>
                      <span className="v">{shortDate(v.createdAt) || 'Recently'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <aside>
              <div className="sidebar">
                <h2 style={{ fontSize: '1.3rem' }}>Enquire</h2>
                <p className="tiny muted" style={{ marginTop: '0.4rem', marginBottom: '1.5rem' }}>
                  Free, and it goes straight to {v.name}.
                </p>

                <EnquiryForm vendor={v} />

                {tier.limits.showContactDetails ? (
                  <div className="contact-list">
                    {v.phone && (
                      <a href={telLink(v.phone)}>
                        <span className="k">Phone</span>
                        <span>{v.phone}</span>
                      </a>
                    )}
                    {v.whatsapp && (
                      <a
                        href={whatsappLink(
                          v.whatsapp,
                          `Hi ${v.name}, I found you on The Function Hub SA.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="k">WhatsApp</span>
                        <span>Message</span>
                      </a>
                    )}
                    {v.email && (
                      <a href={`mailto:${v.email}`}>
                        <span className="k">Email</span>
                        <span>{v.email}</span>
                      </a>
                    )}
                    {tier.limits.showWebsite && v.website && (
                      <a href={externalUrl(v.website)} target="_blank" rel="noopener noreferrer nofollow">
                        <span className="k">Website</span>
                        <span>Visit</span>
                      </a>
                    )}
                    {tier.limits.showSocials && v.instagram && (
                      <a
                        href={`https://instagram.com/${v.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        <span className="k">Instagram</span>
                        <span>@{v.instagram.replace('@', '')}</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <p className="locked">
                    Direct contact details are hidden on Basic listings. Use the form above —{' '}
                    {v.name} receives your enquiry by email either way.
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-tight" style={{ paddingBottom: '4rem' }}>
          <div className="wrap">
            <div className="head">
              <h2>More {categoryName(v.categories[0] ?? '').toLowerCase()} to compare</h2>
              <p className="head-note">
                <Link className="link" to={`/browse?category=${v.categories[0]}`}>
                  See all
                </Link>
              </p>
            </div>
            <div className="grid grid-results">
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
