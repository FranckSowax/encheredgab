-- =============================================
-- Migration: Templates WhatsApp
-- Description: Ajouter les templates pour notifications WhatsApp via Whapi
-- Version: 1.0
-- Date: 2025-10-19
-- =============================================

-- Ajouter les templates WhatsApp
INSERT INTO notification_templates (type, channel, language, subject, body, variables) VALUES

-- Template WhatsApp: Enchère placée
('bid_placed', 'whatsapp', 'fr', NULL,
  '🔔 *Douane Enchères*

Nouvelle enchère de *{{bid_amount}} FCFA* sur :
📦 {{lot_title}}

👉 Voir l''enchère : {{auction_url}}',
  '["bid_amount", "lot_title", "auction_url"]'::jsonb),

-- Template WhatsApp: Surenchéri
('bid_outbid', 'whatsapp', 'fr', NULL,
  '⚠️ *Vous avez été surenchéri !*

📦 {{lot_title}}
💰 Nouvelle enchère : *{{new_bid_amount}} FCFA*
💸 Votre enchère : {{your_bid_amount}} FCFA

🔥 Enchérissez maintenant :
{{auction_url}}',
  '["lot_title", "new_bid_amount", "your_bid_amount", "auction_url"]'::jsonb),

-- Template WhatsApp: Enchère gagnée
('bid_won', 'whatsapp', 'fr', NULL,
  '🎉 *FÉLICITATIONS !*

Vous avez remporté l''enchère :
📦 {{lot_title}}
💰 Montant final : *{{winning_amount}} FCFA*

📋 Prochaines étapes :
1️⃣ Effectuer le paiement
2️⃣ Consulter vos infos de livraison
3️⃣ Récupérer votre lot

👉 {{auction_url}}',
  '["lot_title", "winning_amount", "auction_url"]'::jsonb),

-- Template WhatsApp: Enchère se termine bientôt
('auction_ending_soon', 'whatsapp', 'fr', NULL,
  '⏰ *DERNIÈRES MINUTES !*

📦 {{lot_title}}
⏱️ Se termine dans *{{time_remaining}}*
💰 Enchère actuelle : {{current_price}} FCFA

🔥 Enchérissez vite :
{{auction_url}}',
  '["lot_title", "time_remaining", "current_price", "auction_url"]'::jsonb),

-- Template WhatsApp: Enchère prolongée
('auction_extended', 'whatsapp', 'fr', NULL,
  '⏱️ *Enchère prolongée !*

📦 {{lot_title}}

L''enchère a été prolongée de *{{time_remaining}}* suite à une nouvelle enchère.

👉 {{auction_url}}',
  '["lot_title", "time_remaining", "auction_url"]'::jsonb),

-- Template WhatsApp: KYC approuvé
('kyc_approved', 'whatsapp', 'fr', NULL,
  '✅ *Vérification approuvée !*

Votre vérification d''identité (KYC) a été approuvée.

Vous pouvez maintenant participer à toutes les enchères ! 🎉

👉 Voir les enchères actives',
  '[]'::jsonb),

-- Template WhatsApp: KYC rejeté
('kyc_rejected', 'whatsapp', 'fr', NULL,
  '❌ *Vérification refusée*

Votre vérification d''identité (KYC) a été refusée.

Merci de soumettre de nouveaux documents conformes.

📞 Besoin d''aide ? Contactez-nous.',
  '[]'::jsonb),

-- Template WhatsApp: Livraison prête
('delivery_ready', 'whatsapp', 'fr', NULL,
  '📦 *Votre lot est prêt !*

{{lot_title}}

✅ Prêt pour le retrait
🔐 Code QR : *{{qr_code}}*

📍 Présentez ce code au retrait de votre lot.

⚠️ Ne partagez pas ce code !',
  '["lot_title", "qr_code"]'::jsonb),

-- Template WhatsApp: Livraison effectuée
('delivery_completed', 'whatsapp', 'fr', NULL,
  '✅ *Livraison effectuée*

📦 {{lot_title}}

Merci d''avoir utilisé Douane Enchères !

⭐ Notez votre expérience',
  '["lot_title"]'::jsonb),

-- Template WhatsApp: Paiement reçu
('payment_received', 'whatsapp', 'fr', NULL,
  '💳 *Paiement reçu*

Montant : *{{bid_amount}} FCFA*

Merci ! Votre paiement a été confirmé.

📦 Votre lot sera bientôt prêt pour le retrait.',
  '["bid_amount"]'::jsonb),

-- Template WhatsApp: Paiement échoué
('payment_failed', 'whatsapp', 'fr', NULL,
  '❌ *Échec du paiement*

Montant : {{bid_amount}} FCFA

Votre paiement n''a pas abouti.

🔄 Veuillez réessayer ou contactez le support.',
  '["bid_amount"]'::jsonb);

COMMENT ON COLUMN notification_templates.body IS 'Corps du message. Supporte les variables {{variable}} et le formatage WhatsApp (*gras*, _italique_)';
