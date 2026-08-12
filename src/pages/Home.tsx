import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import VendorCard from '../components/VendorCard'
import { CardSkeletons } from '../components/ui'
import { CATEGORIES } from '../data/taxonomy'
import { listVendors } from '../lib/vendors'
import { useSeo } from '../lib/seo'
import { SITE } from '../lib/firebase'
import type { Vendor } from '../lib/types'

const STEPS = [
  {
    title: 'Search by what you need',
    body: 'Filter by category, province, guest count and budget. Every listing shows a starting price so you are not guessing.',
  },
  {
    title: 'Shortlist and compare',
    body: 'Open the suppliers that fit. Read what they actually offer, look at their work, check their capacity.',
  },
  {
    title: 'Enquire directly',
    body: 'Send one enquiry per supplier. It goes straight to them — we take no commission on your booking.',
  },
]

const REVIEWS = [
  {
    quote:
      'We found our venue, caterer and DJ in one evening. Three enquiries, three quotes back by Monday.',
    who: 'Thandi M., wedding in Hartbeespoort',
  },
  {
    quote:
      'I listed my catering business on the Featured plan and had eleven enquiries in the first month. It paid for itself twice over.',
    who: 'Sipho N., Ubuntu Feast Catering',
  },
  {
    quote:
      'Being able to filter by province and budget saved me hours of scrolling through Facebook groups.',
    who: 'Lerato K., 40th birthday in Bloemfontein',
  },
]

export default function Home() {
  const [vendors, setVendors] = useState<Vendor[] | null>(null)

  useSeo({
    title: 'The Function Hub SA — Find trusted event suppliers in South Africa',
    description:
      'Venues, caterers, décor, photographers, DJs and more across all nine provinces. Compare South African function suppliers and send a free enquiry.',
    path: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'The Function Hub SA',
      url: SITE.url,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE.url}/browse?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  })

  useEffect(() => {
    let alive = true
    listVendors()
      .then((list) => alive && setVendors(list))
      .catch(() => alive && setVendors([]))
    return () => {
      alive = false
    }
  }, [])

  /** The home-page slot is a Premium perk — this is where that tier earns out. */
  const spotlight = useMemo(
    () => (vendors ?? []).filter((v) => v.tier === 'premium').slice(0, 3),
    [vendors],
  )
  const recent = useMemo(
    () =>
      [...(vendors ?? [])]
        .filter((v) => !spotlight.includes(v))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 6),
    [vendors, spotlight],
  )

  const stats = useMemo(() => {
    const list = vendors ?? []
    const provinces = new Set(list.flatMap((v) => v.provinces))
    return {
      suppliers: list.length,
      categories: new Set(list.flatMap((v) => v.categories)).size,
      provinces: provinces.size,
    }
  }, [vendors])

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-inner">
            <span className="eyebrow">Function &amp; event suppliers · South Africa</span>
            <h1>
              Plan the function <em>without</em> the guesswork.
            </h1>
            <p>
              Venues, caterers, décor, photographers, DJs and everything in between — in one place,
              with real prices and direct contact. Searching and enquiring is free, always.
            </p>
          </div>

          <SearchBar />

          <div className="hero-stats">
            <div>
              <strong>{stats.suppliers || '—'}</strong>
              <span>Suppliers listed</span>
            </div>
            <div>
              <strong>{stats.categories || '—'}</strong>
              <span>Categories</span>
            </div>
            <div>
              <strong>{stats.provinces || 9}</strong>
              <span>Provinces covered</span>
            </div>
            <div>
              <strong>R0</strong>
              <span>Commission on bookings</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Browse by category</span>
            <h2>What do you still need?</h2>
            <p className="lead">
              Start with the big three — venue, food, photos — then fill in the rest.
            </p>
          </div>

          <div className="grid grid-4">
            {CATEGORIES.slice(0, 8).map((c) => (
              <Link key={c.slug} className="cat-tile" to={`/browse?category=${c.slug}`}>
                <span className="icon" aria-hidden="true">
                  {c.icon}
                </span>
                <strong>{c.name}</strong>
                <span>{c.blurb}</span>
              </Link>
            ))}
          </div>

          <div className="center" style={{ marginTop: '2rem' }}>
            <Link className="btn btn-ghost" to="/categories">
              See all {CATEGORIES.length} categories
            </Link>
          </div>
        </div>
      </section>

      {(vendors === null || spotlight.length > 0) && (
        <section className="section-tight">
          <div className="wrap">
            <div className="browse-head">
              <div>
                <span className="eyebrow">Spotlight</span>
                <h2>Premium suppliers this month</h2>
              </div>
              <Link className="btn btn-ghost btn-sm" to="/browse">
                View all suppliers
              </Link>
            </div>

            {vendors === null ? (
              <CardSkeletons count={3} />
            ) : (
              <div className="grid grid-3">
                {spotlight.map((v) => (
                  <VendorCard key={v.id} vendor={v} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap">
          <div className="section-head center">
            <span className="eyebrow">How it works</span>
            <h2>Three steps, no middleman</h2>
          </div>

          <div className="grid grid-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="card card-pad step">
                <span className="n" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{step.title}</h3>
                  <p className="muted" style={{ fontSize: '0.93rem' }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="section-tight">
          <div className="wrap">
            <div className="browse-head">
              <div>
                <span className="eyebrow">Recently added</span>
                <h2>New on the hub</h2>
              </div>
            </div>
            <div className="grid grid-3">
              {recent.map((v) => (
                <VendorCard key={v.id} vendor={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="wrap">
          <div className="band">
            <div style={{ maxWidth: '58ch' }}>
              <span className="eyebrow" style={{ color: 'var(--gold-400)' }}>
                For suppliers
              </span>
              <h2>Get in front of people already looking for you</h2>
              <p style={{ marginTop: '1rem' }}>
                A basic listing is free and stays free. When you are ready for more enquiries,
                Featured puts you above the free listings and shows your phone number, and Premium
                puts you at the top of every search you appear in.
              </p>
              <div className="row" style={{ marginTop: '1.75rem' }}>
                <Link className="btn btn-gold" to="/list-your-business">
                  Add your business — free
                </Link>
                <Link className="btn btn-light" to="/pricing">
                  See listing packages
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight" style={{ paddingBottom: '4rem' }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">What people say</span>
            <h2>Both sides of the enquiry</h2>
          </div>
          <div className="grid grid-3">
            {REVIEWS.map((r) => (
              <blockquote key={r.who} className="quote">
                <p>“{r.quote}”</p>
                <footer>{r.who}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
