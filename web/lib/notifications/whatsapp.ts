/**
 * Module de notifications WhatsApp via Whapi
 * Documentation: https://whapi.cloud
 */

import type { NotificationPayload } from '@/types/notification.types'

const WHAPI_API_URL = 'https://gate.whapi.cloud'
const WHAPI_TOKEN = process.env.WHAPI_TOKEN

export interface WhatsAppOptions {
  to: string // Format: +241xxxxxxxxx
  message: string
  mediaUrl?: string // Image, video ou document
}

export async function sendWhatsAppMessage(options: WhatsAppOptions) {
  try {
    if (!WHAPI_TOKEN) {
      throw new Error('Whapi token not configured')
    }

    // Formater le numéro (enlever le +)
    const phoneNumber = options.to.replace('+', '')

    const payload: any = {
      typing_time: 0,
      to: phoneNumber,
      body: options.message
    }

    // Si média fourni
    if (options.mediaUrl) {
      payload.media = {
        link: options.mediaUrl
      }
    }

    const response = await fetch(`${WHAPI_API_URL}/messages/text`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'WhatsApp send failed')
    }

    return {
      success: true,
      messageId: data.id,
      provider: 'whapi',
      status: data.status
    }
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'whapi'
    }
  }
}

/**
 * Envoyer un message WhatsApp avec image
 */
