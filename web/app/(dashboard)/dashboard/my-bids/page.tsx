/**
 * Page Mes Enchères
 */

'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, TrendingUp, Award, AlertCircle } from 'lucide-react'

export default function MyBidsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'won' | 'lost'>('active')

  // TODO: Récupérer depuis API
  const myBids = {
    active: [
      {
        id: '1',
        auctionId: 'auction-1',
        lotTitle: 'iPhone 13 Pro 128GB',
        lotImage: '/placeholder-lot.jpg',
        myBid: 450000,
        currentBid: 450000,
        startPrice: 380000,
        timeRemaining: '2h 15m',
        isLeading: true,
        totalBids: 8
      },
      {
        id: '2',
        auctionId: 'auction-2',
        lotTitle: 'MacBook Pro M2',
        lotImage: '/placeholder-lot.jpg',
        myBid: 820000,
        currentBid: 850000,
        startPrice: 750000,
        timeRemaining: '5h 30m',
        isLeading: false,
        totalBids: 12
      }
    ],
    won: [
      {
        id: '3',
        auctionId: 'auction-3',
        lotTitle: 'Samsung Galaxy S23',
        lotImage: '/placeholder-lot.jpg',
        myBid: 380000,
        finalPrice: 380000,
        wonDate: '2025-10-18',
        status: 'paid'
      }
    ],
    lost: [
      {
        id: '4',
        auctionId: 'auction-4',
        lotTitle: 'AirPods Pro',
        lotImage: '/placeholder-lot.jpg',
        myBid: 95000,
        finalPrice: 102000,
        lostDate: '2025-10-17'
      }
    ]
  }

  const renderActiveBids = () => (
    <div className="bids-grid">
      {myBids.active.map(bid => (
        <div key={bid.id} className="bid-card">
          <Link href={`/auctions/${bid.auctionId}`} className="bid-image-link">
            <div className="bid-image">
              <Image
                src={bid.lotImage}
                alt={bid.lotTitle}
                fill
                className="image"
              />
              {bid.isLeading && (
                <div className="leading-badge">
                  <Award size={14} />
                  <span>En tête</span>
                </div>
              )}
            </div>
          </Link>

          <div className="bid-content">
            <Link href={`/auctions/${bid.auctionId}`}>
              <h3 className="bid-title">{bid.lotTitle}</h3>
            </Link>

            <div className="bid-prices">
              <div className="price-row">
                <span className="price-label">Votre enchère</span>
                <span className="price-value my-bid">
                  {bid.myBid.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="price-row">
                <span className="price-label">Enchère actuelle</span>
                <span className={`price-value ${bid.isLeading ? 'leading' : 'outbid'}`}>
                  {bid.currentBid.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <div className="bid-meta">
              <div className="meta-item">
                <Clock size={14} />
                <span>{bid.timeRemaining}</span>
              </div>
              <div className="meta-item">
                <TrendingUp size={14} />
                <span>{bid.totalBids} enchères</span>
              </div>
            </div>

            {!bid.isLeading && (
              <Link href={`/auctions/${bid.auctionId}`} className="btn-bid-again">
                Surenchérir
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderWonBids = () => (
    <div className="bids-grid">
      {myBids.won.map(bid => (
        <div key={bid.id} className="bid-card won">
          <div className="won-badge">
            <Award size={16} />
            <span>Remportée</span>
          </div>

          <Link href={`/auctions/${bid.auctionId}`} className="bid-image-link">
            <div className="bid-image">
              <Image
                src={bid.lotImage}
                alt={bid.lotTitle}
                fill
                className="image"
              />
            </div>
          </Link>

          <div className="bid-content">
            <h3 className="bid-title">{bid.lotTitle}</h3>

            <div className="won-info">
              <div className="info-row">
                <span className="info-label">Prix final</span>
                <span className="info-value">
                  {bid.finalPrice.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Date</span>
                <span className="info-value">
                  {new Date(bid.wonDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>

            {bid.status === 'paid' ? (
              <div className="status-badge paid">
                ✓ Payé
              </div>
            ) : (
              <button className="btn-pay">
                Procéder au paiement
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderLostBids = () => (
    <div className="bids-grid">
      {myBids.lost.map(bid => (
        <div key={bid.id} className="bid-card lost">
          <Link href={`/auctions/${bid.auctionId}`} className="bid-image-link">
            <div className="bid-image">
              <Image
                src={bid.lotImage}
                alt={bid.lotTitle}
                fill
                className="image"
              />
            </div>
          </Link>

          <div className="bid-content">
            <h3 className="bid-title">{bid.lotTitle}</h3>

            <div className="lost-info">
              <div className="info-row">
                <span className="info-label">Votre enchère</span>
                <span className="info-value">
                  {bid.myBid.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Prix final</span>
                <span className="info-value final">
                  {bid.finalPrice.toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <div className="lost-badge">
              <AlertCircle size={14} />
              <span>Non remportée</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="my-bids-page">
      <div className="page-header">
        <h1 className="page-title">Mes Enchères</h1>
        <p className="page-description">
          Suivez toutes vos enchères actives, remportées et perdues
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab('active')}
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
        >
          Actives ({myBids.active.length})
        </button>
        <button
          onClick={() => setActiveTab('won')}
          className={`tab ${activeTab === 'won' ? 'active' : ''}`}
        >
          Remportées ({myBids.won.length})
        </button>
        <button
          onClick={() => setActiveTab('lost')}
          className={`tab ${activeTab === 'lost' ? 'active' : ''}`}
        >
          Perdues ({myBids.lost.length})
        </button>
      </div>

      {/* Content */}
      <div className="tab-content">
        {activeTab === 'active' && renderActiveBids()}
        {activeTab === 'won' && renderWonBids()}
        {activeTab === 'lost' && renderLostBids()}
      </div>

      <style jsx>{`
        .my-bids-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header {
          background: white;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .page-description {
          font-size: 15px;
          color: #6B7280;
        }

        .tabs {
          display: flex;
          gap: 8px;
          background: white;
          border-radius: 12px;
          padding: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .tab {
          flex: 1;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .tab:hover {
          background: #F3F4F6;
          color: #374151;
        }

        .tab.active {
          background: #3B82F6;
          color: white;
        }

        .tab-content {
          min-height: 400px;
        }

        .bids-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .bid-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
          position: relative;
        }

        .bid-card:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }

        .bid-card.won {
          border: 2px solid #4CAF50;
        }

        .bid-card.lost {
          opacity: 0.7;
        }

        .bid-image-link {
          display: block;
        }

        .bid-image {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background: #F3F4F6;
        }

        .image {
          object-fit: cover;
        }

        .leading-badge,
        .won-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: rgba(76, 175, 80, 0.95);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          color: white;
          font-size: 12px;
          font-weight: 600;
          z-index: 2;
        }

        .won-badge {
          position: static;
          margin: 12px;
          width: fit-content;
        }

        .bid-content {
          padding: 16px;
        }

        .bid-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 12px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .bid-title:hover {
          color: #3B82F6;
        }

        .bid-prices,
        .won-info,
        .lost-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          background: #F9FAFB;
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .price-row,
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .price-label,
        .info-label {
          font-size: 12px;
          color: #6B7280;
        }

        .price-value,
        .info-value {
          font-size: 14px;
          font-weight: 700;
        }

        .my-bid {
          color: #3B82F6;
        }

        .leading {
          color: #4CAF50;
        }

        .outbid {
          color: #EF4444;
        }

        .final {
          color: #111827;
        }

        .bid-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 12px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #6B7280;
        }

        .btn-bid-again,
        .btn-pay {
          width: 100%;
          padding: 12px;
          background: #3B82F6;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
          text-decoration: none;
          display: block;
        }

        .btn-bid-again:hover,
        .btn-pay:hover {
          background: #2563EB;
          transform: translateY(-1px);
        }

        .status-badge {
          text-align: center;
          padding: 10px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .status-badge.paid {
          background: rgba(76, 175, 80, 0.1);
          color: #4CAF50;
        }

        .lost-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 8px;
          color: #EF4444;
          font-size: 13px;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .bids-grid {
            grid-template-columns: 1fr;
          }

          .tabs {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  )
}
