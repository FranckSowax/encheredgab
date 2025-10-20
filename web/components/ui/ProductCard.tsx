/**
 * Product Card Component (pour catalogue)
 * Plus simple qu'AuctionCard, basé sur Image 3
 */

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Eye } from 'lucide-react'

export interface ProductCardProps {
  id: string
  title: string
  brand?: string
  category?: string
  season?: string
  imageUrl: string
  price: number
  likes?: number
  views?: number
  position?: number // Pour le ranking dans TOP 5
  isLiked?: boolean
  onLike?: () => void
  className?: string
}

export default function ProductCard({
  id,
  title,
  brand,
  category,
  season,
  imageUrl,
  price,
  likes = 0,
  views = 0,
  position,
  isLiked = false,
  onLike,
  className = ''
}: ProductCardProps) {
  return (
    <Link href={`/catalog/${id}`} className={`product-card ${className}`}>
      <div className="product-card__container">
        {/* Position badge (pour TOP 5) */}
        {position && (
          <div className="product-card__position">{position}</div>
        )}

        {/* Image */}
        <div className="product-card__image-wrapper">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="product-card__image"
            sizes="(max-width: 768px) 100vw, 300px"
          />

          {/* Stats overlay */}
          <div className="product-card__stats">
            <div className="product-card__stat">
              <Heart size={14} />
              <span>{likes}</span>
            </div>
            <div className="product-card__stat">
              <Eye size={14} />
              <span>{views}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="product-card__content">
          {/* Brand */}
          {brand && (
            <div className="product-card__brand">{brand}</div>
          )}

          {/* Title */}
          <h3 className="product-card__title">{title}</h3>

          {/* Meta */}
          <div className="product-card__meta">
            {category && <span className="product-card__category">{category}</span>}
            {season && <span className="product-card__season">• {season}</span>}
          </div>

          {/* Price */}
          <div className="product-card__price">
            {price.toLocaleString('fr-FR')} FCFA
          </div>
        </div>
      </div>

      <style jsx>{`
        .product-card {
          display: block;
          text-decoration: none;
          color: inherit;
        }

        .product-card__container {
          position: relative;
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .product-card:hover .product-card__container {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }

        /* Position badge (TOP 5) */
        .product-card__position {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          z-index: 2;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        /* Image */
        .product-card__image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background: #F3F4F6;
        }

        .product-card__image {
          object-fit: cover;
        }

        .product-card__stats {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
        }

        .product-card__stat {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          color: #6B7280;
        }

        /* Content */
        .product-card__content {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .product-card__brand {
          font-size: 11px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .product-card__title {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-card__meta {
          font-size: 12px;
          color: #9CA3AF;
        }

        .product-card__category {
          font-weight: 500;
        }

        .product-card__season {
          font-weight: 400;
        }

        .product-card__price {
          font-size: 16px;
          font-weight: 700;
          color: #3B82F6;
          margin-top: 4px;
        }
      `}</style>
    </Link>
  )
}
