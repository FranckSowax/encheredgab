/**
 * Page de Paiement Airtel Money
 * Pour les enchères de moins de 1 000 000 FCFA
 */

'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Smartphone, CheckCircle, Loader2, AlertCircle, QrCode } from 'lucide-react'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const auctionId = params.id as string

  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [auction, setAuction] = useState<any>(null)
  const [phone, setPhone] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending')
  const [error, setError] = useState('')

  useEffect(() => {
    // TODO: Récupérer les détails de l'enchère
    // Pour l'instant, données mockées
    setAuction({
      id: auctionId,
      lotTitle: 'Mercedes GLE 2023',
      winningBid: 850000,
      winner: {
        name: 'Jean Dupont',
        phone: '+241061234567'
      }
    })
    setLoading(false)
  }, [auctionId])

  const handlePayment = async () => {
    setPaying(true)
    setError('')
    setPaymentStatus('processing')

    try {
      // TODO: Intégrer API Airtel Money
      // Simulation pour l'instant
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Succès
      setPaymentStatus('success')
      
      // Rediriger vers la page de confirmation après 2 secondes
      setTimeout(() => {
        router.push(`/payment/${auctionId}/success`)
      }, 2000)

    } catch (err: any) {
      setError(err.message || 'Erreur lors du paiement')
      setPaymentStatus('error')
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-600 animate-spin" />
      </div>
    )
  }

  if (!auction || auction.winningBid >= 1000000) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Paiement par virement</h2>
          <p className="text-gray-600 mb-6">
            Le montant de cette enchère dépasse 1 000 000 FCFA.
            Veuillez effectuer un virement bancaire.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full font-medium hover:shadow-lg transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/logo-douane.jpg"
            alt="Douane Gabon"
            className="h-24 w-auto object-contain mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Paiement Airtel Money</h1>
          <p className="text-gray-600">Paiement sécurisé en 30 secondes</p>
        </div>

        {/* Payment Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Status = Pending/Processing */}
          {(paymentStatus === 'pending' || paymentStatus === 'processing') && (
            <>
              {/* Summary */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-green-100 text-sm mb-1">Enchère remportée</p>
                    <h2 className="text-2xl font-bold">{auction.lotTitle}</h2>
                  </div>
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Smartphone className="w-8 h-8" />
                  </div>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <p className="text-green-100 text-sm">Montant à payer</p>
                  <p className="text-4xl font-bold">{auction.winningBid.toLocaleString('fr-FR')} FCFA</p>
                </div>
              </div>

              {/* Payment Form */}
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Payer avec Airtel Money</h3>

                {/* Phone Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Numéro Airtel Money
                  </label>
                  <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={phone || auction.winner.phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+241 06 12 34 56"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-gray-800 font-medium"
                      disabled={paying}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Un code de confirmation sera envoyé à ce numéro
                  </p>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                  <h4 className="font-bold text-blue-900 mb-2">📱 Comment ça marche ?</h4>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Vérifiez votre numéro Airtel Money</li>
                    <li>Cliquez sur "Payer maintenant"</li>
                    <li>Validez le paiement sur votre téléphone</li>
                    <li>Recevez votre QR code de retrait</li>
                  </ol>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Payment Button */}
                <button
                  onClick={handlePayment}
                  disabled={paying || !phone}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Paiement en cours...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-6 h-6" />
                      Payer {auction.winningBid.toLocaleString('fr-FR')} FCFA
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  🔒 Paiement 100% sécurisé avec Airtel Money
                </p>
              </div>
            </>
          )}

          {/* Status = Success */}
          {paymentStatus === 'success' && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Paiement réussi !</h2>
              <p className="text-gray-600 mb-8">
                Votre paiement de {auction.winningBid.toLocaleString('fr-FR')} FCFA a été confirmé.
              </p>
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
                <QrCode className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <p className="text-green-800 font-medium mb-2">
                  Votre QR code de retrait a été généré !
                </p>
                <p className="text-green-700 text-sm">
                  Consultez vos emails et WhatsApp
                </p>
              </div>
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto" />
              <p className="text-gray-500 text-sm mt-2">Redirection...</p>
            </div>
          )}
        </div>

        {/* Help */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Besoin d'aide ? <a href="#" className="text-green-600 hover:underline font-medium">Contactez le support</a>
          </p>
        </div>
      </div>
    </div>
  )
}
