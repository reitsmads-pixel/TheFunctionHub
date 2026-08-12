import crypto from 'node:crypto'

/**
 * Shared PayFast helpers.
 *
 * PayFast signs the *exact* parameter string it receives, in the order the
 * fields appear, using its own flavour of URL encoding (spaces as `+`, hex
 * digits upper-case). Getting this wrong is the single most common cause of
 * "signature mismatch", so encoding lives in one place.
 */

export function pfEncode(value) {
  return encodeURIComponent(String(value))
    .replace(/%20/g, '+')
    .replace(/%[0-9a-f]{2}/g, (m) => m.toUpperCase())
}

export function paramString(fields, { skipEmpty = true } = {}) {
  return Object.entries(fields)
    .filter(([, v]) => (skipEmpty ? v !== '' && v != null : true))
    .map(([k, v]) => `${k}=${pfEncode(v)}`)
    .join('&')
}

export function signature(fields, passphrase) {
  let base = paramString(fields)
  if (passphrase) base += `&passphrase=${pfEncode(passphrase)}`
  return crypto.createHash('md5').update(base).digest('hex')
}

export const isSandbox = () => process.env.PAYFAST_SANDBOX !== 'false'

export const processUrl = () =>
  isSandbox()
    ? 'https://sandbox.payfast.co.za/eng/process'
    : 'https://www.payfast.co.za/eng/process'

export const validateUrl = () =>
  isSandbox()
    ? 'https://sandbox.payfast.co.za/eng/query/validate'
    : 'https://www.payfast.co.za/eng/query/validate'

/** PayFast recurring-billing frequency codes. */
export const FREQUENCY = { monthly: 3, annual: 6 }

/** Prices must match src/lib/tiers.ts — the client never sends an amount. */
export const PLAN_PRICES = {
  featured: { monthly: 249, annual: 2490 },
  premium: { monthly: 599, annual: 5990 },
}
