import type { Category } from '../lib/types'

export const CATEGORIES: Category[] = [
  { slug: 'venues', name: 'Venues', blurb: 'Halls, farms, lodges, gardens and hotels', icon: '🏛️' },
  { slug: 'catering', name: 'Catering', blurb: 'Plated, buffet, braai, spit and canapés', icon: '🍽️' },
  { slug: 'decor-hire', name: 'Décor & Hire', blurb: 'Draping, tables, linen, crockery, lighting', icon: '🎀' },
  { slug: 'photography', name: 'Photography', blurb: 'Photographers and content creators', icon: '📷' },
  { slug: 'videography', name: 'Videography', blurb: 'Highlight films and full-day coverage', icon: '🎬' },
  { slug: 'dj-entertainment', name: 'DJs & Entertainment', blurb: 'DJs, bands, MCs, dancers, sound', icon: '🎧' },
  { slug: 'cakes-desserts', name: 'Cakes & Desserts', blurb: 'Wedding cakes, dessert tables, treats', icon: '🎂' },
  { slug: 'flowers', name: 'Flowers', blurb: 'Bouquets, arches, centrepieces', icon: '💐' },
  { slug: 'planners', name: 'Planners & Coordinators', blurb: 'Full planning and on-the-day coordination', icon: '📋' },
  { slug: 'hair-makeup', name: 'Hair & Make-up', blurb: 'Bridal beauty and grooming', icon: '💄' },
  { slug: 'attire', name: 'Attire & Suits', blurb: 'Dresses, suits, traditional attire, hire', icon: '👗' },
  { slug: 'transport', name: 'Transport', blurb: 'Shuttles, luxury cars, guest transfers', icon: '🚐' },
  { slug: 'marquees', name: 'Marquees & Tents', blurb: 'Stretch tents, frame marquees, flooring', icon: '⛺' },
  { slug: 'bar-services', name: 'Bar Services', blurb: 'Mobile bars, mixologists, barista carts', icon: '🍸' },
  { slug: 'stationery', name: 'Stationery & Gifts', blurb: 'Invites, signage, favours', icon: '✉️' },
  { slug: 'kids-parties', name: 'Kids Parties', blurb: 'Jumping castles, face painting, entertainers', icon: '🎈' },
]

export const CATEGORY_BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]))

export function categoryName(slug: string): string {
  return CATEGORY_BY_SLUG.get(slug)?.name ?? slug
}

export const PROVINCES = [
  'Gauteng',
  'Western Cape',
  'KwaZulu-Natal',
  'Eastern Cape',
  'Free State',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
] as const

export type Province = (typeof PROVINCES)[number]

export const EVENT_TYPES = [
  'Wedding',
  'Traditional wedding / Lobola',
  'Birthday party',
  'Corporate function',
  'Year-end function',
  'Matric dance',
  'Baby shower',
  'Funeral / Memorial',
  'Church event',
  'Other',
]

export const BUDGET_BANDS = [
  { id: 'any', label: 'Any budget', max: Infinity },
  { id: 'under-5k', label: 'Under R5 000', max: 5000 },
  { id: 'under-15k', label: 'Under R15 000', max: 15000 },
  { id: 'under-30k', label: 'Under R30 000', max: 30000 },
  { id: 'under-75k', label: 'Under R75 000', max: 75000 },
]
