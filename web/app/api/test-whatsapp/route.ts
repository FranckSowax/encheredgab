/**
 * API Route de test pour WhatsApp via Whapi
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  sendTextMessage, 
  notifyOutbid,
  testWhapiConnection,
  formatPhoneNumber 
} from '@/lib/notifications/whapi.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, phone, ...params } = body

    if (!phone) {
      return NextResponse.json(
        { error: 'Numéro de téléphone requis' },
        { status: 400 }
      )
    }

    let result

    switch (type) {
      case 'simple':
        // Test simple d'envoi de message
        result = await sendTextMessage({
          to: phone,
          body: params.message || '🧪 Test Douane Enchères - Votre système de notifications WhatsApp fonctionne !',
          typing_time: 0
        })
        break

      case 'outbid':
        // Test notification d'enchère dépassée
        result = await notifyOutbid({
          to: phone,
          userName: params.userName || 'Test User',
          lotTitle: params.lotTitle || 'iPhone 14 Pro Max',
          previousBid: params.previousBid || 450000,
          newBid: params.newBid || 500000,
          auctionId: params.auctionId || 'test-123',
          auctionUrl: params.auctionUrl || 'http://localhost:3000/auctions/test-123'
        })
        break

      case 'test_connection':
        // Test de connexion à Whapi
        const isConnected = await testWhapiConnection()
        return NextResponse.json({
          success: isConnected,
          message: isConnected ? 'Connexion Whapi OK' : 'Échec connexion Whapi'
        })

      case 'format_phone':
        // Test du formatage de numéro
        const formatted = formatPhoneNumber(phone)
        return NextResponse.json({
          success: true,
          original: phone,
          formatted,
          message: `Numéro formaté pour WhatsApp: ${formatted}`
        })

      default:
        return NextResponse.json(
          { error: 'Type de test invalide. Utilisez: simple, outbid, test_connection, format_phone' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: result.sent,
      message: result.sent ? 'Message envoyé avec succès' : 'Échec envoi',
      error: result.error,
      whatsapp_message_id: result.message?.id,
      formatted_phone: formatPhoneNumber(phone)
    })

  } catch (error: any) {
    console.error('Erreur test WhatsApp:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    )
  }
}

// GET pour obtenir les instructions
export async function GET() {
  return NextResponse.json({
    message: 'API de test WhatsApp via Whapi.cloud',
    endpoints: {
      POST: '/api/test-whatsapp'
    },
    examples: [
      {
        name: 'Test simple',
        method: 'POST',
        body: {
          type: 'simple',
          phone: '+241061234567',
          message: 'Message de test personnalisé'
        }
      },
      {
        name: 'Test notification outbid',
        method: 'POST',
        body: {
          type: 'outbid',
          phone: '+241061234567',
          userName: 'Jean Dupont',
          lotTitle: 'MacBook Pro M2',
          previousBid: 850000,
          newBid: 920000,
          auctionUrl: 'http://localhost:3000/auctions/123'
        }
      },
      {
        name: 'Test connexion Whapi',
        method: 'POST',
        body: {
          type: 'test_connection',
          phone: 'any'
        }
      },
      {
        name: 'Test formatage numéro',
        method: 'POST',
        body: {
          type: 'format_phone',
          phone: '06 12 34 56'
        }
      }
    ],
    documentation: 'https://support.whapi.cloud/help-desk'
  })
}
