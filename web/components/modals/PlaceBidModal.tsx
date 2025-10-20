/**
 * Modal de placement d'enchère
 * Basé sur le design des maquettes
 */

'use client'

import { useState } from 'react'
import { X, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

export interface PlaceBidModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (amount: number) => Promise<void>
  currentPrice: number
  minimumBid: number
  lotTitle: string
  lotImage?: string
}

export default function PlaceBidModal({
  isOpen,
  onClose,
  onConfirm,
  currentPrice,
  minimumBid,
  lotTitle,
  lotImage
}: PlaceBidModalProps) {
  const [bidAmount, setBidAmount] = useState<string>(minimumBid.toString())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const numericBidAmount = parseInt(bidAmount) || 0
  const isValid = numericBidAmount >= minimumBid
  const difference = numericBidAmount - currentPrice

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!isValid) {
      setError(`Le montant minimum est de ${minimumBid.toLocaleString('fr-FR')} FCFA`)
      return
    }

    setIsSubmitting(true)

    try {
      await onConfirm(numericBidAmount)
      setSuccess(true)
      setTimeout(() => {
        onClose()
        setSuccess(false)
        setBidAmount(minimumBid.toString())
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du placement de l\'enchère')
    } finally {
      setIsSubmitting(false)
    }
  }

  const suggestedAmounts = [
    minimumBid,
    minimumBid + 5000,
    minimumBid + 10000,
    minimumBid + 20000
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Placer une enchère</h2>
          <button onClick={onClose} className="modal-close" aria-label="Fermer">
            <X size={24} />
          </button>
        </div>

        {success ? (
          /* Success State */
          <div className="success-container">
            <div className="success-icon">
              <CheckCircle size={64} />
            </div>
            <h3 className="success-title">Enchère placée avec succès !</h3>
            <p className="success-message">
              Votre enchère de <strong>{numericBidAmount.toLocaleString('fr-FR')} FCFA</strong> a été enregistrée.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Lot Info */}
            <div className="lot-info">
              {lotImage && (
                <div className="lot-image">
                  <img src={lotImage} alt={lotTitle} />
                </div>
              )}
              <div className="lot-details">
                <h3 className="lot-title">{lotTitle}</h3>
                <div className="current-bid">
                  <span className="current-bid-label">Enchère actuelle</span>
                  <span className="current-bid-value">
                    {currentPrice.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
            </div>

            {/* Bid Input */}
            <div className="bid-input-section">
              <label className="bid-label">
                Votre enchère
                <span className="bid-label-hint">
                  (min. {minimumBid.toLocaleString('fr-FR')} FCFA)
                </span>
              </label>
              <div className="bid-input-wrapper">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => {
                    setBidAmount(e.target.value)
                    setError(null)
                  }}
                  className={`bid-input ${!isValid && bidAmount ? 'invalid' : ''}`}
                  placeholder={minimumBid.toString()}
                  min={minimumBid}
                  step="1000"
                  required
                  disabled={isSubmitting}
                />
                <span className="bid-currency">FCFA</span>
              </div>

              {/* Difference indicator */}
              {isValid && difference > 0 && (
                <div className="difference-indicator">
                  <TrendingUp size={16} />
                  <span>+{difference.toLocaleString('fr-FR')} FCFA au-dessus de l'enchère actuelle</span>
                </div>
              )}
            </div>

            {/* Quick amounts */}
            <div className="quick-amounts">
              <span className="quick-amounts-label">Montants suggérés :</span>
              <div className="quick-amounts-grid">
                {suggestedAmounts.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setBidAmount(amount.toString())}
                    className={`quick-amount ${numericBidAmount === amount ? 'active' : ''}`}
                    disabled={isSubmitting}
                  >
                    {amount.toLocaleString('fr-FR')}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* Actions */}
            <div className="modal-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={!isValid || isSubmitting}
              >
                {isSubmitting ? 'Placement...' : 'Confirmer l\'enchère'}
              </button>
            </div>

            {/* Info notice */}
            <div className="info-notice">
              <AlertCircle size={16} />
              <p>
                En plaçant cette enchère, vous vous engagez à acheter le lot si vous remportez l'enchère.
              </p>
            </div>
          </form>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }

        .modal-container {
          background: white;
          border-radius: 20px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease-out;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid #E5E7EB;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .modal-close {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F3F4F6;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s;
          color: #6B7280;
        }

        .modal-close:hover {
          background: #E5E7EB;
          color: #374151;
        }

        form {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Lot Info */
        .lot-info {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: #F9FAFB;
          border-radius: 12px;
        }

        .lot-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          background: #E5E7EB;
          flex-shrink: 0;
        }

        .lot-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .lot-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .lot-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          line-height: 1.4;
        }

        .current-bid {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .current-bid-label {
          font-size: 12px;
          color: #6B7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .current-bid-value {
          font-size: 18px;
          font-weight: 700;
          color: #3B82F6;
        }

        /* Bid Input */
        .bid-input-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .bid-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
        }

        .bid-label-hint {
          font-size: 12px;
          font-weight: 500;
          color: #9CA3AF;
        }

        .bid-input-wrapper {
          position: relative;
        }

        .bid-input {
          width: 100%;
          padding: 16px 80px 16px 20px;
          font-size: 24px;
          font-weight: 700;
          border: 3px solid #E5E7EB;
          border-radius: 12px;
          transition: all 0.2s;
          color: #111827;
        }

        .bid-input:focus {
          outline: none;
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .bid-input.invalid {
          border-color: #EF4444;
        }

        .bid-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .bid-currency {
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          font-weight: 600;
          color: #6B7280;
        }

        .difference-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: rgba(76, 175, 80, 0.1);
          border-radius: 8px;
          color: #4CAF50;
          font-size: 14px;
          font-weight: 500;
        }

        /* Quick amounts */
        .quick-amounts {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .quick-amounts-label {
          font-size: 13px;
          font-weight: 500;
          color: #6B7280;
        }

        .quick-amounts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .quick-amount {
          padding: 12px;
          background: #F9FAFB;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s;
        }

        .quick-amount:hover {
          background: #F3F4F6;
          border-color: #D1D5DB;
        }

        .quick-amount.active {
          background: #3B82F6;
          border-color: #3B82F6;
          color: white;
        }

        .quick-amount:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Error */
        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 8px;
          color: #EF4444;
          font-size: 14px;
          font-weight: 500;
        }

        /* Actions */
        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }

        .btn-secondary,
        .btn-primary {
          flex: 1;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-secondary {
          background: #F3F4F6;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #E5E7EB;
        }

        .btn-primary {
          background: #3B82F6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563EB;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Info notice */
        .info-notice {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(59, 130, 246, 0.05);
          border-left: 3px solid #3B82F6;
          border-radius: 8px;
          font-size: 13px;
          color: #6B7280;
          line-height: 1.5;
        }

        .info-notice :global(svg) {
          flex-shrink: 0;
          color: #3B82F6;
          margin-top: 2px;
        }

        /* Success State */
        .success-container {
          padding: 48px 24px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: rgba(76, 175, 80, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4CAF50;
          animation: scaleIn 0.3s ease-out;
        }

        .success-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }

        .success-message {
          font-size: 16px;
          color: #6B7280;
          line-height: 1.6;
        }

        /* Animations */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Responsive */
        @media (max-width: 640px) {
          .modal-container {
            border-radius: 20px 20px 0 0;
            max-height: 95vh;
          }

          .quick-amounts-grid {
            grid-template-columns: 1fr;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }
        }
      `}</style>
    </div>
  )
}
