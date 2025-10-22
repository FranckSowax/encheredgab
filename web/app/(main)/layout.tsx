/**
 * Main Layout avec Navigation
 * Design basé sur les maquettes fournies
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Bell, User, Heart, ShoppingBag, Menu, X } from 'lucide-react'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Masquer le header sur la page d'accueil (elle a son propre header moderne)
  const showHeader = pathname !== '/'

  const navItems = [
    { href: '/', label: 'Enchères', icon: '🔨' },
    { href: '/catalog', label: 'Catalogue', icon: '📦' },
    { href: '/how-it-works', label: 'Comment ça marche', icon: '❓' },
    { href: '/about', label: 'À propos', icon: 'ℹ️' },
  ]

  return (
    <div className="main-layout">
      {/* Header - masqué sur la page d'accueil */}
      {showHeader && <header className="header">
        <div className="container header-container">
          {/* Logo */}
          <Link href="/" className="logo">
            <img
              src="/logo-douane.jpg"
              alt="Douane Gabon"
              className="h-24 w-auto object-contain"
            />
          </Link>

          {/* Search Bar - Desktop */}
          <div className="search-bar">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher un lot, une catégorie..."
              className="search-input"
            />
          </div>

          {/* Navigation - Desktop */}
          <nav className="nav-desktop">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-link ${pathname === item.href ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <button className="action-btn" aria-label="Notifications">
              <Bell size={20} />
              <span className="badge">3</span>
            </button>
            <button className="action-btn" aria-label="Favoris">
              <Heart size={20} />
            </button>
            <button className="action-btn" aria-label="Panier">
              <ShoppingBag size={20} />
              <span className="badge">2</span>
            </button>
            <Link href="/profile" className="profile-btn">
              <User size={20} />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Rechercher..."
                className="mobile-search-input"
              />
            </div>
            <nav className="mobile-nav">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobile-nav-link ${pathname === item.href ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="mobile-nav-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>}

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-grid">
            <div className="footer-column">
              <h4 className="footer-title">Douane Enchères</h4>
              <p className="footer-description">
                Plateforme officielle des ventes aux enchères de la douane gabonaise
              </p>
              <div className="footer-social">
                <a href="#" className="social-link">📘</a>
                <a href="#" className="social-link">📷</a>
                <a href="#" className="social-link">🐦</a>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Navigation</h4>
              <ul className="footer-links">
                <li><Link href="/auctions">Enchères actives</Link></li>
                <li><Link href="/catalog">Catalogue</Link></li>
                <li><Link href="/how-it-works">Comment ça marche</Link></li>
                <li><Link href="/faq">FAQ</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Légal</h4>
              <ul className="footer-links">
                <li><Link href="/terms">Conditions générales</Link></li>
                <li><Link href="/privacy">Politique de confidentialité</Link></li>
                <li><Link href="/cgv">CGV</Link></li>
                <li><Link href="/mentions">Mentions légales</Link></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Contact</h4>
              <ul className="footer-contacts">
                <li>📧 contact@douane-encheres.ga</li>
                <li>📞 +241 XX XX XX XX</li>
                <li>📍 Libreville, Gabon</li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p>&copy; 2025 Douane Enchères Gabon. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .main-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .header {
          background: white;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .header-container {
          display: flex;
          align-items: center;
          gap: 32px;
          padding: 16px 24px;
        }

        /* Logo */
        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
        }

        .logo-icon {
          font-size: 32px;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .logo-title {
          font-size: 20px;
          font-weight: 700;
          color: #111827;
        }

        .logo-subtitle {
          font-size: 12px;
          color: #6B7280;
        }

        /* Search */
        .search-bar {
          flex: 1;
          max-width: 500px;
          position: relative;
          display: none;
        }

        @media (min-width: 768px) {
          .search-bar {
            display: block;
          }
        }

        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #9CA3AF;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px 12px 48px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 14px;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Navigation */
        .nav-desktop {
          display: none;
          gap: 8px;
        }

        @media (min-width: 1024px) {
          .nav-desktop {
            display: flex;
          }
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border-radius: 10px;
          text-decoration: none;
          color: #1F2937;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.2s;
        }

        .nav-link:hover {
          background: #F3F4F6;
          color: #111827;
        }

        .nav-link.active {
          background: #3B82F6;
          color: white;
        }

        .nav-icon {
          font-size: 16px;
        }

        /* Actions */
        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-left: auto;
        }

        .action-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #F9FAFB;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          color: #374151;
          transition: all 0.2s;
        }

        .action-btn:hover {
          background: #F3F4F6;
          color: #111827;
        }

        .badge {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: #EF4444;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 600;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #3B82F6;
          border-radius: 10px;
          color: white;
          transition: all 0.2s;
        }

        .profile-btn:hover {
          background: #2563EB;
          transform: translateY(-1px);
        }

        .mobile-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: transparent;
          border: none;
          cursor: pointer;
          color: #374151;
        }

        @media (min-width: 1024px) {
          .mobile-menu-btn {
            display: none;
          }
        }

        /* Mobile Menu */
        .mobile-menu {
          padding: 20px 24px;
          background: white;
          border-top: 1px solid #E5E7EB;
        }

        .mobile-search {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #F9FAFB;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .mobile-search-input {
          flex: 1;
          background: transparent;
          border: none;
          font-size: 14px;
        }

        .mobile-search-input:focus {
          outline: none;
        }

        .mobile-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 10px;
          text-decoration: none;
          color: #374151;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .mobile-nav-link:hover {
          background: #F3F4F6;
        }

        .mobile-nav-link.active {
          background: #3B82F6;
          color: white;
        }

        .mobile-nav-icon {
          font-size: 20px;
        }

        /* Main Content */
        .main-content {
          flex: 1;
        }

        /* Footer */
        .footer {
          background: #1F2937;
          color: white;
          padding: 48px 0 24px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
          margin-bottom: 40px;
        }

        .footer-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .footer-title {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 8px;
        }

        .footer-description {
          font-size: 14px;
          color: #D1D5DB;
          line-height: 1.6;
        }

        .footer-social {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          text-decoration: none;
          font-size: 20px;
          transition: all 0.2s;
        }

        .social-link:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .footer-links,
        .footer-contacts {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .footer-links a {
          color: #D1D5DB;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: white;
        }

        .footer-contacts li {
          font-size: 14px;
          color: #D1D5DB;
        }

        .footer-bottom {
          padding-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          color: #9CA3AF;
          font-size: 14px;
        }
      `}</style>
    </div>
  )
}
