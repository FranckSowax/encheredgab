# 🔌 Connexion du Channel WhatsApp - Guide Pas à Pas

## 🚨 Problème : Les messages ne sont pas reçus

**Symptôme** : Le test de connexion fonctionne (✅ Succès) mais les messages WhatsApp n'arrivent jamais.

**Cause** : Votre token Whapi est valide MAIS le **channel WhatsApp n'est pas connecté/scanné**.

---

## ✅ Solution : Connecter votre WhatsApp Business

### Étape 1 : Accéder au Panel Whapi

1. Ouvrez votre navigateur
2. Allez sur : **https://panel.whapi.cloud**
3. Connectez-vous avec vos identifiants Whapi

### Étape 2 : Vérifier le Token

1. Une fois connecté, cliquez sur **"API Keys"** ou **"Settings"**
2. Vérifiez que le token est bien : `jDI2E2aKZsJnZ6ivpbZdW6cqjMEEYjze`
3. Si différent, copiez le bon token et mettez à jour votre `.env.local`

### Étape 3 : Ajouter un Channel (IMPORTANT)

1. Dans le menu, cliquez sur **"Channels"**
2. Si vous voyez **"No channels connected"** ou une liste vide :
   - Cliquez sur **"Add Channel"** ou **"Connect WhatsApp"**
3. Vous devriez voir un **QR CODE** s'afficher

### Étape 4 : Scanner le QR Code

1. **Prenez votre téléphone** avec WhatsApp installé
2. Ouvrez **WhatsApp Business** (ou WhatsApp normal si Business pas installé)
3. Allez dans **Paramètres** > **Appareils liés** > **Lier un appareil**
4. **Scannez le QR CODE** affiché sur l'écran
5. Attendez quelques secondes...

### Étape 5 : Vérifier la Connexion

Le status du channel doit passer à :
- ✅ **"connected"** ou **"ready"** ou **"authorized"**

Si vous voyez :
- ❌ **"disconnected"** → Rescannez le QR
- ⚠️ **"loading"** → Attendez 30 secondes
- ❌ **"unauthorized"** → Re-scannez le QR

### Étape 6 : Tester l'Envoi

1. Retournez sur : http://localhost:3000/dashboard/test-whatsapp
2. Cliquez sur **"Vérifier Channel"**
3. Vous devriez maintenant voir :
   - ✅ Token : Valide
   - ✅ Channels : Connecté
   - ✅ Status : ready
   - ✅ Prêt : Oui

4. Maintenant **envoyez un test** :
   - Entrez votre numéro : `+241 06 12 34 56`
   - Sélectionnez "Message simple"
   - Cliquez "Envoyer le test"
   - **Vérifiez votre WhatsApp** 📱

---

## 🔍 Diagnostic Rapide

### Test 1 : Vérifier le Channel depuis l'app

```bash
# Aller sur la page de test
http://localhost:3000/dashboard/test-whatsapp

# Cliquer sur "Vérifier Channel"
# Regarder les 4 statuts :
```

**Cas 1 : Tout est vert ✅**
→ Le channel est connecté, les messages devraient arriver

**Cas 2 : Channels = ❌ Non connecté**
→ Retournez sur panel.whapi.cloud et scannez le QR code

**Cas 3 : Status = "loading"**
→ Attendez 1-2 minutes que la connexion se stabilise

**Cas 4 : Token = ❌ Invalide**
→ Vérifiez le token dans .env.local

### Test 2 : Vérifier manuellement via API

```bash
# Vérifier les channels
curl -H "Authorization: Bearer jDI2E2aKZsJnZ6ivpbZdW6cqjMEEYjze" \
  https://gate.whapi.cloud/channels

# Vérifier le health
curl -H "Authorization: Bearer jDI2E2aKZsJnZ6ivpbZdW6cqjMEEYjze" \
  https://gate.whapi.cloud/health
```

**Réponse attendue** :
```json
{
  "status": "ready",
  "channels": [
    {
      "id": "xxx",
      "status": "ready",
      "phone": "241061234567"
    }
  ]
}
```

---

## 📱 WhatsApp Business vs WhatsApp Normal

### Option 1 : WhatsApp Business (Recommandé)

**Avantages** :
- ✅ Conçu pour les entreprises
- ✅ Profil professionnel
- ✅ Messages automatiques
- ✅ Statistiques

**Installation** :
1. Téléchargez "WhatsApp Business" sur Play Store / App Store
2. Configurez avec votre numéro professionnel
3. Scannez le QR code Whapi

