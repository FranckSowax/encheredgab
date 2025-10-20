/**
 * Module principal de notifications multi-canal
 * Orchestre l'envoi via email, SMS, push, etc.
 */

import { createClient } from '@/lib/supabase/server'
import { sendEmail, getEmailTemplate } from './email'
import { sendSMS, getSMSTemplate, formatGabonPhone } from './sms'
import { sendWhatsAppMessage, getWhatsAppTemplate, formatWhapiPhone } from './whatsapp'
import { renderTemplate } from '@/types/notification.types'
import type {
  NotificationType,
  NotificationChannel,
  NotificationPayload,
  SendNotificationData
} from '@/types/notification.types'

export interface NotificationResult {
  success: boolean
  channel: NotificationChannel
  messageId?: string
  error?: string
}

/**
 * Envoyer une notification multi-canal à un utilisateur
 */
export async function sendNotification(data: SendNotificationData): Promise<NotificationResult[]> {
  const supabase = await createClient()
  const results: NotificationResult[] = []

  try {
    // 1. Récupérer l'utilisateur et ses préférences
    const { data: user } = await supabase
      .from('users')
      .select('id, email, phone, full_name')
      .eq('id', data.user_id)
      .single()

    if (!user) {
      throw new Error('User not found')
    }

    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', data.user_id)
      .single()

    // 2. Déterminer les canaux à utiliser
    const channels = data.channels || prefs?.preferences[data.type] || ['email']
    
    // Filtrer selon les préférences globales
    const enabledChannels = channels.filter((channel: NotificationChannel) => {
      switch (channel) {
        case 'email': return prefs?.email_enabled !== false
        case 'sms': return prefs?.sms_enabled !== false && user.phone
        case 'push': return prefs?.push_enabled !== false
        case 'whatsapp': return prefs?.whatsapp_enabled === true && user.phone
        default: return true
      }
    })

    // 3. Vérifier quiet hours
    if (prefs?.quiet_hours_start && prefs?.quiet_hours_end) {
      const now = new Date()
      const currentTime = now.toTimeString().slice(0, 5) // HH:MM
      if (currentTime >= prefs.quiet_hours_start && currentTime <= prefs.quiet_hours_end) {
        // En quiet hours, seulement les notifications haute priorité
        if ((data.priority || 3) < 5) {
          console.log('Notification skipped due to quiet hours')
          return []
        }
      }
    }

    // 4. Récupérer le template
    const { data: template } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('type', data.type)
      .eq('is_active', true)
      .limit(1)

    // 5. Préparer le payload
    const payload: NotificationPayload = {
      user_name: user.full_name || user.email,
      ...data.data
    }

    // 6. Envoyer sur chaque canal
    for (const channel of enabledChannels) {
      let result: NotificationResult

      try {
        switch (channel) {
          case 'email':
            if (!user.email) break
            
            const emailTemplate = template?.[0]?.channel === 'email'
              ? template[0]
              : null

            const subject = emailTemplate?.subject
              ? renderTemplate(emailTemplate.subject, payload)
              : `Notification Douane Enchères`

            const html = getEmailTemplate(data.type, payload)

            const emailResult = await sendEmail({
              to: user.email,
              subject,
              html
            })

            result = {
              success: emailResult.success,
              channel: 'email',
              messageId: emailResult.messageId,
              error: emailResult.error
            }
            results.push(result)

            // Enregistrer la notification
            await createNotificationRecord(supabase, {
              user_id: data.user_id,
              type: data.type,
              channel: 'email',
              subject,
              body: html,
              data: payload,
              status: emailResult.success ? 'sent' : 'failed',
              error_message: emailResult.error,
              priority: data.priority
            })
            break

          case 'sms':
            if (!user.phone) break

            const smsTemplate = template?.[0]?.channel === 'sms'
              ? template[0]
              : null

            const smsBody = smsTemplate?.body
              ? renderTemplate(smsTemplate.body, payload)
              : getSMSTemplate(data.type, payload)

            const smsResult = await sendSMS({
              to: formatGabonPhone(user.phone),
              message: smsBody
            })

            result = {
              success: smsResult.success,
              channel: 'sms',
              messageId: smsResult.messageId,
              error: smsResult.error
            }
            results.push(result)

            await createNotificationRecord(supabase, {
              user_id: data.user_id,
              type: data.type,
              channel: 'sms',
              subject: null,
              body: smsBody,
              data: payload,
              status: smsResult.success ? 'sent' : 'failed',
              error_message: smsResult.error,
              priority: data.priority
            })
            break

          case 'whatsapp':
            if (!user.phone) break

            const whatsappTemplate = template?.[0]?.channel === 'whatsapp'
              ? template[0]
              : null

            const whatsappBody = whatsappTemplate?.body
              ? renderTemplate(whatsappTemplate.body, payload)
              : getWhatsAppTemplate(data.type, payload)

            const whatsappResult = await sendWhatsAppMessage({
              to: formatWhapiPhone(user.phone),
              message: whatsappBody
            })

            result = {
              success: whatsappResult.success,
              channel: 'whatsapp',
              messageId: whatsappResult.messageId,
              error: whatsappResult.error
            }
            results.push(result)

            await createNotificationRecord(supabase, {
              user_id: data.user_id,
              type: data.type,
              channel: 'whatsapp',
              subject: null,
              body: whatsappBody,
              data: payload,
              status: whatsappResult.success ? 'sent' : 'failed',
              error_message: whatsappResult.error,
              priority: data.priority
            })
            break

          case 'push':
            // TODO: Implémenter push notifications (FCM/APNS)
            result = {
              success: false,
              channel: 'push',
              error: 'Push notifications not yet implemented'
            }
            results.push(result)
            break

          case 'in_app':
            // Notification in-app (stockée dans la DB)
            const inAppTemplate = template?.[0]
            const inAppBody = inAppTemplate?.body
              ? renderTemplate(inAppTemplate.body, payload)
              : `Nouvelle notification: ${data.type}`

            await createNotificationRecord(supabase, {
              user_id: data.user_id,
              type: data.type,
              channel: 'in_app',
              subject: inAppTemplate?.subject || null,
              body: inAppBody,
              data: payload,
              status: 'delivered',
              priority: data.priority
            })

            result = {
              success: true,
              channel: 'in_app'
            }
            results.push(result)
            break
        }
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error)
        results.push({
          success: false,
          channel,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  } catch (error) {
    console.error('Failed to send notification:', error)
    throw error
  }
}

/**
 * Créer un enregistrement de notification dans la DB
 */
async function createNotificationRecord(
  supabase: any,
  data: {
    user_id: string
    type: NotificationType
    channel: NotificationChannel
    subject: string | null
    body: string
    data: any
    status: string
    error_message?: string
    priority?: number
  }
) {
  const record = {
    ...data,
    sent_at: data.status === 'sent' ? new Date().toISOString() : null,
    delivered_at: data.status === 'delivered' ? new Date().toISOString() : null,
    failed_at: data.status === 'failed' ? new Date().toISOString() : null
  }

  const { error } = await supabase
    .from('notifications')
    .insert(record)

  if (error) {
    console.error('Failed to create notification record:', error)
  }
}

/**
 * Helpers pour types de notifications spécifiques
 */

export async function notifyBidPlaced(params: {
  user_id: string
  lot_title: string
  bid_amount: number
  auction_url: string
}) {
  return sendNotification({
    user_id: params.user_id,
    type: 'bid_placed',
    data: {
      lot_title: params.lot_title,
      bid_amount: `${params.bid_amount.toLocaleString('fr-FR')}`,
      auction_url: params.auction_url
    },
    priority: 2
  })
}

export async function notifyBidOutbid(params: {
  user_id: string
  lot_title: string
  new_bid_amount: number
  your_bid_amount: number
  auction_url: string
}) {
  return sendNotification({
    user_id: params.user_id,
    type: 'bid_outbid',
    channels: ['email', 'sms', 'push'], // Urgent
    data: {
      lot_title: params.lot_title,
      new_bid_amount: `${params.new_bid_amount.toLocaleString('fr-FR')}`,
      your_bid_amount: `${params.your_bid_amount.toLocaleString('fr-FR')}`,
      auction_url: params.auction_url
    },
    priority: 5 // Haute priorité
  })
}

export async function notifyBidWon(params: {
  user_id: string
  lot_title: string
  winning_amount: number
  auction_url: string
}) {
  return sendNotification({
    user_id: params.user_id,
    type: 'bid_won',
    channels: ['email', 'sms', 'push'],
    data: {
      lot_title: params.lot_title,
      winning_amount: `${params.winning_amount.toLocaleString('fr-FR')}`,
      auction_url: params.auction_url
    },
    priority: 5
  })
}

export async function notifyAuctionEndingSoon(params: {
  user_id: string
  lot_title: string
  time_remaining: string
  current_price: number
  auction_url: string
}) {
  return sendNotification({
    user_id: params.user_id,
    type: 'auction_ending_soon',
    channels: ['push', 'email'],
    data: {
      lot_title: params.lot_title,
      time_remaining: params.time_remaining,
      current_price: `${params.current_price.toLocaleString('fr-FR')}`,
      auction_url: params.auction_url
    },
    priority: 4
  })
}

export async function notifyDeliveryReady(params: {
  user_id: string
  lot_title: string
  qr_code: string
}) {
  return sendNotification({
    user_id: params.user_id,
    type: 'delivery_ready',
    channels: ['email', 'sms'],
    data: {
      lot_title: params.lot_title,
      qr_code: params.qr_code
    },
    priority: 4
  })
}
