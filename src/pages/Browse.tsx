import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import VendorCard from '../components/VendorCard'
import SearchBar from '../components/SearchBar'
import { CardSkeletons, EmptyState } from '../components/ui'
import { BUDGET_BANDS, CATEGORIES, PROVINCES, categoryName } from '../data/taxonomy'
import { applyFilters, listVendors, rankVendors, type VendorFilters } from '../lib/vendors'
import { useSeo } from '../lib/seo'
import type { Vendor } from '../lib/types'

type Sort = NonNullable<VendorFilters['sort']>

const SORTS: { id: Sort; label: string }[] = [
  { id: 'relevance', label: 'Recommended' },
  { id: 'rating', label: 'Best rated' },
  { id: 'price-asc', label: 'Lowest starting price' },
  { id: 'newest', label: 'Recently added' },
]

export default function Browse() {
  const [params, setParams] = useSearchParams()
  const [all, setAll] = useState<Vendor[] | null>(null)

  const q = params.get('q') ?? ''
  const category = params.get('category') ?? ''
  const province = params.get('province') ?? ''
  const budget = params.get('budget') ?? 'any'
  const guests = params.get('guests') ?? ''
  const sort = (params.get('sort') as Sort) || 'relevance'

  const heading = category
    ? `${categoryName(category)}${province ? ` in ${province}` : ' in South Africa'}`
    : province
      ? `Event suppliers in ${province}`
      : 'All suppliers'

  useSeo({
    title: heading,
    description: `Compare ${category ? categoryName(category).toLowerCase() : 'event suppliers'} ${
      province ? `in ${province}` : 'across South Africa'
    } on The Function Hub SA. Starting prices, contact details and free enquiries.`,
  })

  useEffect(() => {
    let alive = true
    listVendors()
      .then((list) => alive && setAll(list))
      .catch(() => alive && setAll([]))
    return () => {
      alive = false
    }
  }, [])

  function update(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  const results = useMemo(() => {
    if (!all) return null
    const band = BUDGET_BANDS.find((b) => b.id === budget)
    const filtered = applyFilters(all, {
      q,
      category,
      province,
      budgetMax: band && band.max !== Infinity ? band.max : undefined,
      guests: guests ? Number(guests) : undefined,
    })
    return rankVendors(filtered, sort)
  }, [all, q, category, province, budget, guests, sort])

  const activeChips = [
    q && { key: 'q', label: `“${q}”` },
    category && { key: 'category', label: categoryName(category) },
    province && { key: 'province', label: province },
    budget !== 'any' && {
      key: 'budget',
      label: BUDGET_BANDS.find((b) => b.id === budget)?.label ?? budget,
    },
    guests && { key: 'guests', label: `${guests}+ guests` },
  ].filter(Boolean) as { key: string; label: string }[]

  const paidCount = (results ?? []).filter((v) => v.tier !== 'free').length

  return (
    <>
      <section style={{ background: 'var(--plum-800)', paddingBlock: '2.25rem 3.25rem' }}>
        <div className="wrap">
          <h1 style={{ color: '#fff', fontSize: 'clamp(1.8rem, 1.2rem + 2vw, 2.6rem)' }}>{heading}</h1>
          <SearchBar initialQ={q} initialCategory={category} initialProvince={province} />
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className="browse-layout">
            <aside className="filters" aria-label="Filters">
              <div className="group">
                <h3>Category</h3>
                <div className="filter-list">
                  <button
                    className={!category ? 'is-on' : ''}
                    onClick={() => update('category', '')}
                  >
                    All categories
                  </button>
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.slug}
                      className={category === c.slug ? 'is-on' : ''}
                      onClick={() => update('category', c.slug)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="group">
                <h3>Province</h3>
                <div className="filter-list">
                  <button
                    className={!province ? 'is-on' : ''}
                    onClick={() => update('province', '')}
                  >
                    Anywhere
                  </button>
                  {PROVINCES.map((p) => (
                    <button
                      key={p}
                      className={province === p ? 'is-on' : ''}
                      onClick={() => update('province', p)}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="group">
                <h3>Budget</h3>
                <label className="label" htmlFor="budget-select" style={{ position: 'absolute', left: -9999 }}>
                  Budget
                </label>
                <select
                  id="budget-select"
                  value={budget}
                  onChange={(e) => update('budget', e.target.value === 'any' ? '' : e.target.value)}
                >
                  {BUDGET_BANDS.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
                <p className="tiny muted" style={{ marginTop: '0.4rem' }}>
                  Matches the supplier's starting price.
                </p>
              </div>

              <div className="group">
                <h3>Guests</h3>
                <label className="label" htmlFor="guests-input" style={{ position: 'absolute', left: -9999 }}>
                  Minimum guests
                </label>
                <input
                  id="guests-input"
                  type="number"
                  min={1}
                  placeholder="e.g. 150"
                  value={guests}
                  onChange={(e) => update('guests', e.target.value)}
                />
                <p className="tiny muted" style={{ marginTop: '0.4rem' }}>
                  Only filters suppliers that publish a capacity.
                </p>
              </div>
            </aside>

            <div>
              <div className="browse-head">
                <p className="muted">
                  {results === null
                    ? 'Loading suppliers…'
                    : `${results.length} supplier${results.length === 1 ? '' : 's'}`}
                  {paidCount > 0 && results !== null && (
                    <span className="tiny"> · Featured and Premium listings appear first</span>
                  )}
                </p>

                <div className="row">
                  <label className="tiny muted" htmlFor="sort-select">
                    Sort
                  </label>
                  <select
                    id="sort-select"
                    value={sort}
                    onChange={(e) => update('sort', e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    {SORTS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {activeChips.length > 0 && (
                <div className="chips">
                  {activeChips.map((chip) => (
                    <span key={chip.key} className="chip">
                      {chip.label}
                      <button
                        onClick={() => update(chip.key, '')}
                        aria-label={`Remove filter ${chip.label}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <button className="btn btn-ghost btn-sm" onClick={() => setParams({}, { replace: true })}>
                    Clear all
                  </button>
                </div>
              )}

              {results === null ? (
                <CardSkeletons />
              ) : results.length === 0 ? (
                <EmptyState
                  title="No suppliers match that yet"
                  action={{ to: '/list-your-business', label: 'Are you a supplier? List here' }}
                >
                  Try widening the province or clearing the budget filter. The directory is growing
                  weekly.
                </EmptyState>
              ) : (
                <div className="grid grid-results">
                  {results.map((v) => (
                    <VendorCard key={v.id} vendor={v} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
