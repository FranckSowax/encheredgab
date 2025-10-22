/**
 * Admin - Gestion des Enchères
 * Créer, modifier et gérer les enchères
 */

'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Calendar,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Pause,
  Play,
  StopCircle,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function AuctionsManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data
  const auctions = [
    {
      id: '1',
      title: 'Enchère Véhicules - Lot Mars 2024',
      lotTitle: 'Toyota Corolla 2020',
      status: 'active',
      startDate: '2024-03-15 09:00',
      endDate: '2024-03-15 12:00',
      currentBid: '12,500,000',
      minimumBid: '10,000,000',
      totalBids: 24,
      participants: 12
    },
    {
      id: '2',
      title: 'Enchère Électronique - Lot Spécial',
      lotTitle: 'iPhone 14 Pro Max',
      status: 'scheduled',
      startDate: '2024-03-20 14:00',
      endDate: '2024-03-20 16:00',
      currentBid: '0',
      minimumBid: '500,000',
      totalBids: 0,
      participants: 0
    },
    {
      id: '3',
      title: 'Enchère Bijoux - Collection Premium',
      lotTitle: 'Montre Rolex Submariner',
      status: 'ended',
      startDate: '2024-03-10 10:00',
      endDate: '2024-03-10 13:00',
      currentBid: '6,200,000',
      minimumBid: '4,000,000',
      totalBids: 18,
      participants: 8
    },
  ]

  const getStatusInfo = (status: string) => {
    const statusMap = {
      active: { label: 'En cours', class: 'active', icon: Play },
      scheduled: { label: 'Programmée', class: 'scheduled', icon: Calendar },
      paused: { label: 'En pause', class: 'paused', icon: Pause },
      ended: { label: 'Terminée', class: 'ended', icon: CheckCircle },
      cancelled: { label: 'Annulée', class: 'cancelled', icon: StopCircle },
    }
    return statusMap[status as keyof typeof statusMap] || statusMap.scheduled
  }

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         auction.lotTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || auction.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="auctions-management">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Enchères</h1>
          <p className="page-subtitle">Créez et gérez les enchères en temps réel</p>
        </div>
        <Link href="/admin/auctions/new" className="add-btn">
          <Plus size={20} />
          Nouvelle Enchère
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-mini active">
          <div className="stat-icon">
            <Play size={20} />
          </div>
          <div>
            <div className="stat-value">{auctions.filter(a => a.status === 'active').length}</div>
            <div className="stat-label">En cours</div>
          </div>
        </div>
        <div className="stat-mini scheduled">
          <div className="stat-icon">
            <Calendar size={20} />
          </div>
          <div>
            <div className="stat-value">{auctions.filter(a => a.status === 'scheduled').length}</div>
            <div className="stat-label">Programmées</div>
          </div>
        </div>
        <div className="stat-mini ended">
          <div className="stat-icon">
            <CheckCircle size={20} />
          </div>
          <div>
            <div className="stat-value">{auctions.filter(a => a.status === 'ended').length}</div>
            <div className="stat-label">Terminées</div>
          </div>
        </div>
        <div className="stat-mini total">
          <div className="stat-icon">
            <TrendingUp size={20} />
          </div>
          <div>
            <div className="stat-value">{auctions.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher une enchère..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">En cours</option>
          <option value="scheduled">Programmées</option>
          <option value="paused">En pause</option>
          <option value="ended">Terminées</option>
          <option value="cancelled">Annulées</option>
        </select>
      </div>

      {/* Auctions Grid */}
      <div className="auctions-grid">
        {filteredAuctions.map((auction) => {
          const statusInfo = getStatusInfo(auction.status)
          const StatusIcon = statusInfo.icon
          
          return (
            <div key={auction.id} className={`auction-card ${statusInfo.class}`}>
              {/* Header */}
              <div className="auction-header">
                <div className="auction-status">
                  <StatusIcon size={16} />
                  {statusInfo.label}
                </div>
                <div className="auction-actions">
                  <button className="icon-btn" title="Voir">
                    <Eye size={18} />
                  </button>
                  <button className="icon-btn" title="Éditer">
                    <Edit size={18} />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="auction-body">
                <h3 className="auction-title">{auction.title}</h3>
                <div className="auction-lot">{auction.lotTitle}</div>

                <div className="auction-info">
                  <div className="info-item">
                    <Clock size={16} />
                    <div>
                      <div className="info-label">Début</div>
                      <div className="info-value">{auction.startDate}</div>
                    </div>
                  </div>
                  <div className="info-item">
                    <Clock size={16} />
                    <div>
                      <div className="info-label">Fin</div>
                      <div className="info-value">{auction.endDate}</div>
                    </div>
                  </div>
                </div>

                <div className="auction-stats">
                  <div className="stat-item">
                    <DollarSign size={16} />
                    <div>
                      <div className="stat-label">Enchère actuelle</div>
                      <div className="stat-value">{auction.currentBid} FCFA</div>
                    </div>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <Users size={16} />
                    <div>
                      <div className="stat-label">Participants</div>
                      <div className="stat-value">{auction.participants}</div>
                    </div>
                  </div>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <TrendingUp size={16} />
                    <div>
                      <div className="stat-label">Offres</div>
                      <div className="stat-value">{auction.totalBids}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              {auction.status === 'active' && (
                <div className="auction-footer">
                  <button className="footer-btn pause">
                    <Pause size={16} />
                    Mettre en pause
                  </button>
                  <button className="footer-btn end">
                    <StopCircle size={16} />
                    Terminer
                  </button>
                </div>
              )}
              
              {auction.status === 'scheduled' && (
                <div className="auction-footer">
                  <button className="footer-btn start">
                    <Play size={16} />
                    Démarrer maintenant
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {filteredAuctions.length === 0 && (
        <div className="empty-state">
          <Calendar size={48} />
          <h3>Aucune enchère trouvée</h3>
          <p>Créez une nouvelle enchère pour commencer</p>
        </div>
      )}

      <style jsx>{`
        .auctions-management {
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

        .add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
          transition: all 0.2s;
        }

        .add-btn:hover {
          box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
          transform: translateY(-2px);
        }

        /* Stats Row */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-mini {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-mini.active .stat-icon {
          background: #D1FAE5;
          color: #059669;
        }

        .stat-mini.scheduled .stat-icon {
          background: #E0E7FF;
          color: #6366F1;
        }

        .stat-mini.ended .stat-icon {
          background: #DBEAFE;
          color: #3B82F6;
        }

        .stat-mini.total .stat-icon {
          background: #FEF3C7;
          color: #F59E0B;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #111827;
        }

        .stat-label {
          font-size: 14px;
          color: #6B7280;
        }

        /* Filters */
        .filters-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 300px;
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
          background: white;
          outline: none;
        }

        .search-input:focus {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .filter-select {
          padding: 12px 16px;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          background: white;
          cursor: pointer;
        }

        /* Auctions Grid */
        .auctions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 24px;
        }

        @media (max-width: 768px) {
          .auctions-grid {
            grid-template-columns: 1fr;
          }
        }

        .auction-card {
          background: white;
          border: 2px solid #E5E7EB;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .auction-card:hover {
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
          transform: translateY(-4px);
        }

        .auction-card.active {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .auction-header {
          padding: 16px 20px;
          background: #F9FAFB;
          border-bottom: 1px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .auction-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
        }

        .auction-card.active .auction-status {
          background: #D1FAE5;
          color: #059669;
        }

        .auction-card.scheduled .auction-status {
          background: #E0E7FF;
          color: #6366F1;
        }

        .auction-card.ended .auction-status {
          background: #DBEAFE;
          color: #3B82F6;
        }

        .auction-actions {
          display: flex;
          gap: 8px;
        }

        .icon-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: #F3F4F6;
          color: #111827;
        }

        .auction-body {
          padding: 20px;
        }

        .auction-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
        }

        .auction-lot {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 16px;
        }

        .auction-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #F3F4F6;
        }

        .info-item {
          display: flex;
          gap: 10px;
          align-items: start;
        }

        .info-item svg {
          color: #9CA3AF;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .info-label {
          font-size: 11px;
          color: #9CA3AF;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }

        .info-value {
          font-size: 13px;
          font-weight: 600;
          color: #374151;
        }

        .auction-stats {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-item {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .stat-item svg {
          color: #059669;
        }

        .stat-label {
          font-size: 11px;
          color: #6B7280;
        }

        .stat-value {
          font-size: 15px;
          font-weight: 700;
          color: #111827;
        }

        .stat-divider {
          width: 1px;
          height: 32px;
          background: #E5E7EB;
        }

        .auction-footer {
          padding: 16px 20px;
          background: #F9FAFB;
          border-top: 1px solid #E5E7EB;
          display: flex;
          gap: 12px;
        }

        .footer-btn {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .footer-btn.start {
          background: #D1FAE5;
          color: #059669;
        }

        .footer-btn.start:hover {
          background: #A7F3D0;
        }

        .footer-btn.pause {
          background: #FEF3C7;
          color: #F59E0B;
        }

        .footer-btn.pause:hover {
          background: #FDE68A;
        }

        .footer-btn.end {
          background: #FEE2E2;
          color: #EF4444;
        }

        .footer-btn.end:hover {
          background: #FECACA;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #9CA3AF;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
        }

        .empty-state h3 {
          margin: 16px 0 8px;
          color: #374151;
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
          }
          .add-btn {
            width: 100%;
            justify-content: center;
          }
          .filters-bar {
            flex-direction: column;
          }
          .search-box {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
