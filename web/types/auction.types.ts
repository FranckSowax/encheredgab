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

// Types enrichis avec relations
export interface AuctionWithDetails extends Auction {
  lot?: {
    id: string
    title: string
    description: string | null
    category_id: string | null
    starting_bid: number
    condition_description?: string | null
    estimated_weight_kg?: number | null
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
  minimum_bid_increment?: number
}

export interface BidWithUser extends Bid {
  user: {
    id: string
    full_name: string | null
    email: string
  }
}

// Types pour les requêtes API
export interface PlaceBidData {
  auction_id: string
  amount: number
  bid_type?: BidType
}

export interface PlaceBidResult {
  success: boolean
  bid_id: string | null
  message: string
  new_price: number | null
  extended: boolean
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
