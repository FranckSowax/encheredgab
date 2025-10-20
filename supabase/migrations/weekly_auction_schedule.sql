-- Migration: Système de Calendrier Hebdomadaire
-- Date: 2025-10-20
-- Cycle: Lundi-Mercredi Preview, Jeudi-Vendredi Enchères

-- ============================================
-- 1. AJOUTER COLONNES DE PLANNING
-- ============================================

-- Ajouter les dates de preview et de clôture
ALTER TABLE auctions 
ADD COLUMN IF NOT EXISTS preview_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bidding_start TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS bidding_end TIMESTAMPTZ;

-- Index pour optimiser les requêtes de planning
CREATE INDEX IF NOT EXISTS idx_auctions_preview_start ON auctions(preview_start);
CREATE INDEX IF NOT EXISTS idx_auctions_bidding_start ON auctions(bidding_start);
CREATE INDEX IF NOT EXISTS idx_auctions_bidding_end ON auctions(bidding_end);

-- ============================================
-- 2. FONCTION: Calculer Dates Hebdomadaires
-- ============================================

CREATE OR REPLACE FUNCTION calculate_weekly_schedule(
  p_week_start_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  preview_start TIMESTAMPTZ,
  bidding_start TIMESTAMPTZ,
  bidding_end TIMESTAMPTZ,
  week_number INT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_monday DATE;
BEGIN
  -- Trouver le lundi de la semaine
  v_monday := date_trunc('week', p_week_start_date)::DATE + INTERVAL '1 day';
  
  -- Preview: Lundi 00h00
  preview_start := v_monday::TIMESTAMPTZ;
  
  -- Bidding Start: Jeudi 00h00
  bidding_start := (v_monday + INTERVAL '3 days')::TIMESTAMPTZ;
  
  -- Bidding End: Vendredi 12h00
  bidding_end := (v_monday + INTERVAL '4 days' + INTERVAL '12 hours')::TIMESTAMPTZ;
  
  -- Numéro de semaine
  week_number := EXTRACT(WEEK FROM v_monday)::INT;
  
  RETURN QUERY SELECT 
    preview_start, 
    bidding_start, 
    bidding_end, 
    week_number;
END;
$$;

COMMENT ON FUNCTION calculate_weekly_schedule IS 'Calcule les dates de preview et enchères pour une semaine donnée';

-- ============================================
-- 3. FONCTION: Planifier une Enchère Hebdomadaire
-- ============================================

CREATE OR REPLACE FUNCTION schedule_weekly_auction(
  p_auction_id UUID,
  p_week_offset INT DEFAULT 0  -- 0 = cette semaine, 1 = semaine prochaine, etc.
)
RETURNS TABLE (
  success BOOLEAN,
  preview_start TIMESTAMPTZ,
  bidding_start TIMESTAMPTZ,
  bidding_end TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_schedule RECORD;
BEGIN
  -- Calculer les dates pour la semaine cible
  SELECT * INTO v_schedule
  FROM calculate_weekly_schedule(
    (CURRENT_DATE + (p_week_offset * 7))::DATE
  );
  
  -- Mettre à jour l'enchère
  UPDATE auctions
  SET 
    preview_start = v_schedule.preview_start,
    start_date = v_schedule.bidding_start,
    bidding_start = v_schedule.bidding_start,
    end_date = v_schedule.bidding_end,
    bidding_end = v_schedule.bidding_end,
    status = 'scheduled',
    updated_at = NOW()
  WHERE id = p_auction_id;
  
  -- Retourner les dates calculées
  RETURN QUERY SELECT 
    TRUE,
    v_schedule.preview_start,
    v_schedule.bidding_start,
    v_schedule.bidding_end;
END;
$$;

COMMENT ON FUNCTION schedule_weekly_auction IS 'Planifie une enchère selon le calendrier hebdomadaire';

-- ============================================
-- 4. FONCTION: Ouvrir les Enchères (Jeudi 00h00)
-- ============================================

CREATE OR REPLACE FUNCTION open_scheduled_auctions()
RETURNS TABLE (
  opened_count INT,
  auction_ids UUID[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_opened_ids UUID[];
BEGIN
  -- Activer les enchères dont l'heure de début est arrivée
  WITH updated AS (
    UPDATE auctions
    SET 
      status = 'active',
      updated_at = v_now
    WHERE status = 'scheduled'
      AND bidding_start <= v_now
      AND bidding_end > v_now
    RETURNING id
  )
  SELECT array_agg(id) INTO v_opened_ids FROM updated;
  
  -- Retourner le nombre et les IDs
  RETURN QUERY SELECT 
    COALESCE(array_length(v_opened_ids, 1), 0)::INT,
    v_opened_ids;
END;
$$;

COMMENT ON FUNCTION open_scheduled_auctions IS 'Active automatiquement les enchères programmées (à appeler jeudi 00h00)';

-- ============================================
-- 5. FONCTION: Clôturer les Enchères (Vendredi 12h00)
-- ============================================

CREATE OR REPLACE FUNCTION close_finished_auctions()
RETURNS TABLE (
  closed_count INT,
  auction_ids UUID[],
  winners JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_closed_ids UUID[];
  v_winners JSONB := '[]'::JSONB;
  v_auction RECORD;
  v_winning_bid RECORD;
BEGIN
  -- Récupérer les enchères à clôturer
  FOR v_auction IN 
    SELECT id 
    FROM auctions
    WHERE status = 'active'
      AND bidding_end <= v_now
  LOOP
    -- Trouver l'enchère gagnante
    SELECT * INTO v_winning_bid
    FROM bids
    WHERE auction_id = v_auction.id
      AND status = 'valid'
    ORDER BY amount DESC, created_at ASC
    LIMIT 1;
    
    -- Mettre à jour l'enchère
    UPDATE auctions
    SET 
      status = 'completed',
      winner_id = v_winning_bid.user_id,
      winning_bid_id = v_winning_bid.id,
      updated_at = v_now
    WHERE id = v_auction.id;
    
    -- Marquer l'enchère comme gagnante
    IF v_winning_bid.id IS NOT NULL THEN
      UPDATE bids
      SET status = 'won'
      WHERE id = v_winning_bid.id;
      
      -- Ajouter aux gagnants
      v_winners := v_winners || jsonb_build_object(
        'auction_id', v_auction.id,
        'winner_id', v_winning_bid.user_id,
        'winning_amount', v_winning_bid.amount
      );
    END IF;
    
    -- Ajouter à la liste des IDs
    v_closed_ids := array_append(v_closed_ids, v_auction.id);
  END LOOP;
  
  -- Retourner les résultats
  RETURN QUERY SELECT 
    COALESCE(array_length(v_closed_ids, 1), 0)::INT,
    v_closed_ids,
    v_winners;
END;
$$;

COMMENT ON FUNCTION close_finished_auctions IS 'Clôture automatiquement les enchères terminées (à appeler vendredi 12h00)';

-- ============================================
-- 6. FONCTION: Statut Actuel du Cycle Hebdomadaire
-- ============================================

CREATE OR REPLACE FUNCTION get_weekly_cycle_status()
RETURNS TABLE (
  current_phase TEXT,
  phase_description TEXT,
  next_phase TEXT,
  next_phase_time TIMESTAMPTZ,
  hours_remaining NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_day_of_week INT := EXTRACT(DOW FROM v_now)::INT;  -- 0=Dimanche, 1=Lundi, 4=Jeudi, 5=Vendredi
  v_hour INT := EXTRACT(HOUR FROM v_now)::INT;
  v_schedule RECORD;
BEGIN
  -- Calculer le calendrier de la semaine en cours
  SELECT * INTO v_schedule FROM calculate_weekly_schedule(CURRENT_DATE);
  
  -- Lundi-Mercredi (jours 1-3)
  IF v_day_of_week BETWEEN 1 AND 3 THEN
    RETURN QUERY SELECT 
      'preview'::TEXT,
      'Prévisualisation des lots - Enchères non ouvertes'::TEXT,
      'bidding_open'::TEXT,
      v_schedule.bidding_start,
      EXTRACT(EPOCH FROM (v_schedule.bidding_start - v_now)) / 3600;
  
  -- Jeudi-Vendredi midi (jours 4-5 jusqu'à 12h)
  ELSIF (v_day_of_week = 4) OR (v_day_of_week = 5 AND v_hour < 12) THEN
    RETURN QUERY SELECT 
      'active'::TEXT,
      'Enchères en cours'::TEXT,
      'bidding_close'::TEXT,
      v_schedule.bidding_end,
      EXTRACT(EPOCH FROM (v_schedule.bidding_end - v_now)) / 3600;
  
  -- Vendredi après-midi - Dimanche
  ELSE
    -- Calculer la semaine prochaine
    SELECT * INTO v_schedule FROM calculate_weekly_schedule((CURRENT_DATE + 7)::DATE);
    
    RETURN QUERY SELECT 
      'closed'::TEXT,
      'Enchères terminées - Prochaines enchères lundi'::TEXT,
      'preview_start'::TEXT,
      v_schedule.preview_start,
      EXTRACT(EPOCH FROM (v_schedule.preview_start - v_now)) / 3600;
  END IF;
END;
$$;

COMMENT ON FUNCTION get_weekly_cycle_status IS 'Retourne le statut actuel du cycle hebdomadaire';

-- ============================================
-- 7. VIEW: Enchères de la Semaine en Cours
-- ============================================

CREATE OR REPLACE VIEW current_week_auctions AS
SELECT 
  a.*,
  l.title as lot_title,
  l.description as lot_description,
  CASE 
    WHEN a.status = 'scheduled' THEN 'preview'
    WHEN a.status = 'active' THEN 'bidding'
    WHEN a.status = 'completed' THEN 'closed'
    ELSE 'unknown'
  END as phase,
  EXTRACT(EPOCH FROM (a.bidding_start - NOW())) / 3600 as hours_until_bidding,
  EXTRACT(EPOCH FROM (a.bidding_end - NOW())) / 3600 as hours_until_close
FROM auctions a
LEFT JOIN lots l ON l.id = a.lot_id
WHERE a.preview_start >= date_trunc('week', CURRENT_DATE) + INTERVAL '1 day'
  AND a.preview_start < date_trunc('week', CURRENT_DATE) + INTERVAL '8 days'
ORDER BY a.preview_start, a.starting_price DESC;

COMMENT ON VIEW current_week_auctions IS 'Vue des enchères de la semaine en cours';

-- ============================================
-- 8. TRIGGER: Auto-update Status
-- ============================================

CREATE OR REPLACE FUNCTION auto_update_auction_status()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Si on est dans la période de preview
  IF NEW.preview_start <= NOW() AND NEW.bidding_start > NOW() THEN
    NEW.status := 'scheduled';
  
  -- Si on est dans la période d'enchères
  ELSIF NEW.bidding_start <= NOW() AND NEW.bidding_end > NOW() THEN
    NEW.status := 'active';
  
  -- Si les enchères sont terminées
  ELSIF NEW.bidding_end <= NOW() THEN
    NEW.status := 'completed';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_auto_update_auction_status ON auctions;
CREATE TRIGGER trigger_auto_update_auction_status
  BEFORE INSERT OR UPDATE ON auctions
  FOR EACH ROW
  EXECUTE FUNCTION auto_update_auction_status();

-- ============================================
-- 9. EXEMPLES D'UTILISATION
-- ============================================

-- Planifier une enchère pour cette semaine
-- SELECT * FROM schedule_weekly_auction('AUCTION_ID', 0);

-- Planifier pour la semaine prochaine
-- SELECT * FROM schedule_weekly_auction('AUCTION_ID', 1);

-- Obtenir le statut actuel du cycle
-- SELECT * FROM get_weekly_cycle_status();

-- Ouvrir les enchères programmées (cron jeudi 00h00)
-- SELECT * FROM open_scheduled_auctions();

-- Clôturer les enchères terminées (cron vendredi 12h00)
-- SELECT * FROM close_finished_auctions();

-- Voir les enchères de la semaine
-- SELECT * FROM current_week_auctions;
