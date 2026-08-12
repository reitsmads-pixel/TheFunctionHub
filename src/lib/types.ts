/** Listing tiers. The whole monetisation model hangs off this one union. */
export type TierId = 'free' | 'featured' | 'premium'

export type ListingStatus = 'draft' | 'pending' | 'published' | 'rejected' | 'suspended'

export type UserRole = 'vendor' | 'admin'

export interface Vendor {
  id: string
  slug: string
  /** Firebase Auth uid of the account that owns this listing. */
  ownerId: string
  name: string
  tagline: string
  description: string
  categories: string[]
  provinces: string[]
  town: string
  /** Contact details — gated behind the tier on the public page. */
  phone: string
  email: string
  website: string
  whatsapp: string
  instagram: string
  facebook: string
  /** Image URLs. How many of these render is capped per tier. */
  images: string[]
  videoUrl: string
  priceFrom: number | null
  priceNote: string
  capacityMin: number | null
  capacityMax: number | null
  services: string[]
  tier: TierId
  status: ListingStatus
  verified: boolean
  rating: number
  reviewCount: number
  /** ms since epoch — kept as numbers so demo mode and Firestore agree. */
  createdAt: number
  updatedAt: number
  /** Set when a paid tier was bought; null on free listings. */
  subscriptionEndsAt: number | null
  /** Counters used for the vendor's own dashboard stats. */
  views: number
  enquiryCount: number
}

export interface Enquiry {
  id: string
  vendorId: string
  vendorName: string
  name: string
  email: string
  phone: string
  eventDate: string
  eventType: string
  guests: number | null
  message: string
  createdAt: number
  read: boolean
}

export interface AppUser {
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: number
}

export interface Category {
  slug: string
  name: string
  /** Short line used beside the category name in the index. */
  blurb: string
}

export interface Tier {
  id: TierId
  name: string
  monthly: number
  annual: number
  tagline: string
  /** Sort weight — higher tiers float to the top of search results. */
  rank: number
  limits: {
    images: number
    categories: number
    provinces: number
    descriptionChars: number
    showContactDetails: boolean
    showWebsite: boolean
    showSocials: boolean
    video: boolean
    homepageSpot: boolean
    badge: string | null
    leadReports: boolean
  }
  features: string[]
}
