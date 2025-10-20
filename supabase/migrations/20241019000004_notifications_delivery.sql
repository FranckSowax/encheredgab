-- =============================================
-- Migration: Notifications & Livraison
-- Description: Système de notifications multi-canal et livraison QR
-- Version: 1.0
-- Date: 2025-10-19
-- =============================================

-- =============================================
-- ENUMS
-- =============================================

-- Types de canaux de notification
CREATE TYPE notification_channel AS ENUM (
  'email',
  'sms',
  'push',
  'whatsapp',
  'in_app'
);

-- Types de notifications
CREATE TYPE notification_type AS ENUM (
  'bid_placed',
  'bid_outbid',
  'bid_won',
  'auction_starting',
  'auction_ending_soon',
  'auction_extended',
  'auction_completed',
  'kyc_approved',
  'kyc_rejected',
  'lot_approved',
  'lot_rejected',
  'payment_received',
  'payment_failed',
  'delivery_ready',
  'delivery_completed',
  'system_announcement'
);

-- Statut de notification
CREATE TYPE notification_status AS ENUM (
  'pending',
  'sent',
  'delivered',
  'read',
  'failed'
);

-- Statut de livraison
CREATE TYPE delivery_status AS ENUM (
  'pending',
  'ready',
  'in_transit',
  'delivered',
  'cancelled'
);

-- =============================================
-- TABLES
-- =============================================

-- Templates de notifications
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  language VARCHAR(5) DEFAULT 'fr',
  
  subject TEXT,
  body TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(type, channel, language)
);

-- Notifications envoyées
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  channel notification_channel NOT NULL,
  
  subject TEXT,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  
  status notification_status DEFAULT 'pending',
  
  -- Tracking
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_message TEXT,
  
  -- Métadonnées
  priority INTEGER DEFAULT 3,
  expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Préférences de notification des utilisateurs
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Canaux activés par type
  preferences JSONB DEFAULT '{
    "bid_placed": ["email", "push"],
    "bid_outbid": ["email", "sms", "push"],
    "bid_won": ["email", "sms", "push"],
    "auction_ending_soon": ["push"],
    "kyc_approved": ["email", "sms"],
    "delivery_ready": ["email", "sms", "push"]
  }'::jsonb,
  
  -- Paramètres globaux
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT false,
  
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  timezone VARCHAR(50) DEFAULT 'Africa/Libreville',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Livraisons
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- QR Code
  qr_code TEXT UNIQUE NOT NULL,
  qr_code_url TEXT,
  
  -- Adresse de livraison
  delivery_address TEXT,
  delivery_city VARCHAR(100),
  delivery_country VARCHAR(100) DEFAULT 'Gabon',
  recipient_name VARCHAR(255),
  recipient_phone VARCHAR(20),
  
  -- Statut
  status delivery_status DEFAULT 'pending',
  
  -- Tracking
  ready_at TIMESTAMPTZ,
  picked_up_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  delivered_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Signature & preuve
  signature_url TEXT,
  photo_url TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Logs d'activité admin
CREATE TABLE admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, status) WHERE status != 'read';

-- Templates
CREATE INDEX idx_notification_templates_type ON notification_templates(type);
CREATE INDEX idx_notification_templates_active ON notification_templates(is_active);

