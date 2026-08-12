import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getStorage, type FirebaseStorage } from 'firebase/storage'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * Demo mode: with no Firebase project wired up the whole site still runs off
 * the seed data in src/data. That keeps the first Netlify deploy meaningful
 * and lets you show the site to suppliers before paying for anything.
 */
export const isDemoMode = !config.apiKey || !config.projectId

let app: FirebaseApp | null = null
let authInstance: Auth | null = null
let dbInstance: Firestore | null = null
let storageInstance: FirebaseStorage | null = null

function ensureApp(): FirebaseApp {
  if (!app) {
    if (isDemoMode) throw new Error('Firebase is not configured (running in demo mode).')
    app = initializeApp(config)
  }
  return app
}

export function auth(): Auth {
  if (!authInstance) authInstance = getAuth(ensureApp())
  return authInstance
}

export function db(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(ensureApp())
  return dbInstance
}

export function storage(): FirebaseStorage {
  if (!storageInstance) storageInstance = getStorage(ensureApp())
  return storageInstance
}

export const COLLECTIONS = {
  vendors: 'vendors',
  slugs: 'slugs',
  enquiries: 'enquiries',
  users: 'users',
  payments: 'payments',
} as const

export const SITE = {
  url: import.meta.env.VITE_SITE_URL || 'https://www.thefunctionhubsa.co.za',
  email: import.meta.env.VITE_CONTACT_EMAIL || 'hello@thefunctionhubsa.co.za',
  phone: import.meta.env.VITE_CONTACT_PHONE || '+27 00 000 0000',
  whatsapp: import.meta.env.VITE_WHATSAPP || '',
  payfastEnabled: import.meta.env.VITE_PAYFAST_ENABLED === 'true',
}
