/**
 * API Route pour les favoris
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/favorites - Lister les favoris de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Récupérer les favoris avec les détails des enchères
    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select(`
        id,
        auction_id,
        created_at,
        auctions (
          id,
          lot_id,
          start_date,
          end_date,
          starting_price,
          current_price,
          total_bids,
          status,
          lots (
            id,
            title,
            description,
            category_id,
            images:lot_images (
              id,
              image_url,
              is_primary
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur récupération favoris:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des favoris' },
        { status: 500 }
      )
    }

    return NextResponse.json({ favorites })
  } catch (error) {
    console.error('Erreur API favoris:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// POST /api/favorites - Ajouter un favori
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { auction_id } = body

    if (!auction_id) {
      return NextResponse.json(
        { error: 'auction_id requis' },
        { status: 400 }
      )
    }

    // Authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Vérifier que l'enchère existe
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select('id')
      .eq('id', auction_id)
      .single()

    if (auctionError || !auction) {
      return NextResponse.json(
        { error: 'Enchère introuvable' },
        { status: 404 }
      )
    }

    // Ajouter le favori
    const { data: favorite, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        auction_id
      })
      .select()
      .single()

    if (error) {
      // Si c'est une erreur de contrainte unique, c'est déjà en favori
      if (error.code === '23505') {
        return NextResponse.json(
          { message: 'Déjà en favoris' },
          { status: 200 }
        )
      }

      console.error('Erreur ajout favori:', error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'ajout aux favoris' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Ajouté aux favoris',
      favorite
    })
  } catch (error) {
    console.error('Erreur API favoris:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// DELETE /api/favorites - Supprimer un favori
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const auction_id = searchParams.get('auction_id')

    if (!auction_id) {
      return NextResponse.json(
        { error: 'auction_id requis' },
        { status: 400 }
      )
    }

    // Authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Supprimer le favori
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('auction_id', auction_id)

    if (error) {
      console.error('Erreur suppression favori:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Retiré des favoris'
    })
  } catch (error) {
    console.error('Erreur API favoris:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