### Option 2 : WhatsApp Normal

**Si vous n'avez pas Business** :
- ✅ Fonctionne aussi
- ⚠️ Moins de fonctionnalités pro
- ⚠️ Limitez le volume de messages

---

## 🚨 Erreurs Courantes

### Erreur 1 : "No channels found"

**Cause** : Aucun WhatsApp n'est lié au compte Whapi

**Solution** :
1. panel.whapi.cloud → Channels
2. Add Channel
3. Scanner le QR code

### Erreur 2 : "Channel disconnected"

**Cause** : Le téléphone a été déconnecté ou éteint

**Solutions** :
- Rallumez votre téléphone
- Vérifiez la connexion internet du téléphone
- Re-scannez le QR code si nécessaire

### Erreur 3 : "Rate limit exceeded"

**Cause** : Trop de messages envoyés

**Solution** :
- Attendez quelques minutes
- Limitez les tests à 1-2 par minute

### Erreur 4 : Messages pas reçus mais API dit "sent"

**Vérifications** :
1. Le numéro est-il bien au format `24106123456` ?
2. Le numéro est-il enregistré sur WhatsApp ?
3. Le channel est-il bien "ready" ?
4. Y a-t-il des logs d'erreur dans la console ?

---

## 🔐 Sécurité du Token

### Pourquoi le token est-il exposé ?

Le token `jDI2E2aKZsJnZ6ivpbZdW6cqjMEEYjze` est actuellement :
- ✅ En variable d'environnement (.env.local)
- ⚠️ Utilisé côté serveur (API routes)
- ❌ **Ne JAMAIS exposer côté client**

### Protection

```typescript
// ✅ BON : Côté serveur uniquement
const WHAPI_TOKEN = process.env.WHAPI_TOKEN

// ❌ MAUVAIS : Côté client
const token = 'jDI2E2aKZsJnZ6ivpbZdW6cqjMEEYjze'
```

### Régénérer le Token (si compromis)

1. panel.whapi.cloud → API Keys
2. Cliquez "Regenerate"
3. Copiez le nouveau token
4. Mettez à jour `.env.local`
5. Redémarrez l'app : `npm run dev`

---

## 📊 Monitoring de la Connexion

### Dashboard Whapi

Sur **panel.whapi.cloud**, vous pouvez voir :
- 📊 Nombre de messages envoyés
- 📈 Taux de succès
- ⚡ Latence d'envoi
- 🔌 Status du channel en temps réel

### Dans votre App

```sql
-- Derniers messages envoyés
SELECT 
  created_at,
  status,
  data->>'auction_id' as auction,
  sent_at
FROM notifications
WHERE channel = 'whatsapp'
ORDER BY created_at DESC
LIMIT 10;
```

---

## ✅ Checklist Finale

Avant de déployer en production :

- [ ] ✅ Token Whapi configuré dans .env.local
- [ ] ✅ Channel WhatsApp scanné et connecté
- [ ] ✅ Status = "ready" dans le dashboard
- [ ] ✅ Test simple réussi (message reçu)
- [ ] ✅ Test notification enchère réussi
- [ ] ✅ Numéros de téléphone des users au bon format
- [ ] ✅ Monitoring configuré
- [ ] ✅ Rate limiting vérifié

---

## 🆘 Support

### Si rien ne fonctionne

1. **Vérifier les logs serveur** :
   ```bash
   # Terminal où tourne npm run dev
   # Chercher les erreurs avec "whatsapp" ou "whapi"
   ```

2. **Tester l'API directement** :
   ```bash
   curl -X POST https://gate.whapi.cloud/messages/text \
     -H "Authorization: Bearer jDI2E2aKZsJnZ6ivpbZdW6cqjMEEYjze" \
     -H "Content-Type: application/json" \
     -d '{
       "to": "24106123456",
       "body": "Test direct"
     }'
   ```

3. **Contacter le support Whapi** :
   - Email : support@whapi.cloud
   - Documentation : https://support.whapi.cloud
   - Status page : https://status.whapi.cloud

---

## 🎯 Résumé

**Le problème n°1 avec Whapi** : Token valide mais channel pas connecté

**La solution** : Scanner le QR code sur panel.whapi.cloud

**Vérification** : http://localhost:3000/dashboard/test-whatsapp → "Vérifier Channel"

**Une fois connecté** : Les messages arrivent en 1-2 secondes 📱✨

---

**Suivez ce guide et vos notifications WhatsApp fonctionneront ! 🚀**
