# Plateforme d'Enchères Douanières - Gabon

## 📋 Description du Projet

Plateforme web et mobile d'enchères dédiée à la vente de biens saisis par les autorités douanières gabonaises. Le système permet des enchères en temps réel chaque jeudi, avec des paiements via mobile money (Airtel Money / Moov Money) le vendredi, et gestion de la livraison ou retrait au dépôt.

## 🏗️ Architecture

### Structure du Projet

```
.
├── web/                    # Application Next.js 14
│   ├── app/               # App Router Next.js
│   ├── components/        # Composants React
│   ├── lib/              # Bibliothèques et utilitaires
│   ├── types/            # Types TypeScript
│   └── middleware.ts     # Middleware Supabase
├── mobile/               # Application React Native
├── shared/               # Code partagé entre web et mobile
│   ├── components/       # Composants partagés
│   ├── types/           # Types partagés
│   ├── lib/             # Bibliothèques partagées
│   └── utils/           # Utilitaires partagés
├── supabase/            # Configuration Supabase
│   └── migrations/      # Migrations SQL
└── documentation/       # Documentation du projet

```

### Stack Technique

#### Frontend
- **Web**: Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Mobile**: React Native + TypeScript
- **PWA**: Service Workers pour support hors ligne

#### Backend
- **BaaS**: Supabase (Auth, Database, Storage, Realtime)
- **Database**: PostgreSQL avec Row Level Security (RLS)
- **Realtime**: Supabase Realtime pour enchères en direct

#### Services Externes
- **AI**: OpenAI GPT-4o (descriptions automatiques, modération)
- **Paiements**: Airtel Money & Moov Money
- **Notifications**: Twilio (SMS), SendGrid (Email), WhatsApp API
- **QR Codes**: Pour confirmation de livraison

## 🚀 Installation et Configuration

### Prérequis

- Node.js 18+ et npm
- Compte Supabase
- Clés API pour les services externes (OpenAI, Twilio, etc.)

### 1. Installation des Dépendances

#### Projet Web
```bash
cd web
npm install
```

#### Projet Mobile
```bash
cd mobile
npm install
```

#### Bibliothèque Partagée
```bash
cd shared
npm install
```

### 2. Configuration de Supabase

#### 2.1 Créer un Projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL du projet et la clé anonyme

#### 2.2 Appliquer les Migrations
```bash
# Installer Supabase CLI
npm install -g supabase

# Initialiser Supabase localement
supabase init

# Lier au projet distant
supabase link --project-ref <your-project-ref>

# Appliquer les migrations
supabase db push
```

### 3. Configuration des Variables d'Environnement

#### Web Application
Créer un fichier `.env.local` dans le dossier `web/` :
```bash
cp web/.env.local.example web/.env.local
```

Remplir les variables :
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Payment Provider
PAYMENT_PROVIDER_API_KEY=your-payment-key
PAYMENT_PROVIDER_SECRET=your-payment-secret

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# SendGrid
SENDGRID_API_KEY=your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@douane-enchere.ga

# WhatsApp
WHATSAPP_API_KEY=your-whatsapp-key
WHATSAPP_PHONE_NUMBER=your-whatsapp-number

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Démarrer les Applications

#### Web
```bash
cd web
npm run dev
```
Application disponible sur `http://localhost:3000`

#### Mobile
```bash
cd mobile

# Pour iOS
npx react-native run-ios

# Pour Android
npx react-native run-android
```

## 📊 Schéma de Base de Données

### Tables Principales

#### `users`
- Profils utilisateurs étendant `auth.users`
- Statut KYC, exclusions, informations de contact

#### `user_roles`
- Gestion des rôles : `bidder`, `photo_team`, `admin`, `customs`
- Un utilisateur peut avoir plusieurs rôles

#### `kyc_documents`
- Documents d'identité uploadés par les utilisateurs
- Statut de vérification : `pending`, `approved`, `rejected`

## 🔐 Sécurité

### Row Level Security (RLS)

Toutes les tables utilisent RLS avec des politiques spécifiques :
- Les utilisateurs peuvent lire/modifier leurs propres données
- Les admins ont accès complet
- Les customs peuvent vérifier les documents KYC

### Authentification

- Email + mot de passe
- Vérification par SMS/Email
- Système de rôles avec permissions granulaires

## 📱 Fonctionnalités Clés

### Cycle Hebdomadaire
- **Lundi 08:00 - Mercredi 18:00** : Upload des lots par l'équipe photo
- **Jeudi 08:00 - 20:00** : Enchères en temps réel
- **Vendredi 08:00 - 15:00** : Paiements et organisation de la livraison

### Système d'Enchères
- Enchères en temps réel avec Supabase Realtime
- Latence < 200ms pour les mises à jour
- Support pour 500+ utilisateurs simultanés
- File d'attente des enchères hors ligne

### Paiements
- Airtel Money & Moov Money
- Enregistrement des paiements en espèces par admin
- Système de portefeuille (cagnotte) pour enchères premium
- Remboursement automatique sous 48h

### Livraison
- Tarif forfaitaire par zone
- Retrait gratuit au dépôt
- Codes QR pour confirmation
- Notifications WhatsApp

## 📋 Plan d'Implémentation

Voir le fichier `documentation/tasks.json` pour le plan d'implémentation détaillé avec 5 tâches principales :

1. **Infrastructure et Authentification** ✅ En cours
2. **Gestion des Lots et IA**
3. **Moteur d'Enchères en Temps Réel**
4. **Système de Paiement et Portefeuille**
5. **Notifications, Livraison et Dashboard Admin**

## 🧪 Tests

### Tests Unitaires
```bash
cd web
npm run test
```

### Tests E2E
```bash
cd web
npm run test:e2e
```

## 📚 Documentation

- **PRD**: `documentation/project_requirements_document.md`
- **Tasks**: `documentation/tasks.json`
- **Setup**: `documentation/setup.md`

## 🤝 Contribution

Ce projet suit les meilleures pratiques de développement :
- TypeScript strict
- ESLint + Prettier
- Commits conventionnels
- Tests obligatoires

## 📄 Licence

MIT

## 👥 Équipe

Projet développé pour les autorités douanières du Gabon.

---

**Status Actuel**: 🚧 Tâche 1 en cours - Infrastructure et Authentification
# encheredgab
