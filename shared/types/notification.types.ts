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

export interface NotificationTemplate {
  id: string
  type: NotificationType
  channel: NotificationChannel
  language: string
  subject: string | null
  body: string
  variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  channel: NotificationChannel
  subject: string | null
  body: string
  data: Record<string, any>
  status: NotificationStatus
  sent_at: string | null
  delivered_at: string | null
  read_at: string | null
  failed_at: string | null
  error_message: string | null
  priority: number
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationPreferences {
  id: string
  user_id: string
  preferences: Record<NotificationType, NotificationChannel[]>
  email_enabled: boolean
  sms_enabled: boolean
  push_enabled: boolean
  whatsapp_enabled: boolean
  quiet_hours_start: string | null
  quiet_hours_end: string | null
  timezone: string
  created_at: string
  updated_at: string
}

export interface Delivery {
  id: string
  auction_id: string
  lot_id: string
  winner_id: string
  qr_code: string
  qr_code_url: string | null
  delivery_address: string | null
  delivery_city: string | null
  delivery_country: string
  recipient_name: string | null
  recipient_phone: string | null
  status: DeliveryStatus
  ready_at: string | null
  picked_up_at: string | null
  delivered_at: string | null
  delivered_by: string | null
  signature_url: string | null
  photo_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface AdminActivityLog {
  id: string
  admin_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  details: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// Types enrichis
export interface DeliveryWithDetails extends Delivery {
  auction?: {
    id: string
    lot_id: string
    current_price: number
  }
  lot?: {
    id: string
    title: string
    images?: Array<{ image_url: string }>
  }
  winner?: {
    id: string
    full_name: string | null
    email: string
  }
}

export interface NotificationWithUser extends Notification {
  user: {
    id: string
    full_name: string | null
    email: string
  }
}

// Types pour les requêtes API
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

export interface UpdateDeliveryData {
  status?: DeliveryStatus
  delivery_address?: string
  notes?: string
  signature_url?: string
  photo_url?: string
}

export interface GetNotificationsParams {
  user_id?: string
  type?: NotificationType | NotificationType[]
  status?: NotificationStatus | NotificationStatus[]
  channel?: NotificationChannel
  unread_only?: boolean
  limit?: number
  offset?: number
}

export interface GetDeliveriesParams {
  winner_id?: string
  status?: DeliveryStatus | DeliveryStatus[]
  auction_id?: string
  limit?: number
  offset?: number
}

// Dashboard stats
export interface DashboardStats {
  users: {
    total: number
    active: number
    kyc_approved: number
    kyc_pending: number
  }
  lots: {
    total: number
    active: number
    sold: number
    pending_review: number
  }
  auctions: {
    total: number
    active: number
    completed: number
    total_bids: number
    avg_bids_per_auction: number
    total_revenue: number
  }
  deliveries: {
    total: number
    pending: number
    ready: number
    delivered: number
  }
}

// Notification payload pour templates
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

// Helper functions
export function renderTemplate(template: string, payload: NotificationPayload): string {
  let rendered = template
  
  Object.entries(payload).forEach(([key, value]) => {
    const placeholder = `{{${key}}}`
    rendered = rendered.replace(new RegExp(placeholder, 'g'), String(value))
  })
  
  return rendered
}

export function formatNotificationTime(date: string): string {
  const now = new Date()
  const notifDate = new Date(date)
  const diff = now.getTime() - notifDate.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (days > 7) {
    return notifDate.toLocaleDateString('fr-FR')
  } else if (days > 0) {
    return `Il y a ${days} jour${days > 1 ? 's' : ''}`
  } else if (hours > 0) {
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  } else if (minutes > 0) {
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
  } else {
    return 'À l\'instant'
  }
}

export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    bid_placed: '💰',
    bid_outbid: '⚠️',
    bid_won: '🎉',
    auction_starting: '🔔',
    auction_ending_soon: '⏰',
    auction_extended: '⏱️',
    auction_completed: '✅',
    kyc_approved: '✓',
    kyc_rejected: '✗',
    lot_approved: '✓',
    lot_rejected: '✗',
    payment_received: '💳',
    payment_failed: '❌',
    delivery_ready: '📦',
    delivery_completed: '✅',
    system_announcement: '📢'
  }
  
  return icons[type] || '📬'
}

export function getNotificationColor(type: NotificationType): string {
  const colors: Record<NotificationType, string> = {
    bid_placed: 'blue',
    bid_outbid: 'orange',
    bid_won: 'green',
    auction_starting: 'blue',
    auction_ending_soon: 'yellow',
    auction_extended: 'purple',
    auction_completed: 'gray',
    kyc_approved: 'green',
    kyc_rejected: 'red',
    lot_approved: 'green',
    lot_rejected: 'red',
    payment_received: 'green',
    payment_failed: 'red',
    delivery_ready: 'blue',
    delivery_completed: 'green',
    system_announcement: 'purple'
  }
  
  return colors[type] || 'gray'
}
