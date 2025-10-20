# 🚀 Déploiement Netlify - Douane Enchères

## 📊 Projet Netlify Existant

- **Nom** : enchrere-dgab
- **URL** : http://enchrere-dgab.netlify.app
- **Site ID** : `54c50b3a-9182-40ec-a555-b6429c563a3e`
- **Team** : Sowax (francksowax)

---

## 🔐 Variables d'Environnement Requises

### 1. **Supabase** (Base de données) - ✅ OBLIGATOIRE

```
NEXT_PUBLIC_SUPABASE_URL=https://lwhxmrfddlwmfjfrtdzk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3aHhtcmZkZGx3bWZqZnJ0ZHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4NTAyMjYsImV4cCI6MjA3NjQyNjIyNn0.i4aUFtFB9WD8A5GiyQYDLZ1-63WVrRUb-DkxuHLBs1s
```

### 2. **Whapi.cloud** (WhatsApp Business) - ✅ OBLIGATOIRE

```
WHAPI_TOKEN=fKUGctmyoUq5pex25GdAcjrUyjl55nrd
WHAPI_BASE_URL=https://gate.whapi.cloud
```

### 3. **Application** - ✅ OBLIGATOIRE

```
NEXT_PUBLIC_APP_URL=https://enchrere-dgab.netlify.app
NODE_ENV=production
```

### 4. **Cron Jobs** (Optionnel mais recommandé)

```
CRON_SECRET=votre_secret_aleatoire_ici
```

Générez un secret aléatoire :
```bash
openssl rand -base64 32
```

### 5. **OpenAI** (Optionnel - pour descriptions IA)

```
OPENAI_API_KEY=sk-...
```

### 6. **Paiement** (À configurer plus tard)

```
PAYMENT_PROVIDER_API_KEY=votre_cle_airtel_money
PAYMENT_PROVIDER_SECRET=votre_secret_airtel_money
```

### 7. **Email** (Optionnel - SendGrid)

```
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@douane-enchere.ga
```

---

## 📝 Variables Prioritaires pour Commencer

**Minimum viable** :

1. ✅ `NEXT_PUBLIC_SUPABASE_URL`
2. ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. ✅ `WHAPI_TOKEN`
4. ✅ `WHAPI_BASE_URL`
5. ✅ `NEXT_PUBLIC_APP_URL`
6. ✅ `NODE_ENV`

---

## 🛠️ Configuration Netlify

### Paramètres de Build

```toml
[build]
  command = "cd web && npm install && npm run build"
  publish = "web/.next"
  base = "/"

[build.environment]
  NODE_VERSION = "18"
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### netlify.toml

Créer un fichier `netlify.toml` à la racine :

```toml
[build]
  base = "web"
  command = "npm install && npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18.17.0"
  NPM_VERSION = "9.6.7"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# Cron Jobs (Netlify Pro required)
[[edge_functions]]
  function = "scheduled-open-auctions"
  path = "/api/cron/open-weekly-auctions"
  
[[edge_functions]]
  function = "scheduled-close-auctions"
  path = "/api/cron/close-weekly-auctions"
```

---

## 🚀 Méthodes de Déploiement

### Option 1 : Via GitHub (Recommandé)

1. Connecter le repo GitHub à Netlify
2. Configurer les variables d'environnement
3. Déploiement automatique à chaque push

### Option 2 : Déploiement Manuel

```bash
cd web
npm install
npm run build
netlify deploy --prod
```

### Option 3 : Via CLI Netlify

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Lier au projet existant
netlify link --name enchrere-dgab

# Configurer les env vars (voir section suivante)

# Déployer
netlify deploy --prod
```

---

## ⚙️ Configuration via Netlify CLI

### Ajouter les Variables d'Environnement

```bash
# Supabase
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://lwhxmrfddlwmfjfrtdzk.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Whapi
netlify env:set WHAPI_TOKEN "fKUGctmyoUq5pex25GdAcjrUyjl55nrd"
netlify env:set WHAPI_BASE_URL "https://gate.whapi.cloud"

# App
netlify env:set NEXT_PUBLIC_APP_URL "https://enchrere-dgab.netlify.app"
netlify env:set NODE_ENV "production"

# Cron Secret
netlify env:set CRON_SECRET "votre_secret_genere"
```

### Vérifier les Variables

```bash
netlify env:list
```

---

## 🔄 Configuration via Interface Netlify

1. Aller sur https://app.netlify.com/sites/enchrere-dgab
2. **Site settings** → **Environment variables**
3. Cliquer **Add a variable**
4. Ajouter chaque variable une par une

**Scopes recommandés** :
- ✅ **Builds** (pour les variables NEXT_PUBLIC_*)
- ✅ **Functions** (pour WHAPI, CRON, etc.)
- ✅ **All** (pour NODE_ENV)

---

## ✅ Checklist de Déploiement

### Avant le Déploiement

- [ ] Vérifier que le code est sur GitHub
- [ ] Créer `netlify.toml` à la racine
- [ ] Tester le build localement : `cd web && npm run build`
- [ ] Vérifier les variables d'environnement

### Configuration Netlify

- [ ] Connecter le repo GitHub
- [ ] Définir base directory : `web`
- [ ] Définir build command : `npm install && npm run build`
- [ ] Définir publish directory : `.next`
- [ ] Ajouter toutes les variables d'environnement
- [ ] Configurer le custom domain (optionnel)

### Après le Déploiement

- [ ] Vérifier le site : https://enchrere-dgab.netlify.app
- [ ] Tester les enchères
- [ ] Tester les notifications WhatsApp
- [ ] Configurer les cron jobs Netlify
- [ ] Vérifier les logs de déploiement

---

## 🐛 Dépannage

### Erreur de Build

```bash
# Vérifier les logs
netlify logs

# Build local
cd web
npm install
npm run build
```

### Variables d'Environnement Manquantes

```bash
# Lister toutes les env vars
netlify env:list

# Ajouter une variable manquante
netlify env:set NOM_VARIABLE "valeur"
```

### Problème de Routage Next.js

Vérifier que `netlify.toml` contient :
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 📊 Monitoring

### Netlify Analytics

- Activer Netlify Analytics (payant)
- Ou utiliser Google Analytics
- Ou Vercel Analytics (gratuit)

### Logs

```bash
# Voir les logs en temps réel
netlify logs:functions

# Logs de build
netlify logs
```

---

## 🎯 Optimisations Post-Déploiement

1. **Custom Domain** : Configurer `encheres-douane.ga`
2. **SSL** : Activé automatiquement par Netlify
3. **CDN** : Optimisé automatiquement
4. **Caching** : Configurer headers cache
5. **Compression** : Activée automatiquement

---

## 📞 Support

- Netlify Docs : https://docs.netlify.com
- Support Netlify : https://answers.netlify.com
- GitHub Repo : https://github.com/FranckSowax/encheredgab

---

**Prêt à déployer ! 🚀**
