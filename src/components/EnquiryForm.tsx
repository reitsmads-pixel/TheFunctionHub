import { useState, type FormEvent } from 'react'
import { submitEnquiry, type EnquiryInput } from '../lib/enquiries'
import { EVENT_TYPES } from '../data/taxonomy'
import type { Vendor } from '../lib/types'
import { Notice } from './ui'

const BLANK: EnquiryInput = {
  name: '',
  email: '',
  phone: '',
  eventDate: '',
  eventType: '',
  guests: null,
  message: '',
}

export default function EnquiryForm({ vendor }: { vendor: Vendor }) {
  const [form, setForm] = useState<EnquiryInput>(BLANK)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  /** Honeypot: bots fill every field, humans never see this one. */
  const [trap, setTrap] = useState('')

  function set<K extends keyof EnquiryInput>(key: K, value: EnquiryInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (trap) return
    setState('sending')
    try {
      await submitEnquiry(vendor, form)
      setState('sent')
      setForm(BLANK)
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <Notice kind="success">
        <strong>Enquiry sent.</strong> {vendor.name} has your details and typically replies within a
        working day. Enquire with two or three suppliers so you have quotes to compare.
      </Notice>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate={false}>
      <div className="field">
        <label htmlFor="enq-name">Your name</label>
        <input
          id="enq-name"
          type="text"
          required
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="enq-email">Email</label>
          <input
            id="enq-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="enq-phone">Phone / WhatsApp</label>
          <input
            id="enq-phone"
            type="tel"
            required
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="enq-date">Event date</label>
          <input
            id="enq-date"
            type="date"
            value={form.eventDate}
            onChange={(e) => set('eventDate', e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="enq-guests">Guests</label>
          <input
            id="enq-guests"
            type="number"
            min={1}
            value={form.guests ?? ''}
            onChange={(e) => set('guests', e.target.value ? Number(e.target.value) : null)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="enq-type">Type of function</label>
        <select id="enq-type" value={form.eventType} onChange={(e) => set('eventType', e.target.value)}>
          <option value="">Select…</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="enq-message">What do you need?</label>
        <textarea
          id="enq-message"
          required
          value={form.message}
          onChange={(e) => set('message', e.target.value)}
          placeholder={`Hi ${vendor.name}, we are planning a function and would like a quote for…`}
        />
      </div>

      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }}>
        <label htmlFor="enq-company">Company (leave blank)</label>
        <input id="enq-company" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
      </div>

      {state === 'error' && (
        <div style={{ marginBottom: '1rem' }}>
          <Notice kind="error">Something went wrong sending that. Please try again.</Notice>
        </div>
      )}

      <button className="btn btn-gold btn-block" type="submit" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send enquiry — free'}
      </button>

      <p className="tiny muted" style={{ marginTop: '0.75rem' }}>
        We pass your details straight to this supplier. No booking fee, no commission.
      </p>
    </form>
  )
}
