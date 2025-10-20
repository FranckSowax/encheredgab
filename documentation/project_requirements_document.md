# Project Requirements Document

## 1. Project Overview

We are building a web and mobile auction platform dedicated to selling goods seized by the Gabon customs authorities. Every week, customs’ teams photograph and upload seized items in batches (called “lots”) from Monday morning to Wednesday evening. On Thursday, users compete in real-time online auctions, and on Friday they complete payment—either in cash or via Airtel Money / Moov Money. The system then offers delivery (flat-rate per zone) or free pickup at the depot, with QR codes and WhatsApp confirmations. Non-paid lots automatically relist in the next weekly cycle, and high-value lots (> 1 000 000 FCFA) are reserved for in-person Friday auctions by appointment.

The platform addresses the need for transparency, efficiency, and reach in selling seized goods. Key objectives include an ultra-fluid, robust bidding engine that works over spotty networks, strict KYC to prevent fraud, a multi-role dashboard for admins, photo teams, and customs officers, plus a user wallet (“cagnotte”) for remote participation in premium auctions. Success means stable real-time bidding for hundreds of simultaneous users, sub-200 ms bid updates, 99.9% uptime during peak periods, and smooth payment and delivery flows.

## 2. In-Scope vs. Out-of-Scope

**In-Scope (Version 1)**

*   Weekly cycle: listing (Mon 08:00–Wed 18:00), bidding (Thu 08:00–20:00), payment (Fri 08:00–15:00)
*   User registration with KYC (ID upload)
*   Real-time bidding engine (Supabase Realtime) with live countdown and bid increments
*   Payment integration via third-party for Airtel Money & Moov Money, plus cash-recording in admin
*   Admin dashboard for managing lots, users, payments, exclusions, relistings
*   Roles & permissions: bidder, photo team, admin, customs
*   Segmented auctions by price brackets (< 50 000 FCFA; 50 000–200 000 FCFA; 200 000–1 000 000 FCFA; > 1 000 000 FCFA offline)
*   Delivery/pickup selection with flat-rate fees, QR code generation, WhatsApp confirmation
*   “Cagnotte” wallet: deposit, block funds, refund within 48 h, withdrawal restrictions
*   PWA for low-connectivity and React Native mobile apps for iOS/Android
*   Multi-channel notifications: SMS, email, push, WhatsApp API
*   Basic AI (GPT-4o) for auto-generating descriptions and moderating images/text

**Out-of-Scope (Phase 2+)**

*   Dynamic zone-based shipping rate calculation in real time (starts with flat-rate)
*   Additional payment methods (credit card, mobile wallets beyond Airtel/Moov)
*   In-depth AI fraud detection beyond simple anomaly alerts
*   Multi-language UI (initially French-first)
*   Invoicing module or tax/ERP integration
*   Advanced analytics or BI dashboards for customs

## 3. User Flow

A new user lands on the responsive web or PWA welcome screen that highlights the current auction phase. They tap “Join Now,” enter email, phone, create a password, then upload a government-issued ID for KYC verification. Once approved by the admin team, they see a dashboard showing ongoing and upcoming auctions, with clear tabs for Catalog, Live Bidding, Payments, and Profile. Browsing the catalog, they filter by price bracket or category, view lot details (photo carousel, AI-generated description, current highest bid, countdown), and place bids when Thursday’s session is live.

On Thursday, the interface transforms into a live auction view: a top countdown bar, real-time bid updates via Supabase Realtime, quick-access bid buttons, and display of the user’s wallet/cagnotte balance. If the user wins by 20:00, they get in-app, SMS, and WhatsApp notifications prompting payment on Friday between 08:00 and 15:00. They choose Airtel Money, Moov Money, or “cash on delivery” (admin records), confirm, and receive a QR code plus WhatsApp confirmation. Finally, they select delivery (flat-rate) or free depot pickup. Their Profile section tracks transaction history, cagnotte balance, and upcoming premium auctions if they have ≥ 1 000 000 FCFA blocked.

## 4. Core Features

*   **Product & Lot Management**

    *   Photo team uploads multiple images, categories, starting bid, reserve price
    *   AI-assisted description generation and content moderation
    *   Automatic relisting of unpaid lots in next weekly cycle with “relisted” badge

*   **Real-Time Auction Engine**

    *   Supabase Realtime for bid updates (< 200 ms latency)
    *   Countdown timer, bid increment rules, concurrency control, offline bid queuing

