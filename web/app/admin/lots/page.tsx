/**
 * Admin - Gestion des Lots
 * Liste, création et édition des lots
 */

'use client'

import { useState } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  Package,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'

export default function LotsManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  // Mock data - à remplacer par de vraies données depuis Supabase
  const lots = [
    {
      id: '1',
      title: 'Toyota Corolla 2020',
      category: 'Véhicules',
      status: 'available',
      images: 5,
      createdAt: '2024-01-15',
      estimatedValue: '15,000,000'
    },
    {
      id: '2',
      title: 'iPhone 14 Pro Max',
      category: 'Électronique',
      status: 'in_auction',
      images: 3,
      createdAt: '2024-01-14',
      estimatedValue: '850,000'
    },
    {
      id: '3',
      title: 'Montre Rolex Submariner',
      category: 'Bijoux',
      status: 'available',
      images: 4,
      createdAt: '2024-01-13',
      estimatedValue: '5,000,000'
    },
    {
      id: '4',
      title: 'MacBook Pro M2',
      category: 'Électronique',
      status: 'sold',
      images: 6,
      createdAt: '2024-01-12',
      estimatedValue: '1,200,000'
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { label: 'Disponible', class: 'available' },
      in_auction: { label: 'En enchère', class: 'in-auction' },
      sold: { label: 'Vendu', class: 'sold' },
      archived: { label: 'Archivé', class: 'archived' },
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.available
  }

  const filteredLots = lots.filter(lot => {
    const matchesSearch = lot.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || lot.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="lots-management">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Lots</h1>
          <p className="page-subtitle">Gérez tous vos lots d'enchères</p>
        </div>
        <Link href="/admin/lots/new" className="add-btn">
          <Plus size={20} />
          Nouveau Lot
        </Link>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un lot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <Filter size={18} />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous les statuts</option>
            <option value="available">Disponible</option>
            <option value="in_auction">En enchère</option>
            <option value="sold">Vendu</option>
            <option value="archived">Archivé</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-mini">
          <div className="stat-mini-label">Total Lots</div>
          <div className="stat-mini-value">{lots.length}</div>
        </div>
        <div className="stat-mini">
          <div className="stat-mini-label">Disponibles</div>
          <div className="stat-mini-value">{lots.filter(l => l.status === 'available').length}</div>
        </div>
        <div className="stat-mini">
          <div className="stat-mini-label">En enchère</div>
          <div className="stat-mini-value">{lots.filter(l => l.status === 'in_auction').length}</div>
        </div>
        <div className="stat-mini">
          <div className="stat-mini-label">Vendus</div>
          <div className="stat-mini-value">{lots.filter(l => l.status === 'sold').length}</div>
        </div>
      </div>

      {/* Lots Table */}
      <div className="table-card">
        <table className="lots-table">
          <thead>
            <tr>
              <th>Lot</th>
              <th>Catégorie</th>
              <th>Statut</th>
              <th>Images</th>
              <th>Valeur estimée</th>
              <th>Date création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLots.map((lot) => {
              const statusBadge = getStatusBadge(lot.status)
              
              return (
                <tr key={lot.id}>
                  <td>
                    <div className="lot-info">
                      <div className="lot-icon">
                        <Package size={20} />
                      </div>
                      <div>
                        <div className="lot-title">{lot.title}</div>
                        <div className="lot-id">ID: #{lot.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{lot.category}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${statusBadge.class}`}>
                      {statusBadge.label}
                    </span>
                  </td>
                  <td>
                    <div className="images-count">
                      <ImageIcon size={16} />
                      {lot.images}
                    </div>
                  </td>
                  <td className="value-cell">{lot.estimatedValue} FCFA</td>
                  <td className="date-cell">{lot.createdAt}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-icon-btn" title="Voir">
                        <Eye size={18} />
                      </button>
                      <Link href={`/admin/lots/${lot.id}/edit`} className="action-icon-btn" title="Éditer">
                        <Edit size={18} />
                      </Link>
                      <button className="action-icon-btn delete" title="Supprimer">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredLots.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <h3>Aucun lot trouvé</h3>
            <p>Essayez de modifier vos filtres ou créez un nouveau lot</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .lots-management {
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
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }

        .add-btn:hover {
          box-shadow: 0 6px 16px rgba(5, 150, 105, 0.4);
          transform: translateY(-2px);
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

        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
        }

        .filter-select {
          border: none;
          background: none;
          font-size: 14px;
          font-weight: 500;
          color: #374151;
          cursor: pointer;
          outline: none;
        }

        /* Stats Row */
        .stats-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-mini {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          padding: 20px;
        }

        .stat-mini-label {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 8px;
        }

        .stat-mini-value {
          font-size: 32px;
          font-weight: 700;
          color: #059669;
        }

        /* Table */
        .table-card {
          background: white;
          border: 1px solid #E5E7EB;
          border-radius: 16px;
          overflow: hidden;
        }

        .lots-table {
          width: 100%;
          border-collapse: collapse;
        }

        .lots-table th {
          background: #F9FAFB;
          padding: 16px 20px;
          text-align: left;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #E5E7EB;
        }

        .lots-table td {
          padding: 20px;
          border-bottom: 1px solid #F3F4F6;
          font-size: 14px;
          color: #374151;
        }

        .lots-table tr:last-child td {
          border-bottom: none;
        }

        .lots-table tbody tr:hover {
          background: #F9FAFB;
        }

        .lot-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .lot-icon {
          width: 40px;
          height: 40px;
          background: #DBEAFE;
          color: #3B82F6;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .lot-title {
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .lot-id {
          font-size: 12px;
          color: #9CA3AF;
        }

        .category-badge {
          display: inline-block;
          padding: 6px 12px;
          background: #F3F4F6;
          color: #374151;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-badge.available {
          background: #D1FAE5;
          color: #059669;
        }

        .status-badge.in-auction {
          background: #FEF3C7;
          color: #F59E0B;
        }

        .status-badge.sold {
          background: #DBEAFE;
          color: #3B82F6;
        }

        .status-badge.archived {
          background: #F3F4F6;
          color: #6B7280;
        }

        .images-count {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6B7280;
        }

        .value-cell {
          font-weight: 600;
          color: #111827;
        }

        .date-cell {
          color: #6B7280;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-icon-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F9FAFB;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          color: #6B7280;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }

        .action-icon-btn:hover {
          background: #F3F4F6;
          color: #111827;
        }

        .action-icon-btn.delete:hover {
          background: #FEE2E2;
          color: #EF4444;
          border-color: #FECACA;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #9CA3AF;
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
          .stats-row {
            grid-template-columns: repeat(2, 1fr);
          }
          .lots-table {
            font-size: 12px;
          }
          .lots-table th,
          .lots-table td {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  )
}
