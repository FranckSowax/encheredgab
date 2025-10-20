/**
 * API Route pour une enchère spécifique
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/auctions/[id] - Obtenir les détails d'une enchère
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data: auction, error } = await supabase
      .from('auctions')
      .select(`
        *,
        lot:lots(
          id,
          title,
          description,
          category_id,
          starting_bid,
          category:categories(*),
          images:lot_images(*)
        ),
        winner:users!auctions_winner_id_fkey(id, full_name, email),
        current_bids:bids!bids_auction_id_fkey(
          id,
          amount,
          status,
          created_at,
          user:users(id, full_name)
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Auction not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Calculer le temps restant
    const now = new Date()
    const endDate = new Date(auction.end_date)
    const timeRemaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / 1000))

    // Incrémenter le compteur de vues
    await supabase
      .from('auctions')
      .update({ views_count: (auction.views_count || 0) + 1 })
      .eq('id', id)

    return NextResponse.json({
      auction: {
        ...auction,
        time_remaining: timeRemaining
      }
    })
  } catch (error) {
    console.error('Error fetching auction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/auctions/[id] - Mettre à jour une enchère (admin uniquement)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier les rôles (seuls admins)
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const isAdmin = roles?.some(r => r.role === 'admin')

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can modify auctions' },
        { status: 403 }
      )
    }

    // Parser les données de mise à jour
    const body = await request.json()

    // Empêcher certaines modifications si enchère active avec enchères
    const { data: existingAuction } = await supabase
      .from('auctions')
      .select('status, total_bids')
      .eq('id', id)
      .single()

    if (existingAuction?.status === 'active' && existingAuction.total_bids > 0) {
      // Ne peut pas modifier les prix si des enchères ont été placées
      if (body.starting_price || body.increment) {
        return NextResponse.json(
          { error: 'Cannot modify prices for active auction with bids' },
          { status: 400 }
        )
      }
    }

    // Mettre à jour
    const { data: auction, error } = await supabase
      .from('auctions')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ auction })
  } catch (error) {
    console.error('Error updating auction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/auctions/[id] - Annuler une enchère (admin uniquement)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier les rôles (seuls admins)
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const isAdmin = roles?.some(r => r.role === 'admin')

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can cancel auctions' },
        { status: 403 }
      )
    }

    // Marquer comme annulée plutôt que supprimer
    const { error } = await supabase
      .from('auctions')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Auction cancelled successfully' })
  } catch (error) {
    console.error('Error cancelling auction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
