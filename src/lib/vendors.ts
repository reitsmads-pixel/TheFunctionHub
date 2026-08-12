import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { COLLECTIONS, db, isDemoMode } from './firebase'
import { demoId, demoStore } from './demo-store'
import { tierOf } from './tiers'
import type { ListingStatus, TierId, Vendor } from './types'

export interface VendorFilters {
  q?: string
  category?: string
  province?: string
  budgetMax?: number
  guests?: number
  sort?: 'relevance' | 'rating' | 'newest' | 'price-asc'
}

/**
 * Listings are fetched once and filtered in the browser rather than pushed
 * through a pile of Firestore composite indexes. A supplier directory of a few
 * thousand rows is small enough for this to be the faster, cheaper option, and
 * it keeps free-text search working. Revisit if the directory passes ~5 000.
 */
const MAX_FETCH = 2000

function normalise(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function fromDoc(id: string, data: Record<string, unknown>): Vendor {
  const v = data as Partial<Vendor>
  return {
    id,
    slug: v.slug ?? id,
    ownerId: v.ownerId ?? '',
    name: v.name ?? 'Untitled listing',
    tagline: v.tagline ?? '',
    description: v.description ?? '',
    categories: v.categories ?? [],
    provinces: v.provinces ?? [],
    town: v.town ?? '',
    phone: v.phone ?? '',
    email: v.email ?? '',
    website: v.website ?? '',
    whatsapp: v.whatsapp ?? '',
    instagram: v.instagram ?? '',
    facebook: v.facebook ?? '',
    images: v.images ?? [],
    videoUrl: v.videoUrl ?? '',
    priceFrom: v.priceFrom ?? null,
    priceNote: v.priceNote ?? '',
    capacityMin: v.capacityMin ?? null,
    capacityMax: v.capacityMax ?? null,
    services: v.services ?? [],
    tier: (v.tier as TierId) ?? 'free',
    status: (v.status as ListingStatus) ?? 'pending',
    verified: v.verified ?? false,
    rating: v.rating ?? 0,
    reviewCount: v.reviewCount ?? 0,
    createdAt: toMillis(v.createdAt),
    updatedAt: toMillis(v.updatedAt),
    subscriptionEndsAt: v.subscriptionEndsAt ? toMillis(v.subscriptionEndsAt) : null,
    views: v.views ?? 0,
    enquiryCount: v.enquiryCount ?? 0,
  }
}

function toMillis(value: unknown): number {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'toMillis' in value) {
    return (value as { toMillis: () => number }).toMillis()
  }
  return 0
}

async function fetchPublished(): Promise<Vendor[]> {
  if (isDemoMode) {
    return demoStore.state().vendors.filter((v) => v.status === 'published')
  }
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.vendors), where('status', '==', 'published')),
  )
  return snap.docs.slice(0, MAX_FETCH).map((d) => fromDoc(d.id, d.data()))
}

/** Paid tiers rank above free ones — this ordering is the product. */
export function rankVendors(vendors: Vendor[], sort: VendorFilters['sort'] = 'relevance'): Vendor[] {
  const copy = [...vendors]
  switch (sort) {
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
    case 'newest':
      return copy.sort((a, b) => b.createdAt - a.createdAt)
    case 'price-asc':
      return copy.sort(
        (a, b) => (a.priceFrom ?? Number.MAX_SAFE_INTEGER) - (b.priceFrom ?? Number.MAX_SAFE_INTEGER),
      )
    default:
      return copy.sort(
        (a, b) =>
          tierOf(b.tier).rank - tierOf(a.tier).rank ||
          Number(b.verified) - Number(a.verified) ||
          b.rating - a.rating ||
          b.reviewCount - a.reviewCount,
      )
  }
}

