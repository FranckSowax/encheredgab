# 📱 Intégration WhatsApp avec Whapi

## 🎯 Vue d'ensemble

L'intégration WhatsApp utilise **Whapi.Cloud**, une solution simplifiée pour envoyer des messages WhatsApp sans les complications de l'API officielle WhatsApp Business.

### Pourquoi Whapi ?

✅ **Simplicité** - Configuration en 5 minutes  
✅ **Pas de vérification Business** - Pas besoin d'un compte Meta Business vérifié  
✅ **API moderne** - RESTful, bien documentée  
✅ **Fonctionnalités riches** - Texte, images, documents, boutons  
✅ **Tarification claire** - Pay-as-you-go, pas d'abonnement minimum  
✅ **Multi-device** - Supporte plusieurs numéros WhatsApp

---

## 📊 Ce qui a été implémenté

### Module WhatsApp
**Fichier:** `web/lib/notifications/whatsapp.ts`

**Fonctionnalités:**
- ✅ Envoi messages texte
- ✅ Envoi images avec caption
- ✅ Envoi documents (PDF, etc.)
- ✅ 11 templates pré-configurés
- ✅ Formatage numéro gabonais
- ✅ Validation numéro
- ✅ Envoi en masse avec rate limiting
- ✅ Vérification statut service

**Templates WhatsApp:**
- `bid_placed` - Nouvelle enchère
- `bid_outbid` - Surenchéri
- `bid_won` - Enchère gagnée
- `auction_ending_soon` - Dernières minutes
- `auction_extended` - Prolongation
- `kyc_approved` - KYC approuvé
- `kyc_rejected` - KYC rejeté
- `delivery_ready` - Livraison prête
- `delivery_completed` - Livraison effectuée
- `payment_received` - Paiement reçu
- `payment_failed` - Paiement échoué

### Base de Données
- **11 nouveaux templates** WhatsApp en français
- Support formatage Markdown WhatsApp (*gras*, _italique_)
- Variables dynamiques avec `{{variable}}`

---

## ⚙️ Configuration

### 1. Créer un compte Whapi

1. Aller sur https://whapi.cloud
2. S'inscrire (email ou Google)
3. Vérifier votre email

### 2. Connecter votre numéro WhatsApp

**Option A: Scanner QR Code (Recommandé)**
1. Dashboard Whapi → "Add Channel"
2. Scanner le QR code avec WhatsApp
3. Votre numéro est connecté !

**Option B: Utiliser WhatsApp Business**
1. Créer un compte WhatsApp Business
2. Connecter via API Key
3. Plus complexe, pour production

### 3. Obtenir votre API Token

1. Dashboard Whapi → "API Tokens"
2. Créer un nouveau token
3. Copier le token (commence par `whapi_`)

### 4. Configurer les variables d'environnement

Ajouter dans `.env.local` :

```env
# Whapi (WhatsApp)
WHAPI_TOKEN=whapi_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 💡 Utilisation

### Envoi basique

```typescript
import { sendWhatsAppMessage } from '@/lib/notifications/whatsapp'

await sendWhatsAppMessage({
  to: '+241xxxxxxxxx',
  message: '🎉 Félicitations ! Vous avez remporté l\'enchère.'
})
```

### Avec template

```typescript
import { getWhatsAppTemplate } from '@/lib/notifications/whatsapp'

const message = getWhatsAppTemplate('bid_won', {
  lot_title: 'iPhone 13 Pro',
  winning_amount: '450,000',
  auction_url: 'https://douane-encheres.ga/auctions/123'
})

await sendWhatsAppMessage({
  to: '+241xxxxxxxxx',
  message
})
```

### Avec le système de notifications

```typescript
import { sendNotification } from '@/lib/notifications'

await sendNotification({
  user_id: 'user-uuid',
  type: 'bid_won',
  channels: ['whatsapp', 'email', 'sms'],
  data: {
    lot_title: 'iPhone 13 Pro',
    winning_amount: 450000,
    auction_url: 'https://...'
  },
  priority: 5
})
```

### Envoyer une image

```typescript
import { sendWhatsAppImage } from '@/lib/notifications/whatsapp'

await sendWhatsAppImage({
  to: '+241xxxxxxxxx',
  imageUrl: 'https://example.com/lot-image.jpg',
  caption: '📦 Votre lot iPhone 13 Pro est prêt !'
})
```

### Envoyer un document

```typescript
import { sendWhatsAppDocument } from '@/lib/notifications/whatsapp'

await sendWhatsAppDocument({
  to: '+241xxxxxxxxx',
  documentUrl: 'https://example.com/facture.pdf',
  filename: 'Facture_Enchère_123.pdf',
  caption: '📄 Voici votre facture'
})
```

---

## 🎨 Formatage des Messages

WhatsApp supporte un formatage Markdown basique :

```
*Texte en gras*
_Texte en italique_
~Texte barré~
```texte monospace```

