# 🔧 Configuration Supabase - Douane Enchères

Ce document explique comment configurer Supabase pour corriger l'erreur RLS et activer les favoris.

## 📋 Prérequis

- Compte Supabase actif
- Projet Supabase créé
- Accès au SQL Editor dans Supabase Dashboard

---

## 🚀 Étape 1 : Corriger l'erreur RLS (Récursion infinie)

### Problème
```
Error: infinite recursion detected in policy for relation "user_roles"
```

### Solution

1. **Ouvrir Supabase Dashboard**
   - Allez sur https://app.supabase.com
   - Sélectionnez votre projet

2. **Accéder au SQL Editor**
   - Menu gauche : `SQL Editor`
   - Cliquez sur `New query`

3. **Exécuter le script de correction**
   - Copiez le contenu du fichier : `supabase/migrations/fix_rls_policies.sql`
   - Collez dans l'éditeur SQL
   - Cliquez sur `Run`

### Ce que fait le script
- ✅ Désactive temporairement RLS sur `user_roles`
- ✅ Supprime les anciennes policies problématiques
- ✅ Crée de nouvelles policies simples sans récursion
- ✅ Réactive RLS sur toutes les tables
- ✅ Configure l'accès public aux enchères actives
- ✅ Configure l'accès authentifié pour les utilisateurs

---

## ❤️ Étape 2 : Créer le système de favoris

### 1. **Créer la table `user_favorites`**

Dans le SQL Editor, exécutez :
```sql
-- Contenu du fichier: supabase/migrations/create_favorites.sql
```

### 2. **Ce que crée cette migration**

**Table `user_favorites`** :
```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users)
- auction_id (UUID, Foreign Key → auctions)
- created_at (Timestamp)
- UNIQUE(user_id, auction_id) ← Empêche les doublons
```

**Indexes** :
- Sur `user_id` (requêtes rapides)
- Sur `auction_id` (comptage des favoris)
- Sur `created_at` (tri chronologique)

**RLS Policies** :
- ✅ `Users can view own favorites` - Voir ses favoris
- ✅ `Users can add favorites` - Ajouter aux favoris
- ✅ `Users can remove own favorites` - Supprimer

**Fonctions utilitaires** :
- `get_auction_favorites_count(auction_uuid)` - Compter les favoris
- `is_auction_favorited(auction_uuid, user_uuid)` - Vérifier si favorisé

---

## 🧪 Étape 3 : Tester le système

### A. Tester via SQL

```sql
-- 1. Insérer un favori
INSERT INTO user_favorites (user_id, auction_id)
VALUES (
  'YOUR_USER_ID',
  'AN_AUCTION_ID'
);

-- 2. Lister vos favoris
SELECT * FROM user_favorites
WHERE user_id = 'YOUR_USER_ID';

-- 3. Compter les favoris d'une enchère
SELECT get_auction_favorites_count('AN_AUCTION_ID');

-- 4. Vérifier si favorisé
SELECT is_auction_favorited('AN_AUCTION_ID', 'YOUR_USER_ID');
```

### B. Tester via l'application

1. **Démarrez l'app** : `npm run dev`
2. **Allez sur** http://localhost:3000
3. **Cliquez sur le cœur** d'une carte d'enchère
4. **Vérifiez** dans Supabase Dashboard → Table Editor → `user_favorites`

---

## 🔑 Étape 4 : Vérifier les variables d'environnement

Assurez-vous que votre fichier `.env.local` contient :

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Où trouver ces valeurs ?**
1. Supabase Dashboard
2. Settings (⚙️) → API
3. Copiez `Project URL` et `anon public`

---

## 📊 Structure finale des tables

```
users (auth.users)
├── user_roles (user_id FK)
├── user_favorites (user_id FK)
│   └── auctions (auction_id FK)
│       └── lots (lot_id FK)
└── bids (user_id FK)
```

---

## ✅ Checklist de vérification

- [ ] Script `fix_rls_policies.sql` exécuté sans erreur
- [ ] Table `user_favorites` créée
- [ ] Policies RLS actives sur `user_favorites`
- [ ] Variables d'environnement configurées
- [ ] App redémarrée (`npm run dev`)
- [ ] Test d'ajout de favori réussi
- [ ] Aucune erreur dans la console navigateur
- [ ] Aucune erreur dans les logs serveur

---

## 🐛 Dépannage

### Erreur : "relation user_favorites does not exist"
**Solution** : Exécutez la migration `create_favorites.sql`

### Erreur : "permission denied for table user_favorites"
**Solution** : Vérifiez que les policies RLS sont bien créées

### Les favoris ne se sauvegardent pas
**Solution** : Vérifiez que l'utilisateur est authentifié via `supabase.auth.getUser()`

### Erreur TypeScript sur `user_favorites`
**Solution** : C'est normal, régénérez les types :
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > web/types/database.types.ts
```

---

## 📚 Ressources

- [Documentation Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [PostgreSQL Policies](https://www.postgresql.org/docs/current/sql-createpolicy.html)

---

## 🎯 Résumé

**Avant** : 
- ❌ Erreur RLS récursion infinie
- ❌ Pas de système de favoris

**Après** :
- ✅ RLS corrigé avec policies simples
- ✅ Table `user_favorites` fonctionnelle
- ✅ API routes `/api/favorites` (GET, POST, DELETE)
- ✅ Hook `useFavorites()` intégré
- ✅ Interface utilisateur connectée

**Les favoris sont maintenant persistés dans Supabase ! ❤️**
