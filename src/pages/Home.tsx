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
    body: 'Filter by category, province, guest count and budget. Every listing shows a starting price, so you are not guessing.',
  },
  {
    title: 'Shortlist and compare',
    body: 'Open the suppliers that fit. Read what they actually offer, look at their work, check their capacity.',
  },
  {
    title: 'Enquire directly',
    body: 'One enquiry per supplier, straight to them. We take no commission on your booking.',
  },
]

const QUOTES = [
  {
    quote: 'We found our venue, caterer and DJ in one evening. Three enquiries, three quotes back by Monday.',
    who: 'Thandi M. — wedding in Hartbeespoort',
  },
  {
    quote:
      'I listed my catering business on the Featured plan and had eleven enquiries in the first month. It paid for itself twice over.',
    who: 'Sipho N. — Ubuntu Feast Catering',
  },
  {
    quote: 'Filtering by province and budget saved me hours of scrolling through Facebook groups.',
    who: 'Lerato K. — 40th birthday in Bloemfontein',
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
    () => (vendors ?? []).filter((v) => v.tier === 'premium').slice(0, 4),
    [vendors],
  )
  const recent = useMemo(
    () =>
      [...(vendors ?? [])]
        .filter((v) => !spotlight.includes(v))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 4),
    [vendors, spotlight],
  )

  const stats = useMemo(() => {
    const list = vendors ?? []
    return {
      suppliers: list.length,
      categories: new Set(list.flatMap((v) => v.categories)).size,
      provinces: new Set(list.flatMap((v) => v.provinces)).size,
    }
  }, [vendors])

  return (
    <>
      <section className="hero">
        <div className="wrap">
          <div className="hero-grid">
            <h1>
              Plan the function <em>without</em> the guesswork.
            </h1>
            <p className="hero-note">
              Venues, caterers, décor, photographers and DJs across all nine provinces — with real
              starting prices and direct contact. Searching and enquiring is free, always.
            </p>
          </div>

          <SearchBar />

          <div className="figures">
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
          <div className="head">
            <h2>What do you still need?</h2>
            <p className="head-note">
              Start with the big three — venue, food, photographs — then fill in the rest.
            </p>
          </div>

          <div className="index-list">
            {CATEGORIES.slice(0, 10).map((c, i) => (
              <Link key={c.slug} className="index-row" to={`/browse?category=${c.slug}`}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span className="nm">{c.name}</span>
                <span className="blurb">{c.blurb}</span>
              </Link>
            ))}
          </div>

          <p style={{ marginTop: '1.75rem' }}>
            <Link className="link" to="/categories">
              All {CATEGORIES.length} categories
            </Link>
          </p>
        </div>
      </section>

      {(vendors === null || spotlight.length > 0) && (
        <section className="section-tight">
          <div className="wrap">
            <div className="head">
              <h2>In the spotlight</h2>
              <p className="head-note">
                Premium listings, shown here and at the top of every search they appear in.{' '}
                <Link className="link" to="/browse">
                  All suppliers
                </Link>
              </p>
            </div>

            {vendors === null ? (
              <CardSkeletons count={4} />
            ) : (
              <div className="grid grid-results">
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
          <div className="head">
            <h2>Three steps, no middleman</h2>
          </div>

          <div className="steps">
            {STEPS.map((step, i) => (
              <div key={step.title} className="step">
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="section-tight">
          <div className="wrap">
            <div className="head">
              <h2>New on the hub</h2>
            </div>
            <div className="grid grid-results">
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
            <div style={{ maxWidth: '56ch' }}>
              <h2>
                Get in front of people <em>already looking</em> for you
              </h2>
              <p style={{ marginTop: '1.25rem' }}>
                A basic listing is free and stays free. When you are ready for more enquiries,
                Featured puts you above the free listings and shows your phone number; Premium puts
                you at the top of every search you appear in.
              </p>
              <div className="row" style={{ marginTop: '2rem' }}>
                <Link className="btn btn-gold" to="/list-your-business">
                  Add your business
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
          <div className="head">
            <h2>Both sides of the enquiry</h2>
          </div>
          <div className="grid grid-3">
            {QUOTES.map((q) => (
              <blockquote key={q.who} className="pull">
                <p>“{q.quote}”</p>
                <footer>{q.who}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
