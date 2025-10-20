# 📱 Configuration WhatsApp - Système de Notifications

Documentation complète pour le système de notifications WhatsApp via Whapi.cloud

---

## 🎯 Objectif

Envoyer automatiquement des notifications WhatsApp aux enchérisseurs lorsqu'ils sont dépassés, afin d'intensifier la compétition et maintenir l'engagement.

---

## 📋 Fonctionnalités

### ✅ Ce qui est implémenté

1. **Notification Enchère Dépassée** 🔔
   - Alerte immédiate au dernier enchérisseur
   - Affiche son ancienne offre vs nouvelle offre
   - Lien direct vers l'enchère pour surenchérir

2. **Notification Victoire** 🏆
   - Message de félicitations au gagnant
   - Détails de l'article et montant
   - Instructions pour finaliser l'achat

3. **Notification Fin Imminente** ⏰
   - Alerte X minutes avant la fin
   - Prix actuel et temps restant
   - Incitation à l'action

4. **Tests Complets** 🧪
   - Interface de test dans le dashboard
   - API de test dédiée
   - Formatage automatique des numéros

---

## 🔧 Architecture Technique

### Structure des fichiers

```
web/
├── lib/notifications/
│   └── whapi.service.ts              ← Service principal Whapi
├── app/api/
│   ├── auctions/[id]/
│   │   └── notify-outbid/route.ts    ← API notification enchère
│   └── test-whatsapp/route.ts        ← API de test
└── app/(dashboard)/dashboard/
    └── test-whatsapp/page.tsx         ← Interface de test

supabase/migrations/
└── whatsapp_outbid_notifications.sql  ← Fonctions SQL
```

### Flux de notification

```
1. Nouvelle enchère → Supabase bids table
2. Fonction get_previous_top_bidder() → Récupère dernier enchérisseur
3. API /api/auctions/[id]/notify-outbid → Traite la notification
4. whapi.service.ts → Envoie via Whapi.cloud
5. WhatsApp → Message reçu par l'utilisateur
```

---

## 🚀 Configuration

### 1. Variables d'environnement

Fichier `.env.local` :

```env
# Whapi.cloud Configuration
WHAPI_TOKEN=jDI2E2aKZsJnZ6ivpbZdW6cqjMEEYjze
WHAPI_BASE_URL=https://gate.whapi.cloud
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Format des numéros de téléphone

**Important** : Les utilisateurs doivent renseigner leur numéro WhatsApp lors de l'inscription.

**Formats acceptés** :
- `+241 06 12 34 56` (recommandé)
- `06 12 34 56`
- `24106123456`
- `+24106123456`

**Format de sortie** : `24106123456` (sans +, sans espaces)

### 3. Migration Supabase

La migration a été appliquée avec succès ✅

**Fonctions créées** :
- `get_previous_top_bidder(auction_id)` - Récupère le dernier enchérisseur
- `send_outbid_notification(auction_id, new_bid)` - Notification manuelle

---

## 🧪 Tests

### A. Via l'interface web

1. **Accéder à la page de test** :
   ```
   http://localhost:3000/dashboard/test-whatsapp
   ```

2. **Sélectionner le type de test** :
   - ✉️ Message simple
   - 🔔 Notification enchère dépassée
   - 🔌 Test connexion Whapi
   - 📞 Test formatage numéro

3. **Entrer votre numéro WhatsApp** (format Gabon) :
   ```
   +241 06 12 34 56
   ```

4. **Cliquer sur "Envoyer le test"**

5. **Vérifier votre WhatsApp** 📱

### B. Via API (cURL)

#### Test simple

```bash
curl --request POST \
  --url http://localhost:3000/api/test-whatsapp \
  --header 'Content-Type: application/json' \
  --data '{
    "type": "simple",
    "phone": "+241061234567",
    "message": "Test notification Douane Enchères"
  }'
```

#### Test notification enchère dépassée

```bash
curl --request POST \
  --url http://localhost:3000/api/test-whatsapp \
  --header 'Content-Type: application/json' \
  --data '{
    "type": "outbid",
    "phone": "+241061234567",
    "userName": "Jean Dupont",
    "lotTitle": "MacBook Pro M2",
    "previousBid": 850000,
    "newBid": 920000,
    "auctionUrl": "http://localhost:3000/auctions/123"
  }'
```

#### Test connexion Whapi

```bash
curl --request POST \
  --url http://localhost:3000/api/test-whatsapp \
  --header 'Content-Type: application/json' \
  --data '{
    "type": "test_connection",
    "phone": "any"
  }'
```

### C. Via Supabase SQL

```sql
-- Test de récupération du dernier enchérisseur
SELECT * FROM get_previous_top_bidder('AUCTION_ID');

-- Test de notification manuelle
SELECT send_outbid_notification('AUCTION_ID', 500000);
```

---

## 📤 Exemples de messages

### 1. Enchère dépassée

```
🔔 Douane Enchères - Alerte Enchère

Bonjour Jean Dupont,

Votre enchère sur *MacBook Pro M2* a été dépassée ! 😔

💰 Votre offre : 850 000 FCFA
🔥 Nouvelle offre : 920 000 FCFA

Ne laissez pas passer cette opportunité !

👉 Surenchérir maintenant : http://localhost:3000/auctions/123

