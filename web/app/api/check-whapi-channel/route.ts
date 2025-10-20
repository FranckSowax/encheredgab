/**
 * API pour vérifier l'état du channel Whapi
 */

import { NextResponse } from 'next/server'

const WHAPI_TOKEN = process.env.WHAPI_TOKEN || 'fKUGctmyoUq5pex25GdAcjrUyjl55nrd'
const WHAPI_BASE_URL = process.env.WHAPI_BASE_URL || 'https://gate.whapi.cloud'

export async function GET() {
  try {
    // 1. Vérifier les settings
    const settingsResponse = await fetch(`${WHAPI_BASE_URL}/settings`, {
      headers: {
        'authorization': `Bearer ${WHAPI_TOKEN}`
      }
    })

    const settings = await settingsResponse.json()

    // 2. Vérifier les channels disponibles
    const channelsResponse = await fetch(`${WHAPI_BASE_URL}/channels`, {
      headers: {
        'authorization': `Bearer ${WHAPI_TOKEN}`
      }
    })

    const channels = await channelsResponse.json()

    // 3. Vérifier le status du channel actuel
    const statusResponse = await fetch(`${WHAPI_BASE_URL}/health`, {
      headers: {
        'authorization': `Bearer ${WHAPI_TOKEN}`
      }
    })

    const health = await statusResponse.json()

    const statusText = typeof health?.status === 'string' ? health.status : health?.status?.text
    const isReady = statusText === 'ready' || statusText === 'READY' || statusText === 'CONNECTED'
    const isAuth = statusText === 'AUTH' || statusText === 'AUTHENTICATING'
    
    return NextResponse.json({
      success: true,
      settings,
      channels,
      health,
      diagnosis: {
        token_valid: settingsResponse.ok,
        has_channels: channels?.channels?.length > 0 || health?.user?.id !== undefined,
        channel_status: health?.status,
        ready_to_send: isReady,
        is_authenticating: isAuth,
        user_connected: health?.user?.name || null,
        phone_number: health?.user?.id || null
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
