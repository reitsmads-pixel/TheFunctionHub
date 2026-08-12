import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { SITE, isDemoMode } from '../lib/firebase'
import { useAuth } from '../lib/AuthContext'
import { CATEGORIES } from '../data/taxonomy'

const NAV = [
  { to: '/browse', label: 'Suppliers' },
  { to: '/categories', label: 'Categories' },
  { to: '/planning-guide', label: 'Planning guide' },
  { to: '/pricing', label: 'List your business' },
  { to: '/about', label: 'About' },
]

function Brand() {
  return (
    <Link to="/" className="brand" aria-label="The Function Hub SA home">
      <span className="name">The Function Hub</span>
      <small>South Africa</small>
    </Link>
  )
}

function Header() {
  const { user, signOut, isAdmin } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <header className="site-header">
      <div className="wrap">
        <div className="bar">
          <Brand />

          <nav className="nav" aria-label="Main">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions desktop">
            {user ? (
              <>
                <Link className="btn btn-ghost btn-sm" to={isAdmin ? '/admin' : '/dashboard'}>
                  {isAdmin ? 'Admin' : 'My listing'}
                </Link>
                <button className="btn btn-ghost btn-sm" onClick={() => void signOut()}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost btn-sm" to="/signin">
                  Supplier login
                </Link>
                <Link className="btn btn-primary btn-sm" to="/list-your-business">
                  Add your business
                </Link>
              </>
            )}
          </div>

          <button
            className="burger"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden="true">{open ? 'Close' : 'Menu'}</span>
            <span className="sr-only">Navigation</span>
          </button>
        </div>

        {open && (
          <div className="mobile-menu" id="mobile-menu">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to}>
                {item.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink to={isAdmin ? '/admin' : '/dashboard'}>
                  {isAdmin ? 'Admin' : 'My listing'}
                </NavLink>
                <button className="btn btn-ghost" onClick={() => void signOut()}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/signin">Supplier login</NavLink>
                <Link className="btn btn-primary" to="/list-your-business">
                  Add your business
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div>
            <Brand />
            <p style={{ marginTop: '1.25rem', fontSize: '0.92rem', maxWidth: '34ch' }}>
              South Africa's directory of function and event suppliers. Free to search, free to
              enquire, and free for suppliers to get listed.
            </p>
          </div>

          <div>
            <h4>Categories</h4>
            <ul>
              {CATEGORIES.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link to={`/browse?category=${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Suppliers</h4>
            <ul>
              <li>
                <Link to="/pricing">Listing packages</Link>
              </li>
              <li>
                <Link to="/list-your-business">Add your business</Link>
              </li>
              <li>
                <Link to="/signin">Supplier login</Link>
              </li>
              <li>
                <Link to="/faq">Supplier FAQ</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <Link to="/about">About us</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link to="/planning-guide">Planning guide</Link>
              </li>
              <li>
                <Link to="/terms">Terms &amp; privacy</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} The Function Hub SA</span>
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </div>
      </div>
    </footer>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function Layout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {isDemoMode && (
        <div className="demo-bar">
          <strong>Demo mode.</strong> Sample suppliers, and anything you save stays in this browser.
          Add your Firebase keys to switch on the live directory.
        </div>
      )}
      <ScrollToTop />
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
