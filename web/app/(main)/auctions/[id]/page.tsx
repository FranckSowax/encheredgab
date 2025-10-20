/**
 * Page Détail d'Enchère
 * Design basé sur Image 2 - FUNCTIONAL PRODUCT CARD
 */

'use client'

import { useState } from 'react'
import { use } from 'react'
import { Clock, Heart, Eye, TrendingUp, Package, Calendar, MapPin, User, MessageCircle } from 'lucide-react'
import ImageGallery from '@/components/ui/ImageGallery'
import PlaceBidModal from '@/components/modals/PlaceBidModal'
// Utiliser les données mockées pour tester le frontend
import { useAuction } from '@/lib/hooks/useAuction.mock'
// import { useAuction } from '@/lib/hooks/useAuction' // Version avec Supabase
import { formatTimeRemaining } from '@/types/auction.types'

export default function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { auction, bids, timeRemaining, placeBid, loading, error } = useAuction(id)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner"></div>
        <p>Chargement de l'enchère...</p>
      </div>
    )
  }

  if (error || !auction) {
    return (
      <div className="error-page">
        <h2>Enchère introuvable</h2>
        <p>{error || 'Cette enchère n\'existe pas ou a été supprimée.'}</p>
      </div>
    )
  }

  const images = auction.lot?.images?.map(img => ({
    url: img.image_url,
    alt: auction.lot?.title
  })) || [{ url: '/placeholder-lot.jpg', alt: auction.lot?.title }]

  const priceIncrease = auction.current_price - auction.starting_price
  const priceIncreasePercent = ((priceIncrease / auction.starting_price) * 100).toFixed(1)

  const handlePlaceBid = async (amount: number) => {
    await placeBid(amount)
  }

  return (
    <div className="auction-detail-page">
      <div className="container">
        <div className="detail-grid">
          {/* Left: Image Gallery */}
          <div className="gallery-section">
            <ImageGallery images={images} title={auction.lot?.title} />
          </div>

          {/* Right: Details */}
          <div className="details-section">
            {/* Title & Meta */}
            <div className="title-section">
              <div className="title-header">
                <h1 className="title">{auction.lot?.title}</h1>
                <button onClick={() => setIsLiked(!isLiked)} className="like-btn">
                  <Heart size={24} fill={isLiked ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="meta-row">
                <div className="meta-item">
                  <Eye size={16} />
                  <span>{auction.views_count || 0} vues</span>
                </div>
                <div className="meta-item">
                  <Package size={16} />
                  <span>{auction.lot?.category_id || 'Non catégorisé'}</span>
                </div>
              </div>
            </div>

            {/* Price Section */}
            <div className="price-section">
              <div className="price-group">
                <span className="price-label">Prix de départ</span>
                <span className="price-start">
                  {auction.starting_price.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="price-group main-price">
                <span className="price-label">Enchère actuelle</span>
                <span className="price-current">
                  {auction.current_price.toLocaleString('fr-FR')} FCFA
                </span>
                {priceIncrease > 0 && (
                  <div className="price-badge">
                    <TrendingUp size={14} />
                    <span>+{priceIncreasePercent}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Timer */}
            {timeRemaining && (
              <div className={`timer-section ${timeRemaining.is_critical ? 'critical' : timeRemaining.is_ending_soon ? 'warning' : ''}`}>
                <Clock size={20} />
                <div className="timer-content">
                  <span className="timer-label">Temps restant</span>
                  <span className="timer-value">{formatTimeRemaining(timeRemaining)}</span>
                </div>
              </div>
            )}

            {/* CTA Button */}
            <button onClick={() => setIsModalOpen(true)} className="cta-button">
              Placer une enchère
            </button>

            {/* Bids Count */}
            {auction.total_bids > 0 && (
              <div className="bids-count">
                🔥 {auction.total_bids} enchère{auction.total_bids > 1 ? 's' : ''} déjà placée{auction.total_bids > 1 ? 's' : ''}
              </div>
            )}

            {/* Description */}
            <div className="description-section">
              <h3 className="section-title">Description</h3>
              <p className="description-text">
                {auction.lot?.description || 'Aucune description disponible.'}
              </p>
            </div>

            {/* Details Table */}
            <div className="details-table">
              <h3 className="section-title">Informations</h3>
              <div className="details-grid-items">
                <div className="detail-row">
                  <span className="detail-label">État</span>
                  <span className="detail-value">{auction.lot?.condition_description || 'Non spécifié'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Poids estimé</span>
                  <span className="detail-value">{auction.lot?.estimated_weight_kg ? `${auction.lot.estimated_weight_kg} kg` : 'Non spécifié'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date de début</span>
                  <span className="detail-value">{new Date(auction.start_date).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Date de fin</span>
                  <span className="detail-value">{new Date(auction.end_date).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="support-section">
              <MessageCircle size={20} />
              <div>
                <h4>Des questions ?</h4>
                <p>Notre équipe est là pour vous aider</p>
              </div>
              <button className="support-btn">Contacter</button>
            </div>
          </div>
        </div>

        {/* Bid History */}
        {bids.length > 0 && (
          <div className="bids-history-section">
            <h2 className="section-title-main">Historique des enchères</h2>
            <div className="bids-table">
              {bids.map((bid, index) => (
                <div key={bid.id} className="bid-row">
                  <div className="bid-rank">#{index + 1}</div>
                  <div className="bid-user">
                    <User size={16} />
                    <span>Utilisateur {bid.user_id.substring(0, 8)}</span>
                  </div>
                  <div className="bid-amount">
                    {bid.amount.toLocaleString('fr-FR')} FCFA
                  </div>
                  <div className="bid-time">
                    {new Date(bid.created_at).toLocaleString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <PlaceBidModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handlePlaceBid}
        currentPrice={auction.current_price}
        minimumBid={(auction.minimum_bid_increment || auction.increment) + auction.current_price}
        lotTitle={auction.lot?.title || ''}
        lotImage={images[0]?.url}
      />

      <style jsx>{`
        .auction-detail-page {
          min-height: 100vh;
          background: #F9FAFB;
          padding: 40px 0 80px;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          margin-bottom: 60px;
        }
        
        @media (max-width: 1024px) {
          .detail-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
        
        .details-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        
        .title-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          gap: 16px;
        }
        
        .title {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          line-height: 1.3;
        }
        
        .like-btn {
          width: 48px;
          height: 48px;
          background: #F9FAFB;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #EF4444;
        }
        
        .like-btn:hover {
          background: #FEE2E2;
          border-color: #EF4444;
        }
        
        .meta-row {
          display: flex;
          gap: 20px;
          margin-top: 12px;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          color: #6B7280;
        }
        
        .price-section {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 24px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .price-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .main-price {
          position: relative;
        }
        
        .price-label {
          font-size: 12px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .price-start {
          font-size: 20px;
          font-weight: 600;
          color: #9CA3AF;
          text-decoration: line-through;
        }
        
        .price-current {
          font-size: 32px;
          font-weight: 700;
          color: #3B82F6;
        }
        
        .price-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: rgba(76, 175, 80, 0.1);
          border-radius: 12px;
          color: #4CAF50;
          font-size: 13px;
          font-weight: 600;
          margin-top: 8px;
        }
        
        .timer-section {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: white;
          border-radius: 12px;
          border: 2px solid #E5E7EB;
        }
        
        .timer-section.warning {
          background: #FEF3C7;
          border-color: #F59E0B;
        }
        
        .timer-section.critical {
          background: #FEE2E2;
          border-color: #EF4444;
        }
        
        .timer-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        
        .timer-label {
          font-size: 13px;
          color: #6B7280;
        }
        
        .timer-value {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }
        
        .cta-button {
          width: 100%;
          padding: 18px 32px;
          background: #3B82F6;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .cta-button:hover {
          background: #2563EB;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
        }
        
        .bids-count {
          text-align: center;
          font-size: 15px;
          font-weight: 600;
          color: #F59E0B;
        }
        
        .description-section, .details-table {
          padding: 24px;
          background: white;
          border-radius: 16px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 16px;
        }
        
        .description-text {
          font-size: 15px;
          color: #6B7280;
          line-height: 1.7;
        }
        
        .details-grid-items {
          display: grid;
          gap: 12px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #F3F4F6;
        }
        
        .detail-label {
          font-size: 14px;
          color: #6B7280;
        }
        
        .detail-value {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }
        
        .support-section {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: rgba(76, 175, 80, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(76, 175, 80, 0.2);
        }
        
        .support-section h4 {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }
        
        .support-section p {
          font-size: 13px;
          color: #6B7280;
        }
        
        .support-btn {
          margin-left: auto;
          padding: 10px 20px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        
        .bids-history-section {
          margin-top: 40px;
        }
        
        .section-title-main {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 24px;
        }
        
        .bids-table {
          background: white;
          border-radius: 16px;
          overflow: hidden;
        }
        
        .bid-row {
          display: grid;
          grid-template-columns: 60px 1fr auto auto;
          gap: 20px;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #F3F4F6;
        }
        
        .bid-rank {
          font-size: 14px;
          font-weight: 700;
          color: #6B7280;
        }
        
        .bid-user {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #374151;
        }
        
        .bid-amount {
          font-size: 16px;
          font-weight: 700;
          color: #3B82F6;
        }
        
        .bid-time {
          font-size: 13px;
          color: #9CA3AF;
        }
        
        .loading-page, .error-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 20px;
        }
        
        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #E5E7EB;
          border-top-color: #3B82F6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
