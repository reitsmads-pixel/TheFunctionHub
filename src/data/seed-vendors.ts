import type { TierId, Vendor } from '../lib/types'
import { placeholderImage } from '../lib/placeholder'
import { photosFor } from './photos'

/**
 * Sample directory used in demo mode (no Firebase configured) and by
 * `npm run seed` to populate a real Firestore project. Replace with your own
 * suppliers once you start onboarding — nothing else in the app depends on
 * these particular records.
 */

interface Seed {
  name: string
  tagline: string
  description: string
  categories: string[]
  provinces: string[]
  town: string
  tier: TierId
  priceFrom: number | null
  priceNote?: string
  capacityMin?: number
  capacityMax?: number
  services: string[]
  rating: number
  reviewCount: number
  verified?: boolean
}

const SEEDS: Seed[] = [
  {
    name: 'Acacia Hill Estate',
    tagline: 'Garden weddings under old oaks, 40 minutes from Sandton',
    description:
      'A working estate turned function venue on the Magaliesberg foothills. We host garden ceremonies for up to 250 guests, with a covered barn for the reception and eight on-site guest suites. Our team handles setup, tear-down and parking so your coordinator can focus on the day itself. Weekday rates are roughly 30% lower than Saturdays.',
    categories: ['venues', 'marquees'],
    provinces: ['Gauteng', 'North West'],
    town: 'Hartbeespoort',
    tier: 'premium',
    priceFrom: 28000,
    priceNote: 'venue hire only, Saturday peak season',
    capacityMin: 60,
    capacityMax: 250,
    services: ['Garden ceremony site', 'Covered reception barn', 'On-site accommodation', 'Bridal suite', 'Ample parking', 'Load-shedding backup'],
    rating: 4.8,
    reviewCount: 64,
    verified: true,
  },
  {
    name: 'Ubuntu Feast Catering',
    tagline: 'Plated fine dining and proper home cooking, done at scale',
    description:
      'Family-run kitchen in Soweto catering functions across Gauteng since 2009. We cook everything from a full seven-colours Sunday spread to plated three-course menus, and we do halaal and kosher-friendly menus on request. Tasting sessions run every second Saturday at our Diepkloof kitchen.',
    categories: ['catering', 'bar-services'],
    provinces: ['Gauteng'],
    town: 'Soweto, Johannesburg',
    tier: 'premium',
    priceFrom: 185,
    priceNote: 'per head, buffet, minimum 80 guests',
    services: ['Buffet and plated service', 'Traditional menus', 'Halaal options', 'Waitrons and crockery', 'Spit braai', 'Cash and mobile bar'],
    rating: 4.9,
    reviewCount: 112,
    verified: true,
  },
  {
    name: 'Lensa Studios',
    tagline: 'Documentary wedding photography, Cape Town and beyond',
    description:
      'Two-photographer team shooting relaxed, unposed coverage. Full-day packages include a second shooter, an online gallery within three weeks and print-ready files. We travel nationally — travel is quoted at cost, not marked up.',
    categories: ['photography', 'videography'],
    provinces: ['Western Cape', 'Eastern Cape'],
    town: 'Cape Town',
    tier: 'featured',
    priceFrom: 14500,
    priceNote: 'full-day coverage, two photographers',
    services: ['Full-day coverage', 'Second shooter', 'Engagement shoot', 'Online gallery', 'Printed album'],
    rating: 4.7,
    reviewCount: 38,
    verified: true,
  },
  {
    name: 'Royal Drapes & Hire',
    tagline: 'Draping, stretch tents, tables and everything in between',
    description:
      'Durban-based hire company with 1 200 chairs, 90 round tables and a full draping crew. We deliver anywhere in KZN and set up the day before at no extra charge for bookings over R15 000.',
    categories: ['decor-hire', 'marquees'],
    provinces: ['KwaZulu-Natal'],
    town: 'Durban',
    tier: 'featured',
    priceFrom: 6500,
    priceNote: 'typical 150-guest décor and hire package',
    services: ['Ceiling and wall draping', 'Tiffany and Chiavari chairs', 'Round and trestle tables', 'Linen and crockery', 'Stretch tents', 'Mood lighting'],
    rating: 4.5,
    reviewCount: 71,
  },
  {
    name: 'DJ Kagiso',
    tagline: 'Amapiano, house and the classics — read the room, every time',
    description:
      'Fifteen years behind the decks at weddings, corporate year-end functions and matric dances. Comes with own sound for up to 300 guests, plus MC service in English, Setswana and Sesotho.',
    categories: ['dj-entertainment'],
    provinces: ['Gauteng', 'North West', 'Free State'],
    town: 'Pretoria',
    tier: 'featured',
    priceFrom: 5500,
    priceNote: 'six hours including sound and lighting',
    services: ['DJ and MC', 'Sound for up to 300 guests', 'Dance-floor lighting', 'Wireless mics', 'Ceremony sound'],
    rating: 4.8,
    reviewCount: 93,
    verified: true,
  },
  {
    name: 'Sugar & Salt Bakery',
    tagline: 'Wedding cakes that survive a Highveld afternoon',
    description:
      'Small-batch bakery specialising in tiered cakes, dessert tables and personalised favours. Free tasting box for confirmed bookings.',
    categories: ['cakes-desserts'],
    provinces: ['Gauteng'],
    town: 'Centurion',
    tier: 'free',
    priceFrom: 1800,
    priceNote: 'two-tier cake',
    services: ['Tiered wedding cakes', 'Dessert tables', 'Cupcakes and favours'],
    rating: 4.6,
    reviewCount: 24,
  },
  {
    name: 'Karoo Long Table',
    tagline: 'Farm-style long-table dinners in the Klein Karoo',
    description:
      'An outdoor venue built around a 40-metre stone table, with the Swartberg as the backdrop. Best suited to intimate weddings and milestone birthdays of 30 to 120 people. Catering is in-house and seasonal.',
    categories: ['venues', 'catering'],
    provinces: ['Western Cape'],
    town: 'Prince Albert',
    tier: 'premium',
    priceFrom: 22000,
    priceNote: 'venue plus three-course dinner for 60',
    capacityMin: 30,
    capacityMax: 120,
    services: ['Outdoor long-table setting', 'In-house seasonal menu', 'Farm accommodation', 'Wine pairing', 'Wet-weather marquee'],
    rating: 4.9,
    reviewCount: 41,
    verified: true,
  },
  {
    name: 'Bloom Collective',
    tagline: 'Seasonal flowers, arches and installations',
    description:
      'Florists working out of the Joburg market at 4am so you get flowers that last the whole day. We do ceremony arches, aisle work, centrepieces and bouquets.',
    categories: ['flowers', 'decor-hire'],
    provinces: ['Gauteng'],
    town: 'Johannesburg',
    tier: 'featured',
    priceFrom: 4200,
    priceNote: 'bridal party flowers and six centrepieces',
    services: ['Bridal bouquets', 'Ceremony arches', 'Centrepieces', 'Hanging installations', 'Same-day setup'],
    rating: 4.7,
    reviewCount: 55,
  },
  {
    name: 'The Plan Room',
    tagline: 'Full planning and on-the-day coordination',
    description:
      'We manage budgets, supplier contracts and the run sheet so that nobody in your family has to work on the day. Coordination-only packages start eight weeks before the event.',
    categories: ['planners'],
    provinces: ['Gauteng', 'Western Cape', 'KwaZulu-Natal'],
    town: 'Johannesburg',
    tier: 'premium',
    priceFrom: 18000,
    priceNote: 'full planning; on-the-day coordination from R7 500',
    services: ['Full planning', 'On-the-day coordination', 'Budget management', 'Supplier sourcing', 'Run sheet and rehearsal'],
    rating: 4.8,
    reviewCount: 47,
    verified: true,
  },
  {
    name: 'Glow by Naledi',
    tagline: 'Bridal hair and make-up that photographs well',
    description:
      'Mobile bridal beauty team covering Gauteng. Trials in studio, wedding-day service at your venue. Products suit deeper skin tones and long, hot days.',
    categories: ['hair-makeup'],
    provinces: ['Gauteng'],
    town: 'Midrand',
    tier: 'free',
    priceFrom: 1650,
    priceNote: 'bride, hair and make-up',
    services: ['Bridal hair and make-up', 'Bridal party rates', 'Trials', 'Mobile service'],
    rating: 4.6,
    reviewCount: 31,
  },
  {
    name: 'Coastal Marquees',
    tagline: 'Stretch tents and frame marquees for the wind belt',
    description:
      'Engineered rigging for coastal conditions, with flooring, lining and sidewalls. We cover the Garden Route and Nelson Mandela Bay.',
    categories: ['marquees', 'decor-hire'],
    provinces: ['Eastern Cape', 'Western Cape'],
    town: 'Gqeberha',
    tier: 'featured',
    priceFrom: 9800,
    priceNote: '10m x 15m stretch tent with flooring',
    services: ['Stretch tents', 'Frame marquees', 'Flooring and carpeting', 'Lining and lighting', 'Wind-rated rigging'],
    rating: 4.4,
    reviewCount: 28,
  },
  {
    name: 'Motion & Mood Films',
    tagline: 'Highlight films you will actually rewatch',
    description:
      'Cinematic wedding films, five to eight minutes, delivered within six weeks. Optional full-ceremony edit and drone coverage where permitted.',
    categories: ['videography'],
    provinces: ['KwaZulu-Natal', 'Gauteng'],
    town: 'Umhlanga',
    tier: 'free',
    priceFrom: 11000,
    services: ['Highlight film', 'Full ceremony edit', 'Drone coverage', 'Audio capture'],
    rating: 4.5,
    reviewCount: 19,
  },
  {
    name: 'Shuttle SA',
    tagline: 'Guest transfers and late-night shuttles',
    description:
      'Licensed 22-seater and 13-seater shuttles with tracked vehicles and vetted drivers. Popular for out-of-town weddings where guests should not be driving home.',
    categories: ['transport'],
    provinces: ['Gauteng', 'Mpumalanga', 'Limpopo'],
    town: 'Kempton Park',
    tier: 'free',
    priceFrom: 3200,
    priceNote: 'one 22-seater, five hours',
    services: ['Guest shuttles', 'Airport transfers', 'Late-night runs', 'Luxury car for the couple'],
    rating: 4.3,
    reviewCount: 22,
  },
  {
    name: 'The Mobile Bar Co.',
    tagline: 'Copper bars, cocktails and a barista cart',
    description:
      'Bar setup, mixologists, glassware and ice — you supply the alcohol or we quote on it. Also do a morning coffee cart for getting-ready shots.',
    categories: ['bar-services'],
    provinces: ['Western Cape'],
    town: 'Stellenbosch',
    tier: 'featured',
    priceFrom: 5900,
    priceNote: 'bar, two bartenders, glassware, five hours',
    services: ['Mobile bar', 'Mixologists', 'Glassware and ice', 'Barista cart', 'Signature cocktails'],
    rating: 4.7,
    reviewCount: 44,
  },
  {
    name: 'Paper & Pine',
    tagline: 'Invitations, signage and the small printed things',
    description:
      'Design and print for invites, menus, seating charts and welcome boards. Digital invites included free with any print order.',
    categories: ['stationery'],
    provinces: ['Gauteng', 'Free State'],
    town: 'Bloemfontein',
    tier: 'free',
    priceFrom: 28,
    priceNote: 'per printed invitation, 100 minimum',
    services: ['Invitations', 'Menus and place cards', 'Seating charts', 'Welcome signage', 'Digital invites'],
    rating: 4.4,
    reviewCount: 16,
  },
  {
    name: 'Jump & Jive Kids',
    tagline: 'Castles, face painting and someone else to run the games',
    description:
      'Kids party packages with jumping castles, entertainers and a party host who keeps twenty children busy for three hours.',
    categories: ['kids-parties', 'dj-entertainment'],
    provinces: ['KwaZulu-Natal'],
    town: 'Pinetown',
    tier: 'free',
    priceFrom: 1900,
    priceNote: 'castle, host and face painting, three hours',
    services: ['Jumping castles', 'Face painting', 'Party host', 'Themed décor'],
    rating: 4.5,
    reviewCount: 37,
  },
  {
    name: 'Modiehi Traditional Attire',
    tagline: 'Made-to-measure traditional and modern wedding attire',
    description:
      'Seshweshwe, Xhosa and Zulu traditional outfits alongside modern suits and dresses. Six-week lead time; rush orders possible at a surcharge.',
    categories: ['attire'],
    provinces: ['Free State', 'Gauteng'],
    town: 'Welkom',
    tier: 'featured',
    priceFrom: 2400,
    priceNote: 'per made-to-measure outfit',
    services: ['Traditional attire', 'Modern suits', 'Bridal party outfits', 'Alterations', 'Hire options'],
    rating: 4.6,
    reviewCount: 29,
  },
  {
    name: 'Vaal River Lodge',
    tagline: 'Riverside functions with accommodation on site',
    description:
      'Conference and function venue on the Vaal with two halls, a deck over the water and 24 rooms. Popular for corporate year-end functions and 21sts.',
    categories: ['venues'],
    provinces: ['Gauteng', 'Free State'],
    town: 'Vanderbijlpark',
    tier: 'free',
    priceFrom: 12000,
    priceNote: 'main hall hire, full day',
    capacityMin: 40,
    capacityMax: 400,
    services: ['Two function halls', 'Riverside deck', '24 rooms on site', 'Conference equipment', 'In-house catering'],
    rating: 4.2,
    reviewCount: 58,
  },
]

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const BASE_TIME = Date.UTC(2025, 0, 15)

