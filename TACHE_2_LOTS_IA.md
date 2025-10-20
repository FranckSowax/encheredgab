# 📦 Tâche 2: Gestion des Lots et IA - Documentation

## 🎯 Objectif

Implémenter le système complet de gestion des lots avec:
- Création et gestion des lots par l'équipe photo
- Intégration GPT-4o pour génération automatique de descriptions
- Modération de contenu avec IA
- Stockage et gestion des images
- Système de catégorisation

---

## ✅ Ce qui a été implémenté

### 1. Base de Données 🗄️

#### Tables créées (5 tables)

**`categories`** - Catégories de lots
- 7 catégories par défaut: Véhicules, Électronique, Bijoux, Vêtements, Mobilier, Équipements, Autres
- Support de catégories hiérarchiques (parent_id)
- Icônes et ordre d'affichage personnalisables

**`lots`** - Table principale des lots
- Informations complètes du lot (titre, description, prix)
- Description générée par IA (champ `ai_generated_description`)
- Gestion du cycle de vie complet (brouillon → approbation → enchère → vente)
- Tranches de prix automatiques (< 50k, 50k-200k, 200k-1M, > 1M)
- Métadonnées de modération (score, flags)
- Statistiques (vues, enchères, favoris)
- Gestion de la livraison (méthode, zone, frais)

**`lot_images`** - Images des lots
- Support multi-images par lot
- Image principale désignée
- Métadonnées d'image (dimensions, taille, type MIME)
- Modération automatique des images
- Ordre d'affichage personnalisable

**`lot_watchlist`** - Liste de favoris
- Utilisateurs peuvent ajouter des lots à leur watchlist
- Compteur automatique sur les lots

**`lot_history`** - Historique des modifications
- Traçabilité complète des changements
- Auditabilité pour les admins

#### Enums créés (3 nouveaux)

```sql
-- Statut d'un lot
lot_status: 'draft' | 'pending_approval' | 'approved' | 'active' 
          | 'sold' | 'unsold' | 'paid' | 'delivered' 
          | 'relisted' | 'cancelled'

-- Tranches de prix
price_bracket: 'under_50k' | 'range_50k_200k' 
             | 'range_200k_1m' | 'over_1m'

-- Statut de modération
moderation_status: 'pending' | 'approved' | 'rejected' | 'flagged'
```

#### Fonctions SQL

**`calculate_price_bracket()`**
- Calcul automatique de la tranche de prix basé sur `starting_bid`
- Trigger sur INSERT/UPDATE

**`update_watchlist_count()`**
- Mise à jour automatique du compteur de favoris
- Trigger sur INSERT/DELETE dans watchlist

**`get_available_lots()`**
- Fonction pour récupérer les lots disponibles avec filtres
- Optimisée avec JOIN sur images et catégories

**`relist_lot()`**
- Fonction pour remettre un lot invendu en enchère
- Copie le lot et ses images
- Incrémente le compteur de relisting

#### Sécurité RLS

**15 politiques RLS configurées:**
- Categories: Lecture publique, gestion admin/photo
- Lots: Lecture selon statut, création/modification contrôlée
- Images: Visibilité selon statut du lot
- Watchlist: Privée par utilisateur
- History: Lecture admin uniquement

#### Index d'optimisation (18 index)

```sql
-- Recherche et filtrage rapides
idx_lots_status, idx_lots_category_id, idx_lots_price_bracket
idx_lots_auction_dates, idx_lots_starting_bid

-- Performance des relations
idx_lot_images_lot_id, idx_categories_slug
idx_lot_watchlist_user_id

-- Modération
idx_lots_moderation_status, idx_lot_images_moderation
```

---

### 2. Storage 💾

**Bucket: `lot-images`**
- Public (images visibles par tous)
- Limite: 10 MB par fichier
- Types autorisés: JPEG, PNG, WebP
- Structure: `lot-images/{lot_id}/{timestamp}-{random}.jpg`

**Politiques de sécurité:**
- Lecture publique pour toutes les images
- Upload réservé à photo_team et admin
- Gestion complète pour photo_team et admin

---

### 3. Intégration OpenAI GPT-4o 🤖

#### Module: `web/lib/openai/descriptions.ts`

**Fonctionnalités:**

**`generateLotDescription(request)`**
- Génère une description professionnelle avec GPT-4o
- Analyse des images avec GPT-4o Vision si disponibles
- Prompt personnalisé pour enchères douanières
- Suggestions d'amélioration automatiques
- Score de confiance calculé

**`analyzeImages(imageUrls)`**
- Analyse visuelle avec GPT-4o Vision
- Détection de l'état (neuf, usagé, endommagé)
- Identification de marque/modèle
- Détection de défauts

**`improveLotDescription(description, feedback)`**
- Amélioration de descriptions existantes
- Intégration de feedback utilisateur

