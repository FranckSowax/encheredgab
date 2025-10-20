/**
 * API Route pour placer des enchères
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { PlaceBidData } from '@/types/auction.types'

// GET /api/auctions/[id]/bids - Obtenir l'historique des enchères
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: auctionId } = await params
    const { searchParams } = new URL(request.url)
    
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: bids, error } = await supabase
      .from('bids')
      .select(`
        *,
        user:users(id, full_name, email)
      `)
      .eq('auction_id', auctionId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ bids: bids || [] })
  } catch (error) {
    console.error('Error fetching bids:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/auctions/[id]/bids - Placer une enchère
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: auctionId } = await params

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parser les données
    const body: PlaceBidData = await request.json()

    if (!body.amount) {
      return NextResponse.json(
        { error: 'Missing required field: amount' },
        { status: 400 }
      )
    }

    // Récupérer l'IP et user agent
    const ip = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') ||
                null
    const userAgent = request.headers.get('user-agent') || null

    // Appeler la fonction place_bid
    const { data, error } = await supabase.rpc('place_bid', {
      p_auction_id: auctionId,
      p_user_id: user.id,
      p_amount: body.amount,
      p_bid_type: body.bid_type || 'manual',
      p_ip_address: ip,
      p_user_agent: userAgent
    })

    if (error) {
      console.error('Error placing bid:', error)
      
      // Essayer d'extraire un message d'erreur plus clair
      if (error.message) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        )
      }
      
      throw error
    }

    const result = data?.[0]

    if (!result?.success) {
      return NextResponse.json(
        { 
          error: result?.message || 'Failed to place bid',
          current_price: result?.new_price,
          extended: result?.extended
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      bid_id: result.bid_id,
      message: result.message,
      new_price: result.new_price,
      extended: result.extended
    }, { status: 201 })
  } catch (error) {
    console.error('Error placing bid:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
