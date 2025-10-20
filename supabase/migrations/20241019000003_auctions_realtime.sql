-- Migration pour le système d'enchères en temps réel
-- Tâche 3: Moteur d'Enchères en Temps Réel

-- =====================================================
-- ENUMS
-- =====================================================

-- Statut d'une session d'enchères
CREATE TYPE auction_status AS ENUM (
  'scheduled',    -- Planifiée
  'active',       -- En cours
  'paused',       -- En pause (problème technique)
  'completed',    -- Terminée normalement
  'cancelled'     -- Annulée
);

-- Type d'enchère
CREATE TYPE bid_type AS ENUM (
  'manual',       -- Enchère manuelle
  'auto',         -- Enchère automatique (proxy)
  'snipe'         -- Enchère de dernière seconde
);

-- Statut d'une enchère
CREATE TYPE bid_status AS ENUM (
  'pending',      -- En attente de validation
  'valid',        -- Validée
  'outbid',       -- Surenchérie
  'winning',      -- Gagnante actuelle
  'won',          -- Gagnée (enchère terminée)
  'invalid',      -- Invalide (problème de validation)
  'refunded'      -- Remboursée (annulation)
);

-- =====================================================
-- TABLES
-- =====================================================

-- Table des sessions d'enchères
CREATE TABLE public.auctions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Référence au lot
  lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE NOT NULL,
  
  -- Dates et durée
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  extended_count INTEGER DEFAULT 0, -- Nombre de prolongations
  total_extension_time INTERVAL DEFAULT '0 minutes', -- Temps total ajouté
  
  -- Prix
  starting_price DECIMAL(12, 2) NOT NULL,
  reserve_price DECIMAL(12, 2), -- Prix de réserve
  current_price DECIMAL(12, 2) NOT NULL,
  increment DECIMAL(12, 2) DEFAULT 5000 NOT NULL,
  
  -- Statistiques
  total_bids INTEGER DEFAULT 0,
  unique_bidders INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- État
  status auction_status DEFAULT 'scheduled' NOT NULL,
  winner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  winning_bid_id UUID, -- Sera lié après création de la table bids
  
  -- Anti-sniping
  anti_snipe_enabled BOOLEAN DEFAULT TRUE,
  anti_snipe_threshold INTERVAL DEFAULT '2 minutes', -- Si enchère dans les 2 dernières minutes
  anti_snipe_extension INTERVAL DEFAULT '2 minutes', -- Prolonger de 2 minutes
  max_extensions INTEGER DEFAULT 10, -- Maximum 10 prolongations
  
  -- Métadonnées
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Contraintes
  CONSTRAINT valid_auction_dates CHECK (start_date < end_date),
  CONSTRAINT valid_prices CHECK (current_price >= starting_price)
);

-- Table des enchères
CREATE TABLE public.bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Références
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Montant et type
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  bid_type bid_type DEFAULT 'manual' NOT NULL,
  status bid_status DEFAULT 'pending' NOT NULL,
  
  -- Enchère automatique (proxy bidding)
  is_auto_bid BOOLEAN DEFAULT FALSE,
  max_auto_amount DECIMAL(12, 2), -- Montant maximum pour enchère auto
  
  -- Validation
  is_valid BOOLEAN DEFAULT TRUE,
  validation_error TEXT,
  
  -- Informations de connexion
  ip_address INET,
  user_agent TEXT,
  
  -- Timing (pour détecter le sniping)
  time_before_end INTERVAL, -- Temps restant au moment de l'enchère
  is_snipe BOOLEAN DEFAULT FALSE, -- Enchère dans les dernières secondes
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Contraintes
  CONSTRAINT unique_user_amount_per_auction UNIQUE(auction_id, user_id, amount)
);

-- Ajouter la foreign key de winning_bid_id maintenant que bids existe
ALTER TABLE public.auctions 
  ADD CONSTRAINT auctions_winning_bid_id_fkey 
  FOREIGN KEY (winning_bid_id) REFERENCES public.bids(id) ON DELETE SET NULL;

-- Table pour enchères automatiques (proxy bidding)
CREATE TABLE public.auto_bids (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Références
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Configuration
  max_amount DECIMAL(12, 2) NOT NULL CHECK (max_amount > 0),
  increment DECIMAL(12, 2) DEFAULT 5000,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Statistiques
  bids_placed INTEGER DEFAULT 0, -- Nombre d'enchères placées automatiquement
  amount_used DECIMAL(12, 2) DEFAULT 0, -- Montant utilisé
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  deactivated_at TIMESTAMPTZ,
  
  -- Contraintes
  CONSTRAINT unique_user_per_auction UNIQUE(auction_id, user_id)
);

