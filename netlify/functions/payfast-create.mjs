import { FREQUENCY, PLAN_PRICES, processUrl, signature } from './_payfast.mjs'

/**
 * Builds a signed PayFast subscription request.
 *
 * The amount is looked up server-side from the plan id — the browser sends the
 * plan it wants, never a price, so a tampered request cannot buy Premium for
 * one rand. The tier itself is only granted later, by payfast-notify, once
 * PayFast confirms the payment.
 */
export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const {
    PAYFAST_MERCHANT_ID,
    PAYFAST_MERCHANT_KEY,
    PAYFAST_PASSPHRASE,
    PAYFAST_RETURN_URL,
    PAYFAST_CANCEL_URL,
  } = process.env

  if (!PAYFAST_MERCHANT_ID || !PAYFAST_MERCHANT_KEY) {
    return json({ error: 'PayFast is not configured on this site.' }, 501)
  }

  let body
  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid request body.' }, 400)
  }

  const { vendorId, vendorName, email, tier, billing } = body
  const period = billing === 'annual' ? 'annual' : 'monthly'
  const prices = PLAN_PRICES[tier]

  if (!vendorId || !prices) {
    return json({ error: 'Unknown plan.' }, 400)
  }

  const origin = new URL(request.url).origin
  const amount = prices[period].toFixed(2)

  // Field order matters: PayFast signs the string exactly as sent.
  const fields = {
    merchant_id: PAYFAST_MERCHANT_ID,
    merchant_key: PAYFAST_MERCHANT_KEY,
    return_url: PAYFAST_RETURN_URL || `${origin}/dashboard/billing?status=success`,
    cancel_url: PAYFAST_CANCEL_URL || `${origin}/dashboard/billing?status=cancelled`,
    notify_url: `${origin}/.netlify/functions/payfast-notify`,
    email_address: email || '',
    m_payment_id: `${vendorId}:${tier}:${period}:${Date.now()}`,
    amount,
    item_name: `The Function Hub SA — ${tier} listing (${period})`,
    item_description: `Directory listing for ${vendorName || vendorId}`,
    custom_str1: vendorId,
    custom_str2: tier,
    custom_str3: period,
    subscription_type: '1',
    recurring_amount: amount,
    frequency: String(FREQUENCY[period]),
    cycles: '0',
  }

  return json({
    action: processUrl(),
    fields: { ...fields, signature: signature(fields, PAYFAST_PASSPHRASE) },
  })
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
