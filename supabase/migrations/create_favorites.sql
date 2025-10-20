-- Create Favorites Table
-- Date: 2025-01-19

-- ============================================
-- TABLE: user_favorites
-- ============================================

CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Contrainte unique : un utilisateur ne peut favoriser qu'une fois la même enchère
  UNIQUE(user_id, auction_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_auction_id ON user_favorites(auction_id);
CREATE INDEX idx_user_favorites_created_at ON user_favorites(created_at DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir leurs propres favoris
CREATE POLICY "Users can view own favorites"
ON user_favorites
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent ajouter des favoris
CREATE POLICY "Users can add favorites"
ON user_favorites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent supprimer leurs favoris
CREATE POLICY "Users can remove own favorites"
ON user_favorites
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- FUNCTION: Compter les favoris d'une enchère
-- ============================================

CREATE OR REPLACE FUNCTION get_auction_favorites_count(auction_uuid UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::INTEGER
  FROM user_favorites
  WHERE auction_id = auction_uuid;
$$;

-- ============================================
-- FUNCTION: Vérifier si un utilisateur a mis en favori
-- ============================================

CREATE OR REPLACE FUNCTION is_auction_favorited(auction_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_favorites
    WHERE auction_id = auction_uuid
    AND user_id = user_uuid
  );
$$;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE user_favorites IS 'Stores user favorite auctions';
COMMENT ON COLUMN user_favorites.user_id IS 'User who favorited the auction';
COMMENT ON COLUMN user_favorites.auction_id IS 'Favorited auction';
