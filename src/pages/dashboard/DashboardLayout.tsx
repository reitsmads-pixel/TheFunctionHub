import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useOutletContext } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import { listVendorsByOwner } from '../../lib/vendors'
import { useSeo } from '../../lib/seo'
import type { Vendor } from '../../lib/types'

export interface DashboardContext {
  listing: Vendor | null
  loading: boolean
  reload: () => Promise<void>
}

export function useDashboard(): DashboardContext {
  return useOutletContext<DashboardContext>()
}

const LINKS = [
  { to: '/dashboard', label: 'Overview', end: true },
  { to: '/dashboard/listing', label: 'My listing' },
  { to: '/dashboard/enquiries', label: 'Enquiries' },
  { to: '/dashboard/billing', label: 'Plan & billing' },
]

export default function DashboardLayout() {
  const { user } = useAuth()
  const [listing, setListing] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)

  useSeo({ title: 'Supplier dashboard' })

  const reload = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const mine = await listVendorsByOwner(user.uid)
      setListing(mine[0] ?? null)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void reload()
  }, [reload])

  return (
    <section className="section-tight">
      <div className="wrap">
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '2rem' }}>Your dashboard</h1>
          <p className="muted">Signed in as {user?.email}</p>
        </div>

        <div className="dash-layout">
          <nav className="dash-nav" aria-label="Dashboard">
            {LINKS.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div>
            <Outlet context={{ listing, loading, reload } satisfies DashboardContext} />
          </div>
        </div>
      </div>
    </section>
  )
}
