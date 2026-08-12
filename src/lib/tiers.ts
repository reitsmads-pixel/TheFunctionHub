import type { Tier, TierId } from './types'

/**
 * Listing tiers, in rands per month. Everything the site charges for is
 * expressed here — the UI reads limits off these objects rather than
 * hard-coding tier checks, so changing a plan is a one-file edit.
 */
export const TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Basic',
    monthly: 0,
    annual: 0,
    rank: 0,
    tagline: 'Get on the map. No card needed.',
    limits: {
      images: 1,
      categories: 1,
      provinces: 1,
      descriptionChars: 400,
      showContactDetails: false,
      showWebsite: false,
      showSocials: false,
      video: false,
      homepageSpot: false,
      badge: null,
      leadReports: false,
    },
    features: [
      'Listed in your main category',
      '1 cover photo',
      'Enquiries delivered to your inbox',
      'Shown below Featured and Premium suppliers',
      'Phone number and website hidden from the public page',
    ],
  },
  {
    id: 'featured',
    name: 'Featured',
    monthly: 249,
    annual: 2490,
    rank: 1,
    tagline: 'The plan most suppliers pick.',
    limits: {
      images: 10,
      categories: 3,
      provinces: 3,
      descriptionChars: 1500,
      showContactDetails: true,
      showWebsite: true,
      showSocials: true,
      video: false,
      homepageSpot: false,
      badge: 'Featured',
      leadReports: false,
    },
    features: [
      'Everything in Basic',
      'Priority placement above Basic listings',
      'Up to 10 photos in a gallery',
      'Phone, WhatsApp, email and website shown',
      'Listed in up to 3 categories and 3 provinces',
      'Featured badge on your card and page',
      'Instagram and Facebook links',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthly: 599,
    annual: 5990,
    rank: 2,
    tagline: 'Top of the page, every search.',
    limits: {
      images: 30,
      categories: 5,
      provinces: 9,
      descriptionChars: 4000,
      showContactDetails: true,
      showWebsite: true,
      showSocials: true,
      video: true,
      homepageSpot: true,
      badge: 'Premium',
      leadReports: true,
    },
    features: [
      'Everything in Featured',
      'Top placement in every search you appear in',
      'A rotating spot on the home page',
      'Up to 30 photos plus a video',
      'All 9 provinces, up to 5 categories',
      'Verified Premium badge',
      'Monthly lead report by email',
      'Priority support from our team',
    ],
  },
]

export const TIER_BY_ID: Record<TierId, Tier> = TIERS.reduce(
  (acc, tier) => ({ ...acc, [tier.id]: tier }),
  {} as Record<TierId, Tier>,
)

export function tierOf(id: TierId | undefined): Tier {
  return TIER_BY_ID[id ?? 'free'] ?? TIER_BY_ID.free
}

/** Annual price expressed as "pay for 10 months, get 12". */
export function annualSaving(tier: Tier): number {
  return tier.monthly * 12 - tier.annual
}
