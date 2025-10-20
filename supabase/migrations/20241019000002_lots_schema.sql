-- Migration pour la gestion des lots et enchères
-- Tâche 2: Gestion des Lots et IA

-- =====================================================
-- ENUMS
-- =====================================================

-- Statut d'un lot
CREATE TYPE lot_status AS ENUM (
  'draft',           -- Brouillon, en cours de création
  'pending_approval', -- En attente d'approbation admin
  'approved',        -- Approuvé, prêt pour enchère
  'active',          -- Enchère en cours
  'sold',            -- Vendu
  'unsold',          -- Invendu (pas de gagnant)
  'paid',            -- Payé par le gagnant
  'delivered',       -- Livré/retiré
  'relisted',        -- Remis en vente
  'cancelled'        -- Annulé
);

-- Tranches de prix
CREATE TYPE price_bracket AS ENUM (
  'under_50k',       -- < 50 000 FCFA
  'range_50k_200k',  -- 50 000 - 200 000 FCFA
  'range_200k_1m',   -- 200 000 - 1 000 000 FCFA
  'over_1m'          -- > 1 000 000 FCFA (enchères physiques)
);

-- Statut de modération
CREATE TYPE moderation_status AS ENUM (
  'pending',         -- En attente de modération
  'approved',        -- Approuvé
  'rejected',        -- Rejeté
  'flagged'          -- Signalé pour révision
);

-- =====================================================
-- TABLES
-- =====================================================

-- Table des catégories
CREATE TABLE public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT, -- Nom de l'icône (ex: 'car', 'phone', 'jewelry')
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table principale des lots
CREATE TABLE public.lots (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Informations de base
  title TEXT NOT NULL,
  description TEXT,
  ai_generated_description TEXT, -- Description générée par GPT-4o
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  
  -- Prix et enchères
  starting_bid DECIMAL(12, 2) NOT NULL CHECK (starting_bid > 0),
  reserve_price DECIMAL(12, 2) CHECK (reserve_price >= starting_bid),
  current_bid DECIMAL(12, 2) DEFAULT 0,
  bid_increment DECIMAL(12, 2) DEFAULT 5000, -- Incrément minimum
  price_bracket price_bracket NOT NULL,
  
  -- Statut et cycle
  status lot_status DEFAULT 'draft' NOT NULL,
  is_relisted BOOLEAN DEFAULT FALSE,
  relisted_count INTEGER DEFAULT 0,
  original_lot_id UUID REFERENCES public.lots(id) ON DELETE SET NULL,
  
  -- Dates importantes
  listing_start_date TIMESTAMPTZ, -- Début de listing (Lundi 08:00)
  listing_end_date TIMESTAMPTZ,   -- Fin de listing (Mercredi 18:00)
  auction_start_date TIMESTAMPTZ, -- Début enchères (Jeudi 08:00)
  auction_end_date TIMESTAMPTZ,   -- Fin enchères (Jeudi 20:00)
  payment_deadline TIMESTAMPTZ,   -- Date limite paiement (Vendredi 15:00)
  
  -- Gagnant et paiement
  winner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  winning_bid DECIMAL(12, 2),
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
  
  -- Livraison
  delivery_method TEXT, -- pickup, delivery
  delivery_zone TEXT,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  delivery_address TEXT,
  qr_code TEXT, -- QR code pour retrait/livraison
  
  -- Métadonnées
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL NOT NULL,
  approved_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  
  -- Modération AI
  moderation_status moderation_status DEFAULT 'pending',
  moderation_score DECIMAL(3, 2), -- Score de 0.00 à 1.00
  moderation_flags JSONB, -- Flags de modération détaillés
  
  -- Statistiques
  view_count INTEGER DEFAULT 0,
  bid_count INTEGER DEFAULT 0,
  watchlist_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Contraintes
  CONSTRAINT valid_dates CHECK (
    listing_start_date IS NULL OR
    listing_end_date IS NULL OR
    listing_start_date < listing_end_date
  ),
  CONSTRAINT valid_auction_dates CHECK (
    auction_start_date IS NULL OR
    auction_end_date IS NULL OR
    auction_start_date < auction_end_date
  )
);

-- Table des images de lots
CREATE TABLE public.lot_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  alt_text TEXT,
  
  -- Métadonnées image
  width INTEGER,
  height INTEGER,
  file_size INTEGER, -- en bytes
  mime_type TEXT,
  
  -- Modération AI
  moderation_status moderation_status DEFAULT 'pending',
  moderation_labels JSONB, -- Labels de modération (violence, nudity, etc.)
  
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table de watchlist (favoris)
CREATE TABLE public.lot_watchlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, lot_id)
);

