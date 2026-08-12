import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDashboard } from './DashboardLayout'
import { useAuth } from '../../lib/AuthContext'
import { CATEGORIES, PROVINCES } from '../../data/taxonomy'
import { emptyVendor, saveVendor } from '../../lib/vendors'
import { uploadListingImage } from '../../lib/uploads'
import { tierOf } from '../../lib/tiers'
import { Notice, StatusText } from '../../components/ui'
import type { TierId, Vendor } from '../../lib/types'

export default function ListingEditor() {
  const { listing, loading, reload } = useDashboard()
  const { user } = useAuth()
  const [params] = useSearchParams()
  const requestedPlan = params.get('plan') as TierId | null

  const [form, setForm] = useState<Vendor | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ kind: 'success' | 'error' | 'info'; text: string } | null>(
    null,
  )

  useEffect(() => {
    if (loading || !user) return
    setForm(listing ?? emptyVendor(user.uid, user.email))
  }, [listing, loading, user])

  const tier = tierOf(form?.tier)
  const remaining = useMemo(
    () => (form ? tier.limits.descriptionChars - form.description.length : 0),
    [form, tier],
  )

  if (loading || !form) return <div className="skeleton" style={{ height: 420 }} />

  function set<K extends keyof Vendor>(key: K, value: Vendor[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  function toggleArray(key: 'categories' | 'provinces', value: string, limit: number) {
    setForm((prev) => {
      if (!prev) return prev
      const current = prev[key]
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter((x) => x !== value) }
      }
      if (current.length >= limit) return prev
      return { ...prev, [key]: [...current, value] }
    })
  }

  async function onUpload(files: FileList | null) {
    if (!files || !form || !user) return
    const room = tier.limits.images - form.images.length
    if (room <= 0) {
      setMessage({ kind: 'error', text: `Your ${tier.name} plan allows ${tier.limits.images} photos.` })
      return
    }
    setUploading(true)
    setMessage(null)
    try {
      const picked = Array.from(files).slice(0, room)
      const urls = await Promise.all(picked.map((file) => uploadListingImage(file, user.uid)))
      setForm((prev) => (prev ? { ...prev, images: [...prev.images, ...urls] } : prev))
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Upload failed.' })
    } finally {
      setUploading(false)
    }
  }

  async function persist(status: Vendor['status']) {
    if (!form) return
    if (!form.name.trim()) {
      setMessage({ kind: 'error', text: 'Your business needs a name before you can save.' })
      return
    }
    if (status === 'pending') {
      if (form.categories.length === 0) {
        setMessage({ kind: 'error', text: 'Pick at least one category before submitting.' })
        return
      }
      if (form.provinces.length === 0) {
        setMessage({ kind: 'error', text: 'Pick at least one province before submitting.' })
        return
      }
      if (form.description.trim().length < 60) {
        setMessage({ kind: 'error', text: 'Please write at least a couple of sentences about your business.' })
        return
      }
    }

    setSaving(true)
    setMessage(null)
    try {
      const saved = await saveVendor({ ...form, status })
      setForm(saved)
      await reload()
      setMessage({
        kind: 'success',
        text:
          status === 'pending'
            ? 'Submitted. We review new listings within one business day.'
            : 'Saved.',
      })
    } catch {
      setMessage({ kind: 'error', text: 'Could not save that. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    void persist(form?.status === 'published' ? 'published' : 'pending')
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <div className="panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>My listing</h2>
            <p className="muted tiny">
              On the <strong>{tier.name}</strong> plan: {tier.limits.images} photo
              {tier.limits.images === 1 ? '' : 's'}, {tier.limits.categories} categor
              {tier.limits.categories === 1 ? 'y' : 'ies'}, {tier.limits.provinces} province
              {tier.limits.provinces === 1 ? '' : 's'}.{' '}
              <Link to="/dashboard/billing">Change plan</Link>
            </p>
          </div>
          <StatusText status={form.status} />
        </div>
      </div>

      {requestedPlan && requestedPlan !== 'free' && form.tier === 'free' && (
        <Notice kind="info">
          You picked the <strong>{tierOf(requestedPlan).name}</strong> plan. Fill in your listing
          first, then activate it under <Link to="/dashboard/billing">Plan &amp; billing</Link>.
        </Notice>
      )}

      {message && <Notice kind={message.kind}>{message.text}</Notice>}

      <div className="panel">
        <h3>The basics</h3>
        <div className="field" style={{ marginTop: '1rem' }}>
          <label htmlFor="f-name">Business name</label>
          <input id="f-name" type="text" required value={form.name} onChange={(e) => set('name', e.target.value)} />
        </div>

        <div className="field">
          <label htmlFor="f-tagline">One-line summary</label>
          <input
            id="f-tagline"
            type="text"
            maxLength={110}
            value={form.tagline}
            onChange={(e) => set('tagline', e.target.value)}
            placeholder="Garden weddings under old oaks, 40 minutes from Sandton"
          />
          <span className="hint">This is the line people read on the search results card.</span>
        </div>

        <div className="field">
          <label htmlFor="f-description">About your business</label>
          <textarea
            id="f-description"
            value={form.description}
            maxLength={tier.limits.descriptionChars}
            onChange={(e) => set('description', e.target.value)}
            placeholder="What you offer, what makes you different, how you work, and anything a client should know before enquiring."
          />
          <span className="hint">
            {remaining} characters left on the {tier.name} plan.
          </span>
        </div>

        <div className="field">
          <label htmlFor="f-town">Town / city you work from</label>
          <input id="f-town" type="text" value={form.town} onChange={(e) => set('town', e.target.value)} />
        </div>
      </div>

      <div className="panel">
        <h3>Categories</h3>
        <p className="muted tiny" style={{ marginBottom: '0.85rem' }}>
          Choose up to {tier.limits.categories} — {form.categories.length} selected.
        </p>
        <div className="checks">
          {CATEGORIES.map((c) => {
            const on = form.categories.includes(c.slug)
            const blocked = !on && form.categories.length >= tier.limits.categories
            return (
              <label
                key={c.slug}
                className={`check${on ? ' is-on' : ''}${blocked ? ' is-disabled' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  disabled={blocked}
                  onChange={() => toggleArray('categories', c.slug, tier.limits.categories)}
                />
                {c.name}
              </label>
            )
          })}
        </div>

        <h3 style={{ marginTop: '1.75rem' }}>Provinces you serve</h3>
        <p className="muted tiny" style={{ marginBottom: '0.85rem' }}>
          Choose up to {tier.limits.provinces} — {form.provinces.length} selected.
        </p>
        <div className="checks">
          {PROVINCES.map((p) => {
            const on = form.provinces.includes(p)
            const blocked = !on && form.provinces.length >= tier.limits.provinces
            return (
              <label key={p} className={`check${on ? ' is-on' : ''}${blocked ? ' is-disabled' : ''}`}>
                <input
                  type="checkbox"
                  checked={on}
                  disabled={blocked}
                  onChange={() => toggleArray('provinces', p, tier.limits.provinces)}
                />
                {p}
              </label>
            )
          })}
        </div>
      </div>

      <div className="panel">
        <h3>Pricing &amp; capacity</h3>
        <div className="field-row" style={{ marginTop: '1rem' }}>
          <div className="field">
            <label htmlFor="f-price">Starting price (R)</label>
            <input
              id="f-price"
              type="number"
              min={0}
              value={form.priceFrom ?? ''}
              onChange={(e) => set('priceFrom', e.target.value ? Number(e.target.value) : null)}
            />
            <span className="hint">Listings with a price get noticeably more enquiries.</span>
          </div>
          <div className="field">
            <label htmlFor="f-price-note">What that price covers</label>
            <input
              id="f-price-note"
              type="text"
              value={form.priceNote}
              onChange={(e) => set('priceNote', e.target.value)}
              placeholder="per head, buffet, minimum 80 guests"
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="f-cap-min">Minimum guests</label>
            <input
              id="f-cap-min"
              type="number"
              min={0}
              value={form.capacityMin ?? ''}
              onChange={(e) => set('capacityMin', e.target.value ? Number(e.target.value) : null)}
            />
          </div>
          <div className="field">
            <label htmlFor="f-cap-max">Maximum guests</label>
            <input
              id="f-cap-max"
              type="number"
              min={0}
              value={form.capacityMax ?? ''}
              onChange={(e) => set('capacityMax', e.target.value ? Number(e.target.value) : null)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="f-services">What's included (one per line)</label>
          <textarea
            id="f-services"
            style={{ minHeight: 110 }}
            value={form.services.join('\n')}
            onChange={(e) =>
              set(
                'services',
                e.target.value.split('\n').map((s) => s.trim()).filter(Boolean),
              )
            }
            placeholder={'Garden ceremony site\nCovered reception barn\nOn-site accommodation'}
          />
        </div>
      </div>

      <div className="panel">
        <h3>Photos</h3>
        <p className="muted tiny" style={{ marginBottom: '0.85rem' }}>
          {form.images.length} of {tier.limits.images} used. Use your own work — we reject stock
          photos.
        </p>

        {form.images.length > 0 && (
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
            {form.images.map((src, i) => (
              <div key={src.slice(0, 40) + i} style={{ position: 'relative' }}>
                <img
                  src={src}
                  alt=""
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{ position: 'absolute', top: 6, right: 6, padding: '0.2rem 0.5rem' }}
                  onClick={() => set('images', form.images.filter((_, idx) => idx !== i))}
                  aria-label={`Remove photo ${i + 1}`}
                >
                  ✕
                </button>
                {i === 0 && (
                  <span className="badge badge-soft" style={{ position: 'absolute', bottom: 6, left: 6 }}>
                    Cover
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="field">
          <label htmlFor="f-images">Add photos</label>
          <input
            id="f-images"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            disabled={uploading || form.images.length >= tier.limits.images}
            onChange={(e) => void onUpload(e.target.files)}
          />
          {uploading && <span className="hint">Uploading…</span>}
        </div>

        {tier.limits.video && (
          <div className="field">
            <label htmlFor="f-video">Video embed URL</label>
            <input
              id="f-video"
              type="url"
              value={form.videoUrl}
              onChange={(e) => set('videoUrl', e.target.value)}
              placeholder="https://www.youtube.com/embed/xxxxxxxx"
            />
            <span className="hint">Use the embed link, not the normal watch link.</span>
          </div>
        )}
      </div>

      <div className="panel">
        <h3>Contact details</h3>
        {!tier.limits.showContactDetails && (
          <div style={{ marginBlock: '1rem' }}>
            <Notice kind="warn">
              On the Basic plan these stay hidden from the public page — enquiries still reach you by
              email. <Link to="/dashboard/billing">Upgrade</Link> to show them.
            </Notice>
          </div>
        )}

        <div className="field-row" style={{ marginTop: '1rem' }}>
          <div className="field">
            <label htmlFor="f-phone">Phone</label>
            <input id="f-phone" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="f-whatsapp">WhatsApp number</label>
            <input
              id="f-whatsapp"
              type="tel"
              value={form.whatsapp}
              onChange={(e) => set('whatsapp', e.target.value)}
              placeholder="27821234567"
            />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="f-email">Enquiry email</label>
            <input id="f-email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="f-website">Website</label>
            <input id="f-website" type="url" value={form.website} onChange={(e) => set('website', e.target.value)} />
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="f-instagram">Instagram handle</label>
            <input
              id="f-instagram"
              type="text"
              value={form.instagram}
              onChange={(e) => set('instagram', e.target.value)}
              placeholder="yourbusiness"
            />
          </div>
          <div className="field">
            <label htmlFor="f-facebook">Facebook page</label>
            <input
              id="f-facebook"
              type="text"
              value={form.facebook}
              onChange={(e) => set('facebook', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <p className="muted tiny" style={{ maxWidth: '40ch' }}>
            {form.status === 'published'
              ? 'Changes to a live listing go out immediately.'
              : 'Save a draft as often as you like. Submit when you are happy with it.'}
          </p>
          <div className="row">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={saving}
              onClick={() => void persist(form.status === 'published' ? 'published' : 'draft')}
            >
              {saving ? 'Saving…' : 'Save draft'}
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {form.status === 'published' ? 'Save changes' : 'Submit for review'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
