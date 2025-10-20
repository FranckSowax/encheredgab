/**
 * Service WhatsApp via Whapi.cloud
 * Documentation: https://support.whapi.cloud/help-desk
 */

const WHAPI_TOKEN = process.env.WHAPI_TOKEN || 'fKUGctmyoUq5pex25GdAcjrUyjl55nrd'
const WHAPI_BASE_URL = process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud'

interface WhapiMessageResponse {
  sent: boolean
  message?: {
    id: string
    timestamp: number
  }
  error?: string
}

interface SendTextMessageParams {
  to: string // Numéro de téléphone au format international (ex: "241061234567")
  body: string // Texte du message
  typing_time?: number // Temps de simulation de frappe (0-20 secondes)
}

/**
 * Formater un numéro de téléphone gabonais pour WhatsApp
 * Exemples:
 * - "+241 06 12 34 56" → "24106123456"
 * - "06 12 34 56" → "24106123456"
 * - "+24106123456" → "24106123456"
 */
export function formatPhoneNumber(phone: string): string {
  // Supprimer tous les espaces, tirets, parenthèses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '')
  
  // Supprimer le + au début si présent
  cleaned = cleaned.replace(/^\+/, '')
  
  // Si le numéro commence par 0, remplacer par 241 (indicatif Gabon)
  if (cleaned.startsWith('0')) {
    cleaned = '241' + cleaned.substring(1)
  }
  
  // Si le numéro ne commence pas par 241, l'ajouter
  if (!cleaned.startsWith('241')) {
    cleaned = '241' + cleaned
  }
  
  return cleaned
}

/**
 * Envoyer un message texte via WhatsApp
 */
export async function sendTextMessage({
  to,
  body,
  typing_time = 0
}: SendTextMessageParams): Promise<WhapiMessageResponse> {
  try {
    const formattedPhone = formatPhoneNumber(to)
    
    console.log(`📱 Envoi WhatsApp à ${formattedPhone}:`, body)
    
    const response = await fetch(`${WHAPI_BASE_URL}/messages/text`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Bearer ${WHAPI_TOKEN}`
      },
      body: JSON.stringify({
        to: formattedPhone,
        body,
        typing_time
      })
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('❌ Erreur Whapi:', data)
      return {
        sent: false,
        error: data.message || 'Erreur lors de l\'envoi'
      }
    }

    console.log('✅ Message WhatsApp envoyé:', data)
    return {
      sent: true,
      message: data
    }
  } catch (error: any) {
    console.error('❌ Erreur envoi WhatsApp:', error)
    return {
      sent: false,
      error: error.message
    }
  }
}

/**
 * Envoyer une notification d'enchère dépassée
 */
export async function notifyOutbid(params: {
  to: string
  userName: string
  lotTitle: string
  previousBid: number
  newBid: number
  auctionId: string
  auctionUrl: string
}): Promise<WhapiMessageResponse> {
  const message = `🔔 *Douane Enchères - Alerte Enchère*

Bonjour ${params.userName},

Votre enchère sur *${params.lotTitle}* a été dépassée ! 😔

💰 Votre offre : ${params.previousBid.toLocaleString('fr-FR')} FCFA
🔥 Nouvelle offre : ${params.newBid.toLocaleString('fr-FR')} FCFA

Ne laissez pas passer cette opportunité !

👉 Surenchérir maintenant : ${params.auctionUrl}

_Douane Enchères Gabon - Enchères Officielles_`

  return sendTextMessage({
    to: params.to,
    body: message,
    typing_time: 0
  })
}

/**
 * Envoyer une notification de victoire d'enchère avec lien de paiement
 */
export async function notifyAuctionWon(params: {
  to: string
  userName: string
  lotTitle: string
  winningBid: number
  auctionUrl: string
  auctionId: string
}): Promise<WhapiMessageResponse> {
  const isSmallAmount = params.winningBid < 1000000 // Moins de 1 million
  
  let message = `🎉 *Félicitations ${params.userName} !*

Vous avez remporté l'enchère ! 🏆

📦 Article : *${params.lotTitle}*
💰 Montant gagnant : ${params.winningBid.toLocaleString('fr-FR')} FCFA

`

  // Paiement selon le montant
  if (isSmallAmount) {
    // Moins de 1 million : Lien de paiement Airtel Money
    const paymentLink = `${process.env.NEXT_PUBLIC_APP_URL}/payment/${params.auctionId}`
    
    message += `💳 *PAIEMENT FACILE*

Payez en 30 secondes avec Airtel Money :

👉 *CLIQUEZ ICI POUR PAYER* 👈
${paymentLink}

✅ Paiement sécurisé
✅ Confirmation immédiate
✅ QR code de retrait automatique

`
  } else {
    // Plus de 1 million : Virement bancaire
    message += `🏦 *PAIEMENT PAR VIREMENT*

Montant trop élevé pour paiement mobile.

📋 *Coordonnées bancaires :*
Banque : BGD (Banque Gabonaise de Développement)
Compte : 1234567890
Bénéficiaire : Douane Gabon - Enchères
Référence : ENCH-${params.auctionId.substring(0, 8)}

⚠️ *IMPORTANT :*
Envoyez la preuve de dépôt par WhatsApp après le virement.
Votre QR code de retrait sera généré après validation.

`
  }

  message += `📍 *Retrait :*
Direction Générale des Douanes
Libreville, Gabon
Lun-Ven : 9h-16h

_Douane Enchères Gabon - Enchères Officielles_`

  return sendTextMessage({
    to: params.to,
    body: message,
    typing_time: 0
  })
}

/**
 * Envoyer une notification d'enchère bientôt terminée
 */
export async function notifyAuctionEndingSoon(params: {
  to: string
  userName: string
  lotTitle: string
  currentBid: number
  timeRemaining: string
  auctionUrl: string
}): Promise<WhapiMessageResponse> {
  const message = `⏰ *Douane Enchères - Enchère se termine bientôt !*

Bonjour ${params.userName},

L'enchère sur *${params.lotTitle}* se termine dans ${params.timeRemaining} !

💰 Prix actuel : ${params.currentBid.toLocaleString('fr-FR')} FCFA

C'est votre dernière chance !

👉 Voir l'enchère : ${params.auctionUrl}

_Douane Enchères Gabon - Enchères Officielles_`

  return sendTextMessage({
    to: params.to,
    body: message,
    typing_time: 0
  })
}

/**
 * Tester la connexion Whapi
 */
export async function testWhapiConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${WHAPI_BASE_URL}/settings`, {
      headers: {
        'authorization': `Bearer ${WHAPI_TOKEN}`
      }
    })
    
    return response.ok
  } catch (error) {
    console.error('Erreur test Whapi:', error)
    return false
  }
}
