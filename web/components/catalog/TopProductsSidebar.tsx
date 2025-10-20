/**
 * TOP 5 Products Sidebar
 * Liste classée avec ranking (comme Image 3)
 */

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { TrendingUp, Heart, Eye } from 'lucide-react'

export interface TopProduct {
  id: string
  title: string
  brand?: string
  category?: string
  season?: string
  imageUrl: string
  price: number
  likes: number
  views: number
}

export interface TopProductsSidebarProps {
  products: TopProduct[]
  className?: string
}

export default function TopProductsSidebar({ products, className = '' }: TopProductsSidebarProps) {
  const topProducts = products.slice(0, 5)

  return (
    <div className={`top-products-sidebar ${className}`}>
      <div className="sidebar-header">
        <h2 className="sidebar-title">TOP 5</h2>
        <div className="sidebar-subtitle">Things</div>
      </div>

      <div className="tabs">
        <button className="tab active">Product Name</button>
        <button className="tab">Resale</button>
        <button className="tab">New</button>
      </div>

      <div className="products-list">
        {topProducts.map((product, index) => (
          <Link
            key={product.id}
            href={`/catalog/${product.id}`}
            className="product-item"
          >
            <div className="product-rank">{index + 1}</div>
            
            <div className="product-image-wrapper">
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                className="product-image"
                sizes="80px"
              />
            </div>

            <div className="product-info">
              {product.brand && (
                <div className="product-brand">{product.brand}</div>
              )}
              <div className="product-title">{product.title}</div>
              <div className="product-meta">
                {product.category} • {product.season}
              </div>
              <div className="product-stats-row">
                <div className="product-stat">
                  <Heart size={12} />
                  <span>{product.likes}</span>
                </div>
                <div className="product-stat">
                  <Eye size={12} />
                  <span>{product.views}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        .top-products-sidebar {
          background: white;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 100px;
        }

        .sidebar-header {
          margin-bottom: 20px;
        }

        .sidebar-title {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
          line-height: 1;
        }

        .sidebar-subtitle {
          font-size: 18px;
          font-weight: 600;
          color: #6B7280;
          margin-top: 4px;
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .tab {
          flex: 1;
          padding: 8px 12px;
          background: #F9FAFB;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .tab:hover {
          background: #F3F4F6;
          color: #374151;
        }

        .tab.active {
          background: #3B82F6;
          color: white;
        }

        .products-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .product-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: #F9FAFB;
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
        }

        .product-item:hover {
          background: #F3F4F6;
          transform: translateX(4px);
        }

        .product-rank {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(255, 152, 0, 0.3);
        }

        .product-image-wrapper {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          background: #E5E7EB;
          flex-shrink: 0;
        }

        .product-image {
          object-fit: cover;
        }

        .product-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .product-brand {
          font-size: 10px;
          font-weight: 600;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .product-title {
          font-size: 13px;
          font-weight: 600;
          color: #111827;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-meta {
          font-size: 11px;
          color: #9CA3AF;
        }

        .product-stats-row {
          display: flex;
          gap: 12px;
          margin-top: 4px;
        }

        .product-stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          color: #9CA3AF;
        }

        @media (max-width: 1024px) {
          .top-products-sidebar {
            position: relative;
            top: 0;
          }
        }
      `}</style>
    </div>
  )
}
