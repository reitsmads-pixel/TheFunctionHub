const zar = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
})

export function rands(value: number | null | undefined): string {
  if (value == null) return 'On request'
  return zar.format(value).replace(/ /g, ' ')
}

export function shortDate(ms: number): string {
  if (!ms) return ''
  return new Date(ms).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return `${text.slice(0, max).trimEnd()}…`
}

/** Digits-only number suitable for a wa.me link. */
export function whatsappLink(number: string, message?: string): string {
  const digits = number.replace(/\D/g, '')
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${text}`
}

export function telLink(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, '')}`
}

export function externalUrl(url: string): string {
  if (!url) return ''
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}
