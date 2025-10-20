/**
 * API Route pour valider un QR code de livraison
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier rôle admin/customs
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const canValidate = roles?.some(r => r.role === 'admin' || r.role === 'customs')
    if (!canValidate) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { qr_code } = await request.json()

    if (!qr_code) {
      return NextResponse.json({ error: 'QR code required' }, { status: 400 })
    }

    // Appeler la fonction SQL
    const { data, error } = await supabase.rpc('validate_delivery_qr', {
      p_qr_code: qr_code,
      p_delivered_by: user.id
    })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error validating QR code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
