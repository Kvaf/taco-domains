# Requirements: Taco Domains

**Defined:** 2026-03-11
**Core Value:** Users can search, register, and manage domains through a polished, intuitive interface with a fun taco-themed brand

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can create account with email and password
- [ ] **AUTH-02**: User can log in and session persists across browser refresh
- [ ] **AUTH-03**: User can log out from any page
- [ ] **AUTH-04**: User can reset password via email link
- [ ] **AUTH-05**: User can update profile (display name, avatar)

### Domain Search

- [ ] **SRCH-01**: User can search for domain availability across multiple TLDs in real-time via RDAP
- [ ] **SRCH-02**: User can see pricing per TLD in search results
- [ ] **SRCH-03**: User can bulk search multiple domains at once
- [ ] **SRCH-04**: User sees alternative name suggestions when first choice is taken
- [ ] **SRCH-05**: Domain names are validated per RFC 5891 before searching

### Domain Registration & Management

- [ ] **DOMN-01**: User can register a domain through the registration flow (simulated backend)
- [ ] **DOMN-02**: User can view all owned domains in a dashboard with status and expiry dates
- [ ] **DOMN-03**: User can toggle auto-renew per domain
- [ ] **DOMN-04**: User can lock/unlock domain transfers
- [ ] **DOMN-05**: User can toggle WHOIS privacy (free, default-on)
- [ ] **DOMN-06**: User receives expiry warnings for domains expiring within 30 days
- [ ] **DOMN-07**: User can set up HTTP/HTTPS URL redirects for their domains

### DNS Management

- [ ] **DNS-01**: User can create, read, update, and delete DNS records (A, AAAA, CNAME, MX, TXT)
- [ ] **DNS-02**: User can select which domain to manage DNS for
- [ ] **DNS-03**: User can toggle DNSSEC per domain

### Marketplace

- [ ] **MRKT-01**: User can list owned domains for sale (fixed price or auction)
- [ ] **MRKT-02**: User can browse and search marketplace listings
- [ ] **MRKT-03**: User can place bids on auction listings
- [ ] **MRKT-04**: User can Buy Now on fixed-price listings
- [ ] **MRKT-05**: Auction listings show countdown timer and bid history
- [ ] **MRKT-06**: Domain ownership transfers to buyer on successful sale

### UI & Design

- [ ] **UI-01**: Refreshed taco-themed dark design converted to React components
- [ ] **UI-02**: Responsive layout (mobile, tablet, desktop)
- [ ] **UI-03**: Landing page with hero, search, features, pricing sections

## v2 Requirements

### Authentication

- **AUTH-06**: User can log in with OAuth (Google, GitHub)
- **AUTH-07**: User can enable 2FA

### Domain Management

- **DOMN-08**: User can initiate domain transfer (simulated, EPP code input)
- **DOMN-09**: User can set up domain parking pages

### DNS Management

- **DNS-04**: DNS records validated per RFC (CNAME conflicts, apex restrictions)
- **DNS-05**: User can import/export zone files
- **DNS-06**: User can apply DNS templates (e.g., "Shopify setup", "WordPress setup")

### Developer & Extras

- **DEV-01**: REST API for domain/DNS operations
- **DEV-02**: Pricing tiers with feature gating (Mild/Medium/Extra Spicy)
- **DEV-03**: Chatbot (Taco Bot) with keyword matching
- **DEV-04**: Keyboard shortcuts (/ to search, Escape to close)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real ICANN/registrar integration | Simulated backend for now, adapter pattern enables future swap |
| Payment processing (Stripe) | Build UI flows first, integrate payments later |
| Real email forwarding / MX handling | UI only, no actual mail routing |
| Real SSL certificate provisioning | UI mockup only |
| Mobile native app | Web-first, responsive design |
| Web hosting | Out of scope for domain registrar |
| Domain valuation/appraisal | Defer to v2+ |
| Referral/affiliate system | Defer to v2+ |
| Multi-language/i18n | English only for v1 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| AUTH-03 | Phase 1 | Pending |
| AUTH-04 | Phase 1 | Pending |
| AUTH-05 | Phase 1 | Pending |
| SRCH-01 | Phase 2 | Pending |
| SRCH-02 | Phase 2 | Pending |
| SRCH-03 | Phase 2 | Pending |
| SRCH-04 | Phase 2 | Pending |
| SRCH-05 | Phase 2 | Pending |
| DOMN-01 | Phase 3 | Pending |
| DOMN-02 | Phase 3 | Pending |
| DOMN-03 | Phase 3 | Pending |
| DOMN-04 | Phase 3 | Pending |
| DOMN-05 | Phase 3 | Pending |
| DOMN-06 | Phase 3 | Pending |
| DOMN-07 | Phase 3 | Pending |
| DNS-01 | Phase 4 | Pending |
| DNS-02 | Phase 4 | Pending |
| DNS-03 | Phase 4 | Pending |
| MRKT-01 | Phase 5 | Pending |
| MRKT-02 | Phase 5 | Pending |
| MRKT-03 | Phase 5 | Pending |
| MRKT-04 | Phase 5 | Pending |
| MRKT-05 | Phase 5 | Pending |
| MRKT-06 | Phase 5 | Pending |
| UI-01 | Phase 1 | Pending |
| UI-02 | Phase 1 | Pending |
| UI-03 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-11*
*Last updated: 2026-03-11 after initial definition*
