import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, PROVINCES } from '../data/taxonomy'
import { listVendors } from '../lib/vendors'
import { useSeo } from '../lib/seo'

export default function Categories() {
  const [counts, setCounts] = useState<Record<string, number>>({})

  useSeo({
    title: 'All supplier categories',
    description:
      'Every kind of function supplier on The Function Hub SA — venues, catering, décor, photography, DJs, cakes, flowers, planners, transport and more.',
    path: '/categories',
  })

  useEffect(() => {
    listVendors()
      .then((list) => {
        const tally: Record<string, number> = {}
        list.forEach((v) => v.categories.forEach((c) => (tally[c] = (tally[c] ?? 0) + 1)))
        setCounts(tally)
      })
      .catch(() => setCounts({}))
  }, [])

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <h1 style={{ fontSize: 'clamp(2.1rem, 1.4rem + 2.4vw, 3.2rem)' }}>Categories</h1>
          <p className="lead" style={{ marginTop: '1rem', maxWidth: '52ch' }}>
            From the venue down to the welcome signage. Pick a category to see who works in your
            province.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="index-list">
            {CATEGORIES.map((c, i) => (
              <Link key={c.slug} className="index-row" to={`/browse?category=${c.slug}`}>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span className="nm">{c.name}</span>
                <span className="blurb">
                  {counts[c.slug] ? `${counts[c.slug]} listed` : 'Be the first to list'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight" style={{ paddingBottom: '4rem' }}>
        <div className="wrap">
          <div className="head">
            <h2>By province</h2>
          </div>
          <div className="index-list">
            {PROVINCES.map((p, i) => (
              <Link
                key={p}
                className="index-row"
                to={`/browse?province=${encodeURIComponent(p)}`}
              >
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span className="nm">{p}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
