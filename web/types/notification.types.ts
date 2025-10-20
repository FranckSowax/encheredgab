/**
 * Types pour le système de notifications
 */

export type NotificationChannel = 'email' | 'sms' | 'push' | 'whatsapp' | 'in_app'

export type NotificationType =
  | 'bid_placed'
  | 'bid_outbid'
  | 'bid_won'
  | 'auction_starting'
  | 'auction_ending_soon'
  | 'auction_extended'
  | 'auction_completed'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'lot_approved'
  | 'lot_rejected'
  | 'payment_received'
  | 'payment_failed'
  | 'delivery_ready'
  | 'delivery_completed'
  | 'system_announcement'

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export type DeliveryStatus = 'pending' | 'ready' | 'in_transit' | 'delivered' | 'cancelled'

export interface SendNotificationData {
  user_id: string
  type: NotificationType
  channels?: NotificationChannel[]
  data?: Record<string, any>
  priority?: number
}

export interface CreateDeliveryData {
  auction_id: string
  delivery_address?: string
  delivery_city?: string
  recipient_name?: string
  recipient_phone?: string
}

export interface NotificationPayload {
  user_name?: string
  lot_title?: string
  bid_amount?: string | number
  new_bid_amount?: string | number
  your_bid_amount?: string | number
  winning_amount?: string | number
  current_price?: string | number
  time_remaining?: string
  auction_url?: string
  qr_code?: string
  [key: string]: any
}

export function renderTemplate(template: string, payload: NotificationPayload): string {
  let rendered = template
  
  Object.entries(payload).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value))
  })
  
  return rendered
}
