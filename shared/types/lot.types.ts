/**
 * Types pour la gestion des lots et enchères
 */

export type LotStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'active'
  | 'sold'
  | 'unsold'
  | 'paid'
  | 'delivered'
  | 'relisted'
  | 'cancelled'

export type PriceBracket =
  | 'under_50k'        // < 50 000 FCFA
  | 'range_50k_200k'   // 50 000 - 200 000 FCFA
  | 'range_200k_1m'    // 200 000 - 1 000 000 FCFA
  | 'over_1m'          // > 1 000 000 FCFA

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  parent_id: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Lot {
  id: string
  title: string
  description: string | null
  ai_generated_description: string | null
  category_id: string | null
  
  // Prix et enchères
  starting_bid: number
  reserve_price: number | null
  current_bid: number
  bid_increment: number
  price_bracket: PriceBracket
  
  // Statut
  status: LotStatus
  is_relisted: boolean
  relisted_count: number
  original_lot_id: string | null
  
  // Dates
  listing_start_date: string | null
  listing_end_date: string | null
  auction_start_date: string | null
  auction_end_date: string | null
  payment_deadline: string | null
  
  // Gagnant
  winner_id: string | null
  winning_bid: number | null
  payment_status: string
  
  // Livraison
  delivery_method: string | null
  delivery_zone: string | null
  delivery_fee: number
  delivery_address: string | null
  qr_code: string | null
  
  // Métadonnées
  created_by: string
  approved_by: string | null
  approved_at: string | null
  
  // Modération IA
  moderation_status: ModerationStatus
  moderation_score: number | null
  moderation_flags: Record<string, any> | null
  
  // Statistiques
  view_count: number
  bid_count: number
  watchlist_count: number
  
  // Timestamps
  created_at: string
  updated_at: string
}

export interface LotImage {
  id: string
  lot_id: string
  image_url: string
  thumbnail_url: string | null
  display_order: number
  is_primary: boolean
  alt_text: string | null
  
  // Métadonnées
  width: number | null
  height: number | null
  file_size: number | null
  mime_type: string | null
  
  // Modération
  moderation_status: ModerationStatus
  moderation_labels: Record<string, any> | null
  
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export interface LotWatchlist {
  id: string
  user_id: string
  lot_id: string
  created_at: string
}

export interface LotHistory {
  id: string
  lot_id: string
  changed_by: string | null
  field_name: string
  old_value: string | null
  new_value: string | null
  change_reason: string | null
  created_at: string
}

// Types pour les formulaires
export interface CreateLotData {
  title: string
  description?: string
  category_id?: string
  starting_bid: number
  reserve_price?: number
  bid_increment?: number
}

export interface UpdateLotData {
  title?: string
  description?: string
  category_id?: string
  starting_bid?: number
  reserve_price?: number
  status?: LotStatus
}

export interface UploadLotImageData {
  lot_id: string
  image_url: string
  thumbnail_url?: string
  display_order?: number
  is_primary?: boolean
  alt_text?: string
}

// Types pour les requêtes API
export interface GetLotsParams {
  status?: LotStatus | LotStatus[]
  category_id?: string
  price_bracket?: PriceBracket
  search?: string
  limit?: number
  offset?: number
  sort_by?: 'created_at' | 'starting_bid' | 'auction_end_date'
  sort_order?: 'asc' | 'desc'
}

export interface LotWithImages extends Lot {
  images: LotImage[]
  category?: Category
  primary_image?: LotImage
}

// Types pour la génération AI
export interface AIDescriptionRequest {
  title: string
  category?: string
  images?: string[] // URLs des images
  existing_description?: string
}

export interface AIDescriptionResponse {
  description: string
  confidence: number
  suggestions: string[]
}

export interface AIModerationRequest {
  content: string
  type: 'text' | 'image'
}

export interface AIModerationResponse {
  approved: boolean
  score: number
  flags: {
    type: string
    severity: 'low' | 'medium' | 'high'
    description: string
  }[]
  labels: string[]
}