-- Table d'historique des modifications de lots
CREATE TABLE public.lot_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lot_id UUID REFERENCES public.lots(id) ON DELETE CASCADE NOT NULL,
  changed_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =====================================================
-- INDEX
-- =====================================================

-- Index pour les lots
CREATE INDEX idx_lots_status ON public.lots(status);
CREATE INDEX idx_lots_category_id ON public.lots(category_id);
CREATE INDEX idx_lots_price_bracket ON public.lots(price_bracket);
CREATE INDEX idx_lots_created_by ON public.lots(created_by);
CREATE INDEX idx_lots_winner_id ON public.lots(winner_id);
CREATE INDEX idx_lots_auction_dates ON public.lots(auction_start_date, auction_end_date);
CREATE INDEX idx_lots_starting_bid ON public.lots(starting_bid);
CREATE INDEX idx_lots_is_relisted ON public.lots(is_relisted);
CREATE INDEX idx_lots_moderation_status ON public.lots(moderation_status);

-- Index pour les images
CREATE INDEX idx_lot_images_lot_id ON public.lot_images(lot_id);
CREATE INDEX idx_lot_images_is_primary ON public.lot_images(is_primary);
CREATE INDEX idx_lot_images_moderation ON public.lot_images(moderation_status);

-- Index pour les catégories
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX idx_categories_is_active ON public.categories(is_active);

-- Index pour watchlist
CREATE INDEX idx_lot_watchlist_user_id ON public.lot_watchlist(user_id);
CREATE INDEX idx_lot_watchlist_lot_id ON public.lot_watchlist(lot_id);

-- Index pour l'historique
CREATE INDEX idx_lot_history_lot_id ON public.lot_history(lot_id);
CREATE INDEX idx_lot_history_created_at ON public.lot_history(created_at);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger pour updated_at sur lots
CREATE TRIGGER update_lots_updated_at
  BEFORE UPDATE ON public.lots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour updated_at sur categories
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour updated_at sur lot_images
CREATE TRIGGER update_lot_images_updated_at
  BEFORE UPDATE ON public.lot_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour calculer automatiquement la tranche de prix
CREATE OR REPLACE FUNCTION calculate_price_bracket()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.starting_bid < 50000 THEN
    NEW.price_bracket := 'under_50k';
  ELSIF NEW.starting_bid >= 50000 AND NEW.starting_bid < 200000 THEN
    NEW.price_bracket := 'range_50k_200k';
  ELSIF NEW.starting_bid >= 200000 AND NEW.starting_bid < 1000000 THEN
    NEW.price_bracket := 'range_200k_1m';
  ELSE
    NEW.price_bracket := 'over_1m';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_price_bracket
  BEFORE INSERT OR UPDATE OF starting_bid ON public.lots
  FOR EACH ROW
  EXECUTE FUNCTION calculate_price_bracket();

-- Trigger pour incrémenter le compteur de watchlist
CREATE OR REPLACE FUNCTION update_watchlist_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.lots
    SET watchlist_count = watchlist_count + 1
    WHERE id = NEW.lot_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.lots
    SET watchlist_count = watchlist_count - 1
    WHERE id = OLD.lot_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lot_watchlist_count
  AFTER INSERT OR DELETE ON public.lot_watchlist
  FOR EACH ROW
  EXECUTE FUNCTION update_watchlist_count();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lot_history ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour categories

-- Tout le monde peut lire les catégories actives
CREATE POLICY "Anyone can read active categories"
  ON public.categories
  FOR SELECT
  USING (is_active = TRUE);

-- Les admins et photo_team peuvent tout gérer
CREATE POLICY "Admins and photo team can manage categories"
  ON public.categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'photo_team')
    )
  );

-- Politiques RLS pour lots

-- Tout le monde peut lire les lots approuvés et actifs
CREATE POLICY "Anyone can read approved lots"
  ON public.lots
  FOR SELECT
  USING (status IN ('approved', 'active', 'sold', 'paid', 'delivered'));

-- Les créateurs peuvent lire leurs propres lots
CREATE POLICY "Creators can read their own lots"
  ON public.lots
  FOR SELECT
  USING (auth.uid() = created_by);

-- Photo team peut créer des lots
CREATE POLICY "Photo team can create lots"
  ON public.lots
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('photo_team', 'admin')
    )
  );

-- Photo team peut modifier leurs propres lots en brouillon
CREATE POLICY "Photo team can update their draft lots"
  ON public.lots
  FOR UPDATE
  USING (
    auth.uid() = created_by
    AND status = 'draft'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('photo_team', 'admin')
    )
  );

-- Admins peuvent tout gérer
CREATE POLICY "Admins can manage all lots"
  ON public.lots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques RLS pour lot_images

