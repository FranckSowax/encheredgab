/**
 * Page Mes Favoris
 */

'use client'

import AuctionCard from '@/components/ui/AuctionCard'

export default function FavoritesPage() {
  // TODO: Récupérer depuis API
  const favorites = [
    {
      id: '1',
      title: 'Rolex Submariner',
      category: 'Montres',
      season: 'Été 2025',
      imageUrl: '/placeholder-lot.jpg',
      startPrice: 5500000,
      currentPrice: 6200000,
      endDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      totalBids: 15,
      views: 342
    },
    {
      id: '2',
      title: 'Louis Vuitton Bag',
      category: 'Accessoires',
      season: 'Printemps 2025',
      imageUrl: '/placeholder-lot.jpg',
      startPrice: 850000,
      currentPrice: 920000,
      endDate: new Date(Date.now() + 86400000 * 1).toISOString(),
      totalBids: 8,
      views: 156
    }
  ]

  return (
    <div className="favorites-page">
      <div className="page-header">
        <h1 className="page-title">Mes Favoris</h1>
        <p className="page-description">
          {favorites.length} enchère{favorites.length > 1 ? 's' : ''} sauvegardée{favorites.length > 1 ? 's' : ''}
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="favorites-grid">
          {favorites.map(fav => (
            <AuctionCard
              key={fav.id}
              id={fav.id}
              title={fav.title}
              category={fav.category}
              season={fav.season}
              imageUrl={fav.imageUrl}
              startPrice={fav.startPrice}
              currentPrice={fav.currentPrice}
              endDate={fav.endDate}
              totalBids={fav.totalBids}
              views={fav.views}
              isLiked={true}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h3 className="empty-title">Aucun favori</h3>
          <p className="empty-description">
            Commencez à ajouter des enchères à vos favoris
          </p>
        </div>
      )}

      <style jsx>{`
        .favorites-page {
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

        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .empty-state {
          background: white;
          border-radius: 16px;
          padding: 80px 20px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .empty-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .empty-title {
          font-size: 24px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 12px;
        }

        .empty-description {
          font-size: 16px;
          color: #6B7280;
        }

        @media (max-width: 768px) {
          .favorites-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
