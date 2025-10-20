/**
 * API Route pour la gestion des enchères
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
// import type { CreateAuctionData, GetAuctionsParams } from '@/types/auction.types'

// GET /api/auctions - Lister les enchères
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const params: any = {
      status: searchParams.get('status') as any,
      lot_id: searchParams.get('lot_id') || undefined,
      active_only: searchParams.get('active_only') === 'true',
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sort_by: (searchParams.get('sort_by') || 'end_date') as any,
      sort_order: (searchParams.get('sort_order') || 'asc') as any,
    }

    // Construire la requête
    let query = supabase
      .from('auctions')
      .select(`
        *,
        lot:lots(
          id,
          title,
          description,
          category_id,
          starting_bid,
          images:lot_images(id, image_url, is_primary)
        ),
        winner:users!auctions_winner_id_fkey(id, full_name, email)
      `)

    // Filtres
    if (params.active_only) {
      query = query.eq('status', 'active').gt('end_date', new Date().toISOString())
    } else if (params.status) {
      if (Array.isArray(params.status)) {
        query = query.in('status', params.status)
      } else {
        query = query.eq('status', params.status)
      }
    }

    if (params.lot_id) {
      query = query.eq('lot_id', params.lot_id)
    }

    // Tri
    query = query.order(params.sort_by || 'end_date', {
      ascending: params.sort_order === 'asc'
    })

    // Pagination
    query = query.range(
      params.offset || 0,
      (params.offset || 0) + (params.limit || 20) - 1
    )

    const { data: auctions, error, count } = await query

    if (error) throw error

    // Calculer le temps restant pour chaque enchère active
    const auctionsWithTime = auctions?.map(auction => {
      const now = new Date()
      const endDate = new Date(auction.end_date)
      const timeRemaining = Math.max(0, Math.floor((endDate.getTime() - now.getTime()) / 1000))
      
      return {
        ...auction,
        time_remaining: timeRemaining
      }
    })

    return NextResponse.json({
      auctions: auctionsWithTime || [],
      total: count || 0,
      limit: params.limit,
      offset: params.offset
    })
  } catch (error) {
    console.error('Error fetching auctions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/auctions - Créer une nouvelle enchère
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier les rôles (seuls admins peuvent créer des enchères)
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const isAdmin = roles?.some(r => r.role === 'admin')

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can create auctions' },
        { status: 403 }
      )
    }

    // Parser les données
    const body: any = await request.json()

    // Validation
    if (!body.lot_id || !body.start_date || !body.end_date || !body.starting_price) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Vérifier que le lot existe et n'a pas déjà d'enchère active
    const { data: existingAuction } = await supabase
      .from('auctions')
      .select('id')
      .eq('lot_id', body.lot_id)
      .in('status', ['scheduled', 'active'])
      .single()

    if (existingAuction) {
      return NextResponse.json(
        { error: 'Lot already has an active auction' },
        { status: 400 }
      )
    }

    // Créer l'enchère
    const { data: auction, error } = await supabase
      .from('auctions')
      .insert({
        lot_id: body.lot_id,
        start_date: body.start_date,
        end_date: body.end_date,
        starting_price: body.starting_price,
        current_price: body.starting_price,
        reserve_price: body.reserve_price,
        increment: body.increment || 5000,
        anti_snipe_enabled: body.anti_snipe_enabled ?? true,
        anti_snipe_threshold: body.anti_snipe_threshold || '2 minutes',
        anti_snipe_extension: body.anti_snipe_extension || '2 minutes',
        max_extensions: body.max_extensions || 10,
        created_by: user.id,
        status: new Date(body.start_date) <= new Date() ? 'active' : 'scheduled'
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ auction }, { status: 201 })
  } catch (error) {
    console.error('Error creating auction:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
