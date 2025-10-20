/**
 * Cron Job: Ouverture des enchères hebdomadaires
 * À exécuter: Jeudi 00h00
 * Fréquence: 1x par semaine
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Vérifier l'autorisation (optionnel)
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const now = new Date()

    // Vérifier que c'est jeudi à minuit (ou proche)
    const dayOfWeek = now.getDay()
    const hour = now.getHours()

    console.log(`[CRON] Open auctions - Day: ${dayOfWeek}, Hour: ${hour}`)

    // Optionnel: forcer l'exécution en mode dev
    const forceRun = request.headers.get('x-force-run') === 'true'

    if (!forceRun && (dayOfWeek !== 4 || hour !== 0)) {
      return NextResponse.json({
        skipped: true,
        reason: 'Not Thursday midnight',
        currentTime: now.toISOString()
      })
    }

    // Appeler la fonction Supabase pour ouvrir les enchères
    const { data, error } = await supabase.rpc('open_scheduled_auctions')

    if (error) {
      console.error('[CRON] Error opening auctions:', error)
      return NextResponse.json(
        { error: 'Failed to open auctions', details: error.message },
        { status: 500 }
      )
    }

    const openedCount = data?.[0]?.opened_count || 0
    const auctionIds = data?.[0]?.auction_ids || []

    console.log(`[CRON] Opened ${openedCount} auctions:`, auctionIds)

    // Envoyer les notifications aux utilisateurs
    if (openedCount > 0) {
      // TODO: Envoyer notifications WhatsApp/Email
      // await notifyAuctionOpening(auctionIds)
      console.log('[CRON] TODO: Send opening notifications')
    }

    return NextResponse.json({
      success: true,
      openedCount,
      auctionIds,
      timestamp: now.toISOString()
    })

  } catch (error: any) {
    console.error('[CRON] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Pour tester manuellement
export async function POST(request: Request) {
  const newRequest = new Request(request.url, {
    ...request,
    headers: new Headers({
      ...Object.fromEntries(request.headers.entries()),
      'x-force-run': 'true'
    })
  })
  
  return GET(newRequest)
}