-- Tout le monde peut lire les images de lots visibles
CREATE POLICY "Anyone can read lot images"
  ON public.lot_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lots
      WHERE id = lot_images.lot_id
      AND status IN ('approved', 'active', 'sold', 'paid', 'delivered')
    )
  );

-- Photo team peut uploader des images
CREATE POLICY "Photo team can upload images"
  ON public.lot_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('photo_team', 'admin')
    )
  );

-- Photo team peut gérer leurs images
CREATE POLICY "Photo team can manage their images"
  ON public.lot_images
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('photo_team', 'admin')
    )
  );

-- Politiques RLS pour lot_watchlist

-- Les utilisateurs peuvent lire leur propre watchlist
CREATE POLICY "Users can read their own watchlist"
  ON public.lot_watchlist
  FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent gérer leur watchlist
CREATE POLICY "Users can manage their own watchlist"
  ON public.lot_watchlist
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour lot_history

-- Les admins peuvent lire tout l'historique
CREATE POLICY "Admins can read all history"
  ON public.lot_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour obtenir les lots disponibles pour enchères
CREATE OR REPLACE FUNCTION get_available_lots(
  p_price_bracket price_bracket DEFAULT NULL,
  p_category_id UUID DEFAULT NULL,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  lot_id UUID,
  title TEXT,
  starting_bid DECIMAL,
  current_bid DECIMAL,
  auction_end_date TIMESTAMPTZ,
  image_url TEXT,
  category_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.title,
    l.starting_bid,
    l.current_bid,
    l.auction_end_date,
    li.image_url,
    c.name
  FROM public.lots l
  LEFT JOIN public.lot_images li ON l.id = li.lot_id AND li.is_primary = TRUE
  LEFT JOIN public.categories c ON l.category_id = c.id
  WHERE l.status = 'active'
    AND (p_price_bracket IS NULL OR l.price_bracket = p_price_bracket)
    AND (p_category_id IS NULL OR l.category_id = p_category_id)
  ORDER BY l.auction_end_date ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer un lot comme relisté
CREATE OR REPLACE FUNCTION relist_lot(p_lot_id UUID)
RETURNS UUID AS $$
DECLARE
  v_new_lot_id UUID;
  v_old_lot RECORD;
BEGIN
  -- Récupérer les informations du lot original
  SELECT * INTO v_old_lot
  FROM public.lots
  WHERE id = p_lot_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lot not found';
  END IF;
  
  -- Créer un nouveau lot (copie)
  INSERT INTO public.lots (
    title,
    description,
    ai_generated_description,
    category_id,
    starting_bid,
    reserve_price,
    bid_increment,
    price_bracket,
    status,
    is_relisted,
    relisted_count,
    original_lot_id,
    created_by
  ) VALUES (
    v_old_lot.title,
    v_old_lot.description,
    v_old_lot.ai_generated_description,
    v_old_lot.category_id,
    v_old_lot.starting_bid,
    v_old_lot.reserve_price,
    v_old_lot.bid_increment,
    v_old_lot.price_bracket,
    'pending_approval',
    TRUE,
    v_old_lot.relisted_count + 1,
    COALESCE(v_old_lot.original_lot_id, p_lot_id),
    v_old_lot.created_by
  ) RETURNING id INTO v_new_lot_id;
  
  -- Copier les images
  INSERT INTO public.lot_images (lot_id, image_url, thumbnail_url, display_order, is_primary, alt_text, uploaded_by)
  SELECT v_new_lot_id, image_url, thumbnail_url, display_order, is_primary, alt_text, uploaded_by
  FROM public.lot_images
  WHERE lot_id = p_lot_id;
  
  -- Marquer l'ancien lot comme relisté
  UPDATE public.lots
  SET status = 'relisted'
  WHERE id = p_lot_id;
  
  RETURN v_new_lot_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Données de test : Catégories par défaut
INSERT INTO public.categories (name, slug, description, icon, display_order, is_active) VALUES
  ('Véhicules', 'vehicules', 'Voitures, motos, bateaux saisis', 'car', 1, TRUE),
  ('Électronique', 'electronique', 'Téléphones, ordinateurs, appareils électroniques', 'laptop', 2, TRUE),
  ('Bijoux & Montres', 'bijoux-montres', 'Bijoux, montres de luxe', 'gem', 3, TRUE),
  ('Vêtements & Accessoires', 'vetements-accessoires', 'Vêtements, sacs, chaussures', 'shirt', 4, TRUE),
  ('Mobilier', 'mobilier', 'Meubles et décoration', 'sofa', 5, TRUE),
  ('Équipements', 'equipements', 'Outils, équipements divers', 'tool', 6, TRUE),
  ('Autres', 'autres', 'Autres articles saisis', 'package', 7, TRUE);
