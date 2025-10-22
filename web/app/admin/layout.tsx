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
          background: #FAFBFC;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          z-index: 50;
          transition: transform 0.3s ease;
          border-right: 1px solid #E8EBED;
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
          border-bottom: 1px solid #E8EBED;
          background: white;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: #1B5E3F;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: all 0.3s;
        }

        .logo-icon:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(27, 94, 63, 0.3);
        }

        .logo-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 700;
          color: #1A202C;
          line-height: 1;
          letter-spacing: -0.3px;
        }

        .logo-subtitle {
          font-size: 11px;
          font-weight: 500;
          color: #718096;
          letter-spacing: 0.3px;
        }

        .close-btn {
          background: none;
          border: none;
          color: #718096;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .close-btn:hover {
          background: #F7FAFC;
          color: #1A202C;
        }

        .sidebar-nav {
          flex: 1;
          padding: 24px 16px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
        }

        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 16px;
          border-radius: 10px;
          text-decoration: none;
          color: #64748B;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          margin-bottom: 4px;
          position: relative;
          border-left: 3px solid transparent;
        }

        .nav-item::before {
          display: none;
        }

        .nav-item:hover {
          background: #F7FAFC;
          color: #1A202C;
          border-left-color: transparent;
        }

        .nav-item.active {
          background: #F0F9F4;
          color: #1B5E3F;
          border-left-color: #1B5E3F;
          font-weight: 600;
        }

        .nav-item.active .nav-icon {
          background: #1B5E3F;
          color: white;
        }

        .nav-icon {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .nav-item:hover .nav-icon {
          transform: none;
        }

        .nav-item.active .nav-icon {
          transform: none;
        }

        .nav-label {
          flex: 1;
        }

        .nav-badge {
          min-width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #E2E8F0;
          color: #64748B;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          padding: 0 6px;
          transition: all 0.2s;
        }

        .nav-item.active .nav-badge {
          background: #1B5E3F;
          color: white;
        }

        .nav-item:hover .nav-badge {
          background: #CBD5E0;
        }

        .logout-btn {
          margin: 16px;
          padding: 11px 16px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: #64748B;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: all 0.2s ease;
        }

        .logout-btn:hover {
          background: #FEF2F2;
          color: #DC2626;
        }

        .logout-btn:active {
          transform: scale(0.98);
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
