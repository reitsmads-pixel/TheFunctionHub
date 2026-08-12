import { signature, validateUrl } from './_payfast.mjs'

/**
 * PayFast ITN (Instant Transaction Notification) webhook.
 *
 * This is the only place a listing's paid tier is granted, and it is
 * deliberately paranoid: the payload must carry a valid signature, PayFast
 * itself must confirm the data, the merchant id must match ours, and the amount
 * must match the plan we expect. Only then is Firestore written, using the
 * Admin SDK, which bypasses the client security rules.
 *
 * Always return 200 — PayFast retries anything else, and a retry storm on a
 * payload we have already rejected helps nobody.
 */
export default async function handler(request) {
  if (request.method !== 'POST') return new Response('', { status: 200 })

  const raw = await request.text()
  const data = Object.fromEntries(new URLSearchParams(raw))

  try {
    if (!verifySignature(data)) {
      console.warn('payfast-notify: signature mismatch', data.m_payment_id)
      return new Response('', { status: 200 })
    }

    if (data.merchant_id !== process.env.PAYFAST_MERCHANT_ID) {
      console.warn('payfast-notify: merchant id mismatch')
      return new Response('', { status: 200 })
    }

    if (!(await confirmWithPayfast(raw))) {
      console.warn('payfast-notify: PayFast did not validate the payload')
      return new Response('', { status: 200 })
    }

    if (data.payment_status !== 'COMPLETE') {
      await recordPayment(data, 'ignored')
      return new Response('', { status: 200 })
    }

    const vendorId = data.custom_str1
    const tier = data.custom_str2
    const period = data.custom_str3 === 'annual' ? 'annual' : 'monthly'

    const expected = { featured: { monthly: 249, annual: 2490 }, premium: { monthly: 599, annual: 5990 } }
    const amount = Number(data.amount_gross ?? data.amount ?? 0)
    if (!vendorId || !expected[tier] || Math.abs(amount - expected[tier][period]) > 0.01) {
      console.warn('payfast-notify: amount or plan mismatch', { tier, period, amount })
      await recordPayment(data, 'mismatch')
      return new Response('', { status: 200 })
    }

    const months = period === 'annual' ? 12 : 1
    await grantTier(vendorId, tier, months)
    await recordPayment(data, 'applied')
  } catch (error) {
    console.error('payfast-notify failed', error)
  }

  return new Response('', { status: 200 })
}

function verifySignature(data) {
  const { signature: received, ...rest } = data
  return signature(rest, process.env.PAYFAST_PASSPHRASE) === received
}

async function confirmWithPayfast(raw) {
  const response = await fetch(validateUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: raw,
  })
  const text = (await response.text()).trim()
  return text === 'VALID'
}

/* -------------------------------------------------------------------------
   Firestore, via the Admin SDK
   ------------------------------------------------------------------------- */

let adminApp = null

async function firestore() {
  const { cert, getApps, initializeApp } = await import('firebase-admin/app')
  const { getFirestore } = await import('firebase-admin/firestore')

  if (!adminApp) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not set')
    const credentials = JSON.parse(raw)
    adminApp = getApps().length
      ? getApps()[0]
      : initializeApp({ credential: cert(credentials) })
  }
  return getFirestore(adminApp)
}

async function grantTier(vendorId, tier, months) {
  const db = await firestore()
  await db
    .collection('vendors')
    .doc(vendorId)
    .set(
      {
        tier,
        subscriptionEndsAt: Date.now() + months * 30 * 86_400_000,
        updatedAt: new Date(),
      },
      { merge: true },
    )
}

async function recordPayment(data, outcome) {
  try {
    const db = await firestore()
    await db.collection('payments').add({
      outcome,
      vendorId: data.custom_str1 ?? '',
      tier: data.custom_str2 ?? '',
      billing: data.custom_str3 ?? '',
      amount: Number(data.amount_gross ?? 0),
      paymentStatus: data.payment_status ?? '',
      pfPaymentId: data.pf_payment_id ?? '',
      mPaymentId: data.m_payment_id ?? '',
      email: data.email_address ?? '',
      receivedAt: new Date(),
    })
  } catch (error) {
    console.error('could not log payment', error)
  }
}