export const SEED_VENDORS: Vendor[] = SEEDS.map((seed, index) => {
  const slug = slugify(seed.name)
  const imageCount = seed.tier === 'premium' ? 6 : seed.tier === 'featured' ? 4 : 1
  return {
    id: slug,
    slug,
    ownerId: `demo-owner-${index + 1}`,
    name: seed.name,
    tagline: seed.tagline,
    description: seed.description,
    categories: seed.categories,
    provinces: seed.provinces,
    town: seed.town,
    phone: `+27 ${11 + (index % 8)} ${100 + index} ${4000 + index * 7}`,
    email: `hello@${slug}.co.za`,
    website: `https://www.${slug}.co.za`,
    whatsapp: `27${82 + (index % 5)}${1000000 + index * 13}`,
    instagram: slug.replace(/-/g, ''),
    facebook: slug,
    // Real photographs win; otherwise fall back to the category drawing.
    images: photosFor(slug).length
      ? photosFor(slug)
      : Array.from({ length: imageCount }, (_, i) =>
          placeholderImage(`${slug}-${i}`, seed.categories[i % seed.categories.length]),
        ),
    videoUrl: '',
    priceFrom: seed.priceFrom,
    priceNote: seed.priceNote ?? '',
    capacityMin: seed.capacityMin ?? null,
    capacityMax: seed.capacityMax ?? null,
    services: seed.services,
    tier: seed.tier,
    status: 'published',
    verified: seed.verified ?? false,
    rating: seed.rating,
    reviewCount: seed.reviewCount,
    createdAt: BASE_TIME + index * 86_400_000,
    updatedAt: BASE_TIME + index * 86_400_000,
    subscriptionEndsAt: seed.tier === 'free' ? null : BASE_TIME + 365 * 86_400_000,
    views: 400 + index * 137,
    enquiryCount: 3 + (index % 11),
  }
})
