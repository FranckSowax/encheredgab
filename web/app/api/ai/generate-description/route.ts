/**
 * API Route pour la génération de descriptions de lots avec IA
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateLotDescription } from '@/lib/openai/descriptions'
// import type { AIDescriptionRequest } from '@/types/lot.types'

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Vérifier que l'utilisateur a le rôle photo_team ou admin
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

    // Parser la requête
    const body: any = await request.json()

    if (!body.title) {
      return NextResponse.json(
        { error: 'Missing required field: title' },
        { status: 400 }
      )
    }

    // Générer la description
    const result = await generateLotDescription(body)

    // Logger l'utilisation de l'API
    console.log(`[AI] Description generated for: ${body.title} by user ${user.id}`)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Error in generate-description API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