-- Livraisons
CREATE INDEX idx_deliveries_winner_id ON deliveries(winner_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_qr_code ON deliveries(qr_code);
CREATE INDEX idx_deliveries_auction_id ON deliveries(auction_id);

-- Admin logs
CREATE INDEX idx_admin_logs_admin_id ON admin_activity_logs(admin_id);
CREATE INDEX idx_admin_logs_action ON admin_activity_logs(action);
CREATE INDEX idx_admin_logs_created_at ON admin_activity_logs(created_at DESC);
CREATE INDEX idx_admin_logs_entity ON admin_activity_logs(entity_type, entity_id);

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated at triggers
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at
  BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Créer préférences par défaut pour nouveaux utilisateurs
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_notification_prefs_on_user_create
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_default_notification_preferences();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Marquer une notification comme lue
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET 
    status = 'read',
    read_at = NOW()
  WHERE id = p_notification_id
    AND status != 'read';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Générer un code QR unique pour livraison
CREATE OR REPLACE FUNCTION generate_delivery_qr_code()
RETURNS TEXT AS $$
DECLARE
  v_code TEXT;
  v_exists BOOLEAN;
BEGIN
  LOOP
    -- Format: DEL-YYYYMMDD-XXXXXX
    v_code := 'DEL-' || 
              TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
              UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    
    -- Vérifier unicité
    SELECT EXISTS(
      SELECT 1 FROM deliveries WHERE qr_code = v_code
    ) INTO v_exists;
    
    EXIT WHEN NOT v_exists;
  END LOOP;
  
  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Créer une livraison après une enchère gagnée
CREATE OR REPLACE FUNCTION create_delivery_for_auction(
  p_auction_id UUID,
  p_delivery_address TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_delivery_id UUID;
  v_auction RECORD;
BEGIN
  -- Récupérer les infos de l'enchère
  SELECT a.*, u.full_name, u.phone
  INTO v_auction
  FROM auctions a
  LEFT JOIN users u ON u.id = a.winner_id
  WHERE a.id = p_auction_id;
  
  IF v_auction IS NULL THEN
    RAISE EXCEPTION 'Auction not found';
  END IF;
  
  IF v_auction.status != 'completed' OR v_auction.winner_id IS NULL THEN
    RAISE EXCEPTION 'Auction must be completed with a winner';
  END IF;
  
  -- Créer la livraison
  INSERT INTO deliveries (
    auction_id,
    lot_id,
    winner_id,
    qr_code,
    delivery_address,
    recipient_name,
    recipient_phone,
    status
  )
  VALUES (
    p_auction_id,
    v_auction.lot_id,
    v_auction.winner_id,
    generate_delivery_qr_code(),
    p_delivery_address,
    v_auction.full_name,
    v_auction.phone,
    'pending'
  )
  RETURNING id INTO v_delivery_id;
  
  RETURN v_delivery_id;
END;
$$ LANGUAGE plpgsql;

-- Valider un QR code de livraison
CREATE OR REPLACE FUNCTION validate_delivery_qr(
  p_qr_code TEXT,
  p_delivered_by UUID
)
RETURNS JSONB AS $$
DECLARE
  v_delivery RECORD;
  v_result JSONB;
BEGIN
  -- Récupérer la livraison
  SELECT d.*, l.title as lot_title, u.full_name as winner_name
  INTO v_delivery
  FROM deliveries d
  LEFT JOIN lots l ON l.id = d.lot_id
  LEFT JOIN users u ON u.id = d.winner_id
  WHERE d.qr_code = p_qr_code;
  
  IF v_delivery IS NULL THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Invalid QR code'
    );
  END IF;
  
  IF v_delivery.status = 'delivered' THEN
    RETURN jsonb_build_object(
      'valid', false,
      'error', 'Already delivered',
      'delivered_at', v_delivery.delivered_at
    );
  END IF;
  
  -- Marquer comme livré
  UPDATE deliveries
  SET 
    status = 'delivered',
    delivered_at = NOW(),
    delivered_by = p_delivered_by
  WHERE id = v_delivery.id;
  
  RETURN jsonb_build_object(
    'valid', true,
    'delivery_id', v_delivery.id,
    'lot_title', v_delivery.lot_title,
    'winner_name', v_delivery.winner_name,
    'delivered_at', NOW()
  );
END;
$$ LANGUAGE plpgsql;

-- Obtenir les statistiques du dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats(
  p_start_date TIMESTAMPTZ DEFAULT NULL,
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
  v_start_date TIMESTAMPTZ;
BEGIN
  v_start_date := COALESCE(p_start_date, NOW() - INTERVAL '30 days');
  
  SELECT jsonb_build_object(
    'users', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'active', COUNT(*) FILTER (WHERE last_sign_in_at > NOW() - INTERVAL '7 days'),
        'kyc_approved', COUNT(*) FILTER (WHERE kyc_status = 'approved'),
        'kyc_pending', COUNT(*) FILTER (WHERE kyc_status = 'pending')
      )
      FROM users
      WHERE created_at BETWEEN v_start_date AND p_end_date
    ),
    'lots', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'active', COUNT(*) FILTER (WHERE status = 'active'),
        'sold', COUNT(*) FILTER (WHERE status = 'sold'),
        'pending_review', COUNT(*) FILTER (WHERE status = 'pending_review')
      )
      FROM lots
      WHERE created_at BETWEEN v_start_date AND p_end_date
    ),
    'auctions', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'active', COUNT(*) FILTER (WHERE status = 'active'),
        'completed', COUNT(*) FILTER (WHERE status = 'completed'),
        'total_bids', COALESCE(SUM(total_bids), 0),
        'avg_bids_per_auction', COALESCE(AVG(total_bids), 0),
        'total_revenue', COALESCE(SUM(current_price) FILTER (WHERE status = 'completed'), 0)
      )
      FROM auctions
      WHERE created_at BETWEEN v_start_date AND p_end_date
    ),
    'deliveries', (
      SELECT jsonb_build_object(
        'total', COUNT(*),
        'pending', COUNT(*) FILTER (WHERE status = 'pending'),
        'ready', COUNT(*) FILTER (WHERE status = 'ready'),
        'delivered', COUNT(*) FILTER (WHERE status = 'delivered')
      )
      FROM deliveries
      WHERE created_at BETWEEN v_start_date AND p_end_date
    )
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- RLS POLICIES
-- =============================================

ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Templates: Lecture publique, gestion admin
CREATE POLICY "Templates visible by everyone"
  ON notification_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage templates"
  ON notification_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Notifications: Chaque utilisateur voit ses notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Préférences: Chaque utilisateur gère ses préférences