💡 *Conseil :* Utilisez des emojis pour rendre les messages plus engageants !
```

**Exemple de message formaté :**

```
🎉 *FÉLICITATIONS !*

Vous avez remporté l'enchère :
📦 iPhone 13 Pro
💰 Montant final : *450,000 FCFA*

📋 Prochaines étapes :
1️⃣ Effectuer le paiement
2️⃣ Consulter vos infos de livraison
3️⃣ Récupérer votre lot
```

---

## 🔧 Fonctions Utilitaires

### Formater un numéro

```typescript
import { formatWhapiPhone } from '@/lib/notifications/whatsapp'

formatWhapiPhone('0612345678')  // +241612345678
formatWhapiPhone('612345678')   // +241612345678
formatWhapiPhone('+241612345678') // +241612345678
```

### Valider un numéro

```typescript
import { isValidWhatsAppNumber } from '@/lib/notifications/whatsapp'

isValidWhatsAppNumber('+241612345678')  // true
isValidWhatsAppNumber('06123456')       // false
```

### Vérifier le statut Whapi

```typescript
import { checkWhapiStatus } from '@/lib/notifications/whatsapp'

const status = await checkWhapiStatus()

if (status.available) {
  console.log('WhatsApp prêt :', status.phoneNumber)
} else {
  console.error('Erreur :', status.error)
}
```

### Envoi en masse

```typescript
import { sendBulkWhatsApp } from '@/lib/notifications/whatsapp'

const recipients = ['+241611111111', '+241622222222', '+241633333333']

const result = await sendBulkWhatsApp(
  recipients,
  '🎉 Nouvelle enchère disponible !',
  1000 // Délai de 1 seconde entre chaque envoi
)

console.log(`${result.succeeded}/${result.total} envoyés avec succès`)
```

---

## 📊 Statistiques & Monitoring

### Vérifier les envois

Les notifications WhatsApp sont enregistrées dans la table `notifications` :

```sql
SELECT 
  type,
  channel,
  status,
  sent_at,
  delivered_at,
  error_message
FROM notifications
WHERE channel = 'whatsapp'
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;
```

### Taux de succès

```sql
SELECT 
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE status = 'sent') as sent,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'sent') / COUNT(*), 2) as success_rate
FROM notifications
WHERE channel = 'whatsapp'
  AND created_at > NOW() - INTERVAL '30 days';
```

---

## 💰 Tarification Whapi

### Plans

**Free Plan:**
- 100 messages/mois gratuits
- Idéal pour tests et développement
- Toutes les fonctionnalités

**Starter ($29/mois):**
- 1,000 messages inclus
- $0.02/message supplémentaire
- Support prioritaire

**Professional ($99/mois):**
- 5,000 messages inclus
- $0.015/message supplémentaire
- Webhook support
- Multi-channel

**Enterprise (Sur mesure):**
- Volume personnalisé
- Tarifs dégressifs
- Support dédié

### Estimation pour Douane Enchères

**Scénario: 100 enchères/mois**

Notifications par enchère en moyenne :
- 1x bid_placed = 100 messages
- 2x bid_outbid = 200 messages
- 1x auction_ending_soon = 100 messages
- 1x bid_won = 100 messages
- 1x delivery_ready = 100 messages

**Total: ~600 messages/mois**

**Coût: Plan Starter ($29/mois) suffit largement**

---

## ⚠️ Limitations & Bonnes Pratiques

### Limitations Whapi

- **Rate Limit:** ~60 messages/minute
- **Message max:** 4096 caractères
- **Image max:** 5 MB
- **Document max:** 16 MB
- **Délai d'envoi:** ~1-3 secondes par message

### Bonnes Pratiques

1. **Rate Limiting**
   ```typescript
   // Toujours ajouter un délai entre messages
   await sendBulkWhatsApp(recipients, message, 1000)
   ```

2. **Gestion d'erreurs**
   ```typescript
   const result = await sendWhatsAppMessage({...})
   
   if (!result.success) {
     console.error('Échec WhatsApp:', result.error)
     // Fallback vers SMS ou Email
   }
   ```

3. **Opt-in utilisateur**
   ```typescript
   // Vérifier que l'utilisateur a activé WhatsApp
   if (prefs?.whatsapp_enabled === true) {
     await sendWhatsAppMessage({...})
   }
   ```

4. **Messages courts**
   - WhatsApp favorise les messages courts et engageants
   - Utilisez des emojis
   - Maximum 300-400 caractères recommandé

5. **Quiet Hours**
   - Respecter les préférences quiet_hours
   - Ne pas envoyer entre 22h et 7h sauf urgence

---

## 🧪 Tests

### Test basique

```typescript
// Test dans la console Node.js ou route API
import { sendWhatsAppMessage } from '@/lib/notifications/whatsapp'

