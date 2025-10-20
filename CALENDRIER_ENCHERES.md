# 📅 Calendrier Hebdomadaire des Enchères

## 🎯 Cycle de Vente Hebdomadaire

### Vue d'Ensemble

```
┌──────────────────────────────────────────────────────────┐
│                    SEMAINE TYPE                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Lundi - Mercredi  │  PRÉVISUALISATION                  │
│  ══════════════════│══════════════════                  │
│  📱 Mode Vitrine   │  • Lots visibles                   │
│                    │  • Prix de départ affichés          │
│                    │  • Pas d'enchères possibles         │
│                    │  • CTA: "Enchères jeudi 00h00"      │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Jeudi 00h00       │  OUVERTURE DES ENCHÈRES            │
│  ══════════════════│══════════════════                  │
│  🔥 Mode Actif     │  • Enchères activées               │
│                    │  • Bouton "Faire une offre" actif   │
│                    │  • Temps restant affiché            │
│                    │  • Notifications activées           │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Vendredi 12h00    │  CLÔTURE                           │
│  ══════════════════│══════════════════                  │
│  ✅ Terminé        │  • Enchères fermées                │
│                    │  • Gagnants notifiés                │
│                    │  • Process de paiement              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📊 Planning Détaillé

### Lundi à Mercredi (Mode Prévisualisation)

**Durée** : 72 heures  
**Status** : `preview` ou `scheduled`

#### Fonctionnalités Actives
- ✅ Affichage des lots
- ✅ Description complète
- ✅ Prix de départ visible
- ✅ Images et détails
- ✅ Favoris possibles
- ✅ Partage social
- ✅ Questions/Réponses

#### Fonctionnalités Désactivées
- ❌ Bouton "Faire une offre" (grisé)
- ❌ Enchères
- ❌ Auto-bid
- ❌ Notifications enchères

#### Interface Utilisateur

**Badge sur les cartes** :
```
┌─────────────────────┐
│ 🕐 Enchères dès    │
│    Jeudi 00h00     │
└─────────────────────┘
```

**Message CTA** :
```
Les enchères débuteront jeudi à minuit
📌 Ajoutez ce lot à vos favoris pour être notifié
```

---

### Jeudi 00h00 (Ouverture)

**Déclencheur** : Automatique à minuit  
**Status** : `active`

#### Actions Automatiques
1. 🔄 Changement status : `scheduled` → `active`
2. 📧 Envoi notifications push
3. 📱 SMS aux utilisateurs avec favoris
4. 🔔 WhatsApp aux enchérisseurs inscrits
5. 📊 Analytics : début tracking

#### Notifications Envoyées

**WhatsApp** :
```
🔔 Douane Enchères - Ouverture !

Les enchères sont maintenant OUVERTES ! 🎉

Vos lots favoris :
• Mercedes GLE 2023 - Départ: 15M FCFA
• iPhone 14 Pro - Départ: 450K FCFA

⏰ Fin des enchères : Vendredi 12h00

👉 Faire une offre : [lien]
```

**Email** :
```
Subject: 🔥 Les enchères sont ouvertes !

Bonjour [Nom],

Les lots que vous suivez sont maintenant disponibles 
aux enchères jusqu'à vendredi midi.