CREATE POLICY "Users can view own preferences"
  ON notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own preferences"
  ON notification_preferences FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Livraisons: Gagnant et admin
CREATE POLICY "Winners can view own deliveries"
  ON deliveries FOR SELECT
  USING (winner_id = auth.uid());

CREATE POLICY "Admins can manage deliveries"
  ON deliveries FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'customs')
    )
  );

-- Admin logs: Admin seulement
CREATE POLICY "Admins can view activity logs"
  ON admin_activity_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create activity logs"
  ON admin_activity_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- =============================================
-- SEED DATA: Templates de notifications
-- =============================================

INSERT INTO notification_templates (type, channel, language, subject, body, variables) VALUES
-- Email templates
('bid_placed', 'email', 'fr', 
  'Nouvelle enchère placée sur {{lot_title}}',
  'Bonjour {{user_name}},\n\nUne nouvelle enchère de {{bid_amount}} FCFA a été placée sur le lot "{{lot_title}}".\n\nVous pouvez consulter l''enchère ici: {{auction_url}}',
  '["user_name", "lot_title", "bid_amount", "auction_url"]'::jsonb),

('bid_outbid', 'email', 'fr',
  'Vous avez été surenchéri sur {{lot_title}}',
  'Bonjour {{user_name}},\n\nVous avez été surenchéri sur le lot "{{lot_title}}".\nNouvelle enchère: {{new_bid_amount}} FCFA\nVotre dernière enchère: {{your_bid_amount}} FCFA\n\nPlacez une nouvelle enchère: {{auction_url}}',
  '["user_name", "lot_title", "new_bid_amount", "your_bid_amount", "auction_url"]'::jsonb),

('bid_won', 'email', 'fr',
  'Félicitations! Vous avez remporté {{lot_title}}',
  'Bonjour {{user_name}},\n\nFélicitations! Vous avez remporté l''enchère pour "{{lot_title}}".\nMontant final: {{winning_amount}} FCFA\n\nProchaines étapes:\n1. Effectuer le paiement\n2. Organiser la livraison\n\nDétails: {{auction_url}}',
  '["user_name", "lot_title", "winning_amount", "auction_url"]'::jsonb),

('auction_ending_soon', 'email', 'fr',
  '⏰ L''enchère pour {{lot_title}} se termine bientôt',
  'Bonjour {{user_name}},\n\nL''enchère pour "{{lot_title}}" se termine dans {{time_remaining}}.\nEnchère actuelle: {{current_price}} FCFA\n\nNe manquez pas cette opportunité: {{auction_url}}',
  '["user_name", "lot_title", "time_remaining", "current_price", "auction_url"]'::jsonb),

-- SMS templates
('bid_outbid', 'sms', 'fr',
  NULL,
  'Douane Enchères: Vous avez été surenchéri sur {{lot_title}}. Nouvelle enchère: {{new_bid_amount}} FCFA. Enchérissez maintenant!',
  '["lot_title", "new_bid_amount"]'::jsonb),

('bid_won', 'sms', 'fr',
  NULL,
  'Félicitations! Vous avez remporté {{lot_title}} pour {{winning_amount}} FCFA. Consultez vos détails de livraison.',
  '["lot_title", "winning_amount"]'::jsonb),

('delivery_ready', 'sms', 'fr',
  NULL,
  'Votre lot {{lot_title}} est prêt pour le retrait. Code QR: {{qr_code}}',
  '["lot_title", "qr_code"]'::jsonb),

-- Push templates
('bid_placed', 'push', 'fr',
  'Nouvelle enchère',
  'Nouvelle enchère de {{bid_amount}} FCFA sur {{lot_title}}',
  '["bid_amount", "lot_title"]'::jsonb),

('auction_ending_soon', 'push', 'fr',
  'Enchère se termine bientôt',
  '{{lot_title}} se termine dans {{time_remaining}}',
  '["lot_title", "time_remaining"]'::jsonb);

COMMENT ON TABLE notifications IS 'Historique des notifications envoyées';
COMMENT ON TABLE notification_templates IS 'Templates de notifications multi-canal';
COMMENT ON TABLE notification_preferences IS 'Préférences de notification des utilisateurs';
COMMENT ON TABLE deliveries IS 'Système de livraison avec QR codes';
COMMENT ON TABLE admin_activity_logs IS 'Logs d''activité des administrateurs';
