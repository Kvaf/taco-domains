# Feature Landscape

**Domain:** Domain registrar web application (simulated backend)
**Researched:** 2026-03-11
**Confidence:** MEDIUM (based on extensive training knowledge of Namecheap, GoDaddy, Porkbun, Cloudflare Registrar, Squarespace Domains, Gandi, Hover; no live verification possible in this session)

## Competitive Landscape Context

The domain registrar market has a clear feature hierarchy. Registrars like **Cloudflare** compete on at-cost pricing and developer tooling. **Porkbun** wins on personality and transparent pricing. **Namecheap** covers the full feature range. **GoDaddy** upsells aggressively but has the broadest TLD coverage. **Squarespace Domains** (formerly Google Domains) focuses on simplicity and website builder integration. Understanding what each tier expects is critical for Taco Domains, which positions itself as a personality-driven registrar (think Porkbun's approachability meets Cloudflare's developer focus, wrapped in taco branding).

---

## Table Stakes

Features users expect from any domain registrar. Missing any of these and users leave immediately or never sign up.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Domain search with availability check** | The literal entry point for any registrar; users arrive to search | Medium | Already implemented via RDAP/DNS-over-HTTPS in existing landing page. Must support multi-TLD simultaneous checking. Every registrar has this front and center. |
| **Domain registration flow** | Core business function; users need to actually acquire domains | Medium | Simulated backend. Needs domain name + period selection + WHOIS privacy toggle + auto-renew toggle. Existing modal shows this pattern. |
| **WHOIS privacy protection** | Users expect privacy by default in 2026. Cloudflare, Porkbun, Namecheap all include free WHOIS privacy. GoDaddy charges extra (anti-pattern). | Low | Should be free and ON by default. Toggle to opt-out. GDPR made this essentially mandatory. |
| **Domain management dashboard** | Users need to see all their domains, statuses, expiry dates at a glance | High | Existing mockup has: domain list with status badges (Active/Expiring/Parked), expiry dates, SSL status, auto-renew toggles. Stats cards (total domains, active DNS zones, SSL certs, expiring soon). |
| **Auto-renew toggle** | Prevents accidental domain loss; every registrar offers this | Low | Per-domain toggle, already mocked in dashboard. Must be clearly visible and default-on. |
| **DNS record management** | Users need to point their domains somewhere; fundamental utility | High | A, AAAA, CNAME, MX, TXT records at minimum. Existing mockup shows: record type, name, value, TTL, edit/delete actions. Domain selector dropdown. Add record button. |
| **Domain transfer (inbound)** | Users switching registrars need a transfer flow; standard at every registrar | Medium | Requires EPP/auth code input. Existing chatbot mentions 5-7 day process. Simulated: accept code, mark domain as transferring, then complete. |
| **User accounts (auth)** | Domains are high-value assets; authentication is non-negotiable | Medium | Signup, login, password reset, profile management. Email/password at minimum. |
| **Renewal management** | Domains expire; users need to know when and take action | Low | Expiry date display, renewal action, expiring-soon warnings. Part of dashboard. |
| **TLD pricing display** | Users need to know what things cost before committing | Low | Show price per year per TLD. Already exists in search results and pricing page. Transparency is a competitive advantage (Cloudflare, Porkbun model). |
| **Responsive design** | 40-60% of web traffic is mobile; non-responsive is unacceptable | Medium | Existing CSS has responsive breakpoints at 900px and 600px. Must carry over to React components. |
| **Domain locking** | Prevents unauthorized transfers; standard security feature | Low | Simple toggle: locked/unlocked. Domains should be locked by default. |

---

## Differentiators

