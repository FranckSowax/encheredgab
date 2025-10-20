/**
 * Mock data pour tester le frontend sans Supabase
 */

import { useState, useEffect } from 'react'
import type { AuctionWithDetails, BidWithUser, TimeRemaining } from '@/types/auction.types'
import { calculateTimeRemaining } from '@/types/auction.types'

// Données mockées
const mockAuctions: AuctionWithDetails[] = [
  {
    id: '1',
    lot_id: 'lot-1',
    start_date: new Date(Date.now() - 86400000 * 2).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    extended_count: 0,
    total_extension_time: '00:00:00',
    starting_price: 450000,
    reserve_price: null,
    current_price: 520000,
    increment: 5000,
    total_bids: 8,
    unique_bidders: 5,
    views_count: 342,
    status: 'active',
    winner_id: null,
    winning_bid_id: null,
    anti_snipe_enabled: true,
    anti_snipe_threshold: '00:05:00',
    anti_snipe_extension: '00:05:00',
    max_extensions: 3,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    minimum_bid_increment: 5000,
    lot: {
      id: 'lot-1',
      title: 'iPhone 14 Pro Max 256GB - État Neuf',
      description: 'iPhone 14 Pro Max en excellent état, couleur Deep Purple. Livré avec tous les accessoires d\'origine.',
      category_id: 'electronics',
      starting_bid: 450000,
      condition_description: 'Excellent état',
      estimated_weight_kg: 0.5,
      images: [
        { id: '1', image_url: 'https://images.unsplash.com/photo-1678652197950-82291e668777?w=500', is_primary: true },
        { id: '2', image_url: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=500', is_primary: false }
      ]
    }
  },
  {
    id: '2',
    lot_id: 'lot-2',
    start_date: new Date(Date.now() - 86400000).toISOString(),
    end_date: new Date(Date.now() + 3600000 * 5).toISOString(),
    extended_count: 0,
    total_extension_time: '00:00:00',
    starting_price: 850000,
    reserve_price: null,
    current_price: 920000,
    increment: 10000,
    total_bids: 12,
    unique_bidders: 7,
    views_count: 567,
    status: 'active',
    winner_id: null,
    winning_bid_id: null,
    anti_snipe_enabled: true,
    anti_snipe_threshold: '00:05:00',
    anti_snipe_extension: '00:05:00',
    max_extensions: 3,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    minimum_bid_increment: 10000,
    lot: {
      id: 'lot-2',
      title: 'MacBook Pro M2 14" 16GB RAM 512GB SSD',
      description: 'MacBook Pro 2023 avec puce M2, écran Liquid Retina XDR. Comme neuf, utilisé 3 mois.',
      category_id: 'electronics',
      starting_bid: 850000,
      images: [
        { id: '3', image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500', is_primary: true }
      ]
    }
  },
  {
    id: '3',
    lot_id: 'lot-3',
    start_date: new Date(Date.now() - 3600000).toISOString(),
    end_date: new Date(Date.now() + 86400000 * 5).toISOString(),
    extended_count: 0,
    total_extension_time: '00:00:00',
    starting_price: 2500000,
    reserve_price: null,
    current_price: 2750000,
    increment: 50000,
    total_bids: 5,
    unique_bidders: 4,
    views_count: 189,
    status: 'active',
    winner_id: null,
    winning_bid_id: null,
    anti_snipe_enabled: true,
    anti_snipe_threshold: '00:05:00',
    anti_snipe_extension: '00:05:00',
    max_extensions: 3,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    minimum_bid_increment: 50000,
    lot: {
      id: 'lot-3',
      title: 'Rolex Submariner Date - Édition 2022',
      description: 'Montre Rolex Submariner authentique avec certificat et boîte d\'origine.',
      category_id: 'jewelry',
      starting_bid: 2500000,
      images: [
        { id: '4', image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500', is_primary: true }
      ]
    }
  },
  {
    id: '4',
    lot_id: 'lot-4',
    start_date: new Date(Date.now() - 86400000 * 3).toISOString(),
    end_date: new Date(Date.now() + 86400000).toISOString(),
    extended_count: 0,
    total_extension_time: '00:00:00',
    starting_price: 650000,
    reserve_price: null,
    current_price: 780000,
    increment: 10000,
    total_bids: 15,
    unique_bidders: 9,
    views_count: 823,
    status: 'active',
    winner_id: null,
    winning_bid_id: null,
    anti_snipe_enabled: true,
    anti_snipe_threshold: '00:05:00',
    anti_snipe_extension: '00:05:00',
    max_extensions: 3,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    minimum_bid_increment: 10000,
    lot: {
      id: 'lot-4',
      title: 'Louis Vuitton Neverfull MM - Édition Limitée',
      description: 'Sac Louis Vuitton authentique avec facture d\'origine. Excellent état.',
      category_id: 'fashion',
      starting_bid: 650000,
      images: [
        { id: '5', image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500', is_primary: true }
      ]
    }
  }
]

const mockBids: BidWithUser[] = [
  {
    id: 'bid-1',
    auction_id: '1',
    lot_id: 'lot-1',
    user_id: 'user-1',
    amount: 520000,
    bid_type: 'manual',
    status: 'winning',
    is_auto_bid: false,
    max_auto_amount: null,
    is_valid: true,
    validation_error: null,
    ip_address: null,
    user_agent: null,
    time_before_end: null,
    is_snipe: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: 'user-1',
      full_name: 'Jean Dupont',
      email: 'jean@example.com'
    }
  },
  {
    id: 'bid-2',
    auction_id: '1',
    lot_id: 'lot-1',
    user_id: 'user-2',
    amount: 515000,
    bid_type: 'manual',
    status: 'outbid',
    is_auto_bid: false,
    max_auto_amount: null,
    is_valid: true,
    validation_error: null,
    ip_address: null,
    user_agent: null,
    time_before_end: null,
    is_snipe: false,
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    user: {
      id: 'user-2',
      full_name: 'Marie Martin',
      email: 'marie@example.com'
    }
  }
]

export function useActiveAuctions() {
  const [auctions, setAuctions] = useState<AuctionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simuler un délai de chargement
    setTimeout(() => {
      setAuctions(mockAuctions)
      setLoading(false)
    }, 500)
  }, [])

  return { auctions, loading, error }
}

export function useAuction(id: string) {
  const [auction, setAuction] = useState<AuctionWithDetails | null>(null)
  const [bids, setBids] = useState<BidWithUser[]>([])
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Trouver l'enchère
    const found = mockAuctions.find(a => a.id === id)
    
    setTimeout(() => {
      if (found) {
        setAuction(found)
        setBids(mockBids.filter(b => b.auction_id === id))
        setTimeRemaining(calculateTimeRemaining(found.end_date))
      } else {
        setError('Enchère introuvable')
      }
      setLoading(false)
    }, 300)
  }, [id])

  // Mettre à jour le timer toutes les secondes
  useEffect(() => {
    if (!auction) return

    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining(auction.end_date))
    }, 1000)

    return () => clearInterval(interval)
  }, [auction])

  const placeBid = async (amount: number) => {
    // Simuler un placement d'enchère
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (auction) {
      const newAuction = {
        ...auction,
        current_price: amount,
        total_bids: auction.total_bids + 1
      }
      setAuction(newAuction)
    }
  }

  return { auction, bids, timeRemaining, placeBid, loading, error }
}
