/**
 * API Route pour le dashboard admin
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

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

    const isAdmin = roles?.some(r => r.role === 'admin')
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Paramètres de dates
    const startDate = searchParams.get('start_date') || undefined
    const endDate = searchParams.get('end_date') || new Date().toISOString()

    // Appeler la fonction SQL pour obtenir les stats
    const { data: stats, error } = await supabase.rpc('get_dashboard_stats', {
      p_start_date: startDate,
      p_end_date: endDate
    })

    if (error) throw error

    // Logs d'activité récents
    const { data: recentActivity } = await supabase
      .from('admin_activity_logs')
      .select(`
        *,
        admin:users!admin_activity_logs_admin_id_fkey(id, full_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({
      stats: stats || {},
      recent_activity: recentActivity || []
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
