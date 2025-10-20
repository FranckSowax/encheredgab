# Configuration Supabase - Plateforme d'Enchères Douanières

## 📊 Informations du Projet

### Détails
- **Nom du Projet**: douane-enchere-gabon
- **Project ID**: lwhxmrfddlwmfjfrtdzk
- **URL**: https://lwhxmrfddlwmfjfrtdzk.supabase.co
- **Région**: eu-west-3 (Paris)
- **Organisation**: Enchère Douane Gabon
- **Status**: ACTIVE_HEALTHY

### Clés API
- **URL Supabase**: `https://lwhxmrfddlwmfjfrtdzk.supabase.co`
- **Anon Key**: Configurée dans `.env.local`
- **Service Role Key**: Disponible dans le dashboard Supabase

---

## 🗄️ Schéma de Base de Données

### Tables Créées

#### 1. **users**
Extension de `auth.users` pour stocker les profils utilisateurs.

**Colonnes:**
- `id` (UUID, PK) - Référence à auth.users
- `email` (TEXT, UNIQUE) - Email de l'utilisateur
- `phone` (TEXT, UNIQUE, NULLABLE) - Numéro de téléphone
- `full_name` (TEXT, NULLABLE) - Nom complet
- `created_at` (TIMESTAMPTZ) - Date de création
- `updated_at` (TIMESTAMPTZ) - Date de mise à jour
- `kyc_status` (ENUM) - Statut KYC: pending, approved, rejected
- `is_excluded` (BOOLEAN) - Exclusion de l'utilisateur
- `exclusion_reason` (TEXT, NULLABLE) - Raison de l'exclusion

**Index:**
- `idx_users_email` sur email
- `idx_users_phone` sur phone
- `idx_users_kyc_status` sur kyc_status

**RLS:** ✅ Activé
- Users can read their own profile
- Admins can read all profiles
- Users can update their own profile (sauf kyc_status et exclusion)
- Admins can update all profiles

---

#### 2. **user_roles**
Gestion des rôles utilisateurs (multi-rôles possible).

**Colonnes:**
- `id` (UUID, PK) - Identifiant unique
- `user_id` (UUID, FK) - Référence à users.id
- `role` (ENUM) - Rôle: bidder, photo_team, admin, customs
- `created_at` (TIMESTAMPTZ) - Date de création

**Contraintes:**
- UNIQUE(user_id, role) - Un utilisateur ne peut avoir qu'une fois chaque rôle

**Index:**
- `idx_user_roles_user_id` sur user_id
- `idx_user_roles_role` sur role

**RLS:** ✅ Activé
- Users can read their own roles
- Admins can read all roles
- Only admins can manage roles

---

#### 3. **kyc_documents**
Stockage des documents KYC uploadés par les utilisateurs.

**Colonnes:**
- `id` (UUID, PK) - Identifiant unique
- `user_id` (UUID, FK) - Référence à users.id
- `document_type` (TEXT) - Type de document (ID, passport, etc.)
- `document_url` (TEXT) - URL du document dans Storage
- `status` (ENUM) - Statut: pending, approved, rejected
- `rejection_reason` (TEXT, NULLABLE) - Raison du rejet
- `verified_by` (UUID, FK, NULLABLE) - Admin qui a vérifié
- `verified_at` (TIMESTAMPTZ, NULLABLE) - Date de vérification
- `created_at` (TIMESTAMPTZ) - Date de création
- `updated_at` (TIMESTAMPTZ) - Date de mise à jour

**Index:**
- `idx_kyc_documents_user_id` sur user_id
- `idx_kyc_documents_status` sur status

**RLS:** ✅ Activé
- Users can read their own documents
- Admins and customs can read all documents
- Users can create their own documents
- Admins and customs can update documents

---

### Enums

#### user_role
```sql
CREATE TYPE user_role AS ENUM ('bidder', 'photo_team', 'admin', 'customs');
```

#### kyc_status
```sql
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected');
```

---

### Fonctions

#### 1. **update_updated_at_column()**
Trigger function pour mettre à jour automatiquement `updated_at`.

**Utilisé sur:**
- users
- kyc_documents

---

#### 2. **handle_new_user()**
Trigger function exécutée lors de l'inscription d'un nouvel utilisateur.

**Actions:**
1. Crée automatiquement un profil dans `users`
2. Assigne le rôle `bidder` par défaut dans `user_roles`

**Trigger:** `on_auth_user_created` sur `auth.users` (AFTER INSERT)

---

#### 3. **has_role(check_role user_role)**
Vérifie si l'utilisateur connecté a un rôle spécifique.

**Paramètres:**
- `check_role`: Le rôle à vérifier

**Retourne:** BOOLEAN

