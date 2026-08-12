import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TIERS, annualSaving } from '../lib/tiers'
import { rands } from '../lib/format'
import { useSeo } from '../lib/seo'

const COMPARE: { label: string; get: (t: (typeof TIERS)[number]) => string }[] = [
  { label: 'Photos', get: (t) => `${t.limits.images}` },
  { label: 'Categories', get: (t) => `${t.limits.categories}` },
  { label: 'Provinces', get: (t) => `${t.limits.provinces}` },
  { label: 'Description length', get: (t) => `${t.limits.descriptionChars} characters` },
  { label: 'Phone, WhatsApp & email shown', get: (t) => (t.limits.showContactDetails ? '✓' : '—') },
  { label: 'Website link', get: (t) => (t.limits.showWebsite ? '✓' : '—') },
  { label: 'Social links', get: (t) => (t.limits.showSocials ? '✓' : '—') },
  { label: 'Video on your page', get: (t) => (t.limits.video ? '✓' : '—') },
  { label: 'Home-page spotlight', get: (t) => (t.limits.homepageSpot ? '✓' : '—') },
  { label: 'Search placement', get: (t) => ['Below paid listings', 'Above Basic', 'Top of results'][t.rank] },
  { label: 'Monthly lead report', get: (t) => (t.limits.leadReports ? '✓' : '—') },
  { label: 'Enquiries', get: () => 'Unlimited' },
  { label: 'Commission on your bookings', get: () => 'R0' },
]

const FAQ = [
  {
    q: 'Do you take a cut of my bookings?',
    a: 'No. You pay a flat monthly or annual listing fee and keep 100% of what you charge your client. Enquiries go straight to you — we never sit in the middle of the money.',
  },
  {
    q: 'Is the free listing really free?',
    a: 'Yes, and it stays free. Basic listings show your business, one photo and your categories, and you still receive enquiries through the site. Paid plans buy you placement and direct contact details, not access.',
  },
  {
    q: 'How do I pay?',
    a: 'Card or instant EFT through PayFast, in rands. Monthly plans renew automatically and you can cancel any time from your dashboard; annual plans are paid up front and work out to ten months for twelve.',
  },
  {
    q: 'How long until my listing goes live?',
    a: 'Create it in about ten minutes. Our team checks new listings within one business day, mainly to make sure the business is real and the photos belong to you.',
  },
  {
    q: 'Can I change or cancel my plan?',
    a: 'Any time, from your dashboard. Downgrades take effect at the end of the paid period, so you keep what you have paid for.',
  },
  {
    q: 'What makes a listing get enquiries?',
    a: 'In order: clear starting prices, real photos of your own work, a specific description, and the areas you actually travel to. Listings with a starting price get noticeably more enquiries than ones that say "on request".',
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)

  useSeo({
    title: 'Listing packages for suppliers',
    description:
      'List your event business on The Function Hub SA. Free Basic listings, Featured from R249 a month and Premium from R599 a month. No commission on your bookings.',
    path: '/pricing',
  })

  return (
    <>
      <section className="hero" style={{ paddingBlock: '3.5rem' }}>
        <div className="wrap">
          <div className="hero-inner">
            <span className="eyebrow">For suppliers</span>
            <h1>
              Listing packages that pay <em>for themselves</em>
            </h1>
            <p>
              One enquiry a month covers most plans. Choose how visible you want to be — you can
              start free and upgrade when the enquiries justify it.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="center" style={{ marginBottom: '2.5rem' }}>
            <div className="toggle" role="group" aria-label="Billing period">
              <button className={!annual ? 'is-on' : ''} onClick={() => setAnnual(false)}>
                Monthly
              </button>
              <button className={annual ? 'is-on' : ''} onClick={() => setAnnual(true)}>
                Annual — 2 months free
              </button>
            </div>
          </div>

          <div className="pricing-grid">
            {TIERS.map((tier) => {
              const price = annual ? tier.annual : tier.monthly
              return (
                <div key={tier.id} className={`plan${tier.id === 'featured' ? ' is-popular' : ''}`}>
                  <h3>{tier.name}</h3>
                  <p className="muted tiny">{tier.tagline}</p>

                  <div className="price">
                    {price === 0 ? 'Free' : rands(price)}
                    {price > 0 && <span> / {annual ? 'year' : 'month'}</span>}
                  </div>
                  <p className="tiny muted">
                    {price === 0
                      ? 'No card required'
                      : annual
                        ? `Save ${rands(annualSaving(tier))} versus monthly`
                        : `${rands(tier.annual)} a year if paid up front`}
                  </p>

                  <ul className="tick-list">
                    {tier.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>

                  <Link
                    className={`btn btn-block ${tier.id === 'free' ? 'btn-ghost' : tier.id === 'premium' ? 'btn-gold' : 'btn-primary'}`}
                    to={`/list-your-business?plan=${tier.id}&billing=${annual ? 'annual' : 'monthly'}`}
                  >
                    {tier.id === 'free' ? 'Start free' : `Choose ${tier.name}`}
                  </Link>
                </div>
              )
            })}
          </div>

          <p className="center muted tiny" style={{ marginTop: '1.5rem' }}>
            Prices include VAT. Cancel any time — no lock-in contract.
          </p>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Side by side</span>
            <h2>What you get on each plan</h2>
          </div>

          <div className="table-scroll">
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  {TIERS.map((t) => (
                    <th key={t.id} scope="col">
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row) => (
                  <tr key={row.label}>
                    <th scope="row" style={{ fontWeight: 500 }}>
                      {row.label}
                    </th>
                    {TIERS.map((t) => (
                      <td key={t.id}>{row.get(t)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap-narrow faq">
          <div className="section-head center">
            <span className="eyebrow">Questions</span>
            <h2>Before you sign up</h2>
          </div>
          {FAQ.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p className="muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section-tight" style={{ paddingBottom: '4rem' }}>
        <div className="wrap">
          <div className="band center">
            <h2>Ready to get listed?</h2>
            <p style={{ margin: '1rem auto 0', maxWidth: '52ch' }}>
              Setting up takes about ten minutes. You can start on the free plan and upgrade later
              without redoing anything.
            </p>
            <div className="row" style={{ justifyContent: 'center', marginTop: '1.75rem' }}>
              <Link className="btn btn-gold" to="/list-your-business">
                Add your business
              </Link>
              <Link className="btn btn-light" to="/contact">
                Talk to us first
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
