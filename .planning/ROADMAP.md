# Roadmap: Taco Domains

**Created:** 2026-03-11
**Granularity:** Standard (5-8 phases)
**Total v1 Requirements:** 66
**Mapped:** 66 / 66 ✓

---

## Phases

- [ ] **Phase 1: Foundation & Landing** - Shared infrastructure, CSS system, mock data schemas, and landing page with hero, features, testimonials
- [ ] **Phase 2: Domain Search & Discovery** - Search functionality with TLD selector, availability checking, random suggestions, and results display
- [ ] **Phase 3: Cart & Checkout** - Shopping cart management, checkout flow, transparent pricing, and order summary
- [ ] **Phase 4: Dashboard & Domain Management** - Centralized dashboard with domain listings, filtering, renewal management, and transfer info
- [ ] **Phase 5: DNS & Email Configuration** - DNS record editor, email forwarding rules, MX wizard, validation, and help guidance
- [ ] **Phase 6: Security - Guac Guard** - SSL/TLS management, WHOIS privacy, 2FA toggle, registry lock, and unified security dashboard
- [ ] **Phase 7: Marketplace & Shortlinks** - Marketplace browsing, auctions, bid system, shortlink creation, and click analytics
- [ ] **Phase 8: Billing, API & Support** - Billing management, team permissions, referral program, API documentation, and support section

---

## Phase Details

### Phase 1: Foundation & Landing

**Goal:** Users experience a fun, branded landing page that introduces the platform and establishes confident first impression with responsive design throughout.

**Depends on:** None (first phase)

**Requirements:** LAND-01, LAND-02, LAND-03, LAND-04, LAND-05, LAND-06, LAND-07, LAND-08, LAND-09, UX-01, UX-02, UX-03, UX-04, UX-05

**Success Criteria** (observable user behaviors):
1. User lands on homepage and immediately sees animated hero section with floating taco elements and domain search entry point
2. User can navigate entire site via responsive header (desktop nav + mobile hamburger menu) and footer links on any device size
3. User sees feature highlight cards, auto-rotating testimonials with dots, and "How It Works" section without needing to scroll excessively
4. User can interact with all pages via keyboard alone — tab navigation, enter to submit, visible focus indicators throughout
5. User experiences playful, consistent taco branding (color palette, Poppins typography, themed copy like "Frijoles Faltan!" for errors) across all pages

**Plans:** TBD

---

### Phase 2: Domain Search & Discovery

**Goal:** Users can find available domains quickly through flexible search options (single, bulk, random suggestions) with clear pricing and availability status.

**Depends on:** Phase 1

**Requirements:** SRCH-01, SRCH-02, SRCH-03, SRCH-04, SRCH-05, SRCH-06, SRCH-07

**Success Criteria** (observable user behaviors):
1. User types a domain name in search bar, selects TLD from dropdown (.com, .io, .xyz, .net, .org, etc.), and sees real-time availability + pricing for each option
2. User searches multiple domains at once via bulk search and sees all results with available/taken/premium status indicators
3. User clicks "Get Random Domain" and receives one or more playful suggestions matching their query intent
4. User adds WHOIS privacy protection toggle during search and sees price update reflect privacy add-on
5. User's search results clearly show registration price, renewal price, and premium markups — no hidden fees

**Plans:** TBD

---

### Phase 3: Cart & Checkout

**Goal:** Users confidently add domains to cart and complete a checkout flow with transparent pricing and persistent cart state.

**Depends on:** Phase 2

**Requirements:** CART-01, CART-02, CART-03, CART-04, CART-05, CART-06

**Success Criteria** (observable user behaviors):
1. User adds one or more domains from search results to cart and sees cart counter update; can remove items at any time
2. User views cart page showing all selected domains, add-ons, and line-by-line pricing breakdown with totals
3. User navigates away from cart (to search or other pages) and returns to find cart contents unchanged (localStorage persistence)
4. User proceeds through checkout flow, enters contact/billing information, and sees order review before final submission
5. User sees transparent pricing throughout checkout — registration fees, renewal fees, add-ons all clearly itemized with no surprise costs

**Plans:** TBD

---

### Phase 4: Dashboard & Domain Management

**Goal:** Users see all owned domains in one place with easy filtering, renewal management, and transfer information.

**Depends on:** Phase 3

**Requirements:** DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06

**Success Criteria** (observable user behaviors):
1. User logs into dashboard and sees table or card view of all owned domains (mock data) with current status, expiration dates, and renewal info
2. User can filter domains by name/keyword and sort by expiration date or status; results update immediately
3. User sees visual warning for domains expiring soon (red badge, countdown timer) and can quickly toggle auto-renewal
4. User can access domain forwarding and parking configuration from domain detail view; sees clear setup instructions
5. User can view EPP code, transfer guide, and transfer status for any owned domain; understands how to move domain to another registrar

**Plans:** TBD

---

### Phase 5: DNS & Email Configuration

**Goal:** Users can configure DNS records and email forwarding through guided, validated workflows with clear documentation and error prevention.

**Depends on:** Phase 4

