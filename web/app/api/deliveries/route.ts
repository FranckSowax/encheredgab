/**
 * API Route pour les livraisons
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { CreateDeliveryData } from '@/types/notification.types'

// GET /api/deliveries - Lister les livraisons
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const status = searchParams.get('status')

    let query = supabase
      .from('deliveries')
      .select(`
        *,
        lot:lots(id, title, images:lot_images(image_url)),
        winner:users!deliveries_winner_id_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false })

    // Vérifier si admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const isAdmin = roles?.some(r => r.role === 'admin' || r.role === 'customs')

    if (!isAdmin) {
      // Utilisateur normal voit seulement ses livraisons
      query = query.eq('winner_id', user.id)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: deliveries, error } = await query
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({ deliveries: deliveries || [] })
  } catch (error) {
    console.error('Error fetching deliveries:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/deliveries - Créer une livraison (admin uniquement)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier rôle admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const isAdmin = roles?.some(r => r.role === 'admin' || r.role === 'customs')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body: CreateDeliveryData = await request.json()

    // Appeler la fonction SQL
    const { data: deliveryId, error } = await supabase.rpc('create_delivery_for_auction', {
      p_auction_id: body.auction_id,
      p_delivery_address: body.delivery_address || null
    })

    if (error) throw error

    // Récupérer la livraison créée
    const { data: delivery } = await supabase
      .from('deliveries')
      .select('*')
      .eq('id', deliveryId)
      .single()

    return NextResponse.json({ delivery }, { status: 201 })
  } catch (error) {
    console.error('Error creating delivery:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
