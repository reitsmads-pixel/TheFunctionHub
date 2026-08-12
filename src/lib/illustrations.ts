/**
 * Line drawings, one per category, used when a listing has no photograph yet.
 *
 * They exist so a results page reads as deliberate rather than broken. They are
 * not meant to compete with the suppliers' own photographs — single-weight
 * strokes, no fill, low contrast — and they disappear the moment a real image
 * is added.
 *
 * Each entry is the inner markup of a 64 × 64 drawing.
 */
const ART: Record<string, string> = {
  venues: `<path d="M8 40 L32 17 L56 40"/><path d="M14 38v18"/><path d="M50 38v18"/><path d="M26 56V45a6 6 0 0 1 12 0v11"/>`,

  catering: `<path d="M13 44a19 19 0 0 1 38 0"/><path d="M7 44h50"/><path d="M32 25v-5"/>`,

  'decor-hire': `<path d="M8 15h48"/><path d="M15 15c0 15 4 21 4 39"/><path d="M49 15c0 15-4 21-4 39"/><path d="M15 23c8 9 26 9 34 0"/>`,

  photography: `<rect x="9" y="21" width="46" height="27" rx="3"/><circle cx="32" cy="34" r="9"/><path d="M23 21l4-6h10l4 6"/>`,

  videography: `<rect x="8" y="24" width="30" height="20" rx="2"/><path d="M38 30l16-7v22l-16-7z"/><circle cx="16" cy="17" r="5"/>`,

  'dj-entertainment': `<circle cx="30" cy="35" r="19"/><circle cx="30" cy="35" r="3.5"/><path d="M50 17L38 29"/>`,

  'cakes-desserts': `<path d="M16 53h32"/><path d="M19 53V42h26v11"/><path d="M24 42V31h16v11"/><path d="M32 31v-7"/><circle cx="32" cy="20" r="2.6"/>`,

  flowers: `<path d="M32 56V30"/><path d="M32 41L20 32"/><path d="M32 41l12-9"/><circle cx="32" cy="23" r="6"/><circle cx="19" cy="28" r="4.5"/><circle cx="45" cy="28" r="4.5"/>`,

  planners: `<rect x="15" y="15" width="34" height="41" rx="2"/><path d="M26 11h12v8H26z"/><path d="M23 30h18"/><path d="M23 38h18"/><path d="M23 46h11"/>`,

  'hair-makeup': `<circle cx="32" cy="23" r="13"/><circle cx="32" cy="23" r="8"/><path d="M32 36v12"/><rect x="27" y="48" width="10" height="9" rx="4"/>`,

  attire: `<path d="M32 24v-4a4 4 0 1 1 4 4"/><path d="M32 24L13 41h38z"/>`,

  transport: `<path d="M7 41V24h29l10 9h11v8"/><path d="M7 41h6"/><path d="M25 41h14"/><path d="M53 41h4"/><circle cx="19" cy="44" r="5"/><circle cx="46" cy="44" r="5"/>`,

  marquees: `<path d="M7 49L32 16l25 33"/><path d="M32 16v33"/><path d="M20 49l12-14 12 14"/>`,

  'bar-services': `<path d="M15 19h34L32 38z"/><path d="M32 38v14"/><path d="M22 52h20"/><path d="M44 24l6-8"/>`,

  stationery: `<rect x="9" y="19" width="46" height="29" rx="2"/><path d="M9 21l23 18 23-18"/>`,

  'kids-parties': `<ellipse cx="32" cy="25" rx="12" ry="14"/><path d="M29 39h6l-3 4z"/><path d="M32 43c5 6 0 8 0 13"/>`,
}

/** A neutral mark for categories without their own drawing. */
const FALLBACK = `<circle cx="32" cy="32" r="18"/><path d="M32 22v20"/><path d="M22 32h20"/>`

export function artFor(category: string): string {
  return ART[category] ?? FALLBACK
}
