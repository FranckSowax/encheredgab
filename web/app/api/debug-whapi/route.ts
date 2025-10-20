/**
 * API de diagnostic avancé Whapi
 */

import { NextRequest, NextResponse } from 'next/server'

const WHAPI_TOKEN = process.env.WHAPI_TOKEN || 'fKUGctmyoUq5pex25GdAcjrUyjl55nrd'
const WHAPI_BASE_URL = process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud'

export async function POST(request: NextRequest) {
  const { phone } = await request.json()

  const logs: any[] = []
  
  try {
    // 1. Vérifier le health
    logs.push({ step: 1, action: 'Vérification health...' })
    const healthRes = await fetch(`${WHAPI_BASE_URL}/health`, {
      headers: { 'authorization': `Bearer ${WHAPI_TOKEN}` }
    })
    const health = await healthRes.json()
    logs.push({ step: 1, status: healthRes.status, health })

    // 2. Tester l'envoi direct via Whapi
    logs.push({ step: 2, action: 'Envoi message test...' })
    const formattedPhone = phone.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '')
    
    const sendRes = await fetch(`${WHAPI_BASE_URL}/messages/text`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Bearer ${WHAPI_TOKEN}`
      },
      body: JSON.stringify({
        to: formattedPhone,
        body: `🧪 Test DEBUG ${new Date().toLocaleTimeString('fr-FR')}`,
        typing_time: 0
      })
    })

    const sendData = await sendRes.json()
    logs.push({ 
      step: 2, 
      status: sendRes.status,
      ok: sendRes.ok,
      formatted_phone: formattedPhone,
      response: sendData 
    })

    // 3. Vérifier les messages récents
    logs.push({ step: 3, action: 'Vérification messages récents...' })
    const messagesRes = await fetch(`${WHAPI_BASE_URL}/messages?count=5`, {
      headers: { 'authorization': `Bearer ${WHAPI_TOKEN}` }
    })
    
    if (messagesRes.ok) {
      const messages = await messagesRes.json()
      logs.push({ step: 3, status: messagesRes.status, messages })
    } else {
      logs.push({ step: 3, status: messagesRes.status, error: 'Cannot fetch messages' })
    }

    // 4. Vérifier les limites/quotas
    logs.push({ step: 4, action: 'Vérification quotas...' })
    const settingsRes = await fetch(`${WHAPI_BASE_URL}/settings`, {
      headers: { 'authorization': `Bearer ${WHAPI_TOKEN}` }
    })
    const settings = await settingsRes.json()
    logs.push({ step: 4, status: settingsRes.status, settings })

    return NextResponse.json({
      success: sendRes.ok,
      message: sendRes.ok ? 'Message envoyé' : 'Échec envoi',
      sent_to: formattedPhone,
      logs,
      diagnosis: {
        health_ok: healthRes.ok,
        health_status: health?.status?.text || health?.status,
        send_ok: sendRes.ok,
        send_error: sendData.error || sendData.message,
        phone_format: formattedPhone,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    logs.push({ error: error.message, stack: error.stack })
    return NextResponse.json({
      success: false,
      error: error.message,
      logs
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de diagnostic Whapi',
    usage: 'POST avec { "phone": "+241061234567" }'
  })
}
