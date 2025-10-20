/**
 * Module de notifications SMS
 * Compatible avec Twilio, Africa's Talking, ou tout autre provider SMS
 */

import type { NotificationPayload } from '@/types/notification.types'

// Pour Twilio
import twilio from 'twilio'

const client = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

export interface SMSOptions {
  to: string
  message: string
  from?: string
}

export async function sendSMS(options: SMSOptions) {
  try {
    if (!client) {
      throw new Error('SMS client not configured')
    }

    const message = await client.messages.create({
      body: options.message,
      to: options.to,
      from: options.from || process.env.TWILIO_PHONE_NUMBER
    })

    return {
      success: true,
      messageId: message.sid,
      provider: 'twilio',
      status: message.status
    }
  } catch (error) {
    console.error('Failed to send SMS:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'twilio'
    }
  }
}

// Templates SMS (courts et concis)
export function getSMSTemplate(type: string, payload: NotificationPayload): string {
  const templates: Record<string, string> = {
    bid_placed: `Douane Enchères: Nouvelle enchère de ${payload.bid_amount} FCFA sur ${payload.lot_title}`,
    
    bid_outbid: `⚠️ Surenchéri sur ${payload.lot_title}! Nouvelle enchère: ${payload.new_bid_amount} FCFA. Enchérissez: ${payload.auction_url}`,
    
    bid_won: `🎉 Félicitations! Vous avez remporté ${payload.lot_title} pour ${payload.winning_amount} FCFA. Consultez vos détails de livraison.`,
    
    auction_ending_soon: `⏰ ${payload.lot_title} se termine dans ${payload.time_remaining}! Enchère actuelle: ${payload.current_price} FCFA`,
    
    kyc_approved: `✓ Votre vérification KYC a été approuvée. Vous pouvez maintenant participer aux enchères!`,
    
    kyc_rejected: `Votre vérification KYC a été rejetée. Veuillez soumettre de nouveaux documents.`,
    
    delivery_ready: `📦 Votre lot ${payload.lot_title} est prêt pour le retrait. Code QR: ${payload.qr_code}`,
    
    payment_received: `Paiement de ${payload.bid_amount} FCFA reçu. Merci!`,
  }

  return templates[type] || `Notification Douane Enchères: ${payload.lot_title || 'Nouvelle notification'}`
}

// Formatage numéro de téléphone pour Gabon
export function formatGabonPhone(phone: string): string {
  // Enlever espaces et caractères spéciaux
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

// Validation numéro gabonais
export function isValidGabonPhone(phone: string): boolean {
  const formatted = formatGabonPhone(phone)
  // Format: +241 XX XX XX XX (9 chiffres après +241)
  return /^\+241[0-9]{9}$/.test(formatted.replace(/\s/g, ''))
}

// Batch SMS (pour plusieurs destinataires)
export async function sendBulkSMS(recipients: string[], message: string) {
  const results = await Promise.allSettled(
    recipients.map(to => sendSMS({ to: formatGabonPhone(to), message }))
  )

  const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.success).length
  const failed = results.length - succeeded

  return {
    total: results.length,
    succeeded,
    failed,
    results
  }
}
