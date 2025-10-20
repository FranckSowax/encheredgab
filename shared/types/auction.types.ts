/**
 * Types pour le système d'enchères en temps réel
 */

export type AuctionStatus = 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
export type BidType = 'manual' | 'auto' | 'snipe'
export type BidStatus = 'pending' | 'valid' | 'outbid' | 'winning' | 'won' | 'invalid' | 'refunded'

export interface Auction {
  id: string
  lot_id: string
  
  // Dates
  start_date: string
  end_date: string
  extended_count: number
  total_extension_time: string // Interval PostgreSQL
  
  // Prix
  starting_price: number
  reserve_price: number | null
  current_price: number
  increment: number
  
  // Statistiques
  total_bids: number
  unique_bidders: number
  views_count: number
  
  // État
  status: AuctionStatus
  winner_id: string | null
  winning_bid_id: string | null
  
  // Anti-sniping
  anti_snipe_enabled: boolean
  anti_snipe_threshold: string // Interval
  anti_snipe_extension: string // Interval
  max_extensions: number
  
  // Métadonnées
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Bid {
  id: string
  auction_id: string
  lot_id: string
  user_id: string
  
  // Montant
  amount: number
  bid_type: BidType
  status: BidStatus
  
  // Auto-bidding
  is_auto_bid: boolean
  max_auto_amount: number | null
  
  // Validation
  is_valid: boolean
  validation_error: string | null
  
  // Tracking
  ip_address: string | null
  user_agent: string | null
  time_before_end: string | null // Interval
  is_snipe: boolean
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface AutoBid {
  id: string
  auction_id: string
  user_id: string
  
  max_amount: number
  increment: number
  is_active: boolean
  
  bids_placed: number
  amount_used: number
  
  created_at: string
  updated_at: string
  deactivated_at: string | null
}

export interface OfflineBid {
  id: string
  auction_id: string
  user_id: string
  
  amount: number
  bid_data: Record<string, any> | null
  
  status: 'queued' | 'processing' | 'completed' | 'failed'
  retry_count: number
  error_message: string | null
  
  created_at: string
  processed_at: string | null
}

export interface BidEvent {
  id: string
  auction_id: string
  bid_id: string | null
  user_id: string | null
  
  event_type: string
  event_data: Record<string, any> | null
  
  created_at: string
}

// Types enrichis avec relations
export interface AuctionWithDetails extends Auction {
  lot?: {
    id: string
    title: string
    description: string | null
    category_id: string | null
    starting_bid: number
    images?: Array<{
      id: string
      image_url: string
      is_primary: boolean
    }>
  }
  winner?: {
    id: string
    full_name: string | null
    email: string
  }
  current_bids?: Bid[]
  time_remaining?: number // en secondes
}

export interface BidWithUser extends Bid {
  user: {
    id: string
    full_name: string | null
    email: string
  }
}

// Types pour les requêtes API
export interface CreateAuctionData {
  lot_id: string
  start_date: string
  end_date: string
  starting_price: number
  reserve_price?: number
  increment?: number
  anti_snipe_enabled?: boolean
  anti_snipe_threshold?: string
  anti_snipe_extension?: string
  max_extensions?: number
}

export interface PlaceBidData {
  auction_id: string
  amount: number
  bid_type?: BidType
}

export interface CreateAutoBidData {
  auction_id: string
  max_amount: number
  increment?: number
}

export interface GetAuctionsParams {
  status?: AuctionStatus | AuctionStatus[]
  lot_id?: string
  active_only?: boolean
  limit?: number
  offset?: number
  sort_by?: 'end_date' | 'current_price' | 'total_bids'
  sort_order?: 'asc' | 'desc'
}

export interface GetBidsParams {
  auction_id?: string
  user_id?: string
  status?: BidStatus | BidStatus[]
  limit?: number
  offset?: number
}

// Types pour les réponses API
export interface BidValidationResult {
  is_valid: boolean
  error_message: string | null
  current_price: number | null
  minimum_bid: number | null
}

export interface PlaceBidResult {
  success: boolean
  bid_id: string | null
  message: string
  new_price: number | null
  extended: boolean
}

export interface AuctionListResponse {
  auctions: AuctionWithDetails[]
  total: number
  limit: number
  offset: number
}

// Types pour Realtime
export interface RealtimeAuctionUpdate {
  type: 'auction_update'
  auction_id: string
  data: Partial<Auction>
}

export interface RealtimeBidUpdate {
  type: 'new_bid' | 'bid_outbid' | 'bid_won'
  auction_id: string
  bid: Bid
  previous_price?: number
  new_price: number
}

export interface RealtimeAuctionExtended {
  type: 'auction_extended'
  auction_id: string
  new_end_date: string
  extension_time: string
  extended_count: number
}

export interface RealtimeAuctionEnded {
  type: 'auction_ended'
  auction_id: string
  winner_id: string | null
  winning_amount: number | null
}

export type RealtimeMessage = 
  | RealtimeAuctionUpdate 
  | RealtimeBidUpdate 
  | RealtimeAuctionExtended 
  | RealtimeAuctionEnded

// Types pour les événements WebSocket
export interface AuctionChannel {
  auction_id: string
  subscribe: () => void
  unsubscribe: () => void
  on: (event: string, callback: (payload: any) => void) => void
}

// Helpers
export interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total_seconds: number
  is_ending_soon: boolean // < 5 minutes
  is_critical: boolean // < 1 minute
}

export function calculateTimeRemaining(endDate: string): TimeRemaining {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total_seconds: 0,
      is_ending_soon: false,
      is_critical: false
    }
  }
  
  const total_seconds = Math.floor(diff / 1000)
  const days = Math.floor(total_seconds / 86400)
  const hours = Math.floor((total_seconds % 86400) / 3600)
  const minutes = Math.floor((total_seconds % 3600) / 60)
  const seconds = total_seconds % 60
  
  return {
    days,
    hours,
    minutes,
    seconds,
    total_seconds,
    is_ending_soon: total_seconds < 300, // 5 minutes
    is_critical: total_seconds < 60 // 1 minute
  }
}

export function formatTimeRemaining(time: TimeRemaining): string {
  if (time.total_seconds === 0) return 'Terminée'
  
  if (time.days > 0) {
    return `${time.days}j ${time.hours}h`
  }
  
  if (time.hours > 0) {
    return `${time.hours}h ${time.minutes}m`
  }
  
  if (time.minutes > 0) {
    return `${time.minutes}m ${time.seconds}s`
  }
  
  return `${time.seconds}s`
}

export function isAuctionActive(auction: Auction): boolean {
  return auction.status === 'active' && new Date(auction.end_date) > new Date()
}

export function canUserBid(auction: Auction, userId: string | null): boolean {
  if (!userId) return false
  if (!isAuctionActive(auction)) return false
  if (auction.winner_id === userId) return false // Déjà gagnant
  
  return true
}

export function calculateMinimumBid(auction: Auction): number {
  return auction.current_price + auction.increment
}
