/**
 * Auction Card Component
 * Basé sur le design des images fournies
 */

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Eye, Clock, TrendingUp } from 'lucide-react'
import { calculateTimeRemaining, formatTimeRemaining, type TimeRemaining } from '@/types/auction.types'

export interface AuctionCardProps {
  id: string
  title: string
  description?: string
  category?: string
  season?: string
  imageUrl: string
  startPrice: number
  currentPrice: number
  endDate: string
  totalBids: number
  views?: number
  isLiked?: boolean
  onLike?: () => void
  className?: string
}

export default function AuctionCard({
  id,
  title,
  description,
  category,
  season,
  imageUrl,
  startPrice,
  currentPrice,
  endDate,
  totalBids,
  views = 0,
  isLiked = false,
  onLike,
  className = ''
}: AuctionCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)
  const [liked, setLiked] = useState(isLiked)

  useEffect(() => {
    const updateTimer = () => {
      const remaining = calculateTimeRemaining(endDate)
      setTimeRemaining(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [endDate])

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    setLiked(!liked)
    onLike?.()
  }

  const priceIncrease = currentPrice - startPrice
  const priceIncreasePercent = ((priceIncrease / startPrice) * 100).toFixed(1)

  return (
    <Link href={`/auctions/${id}`} className={`auction-card ${className}`}>
      <div className="auction-card__container">
        {/* Image avec badges */}
        <div className="auction-card__image-wrapper">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="auction-card__image"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Timer badge - top left */}
          {timeRemaining && (
            <div className={`auction-card__timer ${timeRemaining.is_critical ? 'critical' : timeRemaining.is_ending_soon ? 'warning' : ''}`}>
              <Clock size={14} />
              <span>{formatTimeRemaining(timeRemaining)}</span>
            </div>
          )}

          {/* Actions - top right */}
          <div className="auction-card__actions">
            <button 
              onClick={handleLike}
              className={`auction-card__action-btn ${liked ? 'liked' : ''}`}
            >
              <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
            </button>
            {views > 0 && (
              <div className="auction-card__views">
                <Eye size={14} />
                <span>{views}</span>
              </div>
            )}
          </div>

          {/* Price increase badge - bottom left */}
          {priceIncrease > 0 && (
            <div className="auction-card__price-badge">
              <TrendingUp size={14} />
              <span>+{priceIncreasePercent}%</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="auction-card__content">
          {/* Category & Season */}
          {(category || season) && (
            <div className="auction-card__meta">
              {category && (
                <span className="auction-card__category">{category}</span>
              )}
              {season && (
                <span className="auction-card__season"> • {season}</span>
              )}
            </div>
          )}

          {/* Title */}
          <h3 className="auction-card__title">{title}</h3>
          
          {/* Description */}
          {description && (
            <p className="auction-card__description">{description}</p>
          )}

          {/* Prices */}
          <div className="auction-card__prices">
            <div className="auction-card__price-group">
              <span className="auction-card__price-label">Prix de départ</span>
              <span className="auction-card__price-start">
                {startPrice.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
            <div className="auction-card__price-group">
              <span className="auction-card__price-label">Enchère actuelle</span>
              <span className="auction-card__price-current">
                {currentPrice.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* Bids count */}
          {totalBids > 0 && (
            <div className="auction-card__bids">
              <span className="auction-card__bids-icon">🔥</span>
              <span>{totalBids} enchère{totalBids > 1 ? 's' : ''}</span>
            </div>
          )}

          {/* CTA Button */}
          <button className="auction-card__cta">
            Faire une offre
          </button>
        </div>
      </div>

      <style jsx>{`
        .auction-card {
          display: block;
          text-decoration: none;
          color: inherit;
        }

        .auction-card__container {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 580px;
          display: flex;
          flex-direction: column;
        }

        .auction-card:hover .auction-card__container {
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
          transform: translateY(-4px);
        }

        .auction-card__image-wrapper {
          position: relative;
          width: 100%;
          height: 280px;
          background: #F3F4F6;
        }

        .auction-card__image {
          object-fit: cover;
        }

        .auction-card__timer {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
        }

        .auction-card__timer.warning {
          background: rgba(251, 191, 36, 0.95);
          color: #92400E;
        }

        .auction-card__timer.critical {
          background: rgba(239, 68, 68, 0.95);
          color: white;
        }

        .auction-card__actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 8px;
        }

        .auction-card__action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          color: #6B7280;
        }

        .auction-card__action-btn:hover {
          background: white;
          transform: scale(1.1);
        }

        .auction-card__action-btn.liked {
          color: #EF4444;
        }

        .auction-card__views {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 16px;
          font-size: 12px;
          font-weight: 500;
          color: #6B7280;
        }

        .auction-card__price-badge {
          position: absolute;
          bottom: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: rgba(76, 175, 80, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
        }

        .auction-card__content {
          padding: 16px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .auction-card__meta {
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 8px;
        }

        .auction-card__category {
          font-weight: 600;
          color: #374151;
        }

        .auction-card__season {
          font-weight: 500;
        }

        .auction-card__title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 8px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .auction-card__description {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .auction-card__prices {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
          padding: 10px;
          background: #F9FAFB;
          border-radius: 8px;
        }

        .auction-card__price-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .auction-card__price-label {
          font-size: 11px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .auction-card__price-start {
          font-size: 12px;
          font-weight: 500;
          color: #374151;
          text-decoration: line-through;
          opacity: 0.7;
        }

        .auction-card__price-current {
          font-size: 14px;
          font-weight: 700;
          color: #3B82F6;
        }

        .auction-card__bids {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #F59E0B;
        }

        .auction-card__bids-icon {
          font-size: 16px;
        }

        .auction-card__cta {
          width: 100%;
          padding: 12px 24px;
          background: #3B82F6;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: auto;
        }

        .auction-card__cta:hover {
          background: #2563EB;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .auction-card__cta:active {
          transform: translateY(0);
        }
      `}</style>
    </Link>
  )
}