**Exemple d'utilisation:**
```typescript
const result = await generateLotDescription({
  title: "iPhone 13 Pro Max 256GB",
  category: "Électronique",
  images: ["https://...jpg", "https://...jpg"],
  existing_description: "Smartphone Apple..."
})

// Résultat:
{
  description: "iPhone 13 Pro Max...",
  confidence: 0.92,
  suggestions: [
    "Mentionner l'état de la batterie",
    "Préciser la couleur exacte",
    "Ajouter l'état de l'écran"
  ]
}
```

---

### 4. Modération de Contenu 🛡️

#### Module: `web/lib/openai/moderation.ts`

**Fonctionnalités:**

**`moderateContent(request)`**
- Modération automatique texte et images
- API Moderation d'OpenAI pour texte
- GPT-4o Vision pour images

**`moderateText(text)`**
- Détection: haine, violence, contenu sexuel, automutilation
- Score de sévérité par catégorie
- Labels détaillés

**`moderateImage(imageUrl)`**
- Détection de contenu inapproprié
- Vérification qualité d'image
- Recommandations d'amélioration

**`checkImageQuality(imageUrl)`**
- Évaluation netteté, éclairage, cadrage
- Score de qualité 0-1
- Suggestions d'amélioration

**`detectObjects(imageUrl)`**
- Identification automatique des objets
- Liste des éléments visibles

**`batchModerate(items)`**
- Modération en masse
- Traitement parallèle

**Exemple:**
```typescript
const result = await moderateContent({
  content: "Description du lot...",
  type: "text"
})

// Résultat:
{
  approved: true,
  score: 0.98,
  flags: [],
  labels: []
}
```

---

### 5. API Routes 🔌

#### `POST /api/ai/generate-description`
Génère une description avec GPT-4o

**Auth:** photo_team, admin  
**Body:**
```json
{
  "title": "string",
  "category": "string?",
  "images": ["url1", "url2"],
  "existing_description": "string?"
}
```

**Response:**
```json
{
  "description": "string",
  "confidence": 0.95,
  "suggestions": ["string"]
}
```

---

#### `POST /api/ai/moderate`
Modère du contenu (texte ou image)

**Auth:** photo_team, admin  
**Body:**
```json
{
  "content": "string (texte ou URL)",
  "type": "text|image"
}
```

**Response:**
```json
{
  "approved": true,
  "score": 0.98,
  "flags": [
    {
      "type": "string",
      "severity": "low|medium|high",
      "description": "string"
    }
  ],
  "labels": ["string"]
}
```

---

#### `GET /api/lots`
Liste les lots avec filtres

**Auth:** Public (selon statut)  
**Query params:**
- `status`: lot_status
- `category_id`: UUID
- `price_bracket`: price_bracket
- `search`: string
- `limit`: number (défaut: 20)
- `offset`: number (défaut: 0)
- `sort_by`: created_at|starting_bid|auction_end_date
- `sort_order`: asc|desc

**Response:**
```json
{
  "lots": [
    {
      "id": "uuid",
      "title": "string",
      "category": { ... },
      "images": [ ... ],
      ...
    }
  ],
  "total": 123,
  "limit": 20,
  "offset": 0
}
```

---

#### `POST /api/lots`
Crée un nouveau lot

**Auth:** photo_team, admin  
**Body:**
```json
{
  "title": "string",
  "description": "string?",
  "category_id": "uuid?",
  "starting_bid": number,
  "reserve_price": number?,
  "bid_increment": number?
}
```

---

#### `GET /api/lots/[id]`
Obtient un lot spécifique

**Auth:** Public (selon statut)

---

#### `PATCH /api/lots/[id]`
Met à jour un lot

**Auth:** Creator (brouillon) ou admin  
**Body:** Champs à modifier

---

#### `DELETE /api/lots/[id]`
Supprime un lot

**Auth:** admin uniquement

---

#### `POST /api/lots/[id]/images`
Upload une image pour un lot

**Auth:** photo_team, admin  
**FormData:**
- `file`: File
- `isPrimary`: boolean
- `altText`: string?

**Response:**
```json
{
  "image": {
    "id": "uuid",
    "lot_id": "uuid",
    "image_url": "string",
    "is_primary": boolean,
    ...
  }
}
```

---

#### `GET /api/lots/[id]/images`
Liste les images d'un lot

**Auth:** Public

---

## 📊 Types TypeScript

Fichier: `shared/types/lot.types.ts`

**Types principaux:**
- `LotStatus`, `PriceBracket`, `ModerationStatus`
- `Category`, `Lot`, `LotImage`, `LotWatchlist`, `LotHistory`
- `CreateLotData`, `UpdateLotData`, `UploadLotImageData`
- `GetLotsParams`, `LotWithImages`
- `AIDescriptionRequest`, `AIDescriptionResponse`
- `AIModerationRequest`, `AIModerationResponse`

