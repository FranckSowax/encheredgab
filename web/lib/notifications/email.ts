/**
 * Module de notifications Email via Resend
 * Resend est un service d'email moderne et fiable
 * NOTE: Resend actuellement désactivé pour le build - à activer après installation
 */

// import { Resend } from 'resend'
import type { NotificationPayload } from '@/types/notification.types'

// const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  tags?: Record<string, string>
}

export async function sendEmail(options: EmailOptions) {
  // TODO: Activer Resend après installation du package
  console.log('Email sending disabled (Resend not installed):', {
    to: options.to,
    subject: options.subject
  })
  
  return {
    success: true,
    messageId: 'stub-' + Date.now(),
    provider: 'stub (resend disabled)',
    error: undefined
  }
  
  /* Resend implementation - à activer après installation
  try {
    const {data, error } = await resend.emails.send({
      from: options.from || process.env.RESEND_FROM_EMAIL || 'Douane Enchères <noreply@douane-encheres.ga>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      tags: options.tags
    })

    if (error) {
      throw new Error(`Email error: ${error.message}`)
    }

    return {
      success: true,
      messageId: data?.id,
      provider: 'resend'
    }
  } catch (error) {
    console.error('Failed to send email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'resend'
    }
  }
  */
}

// Templates HTML
export function renderBidPlacedEmail(payload: NotificationPayload): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a365d; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f7fafc; }
    .button { display: inline-block; padding: 12px 24px; background: #3182ce; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #718096; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Nouvelle Enchère</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>${payload.user_name}</strong>,</p>
      <p>Une nouvelle enchère de <strong>${payload.bid_amount} FCFA</strong> a été placée sur le lot :</p>
      <h2>${payload.lot_title}</h2>
      <p>Consultez l'enchère pour voir les détails et placer votre propre enchère.</p>
      <a href="${payload.auction_url}" class="button">Voir l'enchère</a>
    </div>
    <div class="footer">
      <p>Douane Enchères Gabon - Plateforme officielle des ventes aux enchères douanières</p>
      <p>Ce message a été envoyé automatiquement, merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
  `
}

export function renderBidOutbidEmail(payload: NotificationPayload): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ed8936; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #fffaf0; }
    .alert { background: #fed7d7; border-left: 4px solid #f56565; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #e53e3e; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #718096; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Vous avez été surenchéri !</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>${payload.user_name}</strong>,</p>
      <div class="alert">
        <p><strong>Vous avez été surenchéri sur :</strong></p>
        <h2>${payload.lot_title}</h2>
      </div>
      <p><strong>Nouvelle enchère :</strong> ${payload.new_bid_amount} FCFA</p>
      <p><strong>Votre dernière enchère :</strong> ${payload.your_bid_amount} FCFA</p>
      <p>Ne laissez pas passer cette opportunité ! Placez une nouvelle enchère dès maintenant.</p>
      <a href="${payload.auction_url}" class="button">Enchérir maintenant</a>
    </div>
    <div class="footer">
      <p>Douane Enchères Gabon</p>
    </div>
  </div>
</body>
</html>
  `
}

export function renderBidWonEmail(payload: NotificationPayload): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #48bb78; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #f0fff4; }
    .success { background: #c6f6d5; border-left: 4px solid #48bb78; padding: 15px; margin: 20px 0; }
    .steps { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #38a169; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #718096; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Félicitations !</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>${payload.user_name}</strong>,</p>
      <div class="success">
        <h2>Vous avez remporté l'enchère !</h2>
        <p><strong>${payload.lot_title}</strong></p>
        <p>Montant final : <strong>${payload.winning_amount} FCFA</strong></p>
      </div>
      <div class="steps">
        <h3>Prochaines étapes :</h3>
        <ol>
          <li>Effectuer le paiement dans les 48 heures</li>
          <li>Consulter vos informations de livraison</li>
          <li>Récupérer votre lot avec le code QR fourni</li>
        </ol>
      </div>
      <a href="${payload.auction_url}" class="button">Voir les détails</a>
    </div>
    <div class="footer">
      <p>Douane Enchères Gabon</p>
    </div>
  </div>
</body>
</html>
  `
}

export function renderAuctionEndingSoonEmail(payload: NotificationPayload): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #ecc94b; color: #2d3748; padding: 20px; text-align: center; }
    .content { padding: 30px; background: #fffff0; }
    .urgency { background: #fefcbf; border-left: 4px solid #ecc94b; padding: 15px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background: #d69e2e; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #718096; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Enchère se termine bientôt !</h1>
    </div>
    <div class="content">
      <p>Bonjour <strong>${payload.user_name}</strong>,</p>
      <div class="urgency">
        <p><strong>L'enchère pour ce lot se termine dans ${payload.time_remaining} !</strong></p>
        <h2>${payload.lot_title}</h2>
        <p>Enchère actuelle : <strong>${payload.current_price} FCFA</strong></p>
      </div>
      <p>Ne manquez pas cette opportunité ! Placez votre enchère avant qu'il ne soit trop tard.</p>
      <a href="${payload.auction_url}" class="button">Enchérir maintenant</a>
    </div>
    <div class="footer">
      <p>Douane Enchères Gabon</p>
    </div>
  </div>
</body>
</html>
  `
}

export function getEmailTemplate(type: string, payload: NotificationPayload): string {
  switch (type) {
    case 'bid_placed':
      return renderBidPlacedEmail(payload)
    case 'bid_outbid':
      return renderBidOutbidEmail(payload)
    case 'bid_won':
      return renderBidWonEmail(payload)
    case 'auction_ending_soon':
      return renderAuctionEndingSoonEmail(payload)
    default:
      // Template générique
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Notification Douane Enchères</h2>
          <p>Bonjour ${payload.user_name || 'cher utilisateur'},</p>
          <p>${payload.lot_title || 'Notification système'}</p>
        </div>
      `
  }
}