export function applyFilters(vendors: Vendor[], filters: VendorFilters): Vendor[] {
  const q = filters.q ? normalise(filters.q) : ''
  return vendors.filter((v) => {
    if (filters.category && !v.categories.includes(filters.category)) return false
    if (filters.province && !v.provinces.includes(filters.province)) return false
    if (filters.budgetMax != null && v.priceFrom != null && v.priceFrom > filters.budgetMax) return false
    if (filters.guests != null && v.capacityMax != null && v.capacityMax < filters.guests) return false
    if (q) {
      const haystack = normalise(
        [v.name, v.tagline, v.description, v.town, v.services.join(' '), v.categories.join(' ')].join(' '),
      )
      if (!q.split(/\s+/).every((word) => haystack.includes(word))) return false
    }
    return true
  })
}

export async function listVendors(filters: VendorFilters = {}): Promise<Vendor[]> {
  const all = await fetchPublished()
  return rankVendors(applyFilters(all, filters), filters.sort)
}

/**
 * Slugs live in their own tiny collection keyed by the slug itself, mapping to
 * the vendor document. Two reasons: it makes the slug globally unique without a
 * scan, and it turns a public profile view into two single-document reads that
 * the security rules can allow without opening up the vendors collection to
 * unconstrained queries.
 */
export async function getVendorBySlug(slug: string): Promise<Vendor | null> {
  if (isDemoMode) {
    return demoStore.state().vendors.find((v) => v.slug === slug || v.id === slug) ?? null
  }
  const pointer = await getDoc(doc(db(), COLLECTIONS.slugs, slug))
  const vendorId = pointer.exists() ? (pointer.data().vendorId as string) : slug
  const snap = await getDoc(doc(db(), COLLECTIONS.vendors, vendorId))
  return snap.exists() ? fromDoc(snap.id, snap.data()) : null
}

export async function listVendorsByOwner(ownerId: string): Promise<Vendor[]> {
  if (isDemoMode) {
    return demoStore.state().vendors.filter((v) => v.ownerId === ownerId)
  }
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.vendors), where('ownerId', '==', ownerId)),
  )
  return snap.docs.map((d) => fromDoc(d.id, d.data()))
}

