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
      <section style={{ background: 'var(--plum-800)', color: '#fff', paddingBlock: '3rem' }}>
        <div className="wrap">
          <span className="eyebrow">Directory</span>
          <h1 style={{ color: '#fff' }}>Every kind of supplier</h1>
          <p style={{ color: 'rgb(255 255 255 / 75%)', marginTop: '0.75rem', maxWidth: '56ch' }}>
            From the venue down to the welcome signage. Pick a category to see who works in your
            province.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="grid grid-4">
            {CATEGORIES.map((c) => (
              <Link key={c.slug} className="cat-tile" to={`/browse?category=${c.slug}`}>
                <span className="icon" aria-hidden="true">
                  {c.icon}
                </span>
                <strong>{c.name}</strong>
                <span>{c.blurb}</span>
                <span className="tiny muted" style={{ marginTop: '0.35rem' }}>
                  {counts[c.slug] ? `${counts[c.slug]} listed` : 'Be the first to list'}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight" style={{ paddingBottom: '4rem' }}>
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">By province</span>
            <h2>Browse where your function is</h2>
          </div>
          <div className="chips">
            {PROVINCES.map((p) => (
              <Link key={p} className="chip" to={`/browse?province=${encodeURIComponent(p)}`}>
                {p}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
