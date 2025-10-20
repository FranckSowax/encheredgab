/**
 * Hook pour gérer les favoris utilisateur
 */

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Favorite {
  id: string
  auction_id: string
  created_at: string
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]) // IDs des enchères favorisées
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Charger les favoris de l'utilisateur
  const loadFavorites = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setFavorites([])
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('user_favorites')
        .select('auction_id')
        .eq('user_id', user.id)

      if (error) {
        console.error('Erreur chargement favoris:', error)
        setError(error.message)
      } else {
        setFavorites(data?.map(f => f.auction_id) || [])
      }
    } catch (err: any) {
      console.error('Erreur:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    loadFavorites()
  }, [loadFavorites])

  // Vérifier si une enchère est favorite
  const isFavorite = useCallback((auctionId: string) => {
    return favorites.includes(auctionId)
  }, [favorites])

  // Ajouter aux favoris
  const addFavorite = useCallback(async (auctionId: string) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ auction_id: auctionId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de l\'ajout')
      }

      // Mettre à jour localement
      setFavorites(prev => [...prev, auctionId])
      return true
    } catch (err: any) {
      console.error('Erreur ajout favori:', err)
      setError(err.message)
      return false
    }
  }, [])

  // Retirer des favoris
  const removeFavorite = useCallback(async (auctionId: string) => {
    try {
      const response = await fetch(`/api/favorites?auction_id=${auctionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }

      // Mettre à jour localement
      setFavorites(prev => prev.filter(id => id !== auctionId))
      return true
    } catch (err: any) {
      console.error('Erreur suppression favori:', err)
      setError(err.message)
      return false
    }
  }, [])

  // Toggle favori
  const toggleFavorite = useCallback(async (auctionId: string) => {
    if (isFavorite(auctionId)) {
      return await removeFavorite(auctionId)
    } else {
      return await addFavorite(auctionId)
    }
  }, [isFavorite, addFavorite, removeFavorite])

  return {
    favorites,
    loading,
    error,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    refetch: loadFavorites
  }
}
