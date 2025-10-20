/**
 * Cron Job: Clôture des enchères hebdomadaires
 * À exécuter: Vendredi 12h00
 * Fréquence: 1x par semaine
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Vérifier l'autorisation
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await createClient()
    const now = new Date()

    // Vérifier que c'est vendredi à midi
    const dayOfWeek = now.getDay()
    const hour = now.getHours()

    console.log(`[CRON] Close auctions - Day: ${dayOfWeek}, Hour: ${hour}`)

    // Optionnel: forcer l'exécution en mode dev
    const forceRun = request.headers.get('x-force-run') === 'true'

    if (!forceRun && (dayOfWeek !== 5 || hour !== 12)) {
      return NextResponse.json({
        skipped: true,
        reason: 'Not Friday noon',
        currentTime: now.toISOString()
      })
    }

    // Appeler la fonction Supabase pour clôturer les enchères
    const { data, error } = await supabase.rpc('close_finished_auctions')

    if (error) {
      console.error('[CRON] Error closing auctions:', error)
      return NextResponse.json(
        { error: 'Failed to close auctions', details: error.message },
        { status: 500 }
      )
    }

    const closedCount = data?.[0]?.closed_count || 0
    const auctionIds = data?.[0]?.auction_ids || []
    const winners = data?.[0]?.winners || []

    console.log(`[CRON] Closed ${closedCount} auctions:`, auctionIds)
    console.log(`[CRON] Winners:`, winners)

    // Envoyer les notifications aux gagnants
    if (closedCount > 0 && winners.length > 0) {
      for (const winner of winners) {
        // TODO: Envoyer notifications WhatsApp/Email au gagnant
        console.log(`[CRON] TODO: Notify winner ${winner.winner_id} for auction ${winner.auction_id}`)
        
        // Récupérer les infos du gagnant et de l'enchère
        const { data: auction } = await supabase
          .from('auctions')
          .select('*, lots(*), users!winner_id(*)')
          .eq('id', winner.auction_id)
          .single()

        if (auction && auction.users) {
          // TODO: Appeler l'API WhatsApp
          // await notifyAuctionWon({
          //   to: auction.users.phone,
          //   userName: auction.users.full_name,
          //   lotTitle: auction.lots.title,
          //   winningBid: winner.winning_amount,
          //   auctionUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auctions/${auction.id}`
          // })
        }
      }
    }

    return NextResponse.json({
      success: true,
      closedCount,
      auctionIds,
      winners,
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
