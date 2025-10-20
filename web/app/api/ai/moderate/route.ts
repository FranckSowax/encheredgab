/**
 * API Route pour la modération de contenu avec IA
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { moderateContent, batchModerate } from '@/lib/openai/moderation'
// import type { AIModerationRequest } from '@/types/lot.types'

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

    // Vérifier les rôles appropriés
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

    const body = await request.json()

    // Support pour modération batch ou simple
    if (Array.isArray(body)) {
      const results = await batchModerate(body as any[])
      return NextResponse.json({ results }, { status: 200 })
    } else {
      const result = await moderateContent(body as any)
      return NextResponse.json(result, { status: 200 })
    }
  } catch (error) {
    console.error('Error in moderate API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
