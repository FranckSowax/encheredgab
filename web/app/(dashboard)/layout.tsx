/**
 * Dashboard Layout
 * Navigation utilisateur
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Gavel, Heart, Package, Settings, LogOut } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Masquer le layout sur la page principale du dashboard (elle a son propre design)
  const showLayout = pathname !== '/dashboard'

  const navItems = [
    { href: '/dashboard', label: 'Mon profil', icon: User },
    { href: '/dashboard/my-bids', label: 'Mes enchères', icon: Gavel },
    { href: '/dashboard/favorites', label: 'Mes favoris', icon: Heart },
    { href: '/dashboard/deliveries', label: 'Mes livraisons', icon: Package },
    { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
  ]

  // Si on est sur la page principale du dashboard, ne pas afficher le layout
  if (!showLayout) {
    return <>{children}</>
  }

  return (
    <div className="dashboard-layout">
      <div className="container">
        <div className="dashboard-grid">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-header">
              <h2 className="sidebar-title">Mon Compte</h2>
            </div>

            <nav className="sidebar-nav">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`nav-item ${isActive ? 'active' : ''}`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}

              <button className="nav-item logout">
                <LogOut size={20} />
                <span>Déconnexion</span>
              </button>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="dashboard-content">
            {children}
          </main>
        </div>
      </div>

      <style jsx>{`
        .dashboard-layout {
          min-height: 100vh;
          background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #A7F3D0 100%);
          padding: 40px 0;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 32px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Sidebar */
        .sidebar {
          background: white;
          border-radius: 20px;
          padding: 28px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 100px;
        }

        .sidebar-header {
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 2px solid #F3F4F6;
        }

        .sidebar-title {
          font-size: 22px;
          font-weight: 700;
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          text-decoration: none;
          color: #4B5563 !important;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.2s;
          border: none;
          background: transparent;
          width: 100%;
          cursor: pointer;
          text-align: left;
        }

        .nav-item:hover {
          background: #F3F4F6;
          color: #111827 !important;
        }

        .nav-item.active {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white !important;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .nav-item.logout {
          margin-top: 20px;
          color: #EF4444;
        }

        .nav-item.logout:hover {
          background: #FEE2E2;
        }

        /* Content */
        .dashboard-content {
          min-height: 400px;
        }

        @media (max-width: 1024px) {
          .sidebar {
            position: relative;
            top: 0;
          }
        }
      `}</style>
    </div>
  )
}
