# Architecture: Taco Domains

**Domain:** Domain registration platform (static HTML/CSS/JS)
**Researched:** 2026-03-11

## System Overview

Multi-page static website with shared navigation, centralized mock data layer, and modular JavaScript. No backend — all data is mock JSON consumed by vanilla JS modules.

## Major Components

### 1. Shared Layout Layer
- **Header/Navigation**: Responsive nav bar with logo, links, mobile hamburger menu
- **Footer**: Links, social, legal, newsletter signup
- **Shared across all pages** via HTML includes or copy (with build-time templating as stretch goal)

### 2. Landing Page (index.html)
- Hero section with animated taco elements, domain search bar
- Feature highlights, testimonials carousel, pricing overview
- Partner logos, CTA sections, "How It Works"
- **Dependencies**: None (entry point)

### 3. Domain Search Module (search.html)
- Search input with TLD selector dropdown
- Availability results with pricing
- Domain suggestion generator
- Bulk search interface
- Add-to-cart functionality
- **Dependencies**: Mock data layer, Cart module

### 4. Shopping Cart & Checkout (checkout.html)
- Cart display with domain items, add-ons (WHOIS privacy, SSL)
- Pricing breakdown, promo code input
- Checkout form (contact info, billing — mock)
- **Dependencies**: Cart state (localStorage), Mock data layer

### 5. Dashboard Hub (dashboard.html)
- Domain list (table/card view toggle)
- Renewal status indicators, quick actions
- Filter/sort controls
- **Dependencies**: Mock user domains data, Cart state

### 6. DNS Management (dns.html)
- Record type selector, record list with inline edit
- Add/edit/delete records with validation
- Quick setup templates (email, web hosting)
- Propagation status indicator
- **Dependencies**: Dashboard (domain context), DNS mock data

### 7. Email Forwarding (email.html)
- MX configuration wizard
- Email forwarding rules
- **Dependencies**: DNS module (MX records)

### 8. SSL/Security — Guac Guard (security.html)
- SSL certificate management
- WHOIS privacy controls
- 2FA and registry lock toggles
- **Dependencies**: Dashboard (domain context)

### 9. Marketplace (marketplace.html)
- Domain listings with search/filter
- Auction UI with bidding
- Domain valuation display
- **Dependencies**: Mock marketplace data, Search module patterns

### 10. Shortlinks (shortlinks.html)
- Branded URL creator
- Click analytics dashboard
- **Dependencies**: Mock analytics data

### 11. API Documentation (api.html)
- Code examples (curl, Node.js, Python)
- Endpoint reference
- Authentication guide
- **Dependencies**: None (static content)

### 12. Billing & Account (billing.html)
- Subscription management, wallet/credits
- Team management, permission tiers
- Referral program ("Taco Tokens")
- **Dependencies**: Mock billing data

### 13. Support & Education (support.html)
- AI chatbot placeholder
- "Taco Tips" guide cards
- FAQ accordion
- **Dependencies**: None (static content)

## Data Flow

```
Mock Data Layer (JSON files + localStorage)
    ↓
API Abstraction Layer (src/api/*.js)
    ↓
Page Modules (src/pages/*.js)
    ↓
DOM Rendering
```

### Mock Data Layer
- `/data/domains.json` — available domains, pricing, TLDs
- `/data/user-domains.json` — "owned" domains for dashboard
- `/data/dns-records.json` — sample DNS records
- `/data/marketplace.json` — marketplace listings
- `/data/tlds.json` — supported TLDs with pricing
- `localStorage` — cart state, user preferences, session data

### API Abstraction
```
src/api/
  domains.js    — searchDomains(), checkAvailability(), getDomainDetails()
  dns.js        — getRecords(), addRecord(), updateRecord(), deleteRecord()
  cart.js       — getCart(), addToCart(), removeFromCart()
  marketplace.js — getListings(), placeBid()
  user.js       — getProfile(), getDomains()
```

Each module returns mock data now, swappable to real API later by changing the fetch URL.

## Suggested Build Order

```
Phase 1: Foundation
  └── Shared layout (nav, footer) + CSS system + mock data schema

Phase 2: Landing Page
  └── Hero, features, testimonials, search bar (links to search page)

Phase 3: Domain Search & Cart
  └── Search page + results + cart + checkout flow

Phase 4: Dashboard & DNS
  └── Domain management + DNS editor + email forwarding

Phase 5: Marketplace & Extras
  └── Marketplace, shortlinks, API docs, security bundle

Phase 6: Billing & Support
  └── Billing UI, team management, support section, referral program
```

### Why This Order
1. **Foundation first** — shared components prevent duplication
2. **Landing page second** — entry point, validates brand/UX
3. **Search third** — core product flow, highest value
4. **Dashboard fourth** — completes purchase-to-management loop
5. **Marketplace fifth** — secondary features, more complex
6. **Billing last** — depends on most other features existing

## File Structure

```
taco-domains/
├── index.html
├── search.html
├── checkout.html
├── dashboard.html
├── dns.html
├── email.html
├── security.html
├── marketplace.html
├── shortlinks.html
├── api.html
├── billing.html
├── support.html
├── css/
│   ├── base.css          (reset, variables, typography)
│   ├── components.css    (buttons, cards, forms, modals)
│   ├── layout.css        (nav, footer, grid)
│   └── pages/
│       ├── home.css
│       ├── search.css
│       ├── dashboard.css
│       └── ...
├── js/
│   ├── main.js           (shared init, nav, theme)
│   ├── api/              (mock data abstraction)
│   ├── components/       (reusable UI: carousel, modal, tabs)
│   └── pages/            (page-specific logic)
├── data/
│   ├── domains.json
│   ├── tlds.json
│   ├── dns-records.json
│   ├── marketplace.json
│   └── ...
├── assets/
│   ├── images/
│   ├── icons/
│   └── logos/
└── package.json
```