[Liste des lots favoris avec boutons CTA]
```

---

### Jeudi 00h00 - Vendredi 12h00 (Période Active)

**Durée** : 36 heures  
**Status** : `active`

#### Fonctionnalités Actives
- ✅ Enchères en temps réel
- ✅ Auto-bid
- ✅ Snipe protection
- ✅ Notifications outbid
- ✅ Extension anti-snipe
- ✅ Tableau des enchères

#### Système de Notifications

**Instant** (temps réel) :
- 🔔 Enchère dépassée
- 🏆 Nouveau leader
- ⚡ Extension time

**Programmées** :
- ⏰ 6h avant fin : "Dernières heures"
- ⏰ 1h avant fin : "Dernière heure !"
- ⏰ 15min avant fin : "Derniers instants !"

---

### Vendredi 12h00 (Clôture)

**Déclencheur** : Automatique à midi  
**Status** : `completed`

#### Actions Automatiques

1. **Fermeture des enchères**
   ```sql
   UPDATE auctions 
   SET status = 'completed', 
       winner_id = (SELECT user_id FROM bids 
                    WHERE auction_id = auctions.id 
                    ORDER BY amount DESC LIMIT 1)
   WHERE end_date <= NOW()
   ```

2. **Notification gagnants**
   - WhatsApp
   - Email
   - SMS
   - Push notification

3. **Notification perdants**
   - Email de remerciement
   - Suggestion lots similaires

4. **Process paiement**
   - Génération facture
   - Instructions paiement
   - QR Code livraison

---

## 🔧 Implémentation Technique

### 1. Migration Base de Données

```sql
-- Ajouter champs planning
ALTER TABLE auctions ADD COLUMN preview_start TIMESTAMPTZ;
ALTER TABLE auctions ADD COLUMN bidding_start TIMESTAMPTZ;
ALTER TABLE auctions ADD COLUMN bidding_end TIMESTAMPTZ;

-- Fonction pour calculer les dates
CREATE OR REPLACE FUNCTION schedule_weekly_auction(
  p_preview_start TIMESTAMPTZ
)
RETURNS TABLE (
  preview_start TIMESTAMPTZ,
  bidding_start TIMESTAMPTZ,
  bidding_end TIMESTAMPTZ
) AS $$
BEGIN
  -- Preview : Lundi 00h00
  preview_start := date_trunc('week', p_preview_start) + INTERVAL '0 days';
  
  -- Bidding start : Jeudi 00h00
  bidding_start := date_trunc('week', p_preview_start) + INTERVAL '3 days';
  
  -- Bidding end : Vendredi 12h00
  bidding_end := date_trunc('week', p_preview_start) + INTERVAL '4 days 12 hours';
  
  RETURN QUERY SELECT preview_start, bidding_start, bidding_end;
