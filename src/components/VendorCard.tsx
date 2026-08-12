import { Link } from 'react-router-dom'
import type { Vendor } from '../lib/types'
import { categoryName } from '../data/taxonomy'
import { rands, truncate } from '../lib/format'
import { placeholderImage } from '../lib/placeholder'
import { Stars, TierBadge, VerifiedBadge } from './ui'

export default function VendorCard({ vendor }: { vendor: Vendor }) {
  const cover = vendor.images[0] || placeholderImage(vendor.slug || vendor.name)
  return (
    <article className={`card vendor-card${vendor.tier === 'premium' ? ' is-premium' : ''}`}>
      <div className="thumb">
        <img src={cover} alt="" loading="lazy" />
        <div className="thumb-badges">
          <TierBadge tier={vendor.tier} />
          <VerifiedBadge verified={vendor.verified} />
        </div>
      </div>

      <div className="body">
        <div className="row" style={{ gap: '0.4rem' }}>
          <span className="badge badge-soft">{categoryName(vendor.categories[0] ?? '')}</span>
          <span className="tiny muted">
            {vendor.town}
            {vendor.provinces[0] ? `, ${vendor.provinces[0]}` : ''}
          </span>
        </div>

        <h3>
          <Link to={`/supplier/${vendor.slug}`}>{vendor.name}</Link>
        </h3>

        <p className="tagline">{truncate(vendor.tagline || vendor.description, 110)}</p>

        <div className="meta">
          <span className="price">
            {vendor.priceFrom != null ? (
              <>
                from <strong>{rands(vendor.priceFrom)}</strong>
              </>
            ) : (
              <strong>Price on request</strong>
            )}
          </span>
          <Stars rating={vendor.rating} count={vendor.reviewCount} />
        </div>
      </div>
    </article>
  )
}
