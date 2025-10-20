/**
 * API Route pour la gestion des lots
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateLotData, GetLotsParams } from '@/types/lot.types'

// GET /api/lots - Lister les lots
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Parser les paramètres de requête
    const params: GetLotsParams = {
      status: searchParams.get('status') as any,
      category_id: searchParams.get('category_id') || undefined,
      price_bracket: searchParams.get('price_bracket') as any,
      search: searchParams.get('search') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sort_by: (searchParams.get('sort_by') || 'created_at') as any,
      sort_order: (searchParams.get('sort_order') || 'desc') as any,
    }

    // Construire la requête
    let query = supabase
      .from('lots')
      .select(`
        *,
        category:categories(*),
        images:lot_images(*)
      `)

    // Appliquer les filtres
    if (params.status) {
      if (Array.isArray(params.status)) {
        query = query.in('status', params.status)
      } else {
        query = query.eq('status', params.status)
      }
    }

    if (params.category_id) {
      query = query.eq('category_id', params.category_id)
    }

    if (params.price_bracket) {
      query = query.eq('price_bracket', params.price_bracket)
    }

    if (params.search) {
      query = query.or(
        `title.ilike.%${params.search}%,description.ilike.%${params.search}%`
      )
    }

    // Trier
    query = query.order(params.sort_by || 'created_at', {
      ascending: params.sort_order === 'asc'
    })

    // Paginer
    query = query.range(
      params.offset || 0,
      (params.offset || 0) + (params.limit || 20) - 1
    )

    const { data: lots, error, count } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      lots: lots || [],
      total: count || 0,
      limit: params.limit,
      offset: params.offset
    }, { status: 200 })
  } catch (error) {
    console.error('Error fetching lots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/lots - Créer un nouveau lot
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Vérifier les rôles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const hasPermission = roles?.some(r =>
      ['photo_team', 'admin'].includes(r.role)
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden: Requires photo_team or admin role' },
        { status: 403 }
      )
    }

    // Parser les données
    const body: CreateLotData = await request.json()

    // Valider les champs requis
    if (!body.title || !body.starting_bid) {
      return NextResponse.json(
        { error: 'Missing required fields: title, starting_bid' },
        { status: 400 }
      )
    }

    // Créer le lot
    const { data: lot, error } = await supabase
      .from('lots')
      .insert({
        title: body.title,
        description: body.description,
        category_id: body.category_id,
        starting_bid: body.starting_bid,
        reserve_price: body.reserve_price,
        bid_increment: body.bid_increment || 5000,
        created_by: user.id,
        status: 'draft'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ lot }, { status: 201 })
  } catch (error) {
    console.error('Error creating lot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