**Exemple:**
```sql
SELECT has_role('admin');
```

---

#### 4. **get_user_roles(check_user_id UUID)**
Récupère tous les rôles d'un utilisateur.

**Paramètres:**
- `check_user_id`: ID de l'utilisateur

**Retourne:** TABLE(role user_role)

**Exemple:**
```sql
SELECT * FROM get_user_roles('user-uuid-here');
```

---

## 💾 Storage

### Bucket: kyc-documents
Bucket privé pour stocker les documents KYC.

**Configuration:**
- **Public:** Non (privé)
- **Taille max par fichier:** 5 MB
- **Types MIME autorisés:**
  - image/jpeg
  - image/png
  - image/jpg
  - application/pdf

**Structure des fichiers:**
```
kyc-documents/
  └── {user_id}/
      ├── document1.jpg
      ├── document2.pdf
      └── ...
```

**Politiques RLS:**
1. ✅ Users can upload their own KYC documents
2. ✅ Users can read their own KYC documents
3. ✅ Admins and customs can read all KYC documents
4. ✅ Users can update their own KYC documents
5. ✅ Users can delete their own KYC documents

---

## 🔐 Sécurité (Row Level Security)

### Statut RLS
✅ **Toutes les tables ont RLS activé**

### Politiques par Table

#### users (4 politiques)
1. Lecture: Utilisateur peut lire son propre profil
2. Lecture: Admins peuvent lire tous les profils
3. Mise à jour: Utilisateur peut modifier son profil (sauf kyc_status et exclusion)
4. Mise à jour: Admins peuvent modifier tous les profils

#### user_roles (3 politiques)
1. Lecture: Utilisateur peut lire ses propres rôles
2. Lecture: Admins peuvent lire tous les rôles
3. All: Seuls les admins peuvent gérer les rôles

#### kyc_documents (4 politiques)
1. Lecture: Utilisateur peut lire ses propres documents
2. Lecture: Admins et customs peuvent lire tous les documents
3. Insertion: Utilisateur peut créer ses propres documents
4. Mise à jour: Admins et customs peuvent mettre à jour les documents

---

## 🔧 Extensions Installées

### Extensions Actives
- ✅ **uuid-ossp** (1.1) - Génération d'UUIDs
- ✅ **pgcrypto** (1.3) - Fonctions cryptographiques
- ✅ **pg_stat_statements** (1.11) - Statistiques des requêtes
- ✅ **pg_graphql** (1.5.11) - Support GraphQL
- ✅ **supabase_vault** (0.3.1) - Vault Supabase
- ✅ **plpgsql** (1.0) - Langage procédural

### Extensions Disponibles (non installées)
- postgis, pgvector, pg_cron, http, pgjwt, etc.

---

## 🚀 Accès et Connexion

### Dashboard Supabase
🔗 https://supabase.com/dashboard/project/lwhxmrfddlwmfjfrtdzk

### Connexion depuis Next.js

#### Client Browser
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
```

#### Server Components
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
```

---

## 📝 Migrations Appliquées

### 1. initial_schema (19 Oct 2025)
- ✅ Création des tables users, user_roles, kyc_documents
- ✅ Création des enums user_role et kyc_status
- ✅ Configuration RLS sur toutes les tables
- ✅ Création des triggers et fonctions
- ✅ Création des index

### 2. setup_storage_kyc_documents (19 Oct 2025)
- ✅ Création du bucket kyc-documents
- ✅ Configuration des politiques de storage

---

## 🧪 Tests de Connexion

### Vérifier la connexion
```bash
cd web
npm run dev
```

### Tester l'authentification
1. Créer un compte utilisateur
2. Vérifier la création automatique du profil
3. Vérifier l'assignation du rôle "bidder"

---

## 📊 Monitoring

### Vérifier le statut du projet
```typescript
// Via MCP Supabase
mcp5_get_project({ project_id: 'lwhxmrfddlwmfjfrtdzk' })
```

### Logs
Accessible via le dashboard Supabase:
- Logs API
- Logs Auth
- Logs Database
- Logs Storage

---

## 🔄 Prochaines Étapes

### Tâche 2: Gestion des Lots
- [ ] Créer la table `lots`
- [ ] Créer la table `lot_images`
- [ ] Créer la table `categories`
- [ ] Configurer le bucket storage pour les images de lots
- [ ] Intégration OpenAI GPT-4o pour descriptions

### Tâche 3: Enchères en Temps Réel
- [ ] Créer la table `bids`
- [ ] Créer la table `auctions`
- [ ] Configurer Supabase Realtime
- [ ] Implémenter le système de concurrence

---

**Dernière mise à jour:** 19 Octobre 2025 - 14:00 UTC+01:00  
**Configuration par:** MCP Supabase