END;
$$ LANGUAGE plpgsql;
```

### 2. Scheduler (Cron Job)

**Ouverture Enchères** - Jeudi 00h00 :
```typescript
// app/api/cron/open-weekly-auctions/route.ts
export async function GET() {
  const now = new Date()
  const isThursdayMidnight = now.getDay() === 4 && now.getHours() === 0
  
  if (!isThursdayMidnight) {
    return NextResponse.json({ skipped: true })
  }

  // Activer les enchères scheduled
  const { data, error } = await supabase
    .from('auctions')
    .update({ status: 'active' })
    .eq('status', 'scheduled')
    .lte('start_date', now.toISOString())
  
  // Envoyer notifications
  await notifyAuctionOpening()
  
  return NextResponse.json({ activated: data?.length || 0 })
}
```

**Clôture Enchères** - Vendredi 12h00 :
```typescript
// app/api/cron/close-weekly-auctions/route.ts
export async function GET() {
  const now = new Date()
  const isFridayNoon = now.getDay() === 5 && now.getHours() === 12
  
  if (!isFridayNoon) {
    return NextResponse.json({ skipped: true })
  }

  // Fermer les enchères actives
  const { data: closedAuctions } = await supabase
    .from('auctions')
    .update({ status: 'completed' })
    .eq('status', 'active')
    .lte('end_date', now.toISOString())
    .select('*, bids(*)')
  
  // Déterminer les gagnants
  for (const auction of closedAuctions) {
    await determineWinner(auction)
  }
  
  return NextResponse.json({ closed: closedAuctions.length })
}
```

### 3. Composant UI

```tsx
// components/ui/WeeklyScheduleBanner.tsx
export function WeeklyScheduleBanner() {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Dimanche, 1=Lundi, ..., 5=Vendredi
  const hour = now.getHours()
  
  // Lundi-Mercredi (jours 1-3)
  if (dayOfWeek >= 1 && dayOfWeek <= 3) {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <h3 className="font-bold text-blue-800">
          📱 Mode Prévisualisation
        </h3>
        <p className="text-blue-700">
          Les enchères débuteront <strong>jeudi à minuit</strong>
        </p>
        <Countdown target="jeudi 00:00" />
      </div>
    )
  }
  
  // Jeudi-Vendredi midi (enchères actives)
  if (dayOfWeek === 4 || (dayOfWeek === 5 && hour < 12)) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
        <h3 className="font-bold text-green-800">
          🔥 Enchères en cours !
        </h3>
        <p className="text-green-700">
          Clôture <strong>vendredi à 12h00</strong>
        </p>
        <Countdown target="vendredi 12:00" />
      </div>
    )
  }
  
  // Vendredi après-midi - Dimanche
  return (
    <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
      <h3 className="font-bold text-gray-800">
        ✅ Enchères terminées
      </h3>
      <p className="text-gray-700">
        Prochaines enchères : <strong>lundi prochain</strong>
      </p>
    </div>
  )
}
```

---

## 📱 Expérience Utilisateur

### Mode Prévisualisation (Lundi-Mercredi)

**Page d'accueil** :
```
┌─────────────────────────────────────────┐
│  🗓️ Prochaines Enchères                 │
│  Jeudi 00h00 - Vendredi 12h00          │
│                                         │
│  ⏰ Ouverture dans: 2j 14h 30min       │
│                                         │
│  [Voir les lots] [Activer alertes]     │
└─────────────────────────────────────────┘
```

**Carte produit** :
```
┌──────────────────────┐
│ [Image]              │
│ 🕐 Enchères dès     │
│    Jeudi 00h00      │
├──────────────────────┤
│ Mercedes GLE 2023    │
│ Prix départ:         │
│ 15 000 000 FCFA     │
│                      │
│ [❤️ Suivre]         │
│ [Détails]           │
└──────────────────────┘
```

### Mode Actif (Jeudi-Vendredi)

**Carte produit** :
```
┌──────────────────────┐
│ [Image]              │
│ ⏰ Fin dans:        │
│    12h 30min        │
├──────────────────────┤
│ Mercedes GLE 2023    │
│ Enchère actuelle:    │
│ 16 500 000 FCFA     │
│ 🔥 23 enchères      │
│                      │
│ [Faire une offre]   │
└──────────────────────┘
```

---

## 🎯 Configuration Admin

### Interface de Planification

```tsx
// app/(dashboard)/admin/weekly-schedule/page.tsx
export default function WeeklySchedulePage() {
  return (
    <div>
      <h1>Planification Hebdomadaire</h1>
      
      {/* Semaine en cours */}
      <WeekTimeline currentWeek={currentWeek} />
      
      {/* Lots à planifier */}
      <LotScheduler 
        onSchedule={(lotId, week) => {
          // Assigner lot à une semaine
        }}
      />
      
      {/* Calendrier des prochaines semaines */}
      <UpcomingWeeks weeks={nextWeeks} />
    </div>
  )
}
```

---

## 📊 Métriques & Analytics

### KPIs à Suivre

- 📈 **Taux de conversion Preview → Bid**
- ⏰ **Heure pic des enchères**
- 💰 **Augmentation moyenne du prix**
- 👥 **Participants par semaine**
- 🔔 **Taux d'ouverture notifications**

---

## ✅ Checklist d'Implémentation

- [ ] Migration DB (dates planning)
- [ ] Fonction calcul dates hebdo
- [ ] Cron job ouverture (jeudi 00h)
- [ ] Cron job clôture (vendredi 12h)
- [ ] Composant WeeklyScheduleBanner
- [ ] Mode preview sur cartes
- [ ] Notifications ouverture
- [ ] Notifications clôture
- [ ] Interface admin planning
- [ ] Tests cycle complet

---

**Ce système garantit un cycle régulier et prévisible pour maximiser l'engagement ! 🚀**
