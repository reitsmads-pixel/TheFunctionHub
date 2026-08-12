import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { SITE } from '../lib/firebase'
import { whatsappLink } from '../lib/format'
import { Notice } from '../components/ui'
import { useSeo } from '../lib/seo'

/* -------------------------------------------------------------------------
   About
   ------------------------------------------------------------------------- */

export function About() {
  useSeo({
    title: 'About The Function Hub SA',
    description:
      'Why we built a South African directory for function and event suppliers, and how we make money without taking commission on your booking.',
    path: '/about',
  })

  return (
    <>
      <section className="hero" style={{ paddingBlock: '3.25rem' }}>
        <div className="wrap">
          <div className="hero-grid">
            <h1>
              Finding suppliers should not take <em>three weeks</em>
            </h1>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap-narrow stack">
          <p className="lead">
            Planning a function in South Africa usually means asking around, scrolling through
            Facebook groups, and waiting days for someone to send a price. Meanwhile good suppliers —
            the ones who show up, cook properly and finish on time — stay invisible because they are
            busy working, not marketing.
          </p>
          <p>
            The Function Hub SA puts both sides in one place. People planning something can search by
            category, province, guest count and budget, see a starting price before they enquire, and
            contact suppliers directly. Suppliers get a page that works whether or not they have a
            website, and enquiries that land in their inbox with the date and guest count already
            filled in.
          </p>

          <h2 style={{ marginTop: '1rem' }}>How we make money</h2>
          <p>
            We charge suppliers a flat monthly or annual fee for better placement and for showing
            their direct contact details. That is the whole model. We do not take a percentage of
            your booking, we do not charge per lead, and we do not sell your details on. A free
            listing stays genuinely free and still receives enquiries.
          </p>
          <p>
            We say this plainly because commission-based directories have an incentive to keep you
            and your supplier apart. We do not.
          </p>

          <h2 style={{ marginTop: '1rem' }}>What we check</h2>
          <p>
            Every new listing is reviewed by a person before it goes live. We look for a real
            business, photos that belong to the supplier, and a description that matches what they
            actually do. Listings marked <strong>Verified</strong> have had their business details
            confirmed as well. We are not a rating agency — read reviews, ask for references, and
            always get a written quote.
          </p>

          <div className="band" style={{ marginTop: '2rem' }}>
            <h2>Run an event business?</h2>
            <p style={{ marginTop: '0.75rem' }}>
              Get listed in about ten minutes. Basic listings are free.
            </p>
            <div className="row" style={{ marginTop: '1.5rem' }}>
              <Link className="btn btn-gold" to="/list-your-business">
                Add your business
              </Link>
              <Link className="btn btn-light" to="/pricing">
                See packages
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

/* -------------------------------------------------------------------------
   Contact
   ------------------------------------------------------------------------- */

export function Contact() {
  const [sent, setSent] = useState(false)

  useSeo({
    title: 'Contact us',
    description: 'Get hold of The Function Hub SA team about listings, billing or anything else.',
    path: '/contact',
  })

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    // Netlify Forms handles the POST when deployed; this only drives the UI.
    if (import.meta.env.DEV) {
      event.preventDefault()
      setSent(true)
    }
  }

  return (
    <section className="section">
      <div className="wrap">
        <div className="vendor-layout">
          <div className="stack">
            <div>
              <h1 style={{ fontSize: '2.2rem' }}>Talk to a human</h1>
              <p className="lead">
                Questions about listing, billing, or a supplier who has not come back to you? Send us
                a note and we will reply within one business day.
              </p>
            </div>

            <div className="panel">
              <h3>Direct</h3>
              <div className="contact-list">
                <a href={`mailto:${SITE.email}`}>
                  <span className="k">Email</span>
                  <span>{SITE.email}</span>
                </a>
                {SITE.phone && (
                  <a href={`tel:${SITE.phone.replace(/\s/g, '')}`}>
                    <span className="k">Phone</span>
                    <span>{SITE.phone}</span>
                  </a>
                )}
                {SITE.whatsapp && (
                  <a href={whatsappLink(SITE.whatsapp)} target="_blank" rel="noopener noreferrer">
                    <span className="k">WhatsApp</span>
                    <span>Message us</span>
                  </a>
                )}
              </div>
              <p className="tiny muted" style={{ marginTop: '1rem' }}>
                Office hours are 08:00–17:00, Monday to Friday.
              </p>
            </div>
          </div>

          <aside>
            <div className="sidebar">
              {sent ? (
                <Notice kind="success">Thanks — your message is on its way.</Notice>
              ) : (
                <form name="contact" method="POST" data-netlify="true" onSubmit={onSubmit}>
                  <input type="hidden" name="form-name" value="contact" />
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Send a message</h2>

                  <div className="field">
                    <label htmlFor="c-name">Your name</label>
                    <input id="c-name" name="name" type="text" required />
                  </div>
                  <div className="field">
                    <label htmlFor="c-email">Email</label>
                    <input id="c-email" name="email" type="email" required />
                  </div>
                  <div className="field">
                    <label htmlFor="c-subject">Subject</label>
                    <select id="c-subject" name="subject">
                      <option>Listing my business</option>
                      <option>Billing or plans</option>
                      <option>Problem with a supplier</option>
                      <option>Something else</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="c-message">Message</label>
                    <textarea id="c-message" name="message" required />
                  </div>

                  <button className="btn btn-primary btn-block" type="submit">
                    Send message
                  </button>
                </form>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------
   Planning guide — the content that pulls in search traffic
   ------------------------------------------------------------------------- */

const GUIDE = [
  {
    heading: 'Twelve months out: lock the date and the venue',
    body: 'The venue sets everything else — guest numbers, budget, even the season. Book it first, in writing, with the deposit terms and the wet-weather plan spelled out. Ask what is included: chairs, tables, cleaning, security, generator or inverter cover.',
  },
  {
    heading: 'Nine months: catering and photography',
    body: 'These two book up fastest and cost the most after the venue. Get quotes per head with a written minimum. Ask caterers about staff, crockery, and whether they need a prep kitchen on site.',
  },
  {
    heading: 'Six months: décor, hire and entertainment',
    body: 'Draping, linen, sound and lighting are usually quoted as a package. Confirm delivery and collection times with the venue directly — a late collection fee is the most common surprise on a final invoice.',
  },
  {
    heading: 'Three months: attire, cakes, transport',
    body: 'Made-to-measure attire needs six weeks minimum. If guests are travelling or drinking, arrange shuttles now rather than the week before.',
  },
  {
    heading: 'One month: confirm everything in writing',
    body: 'Reconfirm arrival times, final guest numbers, dietary requirements, and who is paying the balance and when. Share one run sheet with every supplier.',
  },
  {
    heading: 'The week before: the boring but important checks',
    body: 'Power backup, parking, load-in access, someone nominated to make decisions on the day, and a printed contact list. Assume there will be load-shedding and plan around it.',
  },
]

const BUDGET_SPLIT = [
  ['Venue and hire', '30–35%'],
  ['Catering and bar', '25–30%'],
  ['Photography and video', '10–12%'],
  ['Décor and flowers', '8–10%'],
  ['Entertainment', '5–8%'],
  ['Attire and beauty', '5–8%'],
  ['Transport, stationery, extras', '5%'],
]

export function PlanningGuide() {
  useSeo({
    title: 'Function planning guide for South Africa',
    description:
      'A month-by-month planning timeline, a realistic budget split, and the questions to ask every supplier before you pay a deposit.',
    path: '/planning-guide',
  })

  return (
    <>
      <section className="hero" style={{ paddingBlock: '3.25rem' }}>
        <div className="wrap">
          <div className="hero-grid">
            <h1>
              How to plan a function <em>in South Africa</em>
            </h1>
            <p>
              A realistic timeline, where the money actually goes, and the questions worth asking
              before you pay any deposit.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap-narrow">
          <div className="head">
            <h2>When to book what</h2>
          </div>

          <div className="stack">
            {GUIDE.map((item, i) => (
              <div key={item.heading} className="step">
                <span className="n" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.4rem' }}>{item.heading}</h3>
                  <p className="muted" style={{ fontSize: '0.95rem' }}>
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="head" style={{ marginTop: '4rem' }}>
            <h2>Where the money goes</h2>
            <p className="lead">
              A rough split that holds for most weddings and larger functions. Adjust it, but know
              what you are trading off.
            </p>
          </div>

          <div className="table-scroll">
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col">Line item</th>
                  <th scope="col">Share of budget</th>
                </tr>
              </thead>
              <tbody>
                {BUDGET_SPLIT.map(([label, share]) => (
                  <tr key={label}>
                    <th scope="row" style={{ fontWeight: 500 }}>
                      {label}
                    </th>
                    <td>{share}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="head" style={{ marginTop: '4rem' }}>
            <h2>Ask every supplier this</h2>
          </div>

          <ul className="tick-list">
            <li>What exactly is included, and what is quoted separately?</li>
            <li>What is the deposit, and is it refundable if the date changes?</li>
            <li>Who is the person actually working on the day, and how do I reach them?</li>
            <li>What happens if it rains, or if the power goes out?</li>
            <li>What time do you arrive, and what time must you be off site?</li>
            <li>Can I speak to two clients you worked with in the last six months?</li>
          </ul>

          <div className="band" style={{ marginTop: '3rem' }}>
            <h2>Ready to start enquiring?</h2>
            <p style={{ marginTop: '0.75rem' }}>
              Search by category and province, and send as many free enquiries as you like.
            </p>
            <Link className="btn btn-gold" to="/browse" style={{ marginTop: '1.5rem' }}>
              Browse suppliers
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

/* -------------------------------------------------------------------------
   Supplier FAQ
   ------------------------------------------------------------------------- */

const SUPPLIER_FAQ = [
  {
    q: 'How do enquiries reach me?',
    a: 'Every enquiry appears in your dashboard and is emailed to the address on your listing. It includes the name, contact number, event date and guest count.',
  },
  {
    q: 'Why is my phone number hidden?',
    a: 'Direct contact details are a paid feature. On the Basic plan people enquire through the form instead — you still get every enquiry, they just cannot phone you straight from the page.',
  },
  {
    q: 'How long does approval take?',
    a: 'Usually a few hours, and always within one business day. We check that the business is real and that the photos are yours.',
  },
  {
    q: 'Can I list more than one business?',
    a: 'Each account carries one listing. If you run two genuinely separate businesses, sign up with a second email or contact us and we will set it up.',
  },
  {
    q: 'What gets a listing rejected?',
    a: 'Stock photography, other suppliers’ work, prices that do not match what you actually charge, or contact details that do not work.',
  },
  {
    q: 'Do you sell my details to anyone?',
    a: 'No. Your details are shown on your listing according to your plan, and used to send you enquiries and invoices. That is all.',
  },
]

export function Faq() {
  useSeo({
    title: 'Supplier FAQ',
    description: 'Common questions from suppliers listing on The Function Hub SA.',
    path: '/faq',
  })

  return (
    <section className="section">
      <div className="wrap-narrow faq">
        <div className="head">
          <h1 style={{ fontSize: '2.2rem' }}>Frequently asked</h1>
        </div>

        {SUPPLIER_FAQ.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p className="muted">{item.a}</p>
          </details>
        ))}

        <p className="muted" style={{ marginTop: '2rem' }}>
          Still stuck? <Link to="/contact">Contact us</Link>.
        </p>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------
   Terms & privacy
   ------------------------------------------------------------------------- */

export function Terms() {
  useSeo({
    title: 'Terms & privacy',
    description: 'Terms of use and privacy notice for The Function Hub SA.',
    path: '/terms',
  })

  return (
    <section className="section">
      <div className="wrap-narrow stack">
        <h1 style={{ fontSize: '2.2rem' }}>Terms &amp; privacy</h1>
        <Notice kind="warn">
          This is a plain-language starting point, not legal advice. Have an attorney review it
          against the Consumer Protection Act, ECTA and POPIA before you take real payments.
        </Notice>

        <h2>Using the site</h2>
        <p>
          The Function Hub SA is a directory. We list suppliers; we do not supply the goods or
          services ourselves, and we are not a party to any contract you enter into with a supplier.
          Confirm everything in writing directly with them.
        </p>

        <h2>Listings</h2>
        <p>
          Suppliers are responsible for the accuracy of their own listing, including prices,
          availability and photographs. You may only upload images you own or have permission to use.
          We may edit, suspend or remove any listing that is inaccurate, misleading or the subject of
          repeated complaints.
        </p>

        <h2>Paid listings</h2>
        <p>
          Paid plans are billed monthly or annually in advance and renew automatically until
          cancelled. Cancel at any time from your dashboard; your listing keeps its paid features
          until the end of the period you have paid for. Fees already paid are not refunded pro rata,
          except where the law requires it.
        </p>

        <h2>Your personal information (POPIA)</h2>
        <p>
          We collect only what we need to run the directory: your name, contact details and listing
          content if you are a supplier; your name, contact details and enquiry details if you send
          an enquiry. Enquiries are passed to the supplier you chose, and to nobody else. We do not
          sell personal information.
        </p>
        <p>
          You can ask us to show you what we hold, correct it, or delete it — email{' '}
          <a href={`mailto:${SITE.email}`}>{SITE.email}</a> and we will action it within a reasonable
          period.
        </p>

        <h2>Cookies</h2>
        <p>
          We use only what is needed to keep you signed in and to remember your search filters. If we
          add analytics later, this page will say so.
        </p>

        <h2>Liability</h2>
        <p>
          We take reasonable care to keep the directory accurate but we cannot guarantee any
          supplier's performance. To the extent the law allows, our liability is limited to the fees
          you have paid us in the preceding three months.
        </p>

        <h2>Contact</h2>
        <p>
          The Function Hub SA — <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </p>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------
   404
   ------------------------------------------------------------------------- */

export function NotFound() {
  useSeo({ title: 'Page not found' })

  return (
    <section className="section">
      <div className="wrap center" style={{ paddingBlock: '3rem' }}>
        <p className="label-xs">404</p>
        <h1>We cannot find that page</h1>
        <p className="lead" style={{ margin: '1rem auto 2rem', maxWidth: '46ch' }}>
          The link may be old, or the listing may have moved. Try searching the directory instead.
        </p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link className="btn btn-primary" to="/browse">
            Browse suppliers
          </Link>
          <Link className="btn btn-ghost" to="/">
            Go home
          </Link>
        </div>
      </div>
    </section>
  )
}
