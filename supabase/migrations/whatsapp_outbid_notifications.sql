-- Migration: Notifications WhatsApp pour enchères dépassées
-- Date: 2025-10-19

-- ============================================
-- 1. FONCTION: Récupérer le dernier enchérisseur avant une nouvelle enchère
-- ============================================

CREATE OR REPLACE FUNCTION get_previous_top_bidder(p_auction_id UUID)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  user_phone TEXT,
  last_bid_amount NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.user_id,
    u.full_name,
    u.phone,
    b.amount
  FROM bids b
  INNER JOIN users u ON u.id = b.user_id
  WHERE b.auction_id = p_auction_id
    AND b.status IN ('valid', 'winning')
  ORDER BY b.created_at DESC
  LIMIT 1;
END;
$$;

COMMENT ON FUNCTION get_previous_top_bidder IS 'Récupère le dernier enchérisseur d''une auction avant une nouvelle enchère';

-- ============================================
-- 2. TRIGGER: Notification automatique après nouvelle enchère
-- ============================================

CREATE OR REPLACE FUNCTION notify_outbid_via_webhook()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_previous_bidder RECORD;
  v_auction RECORD;
  v_app_url TEXT;
  v_webhook_url TEXT;
  v_payload JSON;
BEGIN
  -- Ne traiter que les nouvelles enchères valides
  IF NEW.status != 'valid' THEN
    RETURN NEW;
  END IF;

  -- Récupérer l'URL de l'app depuis les settings (ou utiliser une valeur par défaut)
  v_app_url := COALESCE(
    current_setting('app.settings.base_url', true),
    'http://localhost:3000'
  );

  -- Construire l'URL du webhook
  v_webhook_url := v_app_url || '/api/auctions/' || NEW.auction_id || '/notify-outbid';

  -- Récupérer le dernier enchérisseur (qui vient d'être dépassé)
  SELECT * INTO v_previous_bidder
  FROM get_previous_top_bidder(NEW.auction_id)
  WHERE user_id != NEW.user_id; -- Ne pas notifier si c'est le même user

  -- Si on a trouvé un enchérisseur précédent avec un téléphone
  IF FOUND AND v_previous_bidder.user_phone IS NOT NULL THEN
    
    -- Préparer le payload
    v_payload := json_build_object(
      'previous_bidder_id', v_previous_bidder.user_id,
      'new_bid_amount', NEW.amount,
      'auction_id', NEW.auction_id
    );

    -- Envoyer la requête HTTP async (via pg_net si disponible)
    -- Note: pg_net doit être installé sur Supabase
    BEGIN
      PERFORM
        net.http_post(
          url := v_webhook_url,
          headers := jsonb_build_object(
            'Content-Type', 'application/json'
          ),
          body := v_payload::jsonb
        );
    EXCEPTION WHEN OTHERS THEN
      -- Logger l'erreur mais ne pas bloquer l'insertion
      RAISE WARNING 'Erreur notification webhook: %', SQLERRM;
    END;

  END IF;

  RETURN NEW;
END;
$$;

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS trigger_notify_outbid ON bids;

-- Créer le trigger
CREATE TRIGGER trigger_notify_outbid
  AFTER INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION notify_outbid_via_webhook();

COMMENT ON TRIGGER trigger_notify_outbid ON bids IS 'Envoie une notification WhatsApp au dernier enchérisseur quand il est dépassé';

-- ============================================
-- 3. FONCTION: Notification manuelle
-- ============================================

CREATE OR REPLACE FUNCTION send_outbid_notification(
  p_auction_id UUID,
  p_new_bid_amount NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_previous_bidder RECORD;
  v_result JSON;
BEGIN
  -- Récupérer le dernier enchérisseur
  SELECT * INTO v_previous_bidder
  FROM get_previous_top_bidder(p_auction_id);

  IF NOT FOUND OR v_previous_bidder.user_phone IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Aucun enchérisseur précédent avec téléphone'
    );
  END IF;

  -- Ici, vous pouvez appeler directement l'API Whapi
  -- Pour l'instant, on retourne juste les infos
  v_result := json_build_object(
    'success', true,
    'previous_bidder', json_build_object(
      'user_id', v_previous_bidder.user_id,
      'name', v_previous_bidder.user_name,
      'phone', v_previous_bidder.user_phone,
      'last_bid', v_previous_bidder.last_bid_amount
    ),
    'new_bid', p_new_bid_amount
  );

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION send_outbid_notification IS 'Envoie manuellement une notification d''enchère dépassée';

-- ============================================
-- 4. TEST DE LA FONCTION
-- ============================================

-- Pour tester:
-- SELECT send_outbid_notification('AUCTION_ID', 500000);

-- ============================================
-- 5. CONFIGURATION
-- ============================================

-- Stocker l'URL de base de l'application
-- À exécuter après le déploiement:
-- ALTER DATABASE postgres SET app.settings.base_url = 'https://votre-domaine.com';
