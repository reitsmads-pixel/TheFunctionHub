import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { COLLECTIONS, auth, db, isDemoMode } from './firebase'
import { demoId, demoStore } from './demo-store'
import type { AppUser } from './types'

interface AuthValue {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthValue | null>(null)

/**
 * In demo mode any address starting with `admin@` gets the admin role, so the
 * moderation queue can be shown without a backend. With Firebase configured the
 * role comes from the user's document and is enforced by firestore.rules.
 */
function demoRole(email: string): AppUser['role'] {
  return email.toLowerCase().startsWith('admin@') ? 'admin' : 'vendor'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      const sync = () => {
        const state = demoStore.state()
        setUser(state.users.find((u) => u.uid === state.currentUid) ?? null)
        setLoading(false)
      }
      sync()
      return demoStore.subscribe(sync)
    }

    return onAuthStateChanged(auth(), async (fbUser) => {
      if (!fbUser) {
        setUser(null)
        setLoading(false)
        return
      }
      const ref = doc(db(), COLLECTIONS.users, fbUser.uid)
      const snap = await getDoc(ref)
      const profile: AppUser = snap.exists()
        ? {
            uid: fbUser.uid,
            email: fbUser.email ?? '',
            displayName: (snap.data().displayName as string) ?? fbUser.displayName ?? '',
            role: ((snap.data().role as AppUser['role']) ?? 'vendor'),
            createdAt: 0,
          }
        : { uid: fbUser.uid, email: fbUser.email ?? '', displayName: fbUser.displayName ?? '', role: 'vendor', createdAt: Date.now() }
      if (!snap.exists()) {
        await setDoc(ref, {
          email: profile.email,
          displayName: profile.displayName,
          role: 'vendor',
          createdAt: serverTimestamp(),
        })
      }
      setUser(profile)
      setLoading(false)
    })
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (isDemoMode) {
      const state = demoStore.state()
      const existing = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
      const account: AppUser = existing ?? {
        uid: demoId('user'),
        email,
        displayName: email.split('@')[0],
        role: demoRole(email),
        createdAt: Date.now(),
      }
      demoStore.update((s) => {
        if (!existing) s.users.push(account)
        s.currentUid = account.uid
      })
      return
    }
    await signInWithEmailAndPassword(auth(), email, password)
  }, [])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (isDemoMode) {
      const account: AppUser = {
        uid: demoId('user'),
        email,
        displayName: name,
        role: demoRole(email),
        createdAt: Date.now(),
      }
      demoStore.update((s) => {
        s.users.push(account)
        s.currentUid = account.uid
      })
      return
    }
    const cred = await createUserWithEmailAndPassword(auth(), email, password)
    await updateProfile(cred.user, { displayName: name })
    await setDoc(doc(db(), COLLECTIONS.users, cred.user.uid), {
      email,
      displayName: name,
      role: 'vendor',
      createdAt: serverTimestamp(),
    })
  }, [])

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      demoStore.update((s) => {
        s.currentUid = null
      })
      return
    }
    await fbSignOut(auth())
  }, [])

  const value = useMemo<AuthValue>(
    () => ({ user, loading, signIn, signUp, signOut, isAdmin: user?.role === 'admin' }),
    [user, loading, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
