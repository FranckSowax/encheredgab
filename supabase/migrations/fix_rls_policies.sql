-- Fix RLS Policies - Corriger la récursion infinie
-- Date: 2025-01-19

-- ============================================
-- 1. DÉSACTIVER TEMPORAIREMENT RLS SUR user_roles
-- ============================================

ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. SUPPRIMER LES ANCIENNES POLICIES PROBLÉMATIQUES
-- ============================================

DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON user_roles;
DROP POLICY IF EXISTS "Users can view auctions" ON auctions;
DROP POLICY IF EXISTS "Users can view lots" ON lots;

-- ============================================
-- 3. CRÉER DES POLICIES SIMPLES SANS RÉCURSION
-- ============================================

-- Policy pour user_roles : Utilisateurs peuvent voir leurs propres rôles
CREATE POLICY "Users can view own roles"
ON user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Policy pour auctions : Tout le monde peut voir les enchères actives
CREATE POLICY "Anyone can view active auctions"
ON auctions
FOR SELECT
USING (status = 'active' OR status = 'scheduled');

-- Policy pour auctions : Utilisateurs authentifiés voient toutes les enchères
CREATE POLICY "Authenticated users view all auctions"
ON auctions
FOR SELECT
TO authenticated
USING (true);

-- Policy pour lots : Tout le monde peut voir les lots approuvés
CREATE POLICY "Anyone can view approved lots"
ON lots
FOR SELECT
USING (status = 'approved');

-- Policy pour bids : Utilisateurs voient leurs propres enchères
CREATE POLICY "Users can view own bids"
ON bids
FOR SELECT
USING (auth.uid() = user_id);

-- Policy pour bids : Tout le monde peut voir les enchères d'une auction
CREATE POLICY "Anyone can view auction bids"
ON bids
FOR SELECT
USING (true);

-- Policy pour bids : Utilisateurs peuvent placer des enchères
CREATE POLICY "Authenticated users can place bids"
ON bids
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 4. RÉACTIVER RLS
-- ============================================

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. VÉRIFICATION
-- ============================================

-- Vérifier que les policies sont actives
DO $$ 
BEGIN
    RAISE NOTICE 'RLS Policies have been fixed successfully!';
    RAISE NOTICE 'Tables with RLS enabled:';
    RAISE NOTICE '- user_roles: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'user_roles');
    RAISE NOTICE '- auctions: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'auctions');
    RAISE NOTICE '- lots: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'lots');
    RAISE NOTICE '- bids: %', (SELECT relrowsecurity FROM pg_class WHERE relname = 'bids');
END $$;
