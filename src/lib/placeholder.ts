/**
 * Flat stand-in artwork for listings with no photograph yet.
 *
 * Deliberately plain: a warm neutral tone and a small monogram, so an empty
 * slot reads as "no photo yet" rather than as decoration. Suppliers' own
 * photographs are meant to be the only colour on a results page.
 */

const TONES = ['#efeae0', '#e7e1d5', '#ded7ca', '#e9e4dc', '#d9d2c5']

function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/** Two-letter monogram, e.g. "Kasi Cakes" -> "KC". */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function placeholderImage(seed: string, label = ''): string {
  const h = hash(seed)
  const tone = TONES[h % TONES.length]
  const text = escapeXml(label || initials(seed))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">
<rect width="800" height="1000" fill="${tone}"/>
<text x="400" y="530" text-anchor="middle" font-family="Georgia,serif" font-size="86" letter-spacing="6" fill="#191512" opacity="0.16">${text}</text>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
