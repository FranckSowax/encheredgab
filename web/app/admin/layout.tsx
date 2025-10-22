/**
 * Admin Dashboard Layout
 * Design inspiré du CRM moderne avec sidebar verte
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  Gavel, 
  Users, 
  Settings, 
  FileText,
  Bell,
  Search,
  Menu,
  X,
  LogOut,
  BarChart3,
  Image as ImageIcon,
  MessageSquare
} from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { href: '/admin/lots', label: 'Gestion des Lots', icon: Package, badge: '24' },
    { href: '/admin/auctions', label: 'Enchères', icon: Gavel, badge: '12' },
    { href: '/admin/users', label: 'Utilisateurs', icon: Users, badge: null },
    { href: '/admin/analytics', label: 'Statistiques', icon: BarChart3, badge: null },
    { href: '/admin/media', label: 'Médiathèque', icon: ImageIcon, badge: null },
    { href: '/admin/messages', label: 'Messages', icon: MessageSquare, badge: '3' },
    { href: '/admin/reports', label: 'Rapports', icon: FileText, badge: null },
    { href: '/admin/settings', label: 'Paramètres', icon: Settings, badge: null },
  ]

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <Gavel size={24} />
            </div>
            <div className="logo-content">
              <span className="logo-text">Douane</span>
              <span className="logo-subtitle">Enchères</span>
            </div>
          </div>
          <button 
            className="close-btn lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="nav-icon">
                  <Icon size={20} />
                </div>
                <span className="nav-label">{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <button className="logout-btn">
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <button 
            className="menu-btn lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="header-content">
            {/* Search */}
            <div className="search-bar">
              <Search size={20} className="search-icon" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="search-input"
              />
            </div>

            {/* Actions */}
            <div className="header-actions">
              <button className="icon-btn">
                <Bell size={20} />
                <span className="notification-badge">3</span>
              </button>
              <div className="user-menu">
                <img 
                  src="/api/placeholder/40/40" 
                  alt="Admin" 
                  className="user-avatar"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          {children}
        </main>
      </div>

      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #F9FAFB;
        }

        /* Sidebar */
        .sidebar {
          width: 280px;
          background: linear-gradient(180deg, #064E3B 0%, #065F46 50%, #064E3B 100%);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 50;
          transition: transform 0.3s ease;
          border-right: 2px solid rgba(212, 175, 55, 0.3);
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }

        .sidebar-header {
          padding: 28px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 2px solid rgba(212, 175, 55, 0.2);
          background: rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #D4AF37 0%, #F9E79F 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #064E3B;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
          position: relative;
        }

        .logo-icon::before {
          content: '';
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, #D4AF37, #F9E79F);
          border-radius: 14px;
          opacity: 0;
          transition: opacity 0.4s;
          z-index: -1;
        }

        .logo-icon:hover::before {
          opacity: 0.3;
        }

        .logo-icon:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 12px 32px rgba(212, 175, 55, 0.5);
        }

        .logo-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .logo-text {
          font-size: 20px;
          font-weight: 800;
          color: #D4AF37;
          line-height: 1;
          letter-spacing: 0.5px;
          text-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
        }

        .logo-subtitle {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        .close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .close-btn:hover {
          background: rgba(212, 175, 55, 0.2);
          border-color: rgba(212, 175, 55, 0.4);
          color: #D4AF37;
        }

        .sidebar-nav {
          flex: 1;
          padding: 24px 16px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }

        .sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.3);
          border-radius: 10px;
        }

        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.5);
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 13px 16px;
          border-radius: 12px;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.75);
          font-size: 15px;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 6px;
          position: relative;
          border-left: 3px solid transparent;
        }

        .nav-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #D4AF37 0%, #F9E79F 100%);
          transform: scaleY(0);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 0 4px 4px 0;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.95);
          transform: translateX(4px);
        }

        .nav-item:hover::before {
          transform: scaleY(1);
        }

        .nav-item.active {
          background: linear-gradient(90deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.1) 100%);
          color: #D4AF37;
          font-weight: 600;
          border-left-color: #D4AF37;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
        }

        .nav-item.active::before {
          transform: scaleY(1);
        }

        .nav-item.active .nav-icon {
          background: linear-gradient(135deg, #D4AF37 0%, #F9E79F 100%);
          color: #064E3B;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .nav-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-item:hover .nav-icon {
          background: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }

        .nav-item.active .nav-icon {
          transform: scale(1);
        }

        .nav-label {
          flex: 1;
          font-weight: 500;
        }

        .nav-item.active .nav-label {
          font-weight: 600;
        }

        .nav-badge {
          min-width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(212, 175, 55, 0.2);
          color: #D4AF37;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          padding: 0 8px;
          transition: all 0.3s;
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .nav-item.active .nav-badge {
          background: linear-gradient(135deg, #D4AF37 0%, #F9E79F 100%);
          color: #064E3B;
          border-color: #D4AF37;
          box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
        }

        .nav-item:hover .nav-badge {
          background: rgba(212, 175, 55, 0.3);
          transform: scale(1.05);
        }

        .logout-btn {
          margin: 16px;
          padding: 13px 16px;
          background: rgba(220, 38, 38, 0.1);
          border: 1px solid rgba(220, 38, 38, 0.2);
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.75);
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .logout-btn:hover {
          background: rgba(220, 38, 38, 0.2);
          border-color: rgba(220, 38, 38, 0.4);
          color: #FCA5A5;
          transform: translateX(4px);
        }

        .logout-btn:active {
          transform: translateX(2px) scale(0.98);
        }

        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 40;
        }

        /* Main Content */
        .main-wrapper {
          flex: 1;
          margin-left: 280px;
          display: flex;
          flex-direction: column;
        }

        @media (max-width: 1024px) {
          .main-wrapper {
            margin-left: 0;
          }
        }

        .top-header {
          background: white;
          border-bottom: 1px solid #E5E7EB;
          padding: 16px 24px;
          position: sticky;
          top: 0;
          z-index: 30;
        }

        .menu-btn {
          background: none;
          border: none;
          color: #374151;
          cursor: pointer;
          padding: 8px;
          margin-right: 16px;
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .search-bar {
          flex: 1;
          max-width: 600px;
          position: relative;
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
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .search-input:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-btn {
          position: relative;
          width: 40px;
          height: 40px;
          background: #F9FAFB;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-center: center;
          color: #374151;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: #F3F4F6;
        }

        .notification-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #EF4444;
          color: white;
          font-size: 11px;
          font-weight: 600;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid #E5E7EB;
        }

        .page-content {
          flex: 1;
          padding: 24px;
        }

        @media (max-width: 768px) {
          .page-content {
            padding: 16px;
          }
          .search-bar {
            max-width: none;
          }
        }
      `}</style>
    </div>
  )
}