---

## 🔄 Workflows

### Workflow de création de lot

```
1. Photo team upload des images → Storage (lot-images)
2. Modération automatique des images → GPT-4o Vision
3. Photo team crée le lot (draft) → API POST /api/lots
4. Génération description IA → GPT-4o → ai_generated_description
5. Photo team révise/édite → API PATCH /api/lots/[id]
6. Photo team soumet → status: pending_approval
7. Admin révise et approuve → status: approved
8. Système planifie enchère → status: active
9. Enchère termine → status: sold/unsold
10. Si invendu → fonction relist_lot()
```

### Workflow de modération

```
1. Contenu uploadé (texte ou image)
2. Modération automatique → OpenAI Moderation API / GPT-4o
3. Score calculé → moderation_score, moderation_status
4. Si flaggé → Notification admin
5. Admin révise → Approuve ou rejette
6. Si approuvé → Lot visible publiquement
```

---

## 🎨 Configuration OpenAI

**Variable d'environnement requise:**
```env
OPENAI_API_KEY=sk-...
```

**Modèles utilisés:**
- `gpt-4o` - Descriptions et analyse d'images
- `gpt-4o-mini` - Suggestions (plus rapide, moins coûteux)
- `text-moderation-latest` - Modération de texte

**Coûts estimés (par opération):**
- Génération description: ~$0.01-0.03
- Analyse image: ~$0.02-0.05
- Modération texte: Gratuit
- Modération image: ~$0.02

---

## 📈 Statistiques

### Base de données
- **5 nouvelles tables**
- **3 nouveaux enums**
- **4 fonctions SQL**
- **15 politiques RLS**
- **18 index**

### Code
- **8 API routes**
- **2 modules IA** (descriptions, modération)
- **1 fichier types** (lot.types.ts)
- **~1500 lignes de code**

### Fonctionnalités
- ✅ CRUD complet des lots
- ✅ Upload multi-images avec métadonnées
- ✅ Génération descriptions GPT-4o + Vision
- ✅ Modération automatique contenu
- ✅ Système de catégories
- ✅ Watchlist/favoris
- ✅ Historique des modifications
- ✅ Fonction de relisting
- ✅ Calcul automatique tranches de prix

---

## 🧪 Tests suggérés

### API Tests
```bash
# Créer un lot
curl -X POST http://localhost:3000/api/lots \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "Test Lot", "starting_bid": 25000}'

# Générer description
curl -X POST http://localhost:3000/api/ai/generate-description \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "iPhone 13 Pro", "category": "Électronique"}'

# Upload image
curl -X POST http://localhost:3000/api/lots/$LOT_ID/images \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@image.jpg" \
  -F "isPrimary=true"
```

### Database Tests
```sql
-- Créer un lot de test
INSERT INTO lots (title, starting_bid, created_by)
VALUES ('Lot Test', 75000, 'user-uuid');

-- Vérifier la tranche de prix (doit être 'range_50k_200k')
SELECT title, starting_bid, price_bracket FROM lots;

-- Tester la fonction de relisting
SELECT relist_lot('lot-uuid');

-- Vérifier les lots disponibles
SELECT * FROM get_available_lots();
```

---

## 📝 Prochaines étapes

### Tâche 3: Enchères en Temps Réel
- [ ] Table `bids` pour les enchères
- [ ] Table `auctions` pour sessions d'enchères
- [ ] Supabase Realtime pour enchères live
- [ ] Système anti-sniping (prolongation automatique)
- [ ] Notifications en temps réel

### Améliorations futures
- [ ] Compression automatique des images
- [ ] Génération de thumbnails
- [ ] Watermarking des images
- [ ] Export PDF des lots
- [ ] Templates de description par catégorie
- [ ] Traduction multilingue (FR/EN)

---

## 🔗 Fichiers créés

### Migrations SQL
- `supabase/migrations/20241019000002_lots_schema.sql`
- Migration storage: `setup_storage_lot_images`

### Code
- `shared/types/lot.types.ts`
- `web/lib/openai/descriptions.ts`
- `web/lib/openai/moderation.ts`
- `web/app/api/ai/generate-description/route.ts`
- `web/app/api/ai/moderate/route.ts`
- `web/app/api/lots/route.ts`
- `web/app/api/lots/[id]/route.ts`
- `web/app/api/lots/[id]/images/route.ts`

### Documentation
- `TACHE_2_LOTS_IA.md` (ce fichier)

---

**Date de complétion:** 19 Octobre 2025 - 15:00 UTC+01:00  
**Configuré par:** MCP Supabase + Cascade AI  
**Status:** ✅ Complété (Backend + APIs)  
**Prochaine étape:** Tâche 3 - Enchères en Temps Réel
