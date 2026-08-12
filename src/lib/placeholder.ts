import { artFor } from './illustrations'

/**
 * Stand-in artwork for listings with no photograph yet.
 *
 * A warm neutral tone plus the category's line drawing. Deliberately quiet:
 * the moment a supplier uploads a real photograph this disappears, and the
 * photographs should be the only colour on a results page.
 */

const TONES = ['#efeae0', '#e8e2d7', '#e2dbcf', '#ece7dd', '#e5decf']

function hash(seed: string): number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/**
 * @param seed   anything stable for this listing — the slug is ideal, so the
 *               same supplier always gets the same tone.
 * @param category  category slug, which chooses the drawing.
 */
export function placeholderImage(seed: string, category = ''): string {
  const tone = TONES[hash(seed) % TONES.length]
  // The drawing is authored on a 64-unit grid; scale it to 280px and centre it
  // on the 800 x 1000 tile.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" preserveAspectRatio="xMidYMid slice">
<rect width="800" height="1000" fill="${tone}"/>
<g transform="translate(260 360) scale(4.375)" fill="none" stroke="#191512" stroke-opacity="0.3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${artFor(category)}</g>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
