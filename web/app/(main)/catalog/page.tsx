/**
 * Page Catalogue / Marketplace
 * Design basé sur Image 3 - TOP PRODUCTS ON THE MARKETPLACE
 */

'use client'

import { useState } from 'react'
import ProductCard from '@/components/ui/ProductCard'
import TopProductsSidebar from '@/components/catalog/TopProductsSidebar'
// Utiliser les données mockées pour tester le frontend
import { useActiveAuctions } from '@/lib/hooks/useAuction.mock'
// import { useActiveAuctions } from '@/lib/hooks/useAuction' // Version avec Supabase

export default function CatalogPage() {
  const { auctions, loading, error } = useActiveAuctions()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Transformer auctions en produits
  const products = auctions.map(auction => ({
    id: auction.id,
    title: auction.lot?.title || '',
    brand: auction.lot?.category_id || '',
    category: auction.lot?.category_id || 'Autre',
    season: 'Été 2025',
    imageUrl: auction.lot?.images?.[0]?.image_url || '/placeholder-lot.jpg',
    price: auction.current_price,
    likes: Math.floor(Math.random() * 500), // TODO: Implémenter vraies likes
    views: auction.views_count || 0
  }))

  // Top 5 produits (par vues)
  const topProducts = [...products]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)

  // Catégories avec icons
  const categories = [
    { id: 'all', name: 'All goods', icon: '📦' },
    { id: 'art', name: 'Art', icon: '🎨' },
    { id: 'jewelry', name: 'Jewelry', icon: '💍' },
    { id: 'bags', name: 'Bags', icon: '👜' },
    { id: 'watch', name: 'Watch', icon: '⌚' },
    { id: 'clothes', name: 'Clothes', icon: '👔' },
    { id: 'shoes', name: 'Shoes', icon: '👟' }
  ]

  // Filtrer les produits
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category === selectedCategory)

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement du catalogue...</p>
      </div>
    )
  }

  return (
    <div className="catalog-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <span className="hero-badge">TOP best products</span>
            <h1 className="hero-title">
              TOP PRODUCTS<br />
              <span className="hero-title-accent">ON THE MARKETPLACE</span>
            </h1>
          </div>

          <div className="hero-annotations">
            <div className="annotation annotation-left">
              <p>Nous affichons les prix moyens et actuels en dynamique</p>
            </div>
            <div className="annotation annotation-right">
              <p>Nous affichons les prix moyens et actuels en dynamique</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-section">
        <div className="container">
          <div className="catalog-layout">
            {/* Sidebar - TOP 5 */}
            <aside className="sidebar-column">
              <TopProductsSidebar products={topProducts} />
            </aside>

            {/* Main Content */}
            <div className="content-column">
              {/* Category Filters */}
              <div className="category-section">
                <h2 className="category-title">
                  TOP things: <span className="category-subtitle">By category</span>
                </h2>
                <div className="category-filters">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`category-filter ${selectedCategory === cat.id ? 'active' : ''}`}
                    >
                      <span className="category-icon">{cat.icon}</span>
                      <span className="category-name">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Grid */}
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    brand={product.brand}
                    category={product.category}
                    season={product.season}
                    imageUrl={product.imageUrl}
                    price={product.price}
                    likes={product.likes}
                    views={product.views}
                  />
                ))}
              </div>

              {/* Empty State */}
              {filteredProducts.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📦</div>
                  <h3 className="empty-title">Aucun produit trouvé</h3>
                  <p className="empty-description">
                    Essayez de sélectionner une autre catégorie
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .catalog-page {
          min-height: 100vh;
          background: #F9FAFB;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
          padding: 80px 0 60px;
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          max-width: 800px;
          text-align: center;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }

        .hero-badge {
          display: inline-block;
          padding: 8px 20px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          color: white;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
          backdrop-filter: blur(10px);
        }

        .hero-title {
          font-size: clamp(36px, 8vw, 64px);
          font-weight: 700;
          color: white;
          line-height: 1.1;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: -0.02em;
        }

        .hero-title-accent {
          display: block;
          background: linear-gradient(90deg, white 0%, rgba(255, 255, 255, 0.8) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-annotations {
          position: relative;
          margin-top: 40px;
        }

        .annotation {
          position: absolute;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          font-size: 14px;
          color: #374151;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 280px;
        }

        .annotation-left {
          left: 20px;
          top: -20px;
        }

        .annotation-right {
          right: 20px;
          top: -20px;
        }

        @media (max-width: 768px) {
          .annotation {
            display: none;
          }
        }

        /* Main Section */
        .main-section {
          padding: 48px 0 80px;
        }

        .catalog-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .catalog-layout {
            grid-template-columns: 1fr;
          }

          .sidebar-column {
            order: 2;
          }

          .content-column {
            order: 1;
          }
        }

        /* Category Section */
        .category-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .category-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 20px;
        }

        .category-subtitle {
          font-weight: 500;
          color: #6B7280;
        }

        .category-filters {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .category-filter {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          background: #F9FAFB;
          border: 2px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
          font-weight: 500;
          color: #6B7280;
        }

        .category-filter:hover {
          background: #F3F4F6;
          color: #374151;
        }

        .category-filter.active {
          background: #3B82F6;
          border-color: #3B82F6;
          color: white;
        }

        .category-icon {
          font-size: 18px;
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        @media (max-width: 640px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 80px 20px;
          background: white;
          border-radius: 16px;
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

        /* Loading */
        .loading-container {
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
          border-top-color: #FF9800;
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
