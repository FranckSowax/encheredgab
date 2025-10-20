/**
 * API Route pour un lot spécifique
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { UpdateLotData } from '@/types/lot.types'

// GET /api/lots/[id] - Obtenir un lot spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data: lot, error } = await supabase
      .from('lots')
      .select(`
        *,
        category:categories(*),
        images:lot_images(*),
        creator:users!lots_created_by_fkey(id, full_name, email),
        approver:users!lots_approved_by_fkey(id, full_name)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Lot not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Incrémenter le compteur de vues
    await supabase
      .from('lots')
      .update({ view_count: (lot.view_count || 0) + 1 })
      .eq('id', id)

    return NextResponse.json({ lot }, { status: 200 })
  } catch (error) {
    console.error('Error fetching lot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/lots/[id] - Mettre à jour un lot
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Récupérer le lot existant
    const { data: existingLot, error: fetchError } = await supabase
      .from('lots')
      .select('*, user_roles!inner(role)')
      .eq('id', id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: 'Lot not found' },
        { status: 404 }
      )
    }

    // Vérifier les permissions
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const isAdmin = roles?.some(r => r.role === 'admin')
    const isCreator = existingLot.created_by === user.id
    const canEdit = isAdmin || (isCreator && existingLot.status === 'draft')

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Forbidden: Cannot edit this lot' },
        { status: 403 }
      )
    }

    // Parser les données de mise à jour
    const body: UpdateLotData = await request.json()

    // Empêcher la modification de certains champs selon le rôle
    if (!isAdmin && body.status && body.status !== 'draft') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can change status' },
        { status: 403 }
      )
    }

    // Mettre à jour le lot
    const { data: updatedLot, error: updateError } = await supabase
      .from('lots')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    // Enregistrer dans l'historique
    if (isAdmin) {
      const changes = Object.keys(body).map(key => ({
        lot_id: id,
        changed_by: user.id,
        field_name: key,
        old_value: String(existingLot[key as keyof typeof existingLot]),
        new_value: String(body[key as keyof UpdateLotData])
      }))

      await supabase.from('lot_history').insert(changes)
    }

    return NextResponse.json({ lot: updatedLot }, { status: 200 })
  } catch (error) {
    console.error('Error updating lot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/lots/[id] - Supprimer un lot
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Seuls les admins peuvent supprimer
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const isAdmin = roles?.some(r => r.role === 'admin')

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can delete lots' },
        { status: 403 }
      )
    }

    // Supprimer le lot (les images seront supprimées en cascade)
    const { error } = await supabase
      .from('lots')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }

    return NextResponse.json(
      { message: 'Lot deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting lot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
