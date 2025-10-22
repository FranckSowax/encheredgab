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
          background: linear-gradient(135deg, rgba(6, 78, 59, 0.05) 0%, rgba(5, 150, 105, 0.08) 100%);
          padding: 28px 32px;
          border-radius: 16px;
          border: 2px solid rgba(212, 175, 55, 0.15);
          position: relative;
          overflow: hidden;
        }

        .greeting::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(30%, -30%);
        }

        .page-title {
          font-size: 36px;
          font-weight: 800;
          background: linear-gradient(135deg, #064E3B 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
          position: relative;
        }

        .page-subtitle {
          color: #065F46;
          font-size: 15px;
          font-weight: 500;
          position: relative;
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
          background: linear-gradient(135deg, #064E3B 0%, #065F46 100%);
          box-shadow: 0 8px 24px rgba(6, 78, 59, 0.25);
          border: 1px solid rgba(212, 175, 55, 0.2);
        }

        .action-card.primary:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(6, 78, 59, 0.35);
          border-color: rgba(212, 175, 55, 0.4);
        }

        .action-card.secondary {
          background: linear-gradient(135deg, #065F46 0%, #059669 100%);
          box-shadow: 0 8px 24px rgba(5, 150, 105, 0.25);
          border: 1px solid rgba(212, 175, 55, 0.2);
        }

        .action-card.secondary:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(5, 150, 105, 0.35);
          border-color: rgba(212, 175, 55, 0.4);
        }

        .action-card.tertiary {
          background: linear-gradient(135deg, #059669 0%, #10B981 100%);
          box-shadow: 0 8px 24px rgba(16, 185, 129, 0.25);
          border: 1px solid rgba(212, 175, 55, 0.2);
        }

        .action-card.tertiary:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(16, 185, 129, 0.35);
          border-color: rgba(212, 175, 55, 0.4);
        }

        .action-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #D4AF37 0%, #F9E79F 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #064E3B;
          flex-shrink: 0;
          box-shadow: 0 4px 16px rgba(212, 175, 55, 0.4);
          transition: all 0.3s;
        }

        .action-card:hover .action-icon {
          transform: scale(1.08);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.5);
        }

        .action-content {
          flex: 1;
          text-align: left;
        }

        .action-title {
          font-size: 17px;
          font-weight: 700;
          color: white;
          margin-bottom: 4px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .action-subtitle {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
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
          border-radius: 18px;
          padding: 28px;
          border: 2px solid rgba(6, 78, 59, 0.1);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(30%, -30%);
          transition: all 0.3s;
        }

        .stat-card:hover::before {
          transform: translate(20%, -20%) scale(1.2);
        }

        .stat-card:hover {
          border-color: rgba(212, 175, 55, 0.3);
          box-shadow: 0 12px 32px rgba(6, 78, 59, 0.15);
          transform: translateY(-4px);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .stat-icon {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
          position: relative;
          z-index: 1;
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 10px;
          position: relative;
          z-index: 1;
        }

        .stat-change.up {
          color: #064E3B;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(249, 231, 159, 0.15) 100%);
          border: 1px solid rgba(212, 175, 55, 0.3);
        }

        .stat-change.down {
          color: #DC2626;
          background: linear-gradient(135deg, rgba(220, 38, 38, 0.1) 0%, rgba(254, 202, 202, 0.1) 100%);
          border: 1px solid rgba(220, 38, 38, 0.2);
        }

        .stat-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .stat-label {
          font-size: 14px;
          color: #065F46;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 36px;
          font-weight: 800;
          background: linear-gradient(135deg, #064E3B 0%, #059669 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
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
          border-radius: 18px;
          border: 2px solid rgba(6, 78, 59, 0.08);
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
        }

        .card:hover {
          border-color: rgba(212, 175, 55, 0.3);
          box-shadow: 0 12px 32px rgba(6, 78, 59, 0.12);
          transform: translateY(-4px);
        }

        .card-header {
          padding: 24px 28px;
          background: linear-gradient(135deg, rgba(6, 78, 59, 0.03) 0%, rgba(5, 150, 105, 0.05) 100%);
          border-bottom: 2px solid rgba(212, 175, 55, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 17px;
          font-weight: 700;
          color: #064E3B;
        }

        .card-title svg {
          color: #D4AF37;
        }

        .see-all-btn {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(249, 231, 159, 0.1) 100%);
          border: 1px solid rgba(212, 175, 55, 0.3);
          color: #064E3B;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 10px;
          transition: all 0.3s;
        }

        .see-all-btn:hover {
          background: linear-gradient(135deg, #D4AF37 0%, #F9E79F 100%);
          border-color: #D4AF37;
          transform: scale(1.05);
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
          gap: 16px;
          padding: 18px;
          border-bottom: 1px solid rgba(6, 78, 59, 0.06);
          margin-bottom: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          border-radius: 12px;
        }

        .activity-item:hover {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.04) 0%, rgba(249, 231, 159, 0.04) 100%);
          border-color: transparent;
          transform: translateX(4px);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
        }

        .activity-item:hover .activity-icon {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .activity-icon.lot {
          background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
          color: #1E40AF;
        }

        .activity-icon.win {
          background: linear-gradient(135deg, #D4AF37 0%, #F9E79F 100%);
          color: #064E3B;
        }

        .activity-icon.bid {
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          color: #92400E;
        }

        .activity-content {
          flex: 1;
        }

        .activity-text {
          font-size: 15px;
          color: #064E3B;
          margin-bottom: 6px;
          font-weight: 500;
          line-height: 1.5;
        }

        .activity-text strong {
          font-weight: 700;
          color: #064E3B;
        }

        .activity-time {
          font-size: 13px;
          color: #059669;
          font-weight: 500;
        }

        /* Auctions */
        .auction-list {
          padding: 20px 28px;
        }

        .auction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px;
          border-bottom: 1px solid rgba(6, 78, 59, 0.06);
          margin-bottom: 0;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          border-radius: 12px;
        }

        .auction-item:hover {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.04) 0%, rgba(249, 231, 159, 0.04) 100%);
          border-color: transparent;
          transform: translateX(4px);
        }

        .auction-item:last-child {
          border-bottom: none;
        }

        .auction-info {
          flex: 1;
        }

        .auction-title {
          font-size: 15px;
          font-weight: 700;
          color: #064E3B;
          margin-bottom: 8px;
        }

        .auction-time {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #059669;
          font-weight: 500;
        }

        .auction-time svg {
          color: #D4AF37;
        }

        .auction-status {
          padding: 8px 16px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
        }

        .auction-item:hover .auction-status {
          transform: scale(1.05);
        }

        .auction-status.active {
          background: linear-gradient(135deg, #D4AF37 0%, #F9E79F 100%);
          color: #064E3B;
          border: 1px solid #D4AF37;
        }

        .auction-status.upcoming {
          background: linear-gradient(135deg, rgba(6, 78, 59, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
          color: #064E3B;
          border: 1px solid rgba(6, 78, 59, 0.2);
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
