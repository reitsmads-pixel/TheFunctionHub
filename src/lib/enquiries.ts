import {
  addDoc,
  collection,
  doc,
  getDocs,
  increment,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { COLLECTIONS, db, isDemoMode } from './firebase'
import { demoId, demoStore } from './demo-store'
import type { Enquiry, Vendor } from './types'

export interface EnquiryInput {
  name: string
  email: string
  phone: string
  eventDate: string
  eventType: string
  guests: number | null
  message: string
}

export async function submitEnquiry(vendor: Vendor, input: EnquiryInput): Promise<void> {
  const base = {
    vendorId: vendor.id,
    vendorName: vendor.name,
    ...input,
    read: false,
  }

  if (isDemoMode) {
    demoStore.update((state) => {
      state.enquiries.unshift({ ...base, id: demoId('enq'), createdAt: Date.now() })
      const v = state.vendors.find((x) => x.id === vendor.id)
      if (v) v.enquiryCount += 1
    })
    return
  }

  await addDoc(collection(db(), COLLECTIONS.enquiries), {
    ...base,
    createdAt: serverTimestamp(),
  })
  // Best effort: the counter is a convenience for the dashboard, not a source
  // of truth, so a permission hiccup here must not fail the enquiry.
  try {
    await updateDoc(doc(db(), COLLECTIONS.vendors, vendor.id), { enquiryCount: increment(1) })
  } catch {
    /* ignore */
  }
}

export async function listEnquiriesForVendor(vendorId: string): Promise<Enquiry[]> {
  if (isDemoMode) {
    return demoStore
      .state()
      .enquiries.filter((e) => e.vendorId === vendorId)
      .sort((a, b) => b.createdAt - a.createdAt)
  }
  const snap = await getDocs(
    query(collection(db(), COLLECTIONS.enquiries), where('vendorId', '==', vendorId)),
  )
  return snap.docs
    .map((d) => {
      const data = d.data() as Partial<Enquiry> & { createdAt?: { toMillis?: () => number } }
      return {
        id: d.id,
        vendorId: data.vendorId ?? vendorId,
        vendorName: data.vendorName ?? '',
        name: data.name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        eventDate: data.eventDate ?? '',
        eventType: data.eventType ?? '',
        guests: data.guests ?? null,
        message: data.message ?? '',
        read: data.read ?? false,
        createdAt: data.createdAt?.toMillis?.() ?? 0,
      } as Enquiry
    })
    .sort((a, b) => b.createdAt - a.createdAt)
}

export async function markEnquiryRead(id: string, read = true): Promise<void> {
  if (isDemoMode) {
    demoStore.update((state) => {
      const e = state.enquiries.find((x) => x.id === id)
      if (e) e.read = read
    })
    return
  }
  await updateDoc(doc(db(), COLLECTIONS.enquiries, id), { read })
}