const test = await sendWhatsAppMessage({
  to: '+241612345678', // Votre numéro
  message: '🧪 Test de notification Douane Enchères'
})

console.log(test)
// { success: true, messageId: 'msg_xxx', provider: 'whapi' }
```

### Test avec template

```bash
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "user_id": "user-uuid",
    "type": "bid_won",
    "channels": ["whatsapp"],
    "data": {
      "lot_title": "iPhone 13 Pro - Test",
      "winning_amount": "450,000",
      "auction_url": "https://test.com"
    }
  }'
```

---

## 🔐 Sécurité

### Protection du token

```typescript
// ❌ JAMAIS exposer le token côté client
// Toujours côté serveur uniquement

// ✅ Bon
const WHAPI_TOKEN = process.env.WHAPI_TOKEN

// ❌ Mauvais
const WHAPI_TOKEN = 'whapi_xxxxxxx' // Hardcodé
```

### Validation numéros

```typescript
// Toujours valider avant envoi
if (!isValidWhatsAppNumber(phone)) {
  throw new Error('Invalid phone number')
}
```

### Rate limiting

```typescript
// Limiter les envois depuis une IP
// Utiliser un middleware Express ou Next.js
```

---

## 🐛 Dépannage

### Le message ne s'envoie pas

1. **Vérifier le token**
   ```bash
   curl https://gate.whapi.cloud/settings \
     -H "Authorization: Bearer $WHAPI_TOKEN"
   ```

2. **Vérifier le numéro**
   - Format: +241XXXXXXXXX (9 chiffres après +241)
   - Pas d'espaces
   - Numéro WhatsApp actif

3. **Vérifier les logs**
   ```typescript
   console.error('WhatsApp error:', result.error)
   ```

### "Token not configured"

Vérifier `.env.local` :
```env
WHAPI_TOKEN=whapi_xxxxx
```

Redémarrer le serveur Next.js :
```bash
npm run dev
```

### "Rate limit exceeded"

Ajouter un délai entre messages :
```typescript
await sendBulkWhatsApp(recipients, message, 2000) // 2 secondes
```

---

## 📈 Migration depuis SMS

WhatsApp est **moins cher** que les SMS pour le Gabon :

| Canal | Coût unitaire | Coût 1000 messages |
|-------|--------------|-------------------|
| SMS (Twilio) | ~$0.05-0.10 | $50-100 |
| WhatsApp (Whapi) | ~$0.015-0.02 | $15-20 |
| **Économie** | **70-80%** | **$30-80** |

### Stratégie hybride

```typescript
// Utiliser WhatsApp en priorité, SMS en fallback
const prefs = await getNotificationPreferences(userId)

if (prefs.whatsapp_enabled) {
  const result = await sendWhatsAppMessage({...})
  
  if (!result.success) {
    // Fallback vers SMS
    await sendSMS({...})
  }
} else {
  await sendSMS({...})
}
```

---

## 🚀 Prochaines Étapes

### Fonctionnalités avancées

- [ ] Boutons interactifs (Quick Replies)
- [ ] Messages de liste
- [ ] Templates médias (images + texte)
- [ ] Webhooks pour statuts de lecture
- [ ] Analytics détaillées

### Optimisations

- [ ] Queue Redis pour envois massifs
- [ ] Cache des templates
- [ ] Retry automatique sur échec
- [ ] A/B testing messages

---

## 📚 Ressources

- **Documentation Whapi:** https://whapi.cloud/docs
- **Dashboard Whapi:** https://panel.whapi.cloud
- **Support Whapi:** support@whapi.cloud
- **Status Page:** https://status.whapi.cloud

---

## 📝 Changelog

**v1.0 (19 Oct 2025)**
- ✅ Intégration Whapi complète
- ✅ 11 templates WhatsApp
- ✅ Support texte, images, documents
- ✅ Envoi en masse
- ✅ Validation numéros gabonais
- ✅ Documentation complète

---

**Configuration complétée ! 🎉**

WhatsApp est maintenant intégré et prêt à être utilisé pour les notifications de la plateforme Douane Enchères Gabon.

**Pour activer:**
1. Créer un compte sur https://whapi.cloud
2. Connecter votre numéro WhatsApp
3. Ajouter `WHAPI_TOKEN` dans `.env.local`
4. Redémarrer le serveur

**Coût estimé:** $29/mois pour ~600 messages (Plan Starter)
