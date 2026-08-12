import { SITE, isDemoMode } from './firebase'
import { setVendorTier } from './vendors'
import type { TierId, Vendor } from './types'

export type Billing = 'monthly' | 'annual'

export interface CheckoutResult {
  /** 'redirected' means the browser is on its way to PayFast. */
  outcome: 'redirected' | 'simulated'
  note?: string
}

/**
 * Starts a subscription.
 *
 * With PayFast configured (VITE_PAYFAST_ENABLED plus the server-side merchant
 * keys) this asks the Netlify function to sign a payment request and posts the
 * browser to PayFast. The tier is only raised once PayFast's ITN webhook
 * confirms payment — never here, where the client could lie about it.
 *
 * Without PayFast configured the upgrade is applied locally so the flow can be
 * demonstrated end to end. That path is clearly labelled in the UI.
 */
export async function startCheckout(
  vendor: Vendor,
  tier: TierId,
  billing: Billing,
): Promise<CheckoutResult> {
  if (tier === 'free') {
    await setVendorTier(vendor.id, 'free')
    return { outcome: 'simulated', note: 'Moved to the free Basic plan.' }
  }

  if (!SITE.payfastEnabled || isDemoMode) {
    await setVendorTier(vendor.id, tier, billing === 'annual' ? 12 : 1)
    return {
      outcome: 'simulated',
      note: 'Payments are not switched on yet, so the plan was applied without charging anything.',
    }
  }

  const response = await fetch('/.netlify/functions/payfast-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vendorId: vendor.id,
      vendorName: vendor.name,
      email: vendor.email,
      tier,
      billing,
    }),
  })

  if (!response.ok) {
    throw new Error('Could not start the payment. Please try again or contact us.')
  }

  const { action, fields } = (await response.json()) as {
    action: string
    fields: Record<string, string>
  }

  // PayFast expects a form POST, not a redirect with a query string.
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = action
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = name
    input.value = value
    form.appendChild(input)
  })
  document.body.appendChild(form)
  form.submit()

  return { outcome: 'redirected' }
}
