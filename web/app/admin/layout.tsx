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
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/lots', label: 'Gestion des Lots', icon: Package },
    { href: '/admin/auctions', label: 'Enchères', icon: Gavel },
    { href: '/admin/users', label: 'Utilisateurs', icon: Users },
    { href: '/admin/analytics', label: 'Statistiques', icon: BarChart3 },
    { href: '/admin/media', label: 'Médiathèque', icon: ImageIcon },
    { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
    { href: '/admin/reports', label: 'Rapports', icon: FileText },
    { href: '/admin/settings', label: 'Paramètres', icon: Settings },
  ]

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">D</div>
            <span className="logo-text">Douane Enchères</span>
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
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
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
          background: linear-gradient(180deg, #059669 0%, #047857 100%);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 50;
          transition: transform 0.3s ease;
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
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          color: #059669;
          font-size: 20px;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 700;
          color: white;
        }

        .close-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
        }

        .sidebar-nav {
          flex: 1;
          padding: 24px 16px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          text-decoration: none;
          color: rgba(255, 255, 255, 0.8);
          font-size: 15px;
          font-weight: 500;
          transition: all 0.2s;
          margin-bottom: 4px;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .nav-item.active {
          background: white;
          color: #059669;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .logout-btn {
          margin: 16px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: none;
          border-radius: 12px;
          color: #FCA5A5;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
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