export async function listAllVendors(): Promise<Vendor[]> {
  if (isDemoMode) return demoStore.state().vendors
  const snap = await getDocs(collection(db(), COLLECTIONS.vendors))
  return snap.docs.map((d) => fromDoc(d.id, d.data()))
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/** Demo mode has the whole directory in memory, so uniqueness is a set lookup. */
function uniqueSlugInDemo(base: string, ignoreId?: string): string {
  const taken = new Set(
    demoStore
      .state()
      .vendors.filter((v) => v.id !== ignoreId)
      .map((v) => v.slug),
  )
  if (!taken.has(base)) return base
  let n = 2
  while (taken.has(`${base}-${n}`)) n++
  return `${base}-${n}`
}

/**
 * Claims `base`, or the first free `base-2`, `base-3`… for this vendor, and
 * releases the slug the vendor held before. Returns the slug that stuck.
 */
async function reserveSlug(base: string, vendorId: string, ownerId: string, previous: string) {
  for (let n = 1; n <= 25; n++) {
    const candidate = n === 1 ? base : `${base}-${n}`
    if (candidate === previous) return candidate
    const ref = doc(db(), COLLECTIONS.slugs, candidate)
    const existing = await getDoc(ref)
    if (existing.exists()) {
      if (existing.data().vendorId === vendorId) return candidate
      continue
    }
    await setDoc(ref, { vendorId, ownerId })
    if (previous && previous !== candidate) {
      // Best effort — an orphaned pointer is harmless, a failed save is not.
      try {
        await deleteDoc(doc(db(), COLLECTIONS.slugs, previous))
      } catch {
        /* ignore */
      }
    }
    return candidate
  }
  // Twenty-five collisions on one name: fall back to something guaranteed free.
  const fallback = `${base}-${vendorId.slice(0, 6).toLowerCase()}`
  await setDoc(doc(db(), COLLECTIONS.slugs, fallback), { vendorId, ownerId })
  return fallback
}

export function emptyVendor(ownerId: string, email: string): Vendor {
  return {
    id: '',
    slug: '',
    ownerId,
    name: '',
    tagline: '',
    description: '',
    categories: [],
    provinces: [],
    town: '',
    phone: '',
    email,
    website: '',
    whatsapp: '',
    instagram: '',
    facebook: '',
    images: [],
    videoUrl: '',
    priceFrom: null,
    priceNote: '',
    capacityMin: null,
    capacityMax: null,
    services: [],
    tier: 'free',
    status: 'draft',
    verified: false,
    rating: 0,
    reviewCount: 0,
    createdAt: 0,
    updatedAt: 0,
    subscriptionEndsAt: null,
    views: 0,
    enquiryCount: 0,
  }
}

export async function saveVendor(vendor: Vendor): Promise<Vendor> {
  const now = Date.now()
  const base = slugify(vendor.name) || 'listing'

  if (isDemoMode) {
    const id = vendor.id || demoId('vendor')
    const saved: Vendor = {
      ...vendor,
      id,
      slug: uniqueSlugInDemo(base, vendor.id || undefined),
      updatedAt: now,
      createdAt: vendor.createdAt || now,
    }
    demoStore.update((state) => {
      const index = state.vendors.findIndex((v) => v.id === id)
      if (index >= 0) state.vendors[index] = saved
      else state.vendors.unshift(saved)
    })
    return saved
  }

  const payload: Record<string, unknown> = { ...vendor, updatedAt: serverTimestamp() }
  delete payload.id

  // The document has to exist before a slug can point at it.
  let id = vendor.id
  if (id) {
    // createdAt stays as the server wrote it; sending our millisecond copy back
    // would quietly downgrade the stored timestamp to a plain number.
    delete payload.createdAt
    await updateDoc(doc(db(), COLLECTIONS.vendors, id), payload)
  } else {
    const created = await addDoc(collection(db(), COLLECTIONS.vendors), {
      ...payload,
      createdAt: serverTimestamp(),
    })
    id = created.id
  }

  const slug = await reserveSlug(base, id, vendor.ownerId, vendor.slug)
  if (slug !== vendor.slug) {
    await updateDoc(doc(db(), COLLECTIONS.vendors, id), { slug })
  }

  return { ...vendor, id, slug, updatedAt: now, createdAt: vendor.createdAt || now }
}

export async function setVendorStatus(id: string, status: ListingStatus): Promise<void> {
  if (isDemoMode) {
    demoStore.update((state) => {
      const v = state.vendors.find((x) => x.id === id)
      if (v) {
        v.status = status
        v.updatedAt = Date.now()
      }
    })
    return
  }
  await updateDoc(doc(db(), COLLECTIONS.vendors, id), { status, updatedAt: serverTimestamp() })
}

export async function setVendorTier(id: string, tier: TierId, months = 1): Promise<void> {
  const endsAt = tier === 'free' ? null : Date.now() + months * 30 * 86_400_000
  if (isDemoMode) {
    demoStore.update((state) => {
      const v = state.vendors.find((x) => x.id === id)
      if (v) {
        v.tier = tier
        v.subscriptionEndsAt = endsAt
        v.updatedAt = Date.now()
      }
    })
    return
  }
  await updateDoc(doc(db(), COLLECTIONS.vendors, id), {
    tier,
    subscriptionEndsAt: endsAt,
    updatedAt: serverTimestamp(),
  })
}

export async function setVendorVerified(id: string, verified: boolean): Promise<void> {
  if (isDemoMode) {
    demoStore.update((state) => {
      const v = state.vendors.find((x) => x.id === id)
      if (v) v.verified = verified
    })
    return
  }
  await updateDoc(doc(db(), COLLECTIONS.vendors, id), { verified })
}

/** Fire-and-forget: a failed view count must never break the page. */
export async function recordView(vendor: Vendor): Promise<void> {
  try {
    if (isDemoMode) {
      demoStore.update((state) => {
        const v = state.vendors.find((x) => x.id === vendor.id)
        if (v) v.views += 1
      })
      return
    }
    await setDoc(
      doc(db(), COLLECTIONS.vendors, vendor.id),
      { views: increment(1) },
      { merge: true },
    )
  } catch {
    /* ignore */
  }
}
