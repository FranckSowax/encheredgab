/**
 * Admin Dashboard - Page principale
 * Statistiques et aperçu
 */

'use client'

import { useState } from 'react'
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Package, 
  Gavel, 
  DollarSign,
  ArrowUpRight,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('month')

  // Mock data - à remplacer par de vraies données
  const stats = [
    {
      label: 'Enchères Actives',
      value: '142',
      change: '+12%',
      trend: 'up',
      icon: Gavel,
      color: '#059669'
    },
    {
      label: 'Nouveaux Lots',
      value: '98',
      change: '+8%',
      trend: 'up',
      icon: Package,
      color: '#3B82F6'
    },
    {
      label: 'Utilisateurs',
      value: '1,604',
      change: '+23%',
      trend: 'up',
      icon: Users,
      color: '#8B5CF6'
    },
    {
      label: 'Revenus',
      value: '45M FCFA',
      change: '+15%',
      trend: 'up',
      icon: DollarSign,
      color: '#F59E0B'
    }
  ]

  const recentActivities = [
    { user: 'Jean Dupont', action: 'a ajouté un nouveau lot', time: "aujourd'hui", type: 'lot' },
    { user: 'Marie Martin', action: "a remporté l'enchère #1234", time: 'hier', type: 'win' },
    { user: 'Pierre Durand', action: 'a placé une offre de 500,000 FCFA', time: 'hier', type: 'bid' },
    { user: 'Sophie Bernard', action: 'a ajouté un nouveau lot', time: "aujourd'hui", type: 'lot' },
  ]

  const upcomingAuctions = [
    { title: 'Véhicule Toyota 2020', date: '10:00 AM - 10:30 AM', status: 'upcoming' },
    { title: 'Lot électronique #45', date: '10:00 AM - 10:30 AM', status: 'active' },
    { title: 'Mobilier de bureau', date: '10:00 AM - 10:30 AM', status: 'upcoming' },
    { title: 'Enchère spéciale', date: '10:00 AM - 10:30 AM', status: 'upcoming' },
  ]

  return (
    <div className="dashboard">
      {/* Page Header avec Actions */}
      <div className="page-header">
        <div className="header-left">
          <div className="greeting">
            <h1 className="page-title">👋 Bonjour, Admin!</h1>
            <p className="page-subtitle">Voici un aperçu de votre activité aujourd'hui</p>
          </div>
        </div>
        <div className="header-right">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="time-select"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="year">Cette année</option>
          </select>
        </div>
      </div>

      {/* Quick Actions - Déplacées en haut */}
      <div className="quick-actions-top">
        <button className="action-card primary">
          <div className="action-icon">
            <Package size={24} />
          </div>
          <div className="action-content">
            <div className="action-title">Nouveau Lot</div>
            <div className="action-subtitle">Ajouter un produit</div>
          </div>
        </button>
        <button className="action-card secondary">
          <div className="action-icon">
            <Gavel size={24} />
          </div>
          <div className="action-content">
            <div className="action-title">Créer Enchère</div>
            <div className="action-subtitle">Lancer une vente</div>
          </div>
        </button>
        <button className="action-card tertiary">
          <div className="action-icon">
            <Users size={24} />
          </div>
          <div className="action-content">
            <div className="action-title">Utilisateurs</div>
            <div className="action-subtitle">Gérer les comptes</div>
          </div>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown
          
          return (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
                  <Icon size={24} />
                </div>
                <span className={`stat-change ${stat.trend}`}>
                  <TrendIcon size={14} />
                  {stat.change}
                </span>
              </div>
              <div className="stat-body">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Recent Activities */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Clock size={20} />
              Activités Récentes
            </div>
          </div>
          <div className="activity-list">
            {recentActivities.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className={`activity-icon ${activity.type}`}>
                  {activity.type === 'lot' && <Package size={16} />}
                  {activity.type === 'win' && <CheckCircle size={16} />}
                  {activity.type === 'bid' && <TrendingUp size={16} />}
                </div>
                <div className="activity-content">
                  <div className="activity-text">
                    <strong>{activity.user}</strong> {activity.action}
                  </div>
                  <div className="activity-time">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Auctions */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Calendar size={20} />
              Enchères à Venir
            </div>
            <button className="see-all-btn">Voir tout</button>
          </div>
          <div className="auction-list">
            {upcomingAuctions.map((auction, index) => (
              <div key={index} className="auction-item">
                <div className="auction-info">
                  <div className="auction-title">{auction.title}</div>
                  <div className="auction-time">
                    <Clock size={14} />
                    {auction.date}
                  </div>
                </div>
                <span className={`auction-status ${auction.status}`}>
                  {auction.status === 'active' ? 'En cours' : 'À venir'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1400px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          gap: 24px;
        }

        .header-left {
          flex: 1;
        }

        .greeting {
          background: transparent;
          padding: 0;
          border-radius: 0;
          border: none;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: #1A202C;
          margin-bottom: 6px;
        }

        .page-subtitle {
          color: #718096;
          font-size: 14px;
          font-weight: 400;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .time-select {
          padding: 12px 18px;
          border: 2px solid #E5E7EB;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          background: white;
          transition: all 0.2s;
        }

        .time-select:hover {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        /* Quick Actions Cards - En Haut */
        .quick-actions-top {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .action-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .action-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, transparent 0%, rgba(255,255,255,0.1) 100%);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .action-card:hover::before {
          opacity: 1;
        }

        .action-card.primary {
          background: #1B5E3F;
          box-shadow: 0 2px 8px rgba(27, 94, 63, 0.15);
        }

        .action-card.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(27, 94, 63, 0.25);
        }

        .action-card.secondary {
          background: #1B5E3F;
          box-shadow: 0 2px 8px rgba(27, 94, 63, 0.15);
        }

        .action-card.secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(27, 94, 63, 0.25);
        }

        .action-card.tertiary {
          background: #1B5E3F;
          box-shadow: 0 2px 8px rgba(27, 94, 63, 0.15);
        }

        .action-card.tertiary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(27, 94, 63, 0.25);
        }

        .action-icon {
          width: 48px;
          height: 48px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .action-content {
          flex: 1;
          text-align: left;
        }

        .action-title {
          font-size: 16px;
          font-weight: 600;
          color: white;
          margin-bottom: 4px;
        }

        .action-subtitle {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.85);
          font-weight: 400;
        }

        /* Stats Grid - Modernisé */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #E8EBED;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          display: none;
        }

        .stat-card:hover {
          border-color: #CBD5E0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: none;
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .stat-change.up {
          color: #1B5E3F;
          background: #F0F9F4;
        }

        .stat-change.down {
          color: #DC2626;
          background: #FEF2F2;
        }

        .stat-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-label {
          font-size: 13px;
          color: #718096;
          font-weight: 500;
          text-transform: none;
          letter-spacing: 0;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #1A202C;
          background: none;
          -webkit-background-clip: unset;
          -webkit-text-fill-color: unset;
          background-clip: unset;
        }

        /* Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        .card {
          background: white;
          border-radius: 16px;
          border: 1px solid #E8EBED;
          overflow: hidden;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .card:hover {
          border-color: #CBD5E0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .card-header {
          padding: 20px 24px;
          background: white;
          border-bottom: 1px solid #E8EBED;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          font-weight: 600;
          color: #1A202C;
        }

        .card-title svg {
          color: #718096;
        }

        .see-all-btn {
          background: transparent;
          border: none;
          color: #1B5E3F;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 6px 12px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .see-all-btn:hover {
          background: #F0F9F4;
        }

        /* Activities */
        .activity-list {
          padding: 20px 28px;
        }

        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #F7FAFC;
        }

        .activity-item {
          display: flex;
          gap: 14px;
          padding: 14px 0;
          border-bottom: 1px solid #F7FAFC;
          margin-bottom: 0;
          transition: all 0.2s;
          background: transparent;
        }

        .activity-item:hover {
          background: #F7FAFC;
          padding-left: 8px;
          padding-right: 8px;
          border-radius: 8px;
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: none;
        }

        .activity-icon.lot {
          background: #DBEAFE;
          color: #2563EB;
        }

        .activity-icon.win {
          background: #F0F9F4;
          color: #1B5E3F;
        }

        .activity-icon.bid {
          background: #FEF3C7;
          color: #D97706;
        }

        .activity-content {
          flex: 1;
        }

        .activity-text {
          font-size: 14px;
          color: #1A202C;
          margin-bottom: 4px;
          font-weight: 400;
          line-height: 1.5;
        }

        .activity-text strong {
          font-weight: 600;
          color: #1A202C;
        }

        .activity-time {
          font-size: 12px;
          color: #718096;
          font-weight: 400;
        }

        /* Auctions */
        .auction-list {
          padding: 20px 28px;
        }

        .auction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid #F7FAFC;
          margin-bottom: 0;
          transition: all 0.2s;
          background: transparent;
        }

        .auction-item:hover {
          background: #F7FAFC;
          padding-left: 8px;
          padding-right: 8px;
          border-radius: 8px;
        }

        .auction-item:last-child {
          border-bottom: none;
        }

        .auction-info {
          flex: 1;
        }

        .auction-title {
          font-size: 14px;
          font-weight: 600;
          color: #1A202C;
          margin-bottom: 6px;
        }

        .auction-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #718096;
          font-weight: 400;
        }

        .auction-time svg {
          color: #718096;
        }

        .auction-status {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
          box-shadow: none;
        }

        .auction-status.active {
          background: #F0F9F4;
          color: #1B5E3F;
        }

        .auction-status.upcoming {
          background: #EEF2FF;
          color: #4338CA;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .quick-actions-top {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
          }
          
          .header-right {
            width: 100%;
          }
          
          .time-select {
            width: 100%;
          }
          
          .greeting {
            padding: 20px;
          }
          
          .page-title {
            font-size: 24px;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .action-card {
            justify-content: center;
          }
          
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .quick-actions-top {
            gap: 12px;
          }
          
          .action-card {
            padding: 16px;
          }
          
          .action-icon {
            width: 48px;
            height: 48px;
          }
          
          .action-title {
            font-size: 15px;
          }
          
          .action-subtitle {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  )
}
