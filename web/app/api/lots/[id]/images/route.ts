/**
 * API Route pour la gestion des images de lots
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { moderateContent } from '@/lib/openai/moderation'

// POST /api/lots/[id]/images - Upload d'images pour un lot
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: lotId } = await params

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Vérifier les permissions
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

    // Vérifier que le lot existe
    const { data: lot, error: lotError } = await supabase
      .from('lots')
      .select('id')
      .eq('id', lotId)
      .single()

    if (lotError || !lot) {
      return NextResponse.json(
        { error: 'Lot not found' },
        { status: 404 }
      )
    }

    // Parser le form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const isPrimary = formData.get('isPrimary') === 'true'
    const altText = formData.get('altText') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Valider le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP' },
        { status: 400 }
      )
    }

    // Valider la taille (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 10 MB' },
        { status: 400 }
      )
    }

    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop()
    const fileName = `${lotId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    // Upload vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('lot-images')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw uploadError
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('lot-images')
      .getPublicUrl(fileName)

    // Si c'est la première image, la définir comme primaire
    const { count } = await supabase
      .from('lot_images')
      .select('*', { count: 'exact', head: true })
      .eq('lot_id', lotId)

    const isFirstImage = (count || 0) === 0

    // Modérer l'image avec l'IA (async, ne bloque pas)
    moderateContent({
      content: publicUrl,
      type: 'image'
    }).then(async (moderation) => {
      // Mettre à jour le statut de modération
      await supabase
        .from('lot_images')
        .update({
          moderation_status: moderation.approved ? 'approved' : 'flagged',
          moderation_labels: moderation.labels
        })
        .eq('image_url', publicUrl)
    }).catch(err => {
      console.error('Moderation error:', err)
    })

    // Créer l'entrée dans la base de données
    const { data: image, error: dbError } = await supabase
      .from('lot_images')
      .insert({
        lot_id: lotId,
        image_url: publicUrl,
        is_primary: isPrimary || isFirstImage,
        alt_text: altText,
        file_size: file.size,
        mime_type: file.type,
        uploaded_by: user.id
      })
      .select()
      .single()

    if (dbError) {
      // En cas d'erreur DB, supprimer le fichier du storage
      await supabase.storage.from('lot-images').remove([fileName])
      throw dbError
    }

    // Si définie comme primaire, retirer le flag des autres images
    if (isPrimary || isFirstImage) {
      await supabase
        .from('lot_images')
        .update({ is_primary: false })
        .eq('lot_id', lotId)
        .neq('id', image.id)
    }

    return NextResponse.json({ image }, { status: 201 })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/lots/[id]/images - Lister les images d'un lot
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: lotId } = await params

    const { data: images, error } = await supabase
      .from('lot_images')
      .select('*')
      .eq('lot_id', lotId)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ images: images || [] }, { status: 200 })
  } catch (error) {
    console.error('Error fetching images:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