**Requirements:** DNS-01, DNS-02, DNS-03, DNS-04, DNS-05, DNS-06, DNS-07, MAIL-01, MAIL-02, MAIL-03

**Success Criteria** (observable user behaviors):
1. User clicks into domain's DNS section and sees all current records (A, CNAME, MX, TXT, NS) in organized table; can add, edit, delete with confirmation dialogs
2. User adds new DNS record, fills in type/name/value/TTL fields, and sees real-time validation errors if config is broken (e.g., CNAME conflicts, invalid format)
3. User hovers over record type and sees help tooltip explaining what the record does with real example values
4. User selects quick setup template (e.g., "Setup Email" or "Point to Shopify") and wizard populates recommended records with explanations
5. User configures email forwarding by selecting rules (contact@domain → personal email) and following MX wizard; sees clear explanations of what each field does

**Plans:** TBD

---

### Phase 6: Security - Guac Guard

**Goal:** Users see unified security dashboard ("Guac Guard") where they can manage SSL certificates, WHOIS privacy, 2FA, and registry lock.

**Depends on:** Phase 4

**Requirements:** SEC-01, SEC-02, SEC-03, SEC-04, SEC-05

**Success Criteria** (observable user behaviors):
1. User navigates to "Guac Guard" security panel and sees all security features in one unified dashboard with clear status indicators
2. User can view and manage SSL/TLS certificates (free and premium options) with renewal dates and installation instructions
3. User can toggle WHOIS privacy protection on/off and sees price impact; understands what WHOIS privacy does
4. User can enable/disable 2FA and registry lock toggles with explanations of why these protect their domain (UI only for v1)
5. User understands which security features are included vs. paid, and can upgrade to premium security bundle as a package

**Plans:** TBD

---

### Phase 7: Marketplace & Shortlinks

**Goal:** Users can browse marketplace listings, place bids on auctions, create shortlinks, and view analytics.

**Depends on:** Phase 4

**Requirements:** MRKT-01, MRKT-02, MRKT-03, MRKT-04, LINK-01, LINK-02, LINK-03

**Success Criteria** (observable user behaviors):
1. User browses marketplace domain listings with search and filters (price, TLD, extension, etc.); can sort by newest, most bids, ending soon
2. User views auction listing with current bid amount, time remaining, bid history, and can place a bid (mock interaction) with confirmation
3. User can list owned domain for sale on marketplace (mock) with price, description, and auction vs. fixed price option
4. User creates branded shortlink (go.taco.domains/custom) and views click analytics dashboard showing clicks, referrers, geography
5. User creates vanity subdomain for marketing campaign (e.g., campaigns.taco.domains/holiday-sale) and sees shortlink alongside analytics

**Plans:** TBD

---

### Phase 8: Billing, API & Support

**Goal:** Users can manage billing, team permissions, API access, and access support resources including AI chatbot and educational guides.

**Depends on:** Phase 4

**Requirements:** BILL-01, BILL-02, BILL-03, BILL-04, BILL-05, API-01, API-02, API-03, SUPP-01, SUPP-02, SUPP-03

**Success Criteria** (observable user behaviors):
1. User accesses billing page, views subscription status, manages prepaid wallet/credits balance, and sees payment history (mock)
2. User manages team members, assigns permission tiers (admin/member/viewer), and controls billing access; sees clear descriptions of each tier
3. User views referral program showing "Taco Tokens" earned, referral link, and reward redemption options; can copy link to share
4. User navigates to API documentation, finds endpoint reference with curl/Node.js/Python code examples, reads authentication and webhook guides
5. User accesses support section with AI chatbot placeholder for quick answers, browses "Taco Tips" educational cards (e.g., "How to point domain to Shopify"), and explores FAQ accordion

**Plans:** TBD

---

## Progress Tracking

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Landing | 0/N | Not started | — |
| 2. Domain Search & Discovery | 0/N | Not started | — |
| 3. Cart & Checkout | 0/N | Not started | — |
| 4. Dashboard & Domain Management | 0/N | Not started | — |
| 5. DNS & Email Configuration | 0/N | Not started | — |
| 6. Security - Guac Guard | 0/N | Not started | — |
| 7. Marketplace & Shortlinks | 0/N | Not started | — |
| 8. Billing, API & Support | 0/N | Not started | — |

---

## Dependency Graph

```
Phase 1: Foundation & Landing
    ↓
Phase 2: Domain Search & Discovery
    ↓
Phase 3: Cart & Checkout
    ↓
Phase 4: Dashboard & Domain Management
    ├─→ Phase 5: DNS & Email Configuration
    ├─→ Phase 6: Security - Guac Guard
    └─→ Phase 7: Marketplace & Shortlinks
    ↓
Phase 8: Billing, API & Support
```

**Notes:**
- Phases 5, 6, 7 can execute in parallel after Phase 4 completes
- All phases depend on Phase 1 (foundation)
- Phase 8 is last (depends on at least Phase 4 for UI patterns)

---

*Roadmap created: 2026-03-11*
*Last updated: 2026-03-11*
