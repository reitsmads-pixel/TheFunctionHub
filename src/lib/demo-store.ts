import { SEED_VENDORS } from '../data/seed-vendors'
import type { AppUser, Enquiry, Vendor } from './types'

/**
 * localStorage-backed stand-in for Firestore, used when no Firebase project is
 * configured. It exists so the entire flow — sign up, create a listing, submit
 * an enquiry, approve it in admin — can be demonstrated on a static deploy.
 *
 * Nothing here is secure or shared between devices. It is a showroom, not a
 * database; the moment you add Firebase env vars the app switches over.
 */

const KEY = 'tfh.demo.v1'

interface DemoState {
  vendors: Vendor[]
  enquiries: Enquiry[]
  users: AppUser[]
  currentUid: string | null
}

function seedState(): DemoState {
  return { vendors: [...SEED_VENDORS], enquiries: [], users: [], currentUid: null }
}

function read(): DemoState {
  if (typeof localStorage === 'undefined') return seedState()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seedState()
    const parsed = JSON.parse(raw) as Partial<DemoState>
    return {
      vendors: parsed.vendors?.length ? parsed.vendors : [...SEED_VENDORS],
      enquiries: parsed.enquiries ?? [],
      users: parsed.users ?? [],
      currentUid: parsed.currentUid ?? null,
    }
  } catch {
    return seedState()
  }
}

function write(state: DemoState): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* quota or private mode — demo data simply will not persist */
  }
  listeners.forEach((fn) => fn())
}

const listeners = new Set<() => void>()

export const demoStore = {
  subscribe(fn: () => void): () => void {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  state: read,
  update(mutate: (state: DemoState) => void): DemoState {
    const state = read()
    mutate(state)
    write(state)
    return state
  },
  reset(): void {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY)
    listeners.forEach((fn) => fn())
  },
}

export function demoId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}
