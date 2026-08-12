/**
 * Photographs for the sample listings.
 *
 * Real suppliers upload their own photographs through the dashboard — this map
 * only covers the seeded demo directory, so the site can be shown with real
 * pictures before anyone has signed up.
 *
 * To use it:
 *   1. Drop image files into `public/img/suppliers/`
 *      (JPG or WebP, roughly 1200 × 1500, under ~300 KB each).
 *   2. Add them below, keyed by the listing's slug. First entry is the cover.
 *
 * Anything left out falls back to the category line drawing, so a partial list
 * is fine — add photographs as you get them.
 */
export const SUPPLIER_PHOTOS: Record<string, string[]> = {
  // 'acacia-hill-estate': [
  //   '/img/suppliers/acacia-hill-estate-1.jpg',
  //   '/img/suppliers/acacia-hill-estate-2.jpg',
  // ],
}

export function photosFor(slug: string): string[] {
  return SUPPLIER_PHOTOS[slug] ?? []
}