export async function sendWhatsAppImage(options: {
  to: string
  caption: string
  imageUrl: string
}) {
  try {
    if (!WHAPI_TOKEN) {
      throw new Error('Whapi token not configured')
    }

    const phoneNumber = options.to.replace('+', '')

    const response = await fetch(`${WHAPI_API_URL}/messages/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        typing_time: 0,
        to: phoneNumber,
        media: {
          link: options.imageUrl
        },
        caption: options.caption
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'WhatsApp image send failed')
    }

    return {
      success: true,
      messageId: data.id,
      provider: 'whapi'
    }
  } catch (error) {
    console.error('Failed to send WhatsApp image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'whapi'
    }
  }
}

/**
 * Envoyer un document WhatsApp
 */
export async function sendWhatsAppDocument(options: {
  to: string
  documentUrl: string
  filename: string
  caption?: string
}) {
  try {
    if (!WHAPI_TOKEN) {
      throw new Error('Whapi token not configured')
    }

    const phoneNumber = options.to.replace('+', '')

    const response = await fetch(`${WHAPI_API_URL}/messages/document`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        typing_time: 0,
        to: phoneNumber,
        media: {
          link: options.documentUrl
        },
        filename: options.filename,
        caption: options.caption
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'WhatsApp document send failed')
    }

    return {
      success: true,
      messageId: data.id,
      provider: 'whapi'
    }
  } catch (error) {
    console.error('Failed to send WhatsApp document:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'whapi'
    }
  }
}

/**
 * Vérifier le statut du service Whapi
 */
export async function checkWhapiStatus() {
  try {
    if (!WHAPI_TOKEN) {
      return { available: false, error: 'Token not configured' }
    }

    const response = await fetch(`${WHAPI_API_URL}/settings`, {
      headers: {
        'Authorization': `Bearer ${WHAPI_TOKEN}`,
      }
    })

    if (!response.ok) {
      throw new Error('Whapi service unavailable')
    }

    const data = await response.json()

    return {
      available: true,
      phoneNumber: data.phone_number,
      isReady: data.is_ready
    }
  } catch (error) {
    console.error('Failed to check Whapi status:', error)
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Templates WhatsApp (plus courts que SMS, avec emojis)
export function getWhatsAppTemplate(type: string, payload: NotificationPayload): string {
  const templates: Record<string, string> = {
    bid_placed: `🔔 *Douane Enchères*\n\nNouvelle enchère de *${payload.bid_amount} FCFA* sur :\n📦 ${payload.lot_title}\n\n👉 Voir l'enchère : ${payload.auction_url}`,
    
    bid_outbid: `⚠️ *Vous avez été surenchéri !*\n\n📦 ${payload.lot_title}\n💰 Nouvelle enchère : *${payload.new_bid_amount} FCFA*\n💸 Votre enchère : ${payload.your_bid_amount} FCFA\n\n🔥 Enchérissez maintenant :\n${payload.auction_url}`,
    
    bid_won: `🎉 *FÉLICITATIONS !*\n\nVous avez remporté l'enchère :\n📦 ${payload.lot_title}\n💰 Montant final : *${payload.winning_amount} FCFA*\n\n📋 Prochaines étapes :\n1️⃣ Effectuer le paiement\n2️⃣ Consulter vos infos de livraison\n3️⃣ Récupérer votre lot\n\n👉 ${payload.auction_url}`,
    
    auction_ending_soon: `⏰ *DERNIÈRES MINUTES !*\n\n📦 ${payload.lot_title}\n⏱️ Se termine dans *${payload.time_remaining}*\n💰 Enchère actuelle : ${payload.current_price} FCFA\n\n🔥 Enchérissez vite :\n${payload.auction_url}`,
    
    auction_extended: `⏱️ *Enchère prolongée !*\n\n📦 ${payload.lot_title}\n\nL'enchère a été prolongée de *${payload.time_remaining}* suite à une nouvelle enchère.\n\n👉 ${payload.auction_url}`,
    
    kyc_approved: `✅ *Vérification approuvée !*\n\nVotre vérification d'identité (KYC) a été approuvée.\n\nVous pouvez maintenant participer à toutes les enchères ! 🎉\n\n👉 Voir les enchères actives`,
    
    kyc_rejected: `❌ *Vérification refusée*\n\nVotre vérification d'identité (KYC) a été refusée.\n\nMerci de soumettre de nouveaux documents conformes.\n\n📞 Besoin d'aide ? Contactez-nous.`,
    
    delivery_ready: `📦 *Votre lot est prêt !*\n\n${payload.lot_title}\n\n✅ Prêt pour le retrait\n🔐 Code QR : *${payload.qr_code}*\n\n📍 Présentez ce code au retrait de votre lot.\n\n⚠️ Ne partagez pas ce code !`,
    
    delivery_completed: `✅ *Livraison effectuée*\n\n📦 ${payload.lot_title}\n\nMerci d'avoir utilisé Douane Enchères !\n\n⭐ Notez votre expérience`,
    
    payment_received: `💳 *Paiement reçu*\n\nMontant : *${payload.bid_amount} FCFA*\n\nMerci ! Votre paiement a été confirmé.\n\n📦 Votre lot sera bientôt prêt pour le retrait.`,
    
    payment_failed: `❌ *Échec du paiement*\n\nMontant : ${payload.bid_amount} FCFA\n\nVotre paiement n'a pas abouti.\n\n🔄 Veuillez réessayer ou contactez le support.`,
    
    system_announcement: `📢 *Annonce Douane Enchères*\n\n${payload.lot_title || 'Nouvelle annonce système'}`
  }

  return templates[type] || `📬 *Douane Enchères*\n\n${payload.lot_title || 'Nouvelle notification'}`
}

// Formatage numéro pour Whapi (sans le +)
export function formatWhapiPhone(phone: string): string {
  // Enlever espaces et caractères spéciaux sauf +
  let cleaned = phone.replace(/[^0-9+]/g, '')
  
  // Si commence par 0, remplacer par +241
  if (cleaned.startsWith('0')) {
    cleaned = '+241' + cleaned.substring(1)
  }
  
  // Si ne commence pas par +, ajouter +241
  if (!cleaned.startsWith('+')) {
    cleaned = '+241' + cleaned
  }
  
  return cleaned
}

// Validation avec emojis WhatsApp
export function isValidWhatsAppNumber(phone: string): boolean {
  const formatted = formatWhapiPhone(phone)
  // Format: +241 XX XX XX XX (9 chiffres après +241)
  return /^\+241[0-9]{9}$/.test(formatted.replace(/\s/g, ''))
}

// Batch WhatsApp (attention au rate limiting)
export async function sendBulkWhatsApp(
  recipients: string[],
  message: string,
  delayMs: number = 1000 // Délai entre messages pour éviter rate limit
) {
  const results = []

  for (const recipient of recipients) {
    const result = await sendWhatsAppMessage({
      to: formatWhapiPhone(recipient),
      message
    })

    results.push(result)

    // Attendre avant le prochain envoi
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  const succeeded = results.filter(r => r.success).length
  const failed = results.length - succeeded

  return {
    total: results.length,
    succeeded,
    failed,
    results
  }
}