_Douane Enchères Gabon - Enchères Officielles_
```

### 2. Victoire

```
🎉 Félicitations Jean Dupont !

Vous avez remporté l'enchère ! 🏆

📦 Article : *MacBook Pro M2*
💰 Montant gagnant : 920 000 FCFA

Prochaines étapes :
1️⃣ Confirmez votre achat
2️⃣ Effectuez le paiement
3️⃣ Récupérez votre article

👉 Voir les détails : http://localhost:3000/auctions/123

_Douane Enchères Gabon - Enchères Officielles_
```

### 3. Fin imminente

```
⏰ Douane Enchères - Enchère se termine bientôt !

Bonjour Jean Dupont,

L'enchère sur *MacBook Pro M2* se termine dans 15 minutes !

💰 Prix actuel : 920 000 FCFA

C'est votre dernière chance !

👉 Voir l'enchère : http://localhost:3000/auctions/123

_Douane Enchères Gabon - Enchères Officielles_
```

---

## 🔗 Intégration avec le système d'enchères

### Appel automatique lors d'une nouvelle enchère

Dans votre fonction `place_bid()`, ajoutez :

```typescript
// Après l'insertion d'une nouvelle enchère
const { data: auction } = await supabase
  .from('auctions')
  .select('*, lots(*)')
  .eq('id', auctionId)
  .single()

// Récupérer le dernier enchérisseur dépassé
const { data: previousBids } = await supabase
  .from('bids')
  .select('user_id, amount')
  .eq('auction_id', auctionId)
  .neq('user_id', newBidderId)
  .order('created_at', { ascending: false })
  .limit(1)

if (previousBids && previousBids.length > 0) {
  // Appeler l'API de notification
  await fetch(`/api/auctions/${auctionId}/notify-outbid`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      previous_bidder_id: previousBids[0].user_id,
      new_bid_amount: newBidAmount
    })
  })
}
```

---

## 📊 Monitoring

### Vérifier les notifications envoyées

```sql
-- Dernières notifications WhatsApp
SELECT 
  n.created_at,
  n.type,
  n.status,
  u.full_name,
  u.phone,
  n.data->>'auction_id' as auction_id,
  n.sent_at
FROM notifications n
JOIN users u ON u.id = n.user_id
WHERE n.channel = 'whatsapp'
ORDER BY n.created_at DESC
LIMIT 20;
```

### Statistiques

```sql
-- Taux de succès des notifications WhatsApp
SELECT 
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM notifications
WHERE channel = 'whatsapp'
GROUP BY status;
```

---

## 🐛 Dépannage

### Erreur 401 - Need channel authorization

**Cause** : Token Whapi invalide ou expiré

**Solution** : Vérifier le token dans `.env.local`

### Erreur 400 - Wrong request parameters

**Cause** : Format de numéro incorrect

**Solution** : Utiliser le format `24106123456` (sans +)

### Message non reçu

**Vérifications** :
1. ✅ Le numéro est bien enregistré sur WhatsApp
2. ✅ Le numéro est au format international
3. ✅ Le token Whapi est valide
4. ✅ Vérifier les logs serveur

### Test de connexion

```bash
# Tester la connexion Whapi
curl --request GET \
  --url https://gate.whapi.cloud/settings \
  --header 'authorization: Bearer jDI2E2aKZsJnZ6ivpbZdW6cqjMEEYjze'
```

---

## 📈 Limites et Quotas

### Whapi.cloud

- **Version Trial** : 100 messages/jour
- **Production** : Selon votre plan
- **Rate limit** : 10 messages/seconde

### Recommandations

1. **Throttling** : Limiter à 1 notification par enchère par utilisateur
2. **Cooldown** : Attendre 30 secondes entre 2 notifications au même user
3. **Préférences** : Permettre aux users de désactiver les notifications

---

## 🔐 Sécurité

### Best Practices

1. ✅ **Token en variable d'environnement** (jamais dans le code)
2. ✅ **Validation des numéros** avant envoi
3. ✅ **Rate limiting** pour éviter le spam
4. ✅ **Logs des notifications** pour audit
5. ✅ **Opt-out** pour les utilisateurs

### RGPD / Protection des données

- Les numéros de téléphone sont stockés de manière sécurisée
- Les utilisateurs peuvent désactiver les notifications
- Les messages sont envoyés uniquement aux utilisateurs concernés
- Pas de partage de données avec des tiers

---

## 📚 Ressources

- **Documentation Whapi** : https://support.whapi.cloud/help-desk
- **API Reference** : https://support.whapi.cloud/help-desk/sending/send-text-message
- **Status Page** : https://status.whapi.cloud

---

## ✅ Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Migration Supabase appliquée
- [ ] Test simple réussi
- [ ] Test notification enchère réussi
- [ ] Numéros de téléphone des users vérifiés
- [ ] Intégration dans place_bid() testée
- [ ] Monitoring configuré
- [ ] Documentation partagée avec l'équipe

---

## 🎯 Prochaines Étapes

1. **Tester en production** avec de vrais numéros
2. **Ajuster les templates** de messages
3. **Configurer les préférences** utilisateur
4. **Ajouter analytics** (taux d'ouverture, clics)
5. **Implémenter rate limiting**
6. **Créer dashboard admin** pour monitoring

---

**Le système de notifications WhatsApp est maintenant opérationnel ! 🚀📱**