-- Table pour file d'attente offline
CREATE TABLE public.offline_bids_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Références
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Données de l'enchère
  amount DECIMAL(12, 2) NOT NULL,
  bid_data JSONB, -- Données complètes de l'enchère
  
  -- État de traitement
  status TEXT DEFAULT 'queued', -- queued, processing, completed, failed
  retry_count INTEGER DEFAULT 0,
  error_message TEXT,
  
  -- Métadonnées
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMPTZ,
  
  -- Index pour traitement efficace
  CONSTRAINT max_retries CHECK (retry_count <= 3)
);

-- Table d'historique des enchères en temps réel (pour analytics)
CREATE TABLE public.bid_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  auction_id UUID REFERENCES public.auctions(id) ON DELETE CASCADE NOT NULL,
  bid_id UUID REFERENCES public.bids(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  
  event_type TEXT NOT NULL, -- bid_placed, bid_outbid, auction_extended, etc.
  event_data JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- INDEX
-- =====================================================

-- Auctions
CREATE INDEX idx_auctions_lot_id ON public.auctions(lot_id);
CREATE INDEX idx_auctions_status ON public.auctions(status);
CREATE INDEX idx_auctions_start_date ON public.auctions(start_date);
CREATE INDEX idx_auctions_end_date ON public.auctions(end_date);
CREATE INDEX idx_auctions_winner_id ON public.auctions(winner_id);
CREATE INDEX idx_auctions_active ON public.auctions(status) WHERE status = 'active';

-- Bids
CREATE INDEX idx_bids_auction_id ON public.bids(auction_id);
CREATE INDEX idx_bids_user_id ON public.bids(user_id);
CREATE INDEX idx_bids_lot_id ON public.bids(lot_id);
CREATE INDEX idx_bids_status ON public.bids(status);
CREATE INDEX idx_bids_created_at ON public.bids(created_at DESC);
CREATE INDEX idx_bids_amount ON public.bids(amount DESC);
CREATE INDEX idx_bids_auction_user ON public.bids(auction_id, user_id);

-- Auto bids
CREATE INDEX idx_auto_bids_auction_id ON public.auto_bids(auction_id);
CREATE INDEX idx_auto_bids_user_id ON public.auto_bids(user_id);
CREATE INDEX idx_auto_bids_active ON public.auto_bids(is_active) WHERE is_active = TRUE;

-- Offline queue
CREATE INDEX idx_offline_queue_status ON public.offline_bids_queue(status);
CREATE INDEX idx_offline_queue_created ON public.offline_bids_queue(created_at);

-- Bid events
CREATE INDEX idx_bid_events_auction_id ON public.bid_events(auction_id);
CREATE INDEX idx_bid_events_created_at ON public.bid_events(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger pour updated_at
CREATE TRIGGER update_auctions_updated_at
  BEFORE UPDATE ON public.auctions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auto_bids_updated_at
  BEFORE UPDATE ON public.auto_bids
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Calculer le temps restant avant fin d'enchère
CREATE OR REPLACE FUNCTION calculate_time_before_end()
RETURNS TRIGGER AS $$
DECLARE
  auction_end TIMESTAMPTZ;
BEGIN
  SELECT end_date INTO auction_end
  FROM public.auctions
  WHERE id = NEW.auction_id;
  
  NEW.time_before_end := auction_end - NEW.created_at;
  NEW.is_snipe := (auction_end - NEW.created_at) < INTERVAL '30 seconds';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_bid_timing
  BEFORE INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION calculate_time_before_end();

-- Mettre à jour les statistiques de l'enchère
CREATE OR REPLACE FUNCTION update_auction_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.auctions
    SET 
      total_bids = total_bids + 1,
      unique_bidders = (
        SELECT COUNT(DISTINCT user_id)
        FROM public.bids
        WHERE auction_id = NEW.auction_id
      ),
      updated_at = NOW()
    WHERE id = NEW.auction_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_auction_stats_on_bid
  AFTER INSERT ON public.bids
  FOR EACH ROW
  EXECUTE FUNCTION update_auction_stats();

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Valider une enchère
CREATE OR REPLACE FUNCTION validate_bid(
  p_auction_id UUID,
  p_user_id UUID,
  p_amount DECIMAL
)
RETURNS TABLE (
  is_valid BOOLEAN,
  error_message TEXT,
  current_price DECIMAL,
  minimum_bid DECIMAL
) AS $$
DECLARE
  v_auction RECORD;
  v_user_kyc TEXT;
  v_user_excluded BOOLEAN;
  v_last_bid DECIMAL;
BEGIN
  -- Vérifier que l'enchère existe et est active
  SELECT * INTO v_auction
  FROM public.auctions
  WHERE id = p_auction_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Auction not found', NULL::DECIMAL, NULL::DECIMAL;
    RETURN;
  END IF;
  
  IF v_auction.status != 'active' THEN
    RETURN QUERY SELECT FALSE, 'Auction is not active', v_auction.current_price, NULL::DECIMAL;
    RETURN;
  END IF;
  
  -- Vérifier que l'enchère n'est pas terminée
  IF NOW() > v_auction.end_date THEN
    RETURN QUERY SELECT FALSE, 'Auction has ended', v_auction.current_price, NULL::DECIMAL;
    RETURN;
  END IF;
  
  -- Vérifier le KYC de l'utilisateur
  SELECT kyc_status, is_excluded INTO v_user_kyc, v_user_excluded
  FROM public.users
  WHERE id = p_user_id;
  
  IF v_user_kyc != 'approved' THEN
    RETURN QUERY SELECT FALSE, 'KYC not approved', v_auction.current_price, NULL::DECIMAL;
    RETURN;
  END IF;
  
  IF v_user_excluded THEN
    RETURN QUERY SELECT FALSE, 'User is excluded from bidding', v_auction.current_price, NULL::DECIMAL;
    RETURN;
  END IF;
  
  -- Vérifier que l'utilisateur n'est pas le propriétaire
  IF v_auction.winner_id = p_user_id THEN
    RETURN QUERY SELECT FALSE, 'You are already the highest bidder', v_auction.current_price, NULL::DECIMAL;
    RETURN;
  END IF;
  
  -- Calculer le montant minimum
  v_last_bid := v_auction.current_price + v_auction.increment;
  
  -- Vérifier que le montant est suffisant
  IF p_amount < v_last_bid THEN
    RETURN QUERY SELECT FALSE, 
      'Bid amount must be at least ' || v_last_bid::TEXT, 
      v_auction.current_price, 
      v_last_bid;
    RETURN;
  END IF;
  
  -- Tout est valide
  RETURN QUERY SELECT TRUE, NULL::TEXT, v_auction.current_price, v_last_bid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Placer une enchère
CREATE OR REPLACE FUNCTION place_bid(
  p_auction_id UUID,
  p_user_id UUID,
  p_amount DECIMAL,
  p_bid_type bid_type DEFAULT 'manual',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  bid_id UUID,
  message TEXT,
  new_price DECIMAL,
  extended BOOLEAN
) AS $$
DECLARE
  v_validation RECORD;
  v_auction RECORD;
  v_new_bid_id UUID;
  v_extended BOOLEAN := FALSE;
  v_time_left INTERVAL;
BEGIN
  -- Valider l'enchère
  SELECT * INTO v_validation
  FROM validate_bid(p_auction_id, p_user_id, p_amount)
  LIMIT 1;
  
  IF NOT v_validation.is_valid THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, v_validation.error_message, v_validation.current_price, FALSE;
    RETURN;
  END IF;
  
  -- Récupérer l'enchère
  SELECT * INTO v_auction FROM public.auctions WHERE id = p_auction_id;
  
  -- Marquer les anciennes enchères comme outbid
  UPDATE public.bids
  SET status = 'outbid'
  WHERE auction_id = p_auction_id
    AND status = 'winning';
  
  -- Créer la nouvelle enchère
  INSERT INTO public.bids (
    auction_id, lot_id, user_id, amount, bid_type, 
    status, ip_address, user_agent
  )
  VALUES (
    p_auction_id, v_auction.lot_id, p_user_id, p_amount, p_bid_type,
    'winning', p_ip_address, p_user_agent
  )
  RETURNING id INTO v_new_bid_id;
  
  -- Calculer le temps restant
  v_time_left := v_auction.end_date - NOW();
  
  -- Anti-sniping : prolonger si enchère dans les dernières minutes
  IF v_auction.anti_snipe_enabled AND 
     v_time_left < v_auction.anti_snipe_threshold AND
     v_auction.extended_count < v_auction.max_extensions THEN
    
    UPDATE public.auctions
    SET 
      end_date = end_date + v_auction.anti_snipe_extension,
      extended_count = extended_count + 1,
      total_extension_time = total_extension_time + v_auction.anti_snipe_extension
    WHERE id = p_auction_id;
    
    v_extended := TRUE;
  END IF;
  
  -- Mettre à jour l'enchère avec le nouveau prix et gagnant
  UPDATE public.auctions
  SET 
    current_price = p_amount,
    winner_id = p_user_id,
    winning_bid_id = v_new_bid_id,
    updated_at = NOW()
  WHERE id = p_auction_id;
  
  -- Logger l'événement
  INSERT INTO public.bid_events (auction_id, bid_id, user_id, event_type, event_data)
  VALUES (
    p_auction_id, v_new_bid_id, p_user_id, 'bid_placed',
    jsonb_build_object(
      'amount', p_amount,
      'type', p_bid_type,
      'extended', v_extended
    )
  );
  
  RETURN QUERY SELECT TRUE, v_new_bid_id, 'Bid placed successfully', p_amount, v_extended;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obtenir les enchères actives
CREATE OR REPLACE FUNCTION get_active_auctions(
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  auction_id UUID,
  lot_id UUID,
  lot_title TEXT,
  current_price DECIMAL,
  total_bids INTEGER,
  end_date TIMESTAMPTZ,
  time_remaining INTERVAL,
  image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.lot_id,
    l.title,
    a.current_price,
    a.total_bids,
    a.end_date,
    a.end_date - NOW() AS time_remaining,
    li.image_url
  FROM public.auctions a
  INNER JOIN public.lots l ON a.lot_id = l.id
  LEFT JOIN public.lot_images li ON l.id = li.lot_id AND li.is_primary = TRUE
  WHERE a.status = 'active'
    AND a.end_date > NOW()
  ORDER BY a.end_date ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Terminer une enchère
CREATE OR REPLACE FUNCTION complete_auction(p_auction_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_auction RECORD;
  v_winning_bid RECORD;
BEGIN
  SELECT * INTO v_auction FROM public.auctions WHERE id = p_auction_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Marquer l'enchère comme complétée
  UPDATE public.auctions
  SET status = 'completed', updated_at = NOW()
  WHERE id = p_auction_id;
  
  -- Marquer l'enchère gagnante
  UPDATE public.bids
  SET status = 'won'
  WHERE id = v_auction.winning_bid_id;
  
  -- Mettre à jour le lot
  IF v_auction.winner_id IS NOT NULL THEN
    UPDATE public.lots
    SET 
      status = 'sold',
      winner_id = v_auction.winner_id,
      winning_bid = v_auction.current_price,
      updated_at = NOW()
    WHERE id = v_auction.lot_id;
  ELSE
    -- Pas de gagnant (prix de réserve non atteint)
    UPDATE public.lots
    SET status = 'unsold', updated_at = NOW()
    WHERE id = v_auction.lot_id;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_bids_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bid_events ENABLE ROW LEVEL SECURITY;

-- Politiques pour auctions

-- Tout le monde peut lire les enchères actives
CREATE POLICY "Anyone can read active auctions"
  ON public.auctions
  FOR SELECT
  USING (status IN ('scheduled', 'active', 'completed'));

-- Admins peuvent tout gérer
CREATE POLICY "Admins can manage all auctions"
  ON public.auctions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour bids

-- Utilisateurs peuvent lire leurs propres enchères
CREATE POLICY "Users can read their own bids"
  ON public.bids
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins peuvent lire toutes les enchères
CREATE POLICY "Admins can read all bids"
  ON public.bids
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Utilisateurs peuvent créer des enchères
CREATE POLICY "Users can create bids"
  ON public.bids
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Politiques pour auto_bids

-- Utilisateurs peuvent gérer leurs enchères automatiques
CREATE POLICY "Users can manage their auto bids"
  ON public.auto_bids
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politiques pour offline queue

-- Utilisateurs peuvent gérer leur queue
CREATE POLICY "Users can manage their offline queue"
  ON public.offline_bids_queue
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politiques pour bid_events

-- Admins peuvent lire tous les événements
CREATE POLICY "Admins can read all bid events"
  ON public.bid_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- REALTIME PUBLICATION
-- =====================================================

-- Activer Realtime sur les tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bids;

-- Note: Configuration additionnelle dans le dashboard Supabase:
-- Database → Replication → Ajouter les tables auctions et bids
