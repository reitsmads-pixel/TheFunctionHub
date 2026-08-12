import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { StatusText } from '../components/ui'
import {
  listAllVendors,
  setVendorStatus,
  setVendorTier,
  setVendorVerified,
} from '../lib/vendors'
import { TIERS, tierOf } from '../lib/tiers'
import { rands, shortDate } from '../lib/format'
import { useSeo } from '../lib/seo'
import type { ListingStatus, TierId, Vendor } from '../lib/types'

const FILTERS: { id: 'all' | ListingStatus; label: string }[] = [
  { id: 'pending', label: 'Awaiting review' },
  { id: 'published', label: 'Live' },
  { id: 'draft', label: 'Drafts' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'suspended', label: 'Suspended' },
  { id: 'all', label: 'Everything' },
]

export default function Admin() {
  const [vendors, setVendors] = useState<Vendor[] | null>(null)
  const [filter, setFilter] = useState<'all' | ListingStatus>('pending')
  const [busy, setBusy] = useState<string | null>(null)

  useSeo({ title: 'Admin' })

  const load = useCallback(async () => {
    const list = await listAllVendors()
    setVendors(list.sort((a, b) => b.updatedAt - a.updatedAt))
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const shown = useMemo(
    () => (vendors ?? []).filter((v) => filter === 'all' || v.status === filter),
    [vendors, filter],
  )

  /** Monthly recurring revenue at list prices — the number worth watching. */
  const mrr = useMemo(
    () =>
      (vendors ?? [])
        .filter((v) => v.status === 'published')
        .reduce((sum, v) => sum + tierOf(v.tier).monthly, 0),
    [vendors],
  )

  const counts = useMemo(() => {
    const list = vendors ?? []
    return {
      total: list.length,
      pending: list.filter((v) => v.status === 'pending').length,
      published: list.filter((v) => v.status === 'published').length,
      paying: list.filter((v) => v.tier !== 'free' && v.status === 'published').length,
    }
  }, [vendors])

  async function act(id: string, fn: () => Promise<void>) {
    setBusy(id)
    try {
      await fn()
      await load()
    } finally {
      setBusy(null)
    }
  }

  if (vendors === null) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="skeleton" style={{ height: 380 }} />
        </div>
      </section>
    )
  }

  return (
    <section className="section-tight">
      <div className="wrap">
        <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>Admin</h1>
        <p className="muted" style={{ marginBottom: '1.75rem' }}>
          Moderate listings, change plans and keep an eye on revenue.
        </p>

        <div className="figures compact" style={{ marginBottom: '1.75rem' }}>
          <div>
            <strong>{counts.total}</strong>
            <span>Listings</span>
          </div>
          <div>
            <strong>{counts.published}</strong>
            <span>Live</span>
          </div>
          <div>
            <strong>{counts.pending}</strong>
            <span>Awaiting review</span>
          </div>
          <div>
            <strong>{counts.paying}</strong>
            <span>Paying suppliers</span>
          </div>
          <div>
            <strong>{rands(mrr)}</strong>
            <span>MRR at list price</span>
          </div>
        </div>

        <div className="chips" style={{ marginBottom: '1.25rem' }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`btn btn-sm ${filter === f.id ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Status</th>
                  <th>Plan</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((v) => (
                  <tr key={v.id}>
                    <td>
                      <strong>{v.name}</strong>
                      <div className="tiny muted">
                        {v.town || '—'} · {v.provinces.join(', ') || 'No province'}
                      </div>
                      {v.status === 'published' && (
                        <Link className="tiny" to={`/supplier/${v.slug}`}>
                          View page
                        </Link>
                      )}
                    </td>
                    <td>
                      <StatusText status={v.status} />
                    </td>
                    <td>
                      <div className="row" style={{ gap: '0.35rem' }}>
                        <label className="sr-only" htmlFor={`tier-${v.id}`}>
                          Plan for {v.name}
                        </label>
                        <select
                          id={`tier-${v.id}`}
                          value={v.tier}
                          disabled={busy === v.id}
                          onChange={(e) =>
                            void act(v.id, () => setVendorTier(v.id, e.target.value as TierId, 1))
                          }
                          style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.85rem' }}
                        >
                          {TIERS.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="tiny muted">{shortDate(v.updatedAt) || '—'}</td>
                    <td>
                      <div className="row" style={{ gap: '0.35rem' }}>
                        {v.status !== 'published' && (
                          <button
                            className="btn btn-primary btn-sm"
                            disabled={busy === v.id}
                            onClick={() => void act(v.id, () => setVendorStatus(v.id, 'published'))}
                          >
                            Approve
                          </button>
                        )}
                        {v.status === 'pending' && (
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={busy === v.id}
                            onClick={() => void act(v.id, () => setVendorStatus(v.id, 'rejected'))}
                          >
                            Reject
                          </button>
                        )}
                        {v.status === 'published' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            disabled={busy === v.id}
                            onClick={() => void act(v.id, () => setVendorStatus(v.id, 'suspended'))}
                          >
                            Suspend
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm"
                          disabled={busy === v.id}
                          onClick={() => void act(v.id, () => setVendorVerified(v.id, !v.verified))}
                        >
                          {v.verified ? 'Unverify' : 'Verify'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {shown.length === 0 && (
                  <tr>
                    <td colSpan={5} className="muted center" style={{ padding: '2rem' }}>
                      Nothing here right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
