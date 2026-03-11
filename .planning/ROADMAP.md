# Roadmap: Taco Domains

## Overview

Taco Domains transforms an existing static landing page into a full-stack Next.js domain registrar application. The build follows the natural registrar hierarchy: foundation and user accounts first, then domain search (the entry point), registration and management (the core value), DNS configuration (ongoing utility), and finally marketplace (social/trading layer). Each phase delivers a complete, usable increment -- after Phase 2 users can search domains, after Phase 3 they can register and manage them, and so on through the full registrar experience.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation and Authentication** - Project scaffold, database, auth system, design system, and responsive layout
- [ ] **Phase 2: Domain Search and Landing Page** - Real-time RDAP search, TLD pricing, bulk search, and the public landing page
- [ ] **Phase 3: Domain Registration and Dashboard** - Registration flow, management dashboard, renewals, domain lock, WHOIS privacy, and URL redirects
- [ ] **Phase 4: DNS Management** - Full CRUD for DNS records, domain selector, and DNSSEC toggle
- [ ] **Phase 5: Marketplace** - Buy/sell listings, auctions with bidding, Buy Now, and ownership transfer on sale

## Phase Details

### Phase 1: Foundation and Authentication
**Goal**: Users can create accounts, log in, and navigate a polished taco-themed application shell with responsive design
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, UI-01, UI-02
**Success Criteria** (what must be TRUE):
  1. User can sign up with email and password, then land on a logged-in dashboard shell
  2. User can log in and their session survives a full browser refresh without re-authentication
  3. User can log out from any page in the application and is redirected to the public landing area
  4. User can trigger a password reset email and set a new password via the reset link
  5. User can update their display name and avatar from a profile settings page
  6. The application renders correctly on mobile (375px), tablet (768px), and desktop (1440px) viewports with the taco-themed dark design
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — Next.js scaffold, Prisma schema, Tailwind v4 taco theme, RegistrarAdapter interface
- [ ] 01-02-PLAN.md — Auth.js v5 setup, signup/login/logout flows, route protection middleware
- [ ] 01-03-PLAN.md — Reusable UI components (Button, Input, Card), public navbar, dashboard sidebar layouts
- [ ] 01-04-PLAN.md — Password reset flow, profile settings page, end-to-end verification checkpoint

### Phase 2: Domain Search and Landing Page
**Goal**: Users can search for domain availability in real-time and see the full public landing page with hero, features, and pricing
**Depends on**: Phase 1
**Requirements**: SRCH-01, SRCH-02, SRCH-03, SRCH-04, SRCH-05, UI-03
**Success Criteria** (what must be TRUE):
  1. User can type a domain name and see real-time availability results across multiple TLDs via server-side RDAP lookups (no CORS issues)
  2. User can see pricing per TLD displayed alongside each search result
  3. User can search multiple domain names at once (bulk search) and see consolidated results
  4. User sees alternative name suggestions when their first-choice domain is taken
  5. User cannot submit an invalid domain name -- names are validated per RFC 5891 with clear error messages before any search executes
  6. The public landing page displays hero section, domain search bar, feature highlights, and pricing tiers
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Domain Registration and Dashboard
**Goal**: Users can register domains and manage their entire portfolio through a comprehensive dashboard
**Depends on**: Phase 2
**Requirements**: DOMN-01, DOMN-02, DOMN-03, DOMN-04, DOMN-05, DOMN-06, DOMN-07
**Success Criteria** (what must be TRUE):
  1. User can complete a domain registration flow from search results through to a confirmed registration (simulated backend) and see the new domain in their dashboard immediately
  2. User can view all owned domains in a dashboard showing status badges, expiry dates, and summary statistics
  3. User can toggle auto-renew, domain transfer lock, and WHOIS privacy per domain with immediate visual feedback
  4. User sees a clear warning banner or notification for any domains expiring within 30 days
  5. User can configure HTTP/HTTPS URL redirects for any owned domain
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: DNS Management
**Goal**: Users can fully configure DNS records for their domains through an intuitive editor
**Depends on**: Phase 3
**Requirements**: DNS-01, DNS-02, DNS-03
**Success Criteria** (what must be TRUE):
  1. User can create, view, edit, and delete DNS records of types A, AAAA, CNAME, MX, and TXT for any owned domain
  2. User can select which domain to manage DNS for via a domain selector and the editor loads that domain's existing records
  3. User can toggle DNSSEC on or off per domain
  4. Invalid DNS configurations are rejected with clear error messages (e.g., CNAME at apex, CNAME coexisting with other record types at same name)
**Plans**: TBD

Plans:
- [ ] 04-01: TBD

### Phase 5: Marketplace
**Goal**: Users can buy and sell domains through fixed-price listings and timed auctions
**Depends on**: Phase 3
**Requirements**: MRKT-01, MRKT-02, MRKT-03, MRKT-04, MRKT-05, MRKT-06
**Success Criteria** (what must be TRUE):
  1. User can list an owned domain for sale as either a fixed-price listing or a timed auction
  2. User can browse and search all marketplace listings with relevant filters
  3. User can place bids on auction listings and see a live countdown timer with full bid history
  4. User can instantly purchase a fixed-price listing via Buy Now
  5. When a sale completes (auction ends or Buy Now executes), domain ownership transfers to the buyer and both parties see updated dashboards
**Plans**: TBD

Plans:
- [ ] 05-01: TBD
- [ ] 05-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Authentication | 0/4 | Planning complete | - |
| 2. Domain Search and Landing Page | 0/? | Not started | - |
| 3. Domain Registration and Dashboard | 0/? | Not started | - |
| 4. DNS Management | 0/? | Not started | - |
| 5. Marketplace | 0/? | Not started | - |