Features that set Taco Domains apart. Not necessarily expected, but valued when present. Ordered by impact-to-effort ratio.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Real-time RDAP availability checking** | Most registrar searches hit internal databases (stale). Taco Domains already checks live via RDAP and DNS-over-HTTPS. This is genuinely impressive for a branded registrar. | Already built | Preserve and enhance. This is an actual differentiator over registrars with cached availability data. |
| **Bulk domain search** | Power users checking many names at once. Porkbun and Namecheap offer this; smaller registrars often do not. | Low | Already mocked with textarea input. One domain per line, parallel checking. |
| **Domain marketplace with auctions** | Buy/sell/bid on domains. GoDaddy Auctions, Sedo, Afternic exist as separate platforms. Having it integrated into the registrar is a Namecheap-style differentiator. | High | Existing mockup shows: current bid, bid count, views, countdown timer, "Place Bid" / "Buy Now" actions. Premium/expiring/trending categories. Secure escrow mentioned. |
| **Taco-themed branding and UX personality** | Porkbun proved that fun branding can be a serious competitive advantage. The taco theme with fire/lime/cyan gives memorable identity in a commodity market. | Medium | Not a feature per se, but a product differentiator. "Taco Specials," "Spicy Mode," "Guac Guard" -- these branded feature names create stickiness. |
| **Developer API** | Cloudflare and Namecheap attract developers with APIs. Having REST endpoints for domain and DNS automation is table stakes for developer-focused registrars but a differentiator in the broader market. | High | Existing mockup shows Node.js, Python, cURL examples. API key auth. Search + register endpoints. Mentioned: webhooks, CLI tool, SDKs. For simulated backend, API is just a facade over the same DB operations. |
| **Domain name suggestions/brainstorming** | Help users find the right name when their first choice is taken. GoDaddy and Namecheap do this. Porkbun does not. | Medium | Listed in services strip as "Domain Brainstorming." Could be algorithmic (prefix/suffix/synonym) or AI-powered. Nice touch when a .com search returns "Taken." |
| **Keyboard shortcuts** | Existing `"/"` to focus search and `Escape` to close modals. Power user features that differentiate from clunky registrar UIs. | Low | Already partially implemented. Expand to dashboard navigation. |
| **Chatbot/support assistant** | Existing "Taco Bot" with keyword matching. Differentiates from registrars with only ticket-based support. | Low-Medium | Already implemented as simple keyword matcher. Could be enhanced but the basic version works. |
| **DNSSEC toggle** | Security-conscious users expect this. Cloudflare enables it by default. Namecheap supports it. Many smaller registrars do not. | Low | Already mocked in DNS editor as a toggle. Simulated: just a flag in the database. |
| **Zone file import/export** | Power users migrating from other registrars or managing DNS externally. Cloudflare and Namecheap support this. | Medium | Mocked as buttons in DNS editor toolbar. Import parses BIND zone format; export generates it. |
| **Pricing tiers with subscription model** | Existing landing page shows Mild ($0), Medium ($9/mo), Extra Spicy ($29/mo). Creates recurring revenue, not just per-domain fees. Unique positioning vs per-domain-only registrars. | Medium | Simulated: user has a plan tier that gates features (API access, domain limits, team billing, etc.). |
| **Domain parking page** | When a domain is registered but not pointed anywhere, show a branded parking page. GoDaddy and Namecheap do this. | Low | "Parked" status already shown in dashboard mockup. Serve a simple branded page for domains with no DNS records configured. |

---

## Anti-Features

