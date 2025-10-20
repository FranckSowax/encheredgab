/**
 * Page de test WhatsApp
 * Interface pour tester les notifications Whapi
 */

'use client'

import { useState } from 'react'
import { Send, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestWhatsAppPage() {
  const [phone, setPhone] = useState('+241 06 12 34 56')
  const [testType, setTestType] = useState('simple')
  const [message, setMessage] = useState('Test de notification Douane Enchères')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [channelStatus, setChannelStatus] = useState<any>(null)
  const [checkingChannel, setCheckingChannel] = useState(false)
  const [debugResult, setDebugResult] = useState<any>(null)
  const [debugging, setDebugging] = useState(false)

  // Vérifier le status du channel au chargement
  const checkChannel = async () => {
    setCheckingChannel(true)
    try {
      const response = await fetch('/api/check-whapi-channel')
      const data = await response.json()
      setChannelStatus(data)
      
      // Si status AUTH, re-vérifier dans 10 secondes
      if (data.health?.status?.text === 'AUTH') {
        setTimeout(() => {
          console.log('🔄 Re-vérification du status...')
          checkChannel()
        }, 10000)
      }
    } catch (error) {
      console.error('Erreur check channel:', error)
    } finally {
      setCheckingChannel(false)
    }
  }

  const handleDebug = async () => {
    setDebugging(true)
    setDebugResult(null)
    
    try {
      const response = await fetch('/api/debug-whapi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
      })

      const data = await response.json()
      setDebugResult(data)
    } catch (error: any) {
      setDebugResult({
        success: false,
        error: error.message
      })
    } finally {
      setDebugging(false)
    }
  }

  const handleTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const body: any = {
        type: testType,
        phone
      }

      if (testType === 'simple') {
        body.message = message
      } else if (testType === 'outbid') {
        body.userName = 'Jean Dupont'
        body.lotTitle = 'MacBook Pro M2'
        body.previousBid = 850000
        body.newBid = 920000
        body.auctionUrl = 'http://localhost:3000/auctions/123'
      }

      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
              <Send className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Test WhatsApp
              </h1>
              <p className="text-gray-600">Test des notifications via Whapi.cloud</p>
            </div>
            <button
              onClick={checkChannel}
              disabled={checkingChannel}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition disabled:opacity-50"
            >
              {checkingChannel ? 'Vérification...' : 'Vérifier Channel'}
            </button>
          </div>
        </div>

        {/* Status du Channel */}
        {channelStatus && (
          <div className={`bg-white rounded-3xl shadow-xl p-8 mb-8 border-2 ${
            channelStatus.diagnosis?.ready_to_send ? 'border-green-500' : 'border-orange-500'
          }`}>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📡 Status du Channel WhatsApp
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Token</div>
                <div className={`font-semibold ${channelStatus.diagnosis?.token_valid ? 'text-green-600' : 'text-red-600'}`}>
                  {channelStatus.diagnosis?.token_valid ? '✅ Valide' : '❌ Invalide'}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Channels</div>
                <div className={`font-semibold ${channelStatus.diagnosis?.has_channels ? 'text-green-600' : 'text-red-600'}`}>
                  {channelStatus.diagnosis?.has_channels ? '✅ Connecté' : '❌ Non connecté'}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Status</div>
                <div className={`font-semibold ${channelStatus.diagnosis?.ready_to_send ? 'text-green-600' : 'text-orange-600'}`}>
                  {typeof channelStatus.health?.status === 'string' 
                    ? channelStatus.health.status 
                    : typeof channelStatus.health?.status === 'object' 
                    ? channelStatus.health.status?.text || JSON.stringify(channelStatus.health.status)
                    : 'Inconnu'}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Prêt</div>
                <div className={`font-semibold ${channelStatus.diagnosis?.ready_to_send ? 'text-green-600' : 'text-red-600'}`}>
                  {channelStatus.diagnosis?.ready_to_send ? '✅ Oui' : '❌ Non'}
                </div>
              </div>
            </div>

            {channelStatus.diagnosis?.is_authenticating && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  🔄 Authentification en cours...
                </h3>
                <p className="text-sm text-blue-700 mb-3">
                  Votre WhatsApp Business <strong>{channelStatus.diagnosis?.user_connected}</strong> est connecté et en cours d'initialisation.
                </p>
                <div className="space-y-2 text-sm text-blue-700">
                  <div>📱 Numéro : <code className="bg-blue-100 px-2 py-1 rounded">{channelStatus.diagnosis?.phone_number}</code></div>
                  <div>⏱️ Status : <code className="bg-blue-100 px-2 py-1 rounded">AUTH - Authentification</code></div>
                  <div>⏳ Temps estimé : 1-3 minutes</div>
                </div>
                <p className="text-sm text-blue-700 mt-3 font-semibold">
                  ✨ Le channel sera prêt dans quelques instants. Cette page se rafraîchit automatiquement toutes les 10 secondes.
                </p>
              </div>
            )}

            {!channelStatus.diagnosis?.ready_to_send && !channelStatus.diagnosis?.is_authenticating && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                <h3 className="font-bold text-orange-800 mb-2">⚠️ Action Requise</h3>
                <p className="text-sm text-orange-700 mb-3">
                  Votre channel WhatsApp n'est pas connecté. Suivez ces étapes :
                </p>
                <ol className="text-sm text-orange-700 space-y-2 list-decimal list-inside">
                  <li>Allez sur <a href="https://panel.whapi.cloud" target="_blank" className="underline font-semibold">panel.whapi.cloud</a></li>
                  <li>Connectez-vous avec votre compte</li>
                  <li>Cliquez sur "Channels" puis "Add Channel"</li>
                  <li>Scannez le QR code avec votre WhatsApp Business</li>
                  <li>Attendez que le status passe à "ready"</li>
                  <li>Revenez ici et cliquez "Vérifier Channel"</li>
                </ol>
              </div>
            )}

            {channelStatus.diagnosis?.ready_to_send && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  ✅ Channel Prêt !
                </h3>
                <p className="text-sm text-green-700">
                  Votre WhatsApp Business <strong>{channelStatus.diagnosis?.user_connected}</strong> est connecté et prêt à envoyer des messages.
                </p>
              </div>
            )}

            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                Voir les détails techniques
              </summary>
              <pre className="mt-2 p-4 bg-gray-800 text-green-400 rounded-xl text-xs overflow-auto">
                {JSON.stringify(channelStatus, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Formulaire de test */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Configuration du test</h2>

          {/* Type de test */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type de test
            </label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="simple">Message simple</option>
              <option value="outbid">Notification enchère dépassée</option>
              <option value="test_connection">Test connexion Whapi</option>
              <option value="format_phone">Test formatage numéro</option>
            </select>
          </div>

          {/* Numéro de téléphone */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Numéro WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+241 06 12 34 56"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Format: +241 XX XX XX XX (Gabon)
            </p>
          </div>

          {/* Message personnalisé (si type simple) */}
          {testType === 'simple' && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </div>
          )}

          {/* Boutons d'envoi */}
          <div className="flex gap-3">
            <button
              onClick={handleTest}
              disabled={loading || !phone}
              className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Envoyer le test
                </>
              )}
            </button>

            <button
              onClick={handleDebug}
              disabled={debugging || !phone}
              className="px-6 py-4 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              title="Diagnostic complet avec logs détaillés"
            >
              {debugging ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Debug...
                </>
              ) : (
                '🔍 Debug'
              )}
            </button>
          </div>
        </div>

        {/* Résultat Debug */}
        {debugResult && (
          <div className={`bg-white rounded-3xl shadow-xl p-8 mb-8 border-2 ${
            debugResult.success ? 'border-green-500' : 'border-red-500'
          }`}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              🔍 Diagnostic Complet
              {debugResult.success ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
            </h3>

            {/* Résumé */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Health Status</div>
                <div className="font-semibold text-gray-800">
                  {debugResult.diagnosis?.health_status || 'N/A'}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-600 mb-1">Envoi</div>
                <div className={`font-semibold ${debugResult.diagnosis?.send_ok ? 'text-green-600' : 'text-red-600'}`}>
                  {debugResult.diagnosis?.send_ok ? '✅ Réussi' : '❌ Échoué'}
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-xl col-span-2">
                <div className="text-sm text-gray-600 mb-1">Numéro formaté</div>
                <code className="font-mono text-sm">{debugResult.diagnosis?.phone_format}</code>
              </div>

              {debugResult.diagnosis?.send_error && (
                <div className="p-4 bg-red-50 rounded-xl col-span-2">
                  <div className="text-sm font-semibold text-red-600 mb-1">Erreur</div>
                  <div className="text-sm text-red-700">{debugResult.diagnosis.send_error}</div>
                </div>
              )}
            </div>

            {/* Logs détaillés */}
            <details>
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 mb-2">
                📋 Voir les logs détaillés ({debugResult.logs?.length || 0} étapes)
              </summary>
              <div className="space-y-2 mt-2">
                {debugResult.logs?.map((log: any, i: number) => (
                  <div key={i} className="p-3 bg-gray-800 rounded-lg">
                    {log.step && <div className="text-xs text-green-400 mb-1">Étape {log.step}</div>}
                    <pre className="text-xs text-gray-300 overflow-auto whitespace-pre-wrap break-all">
                      {typeof log === 'string' ? log : JSON.stringify(log, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </details>
            
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-700">
                ✅ <strong>Message de debug reçu !</strong> Le système fonctionne correctement.
              </p>
            </div>
          </div>
        )}

        {/* Résultat */}
        {result && (
          <div className={`bg-white rounded-3xl shadow-xl p-8 ${
            result.success ? 'border-2 border-green-500' : 'border-2 border-red-500'
          }`}>
            <div className="flex items-start gap-4 mb-4">
              {result.success ? (
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 ${
                  result.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {result.success ? 'Succès !' : 'Échec'}
                </h3>
                <p className="text-gray-700 mb-4">{result.message}</p>

                {/* Détails */}
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {result.formatted_phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Numéro formaté:</span>
                      <span className="font-mono font-semibold">{result.formatted_phone}</span>
                    </div>
                  )}
                  {result.whatsapp_message_id && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Message ID:</span>
                      <span className="font-mono text-sm">{result.whatsapp_message_id}</span>
                    </div>
                  )}
                  {result.error && (
                    <div className="text-red-600 text-sm">
                      <strong>Erreur:</strong> {result.error}
                    </div>
                  )}
                  {result.details && (
                    <div className="text-gray-600 text-sm">
                      {result.details}
                    </div>
                  )}
                </div>

                {/* JSON brut */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Voir la réponse JSON complète
                  </summary>
                  <pre className="mt-2 p-4 bg-gray-800 text-green-400 rounded-xl text-xs overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          </div>
        )}

        {/* Documentation */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">📚 Documentation</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <strong className="text-gray-800">API URL:</strong>{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">https://gate.whapi.cloud</code>
            </div>
            <div>
              <strong className="text-gray-800">Token:</strong>{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">fKUGct...5nrd</code>
            </div>
            <div>
              <strong className="text-gray-800">Docs:</strong>{' '}
              <a 
                href="https://support.whapi.cloud/help-desk" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-600 hover:underline"
              >
                support.whapi.cloud/help-desk
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
