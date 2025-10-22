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
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Bienvenue dans votre espace d'administration</p>
        </div>
        <div className="header-actions">
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

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="action-btn primary">
          <Package size={20} />
          Ajouter un Lot
        </button>
        <button className="action-btn secondary">
          <Gavel size={20} />
          Créer une Enchère
        </button>
        <button className="action-btn secondary">
          <Users size={20} />
          Gérer les Utilisateurs
        </button>
      </div>

      <style jsx>{`
        .dashboard {
          max-width: 1400px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 32px;
          gap: 24px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .page-subtitle {
          color: #6B7280;
          font-size: 16px;
        }

        .time-select {
          padding: 10px 16px;
          border: 1px solid #E5E7EB;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          background: white;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #E5E7EB;
          transition: all 0.2s;
        }

        .stat-card:hover {
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
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 14px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
        }

        .stat-change.up {
          color: #059669;
          background: #D1FAE5;
        }

        .stat-change.down {
          color: #EF4444;
          background: #FEE2E2;
        }

        .stat-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #6B7280;
          font-weight: 500;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
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
          border: 1px solid #E5E7EB;
          overflow: hidden;
        }

        .card-header {
          padding: 20px 24px;
          border-bottom: 1px solid #F3F4F6;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }

        .see-all-btn {
          background: none;
          border: none;
          color: #059669;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        /* Activities */
        .activity-list {
          padding: 16px 24px;
        }

        .activity-item {
          display: flex;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #F3F4F6;
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
        }

        .activity-icon.lot {
          background: #DBEAFE;
          color: #3B82F6;
        }

        .activity-icon.win {
          background: #D1FAE5;
          color: #059669;
        }

        .activity-icon.bid {
          background: #FEF3C7;
          color: #F59E0B;
        }

        .activity-content {
          flex: 1;
        }

        .activity-text {
          font-size: 14px;
          color: #374151;
          margin-bottom: 4px;
        }

        .activity-time {
          font-size: 12px;
          color: #9CA3AF;
        }

        /* Auctions */
        .auction-list {
          padding: 16px 24px;
        }

        .auction-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid #F3F4F6;
        }

        .auction-item:last-child {
          border-bottom: none;
        }

        .auction-title {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
        }

        .auction-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6B7280;
        }

        .auction-status {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .auction-status.active {
          background: #D1FAE5;
          color: #059669;
        }

        .auction-status.upcoming {
          background: #E0E7FF;
          color: #6366F1;
        }

        /* Quick Actions */
        .quick-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 24px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        .action-btn.primary:hover {
          box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
          transform: translateY(-2px);
        }

        .action-btn.secondary {
          background: #F9FAFB;
          color: #374151;
          border: 1px solid #E5E7EB;
        }

        .action-btn.secondary:hover {
          background: #F3F4F6;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .action-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