Features to deliberately NOT build. These either add complexity without value, create bad user experience, or are out of scope per project constraints.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Aggressive upselling on domain search results** | GoDaddy's #1 complaint. Pushing hosting, email, SSL, "premium DNS" on every search result destroys trust. Porkbun and Cloudflare succeed precisely by NOT doing this. | Show clean search results with availability and price. Let the dashboard surface additional services contextually. |
| **Real ICANN/registrar integration** | Explicitly out of scope. Would require ICANN accreditation, EPP protocol implementation, registry agreements, escrow requirements. Massive complexity. | Simulated backend with swappable service layer. Design interfaces as if real API will plug in later. |
| **Payment processing** | Explicitly out of scope. Stripe/PayPal integration adds PCI compliance concerns, webhook handling, subscription management. | Build the UI flows (cart, checkout page) but stub the payment step. "Register" completes immediately in simulation. |
| **Real email forwarding/MX handling** | Would require mail server infrastructure, spam filtering, DKIM/SPF management. Massive operational overhead. | UI-only. Users can configure MX records in DNS editor (which they'd need for any email provider), but Taco Domains itself does not handle email routing. |
| **SSL certificate provisioning** | Would require ACME integration, certificate storage, renewal automation, CDN/proxy layer. | UI mockup. Dashboard shows SSL status but it is display-only. The DNS records a user configures would be for their own hosting, which would handle SSL. |
| **Web hosting** | Listed in services strip but out of scope. Would require server infrastructure, deployment pipelines, resource management. | Remove from active features or label as "Coming Soon." Domain registrars can exist without hosting (Cloudflare Registrar, Porkbun). |
| **Domain valuation/appraisal** | GoDaddy offers this but it is notoriously inaccurate and gives users false expectations. Adds complexity to marketplace. | For marketplace, let sellers set their own prices. No automated "your domain is worth $X." |
| **Mobile native app** | Explicitly out of scope. Web-first responsive design covers mobile use cases for a domain registrar (not a high-frequency daily-use app). | Ensure responsive design works well on mobile browsers. PWA could be a future enhancement. |
| **Multi-language/i18n** | Adds significant complexity for string management, RTL support, IDN handling. Not needed for MVP. | English only. Use Next.js i18n infrastructure so it can be added later, but do not implement translations. |
| **Real-time collaborative editing** | Multiple team members editing DNS records simultaneously is an edge case. WebSocket infrastructure adds complexity. | Optimistic locking / last-write-wins is sufficient. Show "last modified by" timestamps. |
| **Referral/affiliate system** | Mentioned in pricing mockup ("referral rewards"). Requires tracking, payout logic, fraud detection. | Defer entirely. Can be added post-MVP if the marketplace takes off. |

---

## Feature Dependencies

```
User Accounts (auth)
  |-> Domain Registration (requires authenticated user to own domains)
  |-> Domain Management Dashboard (requires user with domains)
  |     |-> Renewal Management (requires domain with expiry tracking)
  |     |-> Auto-Renew Toggle (requires domain record)
  |     |-> Domain Locking (requires domain record)
  |-> DNS Record Management (requires user-owned domain to edit records)
  |     |-> DNSSEC Toggle (sub-feature of DNS management)
  |     |-> Zone Import/Export (sub-feature of DNS management)
  |-> Marketplace (requires authenticated user to buy/sell)
  |     |-> Auction System (requires marketplace infrastructure)
  |     |-> Buy Now / Make Offer (requires marketplace infrastructure)
  |-> Pricing/Subscription Tiers (requires user account for plan assignment)
  |-> API Access (requires user account for API key generation)

Domain Search (can be unauthenticated)
  |-> Domain Registration (search leads to registration flow)
  |-> Bulk Search (extension of single search)
  |-> Domain Suggestions (triggered when primary search returns "Taken")

Domain Registration
  |-> WHOIS Privacy (toggle during registration)
  |-> Domain appears in Dashboard (after registration completes)
  |-> Domain available for DNS management (after registration)

Marketplace
  |-> List Domain for Sale (requires owning a domain)
  |-> Auction System (requires marketplace listings)
  |-> Transfer on Sale (requires domain transfer mechanism)
```

## Critical Path

The minimum dependency chain to reach a functional product:

1. **User Accounts** -- everything gates on this
2. **Domain Search** -- the entry point (can work without auth)
3. **Domain Registration** -- connects search to ownership (requires auth)
4. **Domain Dashboard** -- see what you own (requires domains)
5. **DNS Management** -- do something useful with domains (requires domains)

Everything else (marketplace, API, pricing tiers, bulk search, suggestions) layers on top.

---

## MVP Recommendation

### Must Build (Phase 1-2)

1. **Domain search with RDAP availability checking** -- preserve existing logic, convert to Next.js API route
2. **User accounts** (signup/login/profile) -- gate all ownership features
3. **Domain registration flow** (simulated) -- the core conversion action
4. **Domain management dashboard** -- see and manage owned domains
5. **DNS record management** -- A, AAAA, CNAME, MX, TXT with CRUD operations
6. **WHOIS privacy toggle** -- free, default-on
7. **Auto-renew and renewal management** -- prevent domain loss
8. **Domain locking** -- security baseline

### Build Next (Phase 3)

9. **Bulk domain search** -- power user feature, low complexity
10. **Domain transfer flow** (simulated) -- complete the registrar lifecycle
11. **Domain suggestions** -- improve conversion when first choice is taken
12. **DNSSEC toggle** -- security feature, low complexity with simulated backend

### Build Later (Phase 4+)

13. **Domain marketplace with auctions** -- high complexity, high reward
14. **Developer API** -- REST endpoints over existing operations
15. **Pricing/subscription tiers** -- monetization layer
16. **Zone import/export** -- power user DNS feature
17. **Chatbot** -- support assistant (basic keyword version exists)

### Defer Indefinitely

- Web hosting
- Real email forwarding
- Real SSL provisioning
- Payment processing (build UI flow, stub payment)
- Referral system
- Domain valuation

---

## Comparison with Existing Landing Page

The existing `index.html` markets features that should guide what actually gets built. Key gaps between what is marketed and what needs to be real:

| Marketed Feature | Current State | Needs To Be Real |
|-----------------|---------------|-------------------|
| Domain search | Working (RDAP/DNS) | YES -- port to Next.js API |
| Registration | Modal with alert() | YES -- database-backed |
| Dashboard | Static HTML mockup | YES -- dynamic, user-specific |
| DNS editor | Static HTML mockup | YES -- full CRUD operations |
| Marketplace | Static HTML mockup | YES (later phase) -- listings, bidding |
| Pricing tiers | Static HTML | PARTIAL -- plan assignment, feature gating |
| API docs | Static code examples | LATER -- real endpoints |
| Chatbot | Keyword matcher | KEEP -- port to React component |
| SSL management | Feature card only | NO -- display only |
| Email forwarding | Feature card only | NO -- DNS records cover MX config |
| Shortlinks | Feature card only | NO -- defer, not core registrar |
| Web hosting | Service card only | NO -- remove or mark "Coming Soon" |

---

## Sources

- Analysis based on direct examination of existing Taco Domains `index.html` (925 lines, full landing page with working RDAP search)
- PROJECT.md scope and constraints
- Training knowledge of Namecheap, GoDaddy, Porkbun, Cloudflare Registrar, Squarespace Domains (formerly Google Domains), Gandi, Hover feature sets
- **Confidence note:** Feature categorizations are based on training data patterns across registrar products. Specific registrar feature additions or removals after mid-2025 are not reflected. The core feature hierarchy (search -> register -> manage -> DNS) is stable and well-established in this domain.
