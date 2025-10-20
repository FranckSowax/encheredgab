/**
 * API Route pour notifier un enchérisseur dépassé
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { notifyOutbid } from '@/lib/notifications/whapi.service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const auctionId = params.id
    const body = await request.json()
    const { previous_bidder_id, new_bid_amount } = body

    if (!previous_bidder_id || !new_bid_amount) {
      return NextResponse.json(
        { error: 'previous_bidder_id et new_bid_amount requis' },
        { status: 400 }
      )
    }

    // Récupérer les infos de l'enchère
    const { data: auction, error: auctionError } = await supabase
      .from('auctions')
      .select(`
        id,
        current_price,
        lots (
          id,
          title
        )
      `)
      .eq('id', auctionId)
      .single()

    if (auctionError || !auction) {
      return NextResponse.json(
        { error: 'Enchère introuvable' },
        { status: 404 }
      )
    }

    // Récupérer le dernier enchérisseur dépassé
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, full_name, phone')
      .eq('id', previous_bidder_id)
      .single()

    if (userError || !user || !user.phone) {
      console.error('Utilisateur sans numéro de téléphone:', previous_bidder_id)
      return NextResponse.json(
        { error: 'Utilisateur introuvable ou sans téléphone' },
        { status: 404 }
      )
    }

    // Récupérer la dernière enchère du user
    const { data: lastBid, error: bidError } = await supabase
      .from('bids')
      .select('amount')
      .eq('auction_id', auctionId)
      .eq('user_id', previous_bidder_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (bidError || !lastBid) {
      return NextResponse.json(
        { error: 'Dernière enchère introuvable' },
        { status: 404 }
      )
    }

    // URL de l'enchère
    const auctionUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auctions/${auctionId}`

    // Envoyer la notification WhatsApp
    const result = await notifyOutbid({
      to: user.phone,
      userName: user.full_name || 'Enchérisseur',
      lotTitle: auction.lots?.title || 'Lot',
      previousBid: Number(lastBid.amount),
      newBid: Number(new_bid_amount),
      auctionId: auction.id,
      auctionUrl
    })

    if (!result.sent) {
      console.error('Échec envoi WhatsApp:', result.error)
      return NextResponse.json(
        { error: 'Échec envoi notification', details: result.error },
        { status: 500 }
      )
    }

    // Enregistrer la notification dans la base
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'bid_outbid',
      channel: 'whatsapp',
      subject: 'Votre enchère a été dépassée',
      body: `Nouvelle offre de ${new_bid_amount.toLocaleString('fr-FR')} FCFA`,
      data: {
        auction_id: auctionId,
        previous_bid: lastBid.amount,
        new_bid: new_bid_amount,
        whatsapp_message_id: result.message?.id
      },
      status: 'sent',
      sent_at: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Notification envoyée',
      whatsapp_message_id: result.message?.id
    })

  } catch (error: any) {
    console.error('Erreur notification outbid:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    )
  }
}
