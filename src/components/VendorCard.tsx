import { Link } from 'react-router-dom'
import type { Vendor } from '../lib/types'
import { categoryName } from '../data/taxonomy'
import { rands, truncate } from '../lib/format'
import { placeholderImage } from '../lib/placeholder'
import { tierOf } from '../lib/tiers'
import { Rating } from './ui'

export default function VendorCard({ vendor }: { vendor: Vendor }) {
  const cover = vendor.images[0] || placeholderImage(vendor.slug || vendor.name)
  const mark = tierOf(vendor.tier).limits.badge

  return (
    <article className="vendor-card">
      <div className="thumb">
        <img src={cover} alt="" loading="lazy" />
        {mark && (
          <span className={`mark${vendor.tier === 'premium' ? ' is-premium' : ''}`}>{mark}</span>
        )}
      </div>

      <div className="body">
        <p className="kicker">
          {categoryName(vendor.categories[0] ?? '')} — {vendor.town}
        </p>

        <h3>
          <Link to={`/supplier/${vendor.slug}`}>{vendor.name}</Link>
        </h3>

        <p className="tagline">{truncate(vendor.tagline || vendor.description, 96)}</p>

        <div className="foot">
          <span className="price">
            {vendor.priceFrom != null ? (
              <>
                From <strong>{rands(vendor.priceFrom)}</strong>
              </>
            ) : (
              <strong>Price on request</strong>
            )}
          </span>
          <Rating rating={vendor.rating} count={vendor.reviewCount} />
        </div>
      </div>
    </article>
  )
}