*   **Secure Payments**

    *   Airtel Money & Moov Money via third-party API integration
    *   Cash payment recording in admin dashboard
    *   Strict Friday window, auto-exclusion for missed payments

*   **User Wallet (Cagnotte)**

    *   Deposit via mobile money or cash, immediate fund blocking
    *   Refund unused balance within 48 h, withdrawal restrictions on active bids

*   **Admin Dashboard**

    *   Role-based access: admin, photo team, customs
    *   Manage users, KYC approvals, lots, payments, exclusions, notifications
    *   Audit logs for every action

*   **Multi-Channel Notifications**

    *   SMS, email, push, WhatsApp alerts for phase transitions, bid status, payments, delivery

*   **Delivery & Pickup**

    *   Flat-rate delivery by zone, free depot pickup
    *   QR code generation and WhatsApp confirmation

*   **Segmentation & Special Auctions**

    *   Price brackets: < 50 000; 50 000–200 000; 200 000–1 000 000 FCFA (online)
    *   1 000 000 FCFA lots: physical auctions by appointment on Friday

*   **Authentication & KYC**

    *   Email/phone login, password, ID upload, admin verification
    *   Role-based access control

## 5. Tech Stack & Tools

*   **Frontend Web**

    *   Next.js 14 (App Router) with TypeScript
    *   Tailwind CSS + shadcn UI components
    *   PWA support (service workers, offline caching)

*   **Mobile App**

    *   React Native (TypeScript) for iOS & Android
    *   Shared component library for consistency

*   **Backend & Realtime**

    *   Supabase Auth, Database, Storage, Realtime
    *   Serverless functions (Edge Runtime) for webhooks & custom logic

*   **Payments & Notifications**

    *   Airtel Money & Moov Money via third-party payment provider
    *   SMS (Twilio or local SMS API), email (SendGrid / Mailgun), push notifications, WhatsApp API

*   **AI Integration**

    *   GPT-4o for description generation & content moderation
    *   Lightweight anomaly detection scripts for bidding patterns

*   **IDE & Plugins**

    *   VS Code with Cursor AI plugin, Windsurf for Supabase queries

## 6. Non-Functional Requirements

*   **Performance**

    *   Bid update latency < 200 ms under 500+ concurrent users
    *   Initial page load < 3 s on 3G networks; full interactivity within 5 s

*   **Scalability**

    *   Auto-scaling Supabase Realtime listeners to handle peak Thursday traffic

*   **Security & Compliance**

    *   Encrypt PII at rest and in transit (TLS & column-level encryption)
    *   GDPR-like compliance for personal data, KYC document storage
    *   Role-based access control, audit logging

*   **Usability & Accessibility**

    *   Mobile-first, WCAG AA accessibility standards
    *   Graceful offline support with local bid queueing

*   **Reliability**

    *   99.9% uptime during auction windows
    *   Automated health checks and alerts

## 7. Constraints & Assumptions

*   **Third-Party Dependencies**

    *   Airtel Money & Moov Money APIs must be available via selected provider sandbox
    *   WhatsApp Business API rate limits apply

*   **Network Environment**

    *   Many users on 3G or worse; PWA fallback and caching required

*   **Weekly Schedule**

    *   Strict cycle: Mon 08:00–Wed 18:00 listing; Thu 08:00–20:00 bidding; Fri 08:00–15:00 payments

*   **User Base**

    *   ~1 000 active users, hundreds of simultaneous bidders each Thursday

*   **AI Usage**

    *   GPT-4o only for non-critical tasks (descriptions, moderation) to avoid unpredictable outputs

## 8. Known Issues & Potential Pitfalls

*   **Realtime Race Conditions**

    *   Mitigate by optimistic locking, bid queuing on reconnect, server-side bid validation

*   **Payment Failures & Delays**

    *   Implement retry logic, manual fallback in admin, clear user messaging on errors

*   **API Rate Limits**

    *   Cache WhatsApp templates, batch SMS where possible, back-off on 429 errors

*   **Network Instability**

    *   PWA offline storage of user bids; sync on reconnect; show warnings for stale data

*   **KYC Verification Bottleneck**

    *   Offer bulk approval tools for admin, automated checks for document validity

This PRD provides a clear blueprint for the AI-driven generation of subsequent technical documents: tech stack deep dive, frontend guidelines, backend architecture, security policies, and flowcharts—ensuring no ambiguity or missing information.
