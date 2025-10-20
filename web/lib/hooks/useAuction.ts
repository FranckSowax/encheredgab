/**
 * Hook React pour gérer les enchères en temps réel
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { 
  Auction, 
  AuctionWithDetails, 
  Bid, 
  PlaceBidResult,
  TimeRemaining
} from '@/types/auction.types'
// import { calculateTimeRemaining } from '@/types/auction.types'
import { RealtimeChannel } from '@supabase/supabase-js'

// Helper function pour calculer le temps restant
function calculateTimeRemaining(endDate: string): TimeRemaining | null {
  const now = new Date()
  const end = new Date(endDate)
  const diff = end.getTime() - now.getTime()
  const total_seconds = Math.floor(diff / 1000)

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total_seconds: 0, is_ending_soon: false, is_critical: false }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  const is_critical = total_seconds < 300 // moins de 5 minutes
  const is_ending_soon = total_seconds < 3600 // moins de 1 heure

  return { days, hours, minutes, seconds, total_seconds, is_ending_soon, is_critical }
}

export function useAuction(auctionId: string | null) {
  const [auction, setAuction] = useState<AuctionWithDetails | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null)
  
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabase = createClient()

  // Charger les données de l'enchère
  const fetchAuction = useCallback(async () => {
    if (!auctionId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/auctions/${auctionId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch auction')
      }

      const data = await response.json()
      setAuction(data.auction)
      setError(null)
    } catch (err) {
      console.error('Error fetching auction:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [auctionId])

  // Charger l'historique des enchères
  const fetchBids = useCallback(async () => {
    if (!auctionId) return

    try {
      const response = await fetch(`/api/auctions/${auctionId}/bids`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bids')
      }

      const data = await response.json()
      setBids(data.bids)
    } catch (err) {
      console.error('Error fetching bids:', err)
    }
  }, [auctionId])

  // Placer une enchère
  const placeBid = useCallback(async (amount: number): Promise<PlaceBidResult> => {
    if (!auctionId) {
      return {
        success: false,
        bid_id: null,
        message: 'No auction selected',
        new_price: null,
        extended: false
      }
    }

    try {
      const response = await fetch(`/api/auctions/${auctionId}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, bid_type: 'manual' })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place bid')
      }

      // Rafraîchir les données
      await Promise.all([fetchAuction(), fetchBids()])

      return data
    } catch (err) {
      console.error('Error placing bid:', err)
      return {
        success: false,
        bid_id: null,
        message: err instanceof Error ? err.message : 'Unknown error',
        new_price: null,
        extended: false
      }
    }
  }, [auctionId, fetchAuction, fetchBids])

  // S'abonner aux mises à jour en temps réel
  useEffect(() => {
    if (!auctionId) return

    // Créer le channel Realtime
    const channel = supabase
      .channel(`auction:${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'auctions',
          filter: `id=eq.${auctionId}`
        },
        (payload) => {
          console.log('Auction updated:', payload)
          setAuction(prev => prev ? { ...prev, ...payload.new } : null)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${auctionId}`
        },
        (payload) => {
          console.log('New bid:', payload)
          setBids(prev => [payload.new as Bid, ...prev])
          fetchAuction() // Rafraîchir pour les stats mises à jour
        }
      )
      .subscribe()

    channelRef.current = channel

    // Cleanup
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [auctionId, supabase, fetchAuction])

  // Calculer le temps restant toutes les secondes
  useEffect(() => {
    if (!auction?.end_date) return

    const updateTime = () => {
      const remaining = calculateTimeRemaining(auction.end_date)
      setTimeRemaining(remaining)

      // Arrêter le timer si enchère terminée
      if (remaining && remaining.total_seconds === 0) {
        fetchAuction() // Rafraîchir pour obtenir le statut final
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [auction?.end_date, fetchAuction])

  // Charger les données initiales
  useEffect(() => {
    if (auctionId) {
      fetchAuction()
      fetchBids()
    }
  }, [auctionId, fetchAuction, fetchBids])

  return {
    auction,
    bids,
    loading,
    error,
    timeRemaining,
    placeBid,
    refresh: fetchAuction,
    refetchBids: fetchBids
  }
}

// Hook pour lister les enchères actives
export function useActiveAuctions() {
  const [auctions, setAuctions] = useState<AuctionWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auctions?active_only=true&limit=50')
      
      if (!response.ok) {
        throw new Error('Failed to fetch auctions')
      }

      const data = await response.json()
      setAuctions(data.auctions)
      setError(null)
    } catch (err) {
      console.error('Error fetching auctions:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAuctions()
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(fetchAuctions, 30000)
    
    return () => clearInterval(interval)
  }, [fetchAuctions])

  return {
    auctions,
    loading,
    error,
    refresh: fetchAuctions
  }
}
