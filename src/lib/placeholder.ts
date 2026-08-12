/**
 * Deterministic inline SVG placeholders.
 *
 * Demo mode ships without any real photography, and a directory full of broken
 * <img> tags looks worse than no images at all. These generate a stable
 * gradient per seed string, so the same vendor always gets the same artwork.
 */

const PALETTES: [string, string][] = [
  ['#1B1035', '#4A2B6B'],
  ['#2A1A12', '#8A5A32'],
  ['#10261F', '#2F6B54'],
  ['#241226', '#7A3B63'],
  ['#111B2E', '#2E4F7A'],
  ['#2B1A10', '#A8763C'],
  ['#1E1330', '#5C4B9B'],
  ['#291017', '#8C3E52'],
]

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
  const [from, to] = PALETTES[h % PALETTES.length]
  const angle = h % 90
  const text = escapeXml(label || initials(seed))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="g" gradientTransform="rotate(${angle})">
<stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
</linearGradient></defs>
<rect width="800" height="600" fill="url(#g)"/>
<circle cx="${120 + (h % 400)}" cy="${80 + (h % 200)}" r="180" fill="#ffffff" opacity="0.06"/>
<circle cx="${600 - (h % 300)}" cy="${520 - (h % 160)}" r="140" fill="#E4B95B" opacity="0.10"/>
<text x="400" y="322" text-anchor="middle" font-family="Georgia,serif" font-size="120" font-weight="600" fill="#ffffff" opacity="0.82">${text}</text>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/** Wider crop for hero / banner slots. */
export function placeholderBanner(seed: string): string {
  const h = hash(seed)
  const [from, to] = PALETTES[(h + 3) % PALETTES.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 700" preserveAspectRatio="xMidYMid slice">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
</linearGradient></defs>
<rect width="1600" height="700" fill="url(#g)"/>
<circle cx="${200 + (h % 900)}" cy="180" r="260" fill="#ffffff" opacity="0.05"/>
<circle cx="${1300 - (h % 500)}" cy="600" r="220" fill="#E4B95B" opacity="0.08"/>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
