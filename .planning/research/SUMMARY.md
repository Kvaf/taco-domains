# Project Research Summary

**Project:** Taco Domains
**Domain:** Domain registrar web application (simulated backend, real RDAP lookups)
**Researched:** 2026-03-11
**Confidence:** MEDIUM

## Executive Summary

Taco Domains is a personality-driven domain registrar web application that converts an existing 925-line static HTML landing page into a full-stack Next.js application. The product combines real domain availability checking (via RDAP and DNS-over-HTTPS) with a simulated registrar backend for domain registration, renewal, DNS management, and a marketplace with auctions. Experts build this type of application as a layered monolith with a clear service abstraction between the simulated backend and the UI, so a real registrar API (EPP/reseller) can replace the simulation later without touching frontend code. The existing landing page already demonstrates working RDAP integration, a comprehensive design system (fire/lime/cyan dark theme), and extensive UI mockups for dashboard, DNS editor, and marketplace -- giving us a strong design reference and proven search logic to port.

The recommended approach is Next.js 15 with App Router, TypeScript, Prisma ORM on PostgreSQL, Auth.js v5 for authentication, and Tailwind CSS v4 for styling. The critical architectural decision is the **Registrar Adapter pattern** -- a strategy interface that wraps all domain operations so the simulated (database-backed) registrar can be swapped for a real provider. This must be established in the foundation phase; retrofitting it later is a rewrite. Server Components handle data loading, Server Actions handle mutations, and a thin REST API layer serves external consumers. The feature set follows the proven registrar hierarchy: search, register, manage, DNS, then marketplace.

The primary risks are: (1) CORS failures on client-side RDAP calls -- the existing code already suffers from this and the fix (server-side proxy) must be implemented from day one; (2) RDAP rate limiting when multiple users share the server IP -- needs a request queue and caching; (3) marketplace concurrency bugs -- auction/bid operations require database transactions with row-level locking; and (4) DNS validation complexity -- RFC-compliant record validation prevents users from saving invalid configurations. All four risks have clear mitigations documented in the research.

## Key Findings

### Recommended Stack

The stack is a modern Next.js full-stack setup with strong typing throughout. Next.js 15 with React 19 provides Server Components for data loading and Server Actions for mutations, eliminating the need for a separate API layer for most user-facing operations. Prisma ORM generates TypeScript types from the database schema and integrates directly with Auth.js via its adapter. Tailwind CSS v4's CSS-first configuration maps perfectly to the existing design system's CSS custom properties.

**Core technologies:**
- **Next.js 15 (App Router):** Full-stack framework -- SSR/SSG for SEO, Server Components for data loading, Server Actions for mutations, API Routes for public REST API
- **TypeScript 5.x:** Type safety from database to UI -- Prisma generates types, Zod validates at boundaries
- **Prisma ORM 6.x on PostgreSQL 16+:** Database access with auto-generated types, declarative migrations, Auth.js adapter built-in
- **Auth.js v5 (NextAuth):** Authentication with Credentials provider (email/password) and future OAuth expansion; native App Router support
- **Tailwind CSS v4:** CSS-first configuration with `@theme` blocks maps directly to existing `--fire`, `--lime`, `--cyan` custom properties
- **Radix UI Primitives:** Accessible headless components for modals, dropdowns, tabs -- styled with Tailwind
- **Zod + React Hook Form:** Schema validation shared between client and server; form state management for complex forms (DNS editor, marketplace)
- **Framer Motion:** Declarative animations to preserve existing landing page orb animations, fade-ups, and transitions
- **nuqs:** Type-safe URL search params for domain search queries, marketplace filters, pagination

**Critical version note:** Auth.js v5 was distributed as `next-auth@beta` in early 2025; verify current stable tag before installing. Tailwind CSS v4 is relatively new; confirm third-party plugin compatibility.

### Expected Features

The feature landscape follows a clear registrar hierarchy established by Cloudflare, Porkbun, and Namecheap.

**Must have (table stakes):**
- Domain search with real-time RDAP availability checking (multi-TLD)
- User accounts with email/password authentication
- Domain registration flow (simulated backend)
- Domain management dashboard (status, expiry, auto-renew, domain lock)
- DNS record management (A, AAAA, CNAME, MX, TXT with full CRUD)
- WHOIS privacy (free, default-on)
- Renewal management with expiry warnings
- Responsive design (existing breakpoints at 900px and 600px)
- TLD pricing display with transparency

**Should have (differentiators):**
- Bulk domain search (already mocked in existing UI)
- Domain transfer flow (simulated, EPP code input)
- Domain marketplace with auctions (listings, bidding, Buy Now)
- Taco-themed branding as UX differentiator (Taco Specials, Guac Guard, Spicy Mode)
- Developer API (REST endpoints over existing operations)
- Keyboard shortcuts (existing "/" to search, Escape to close)
- Chatbot (port existing keyword-matching Taco Bot)
- DNSSEC toggle
- Pricing tiers with subscription model (Mild/Medium/Extra Spicy)

**Defer (v2+):**
- Real payment processing (build UI, stub payment step)
- Real ICANN/registrar integration (the adapter pattern enables this later)
- Web hosting, real email forwarding, real SSL provisioning
- Domain valuation/appraisal
- Referral/affiliate system
- Multi-language/i18n
- Mobile native app
- Zone file import/export (lower priority power-user feature)

### Architecture Approach

The architecture is a **layered full-stack monolith** with the Registrar Adapter as its defining pattern. All domain operations flow through a service layer that wraps a `RegistrarAdapter` interface. The `SimulatedRegistrar` implementation uses Prisma for database operations; a future `RealRegistrar` would call EPP or a reseller API. This separation is non-negotiable -- it must be established before any domain logic is written.

**Major components:**
1. **Pages/Layouts (App Router)** -- Route structure with (public) and (dashboard) route groups; auth guards on dashboard routes
2. **Server Actions** -- All user-facing mutations (register, renew, update DNS, place bid); provide form handling and optimistic updates
3. **Service Layer** -- DomainService, DNSService, MarketplaceService, UserService; contain all business logic and ownership verification
4. **Registrar Adapter** -- Strategy pattern interface; SimulatedRegistrar (now) vs RealRegistrar (future); the swap boundary
5. **RDAP Client** -- Server-side availability checking; Verisign for .com/.net, rdap.org for others; DNS-over-HTTPS fallback
6. **API Routes (/api/v1/*)** -- Public REST API for external consumers (Developer API feature); thin handlers over service layer
7. **Prisma + PostgreSQL** -- Data layer with models for User, Domain, DNSRecord, MarketplaceListing, Bid, AuditLog, Transaction

**Key data flow:** Domain search hits the RDAP client (server-side, no CORS). Registration goes through Server Action -> DomainService -> RegistrarAdapter -> Prisma. DNS updates go through Server Action -> DNSService -> validation -> RegistrarAdapter -> Prisma. Marketplace bids use database transactions with row-level locking.

### Critical Pitfalls

1. **Client-side RDAP calls cause CORS failures and false positives** -- Move ALL RDAP lookups to server-side API routes from day one. The existing code's DNS-over-HTTPS fallback gives false "Available" results for domains that are registered but not resolving. This is the single most important technical fix.

2. **RDAP rate limiting crashes multi-user search** -- All server-side RDAP requests share one IP. Implement a request queue (p-queue or bottleneck) with per-server rate limits. Cache results for 60-120 seconds. Bulk search must use concurrency limits of 2-3 per TLD server.

3. **Simulated backend becomes non-swappable spaghetti** -- Define the RegistrarAdapter interface BEFORE writing any domain logic. Every domain operation must go through this interface. Test: "Can I swap the simulated registrar for a real API by changing one file?" If no, the abstraction leaks.

4. **Marketplace auction race conditions** -- Two users can "Buy Now" the same domain, or bids can be placed after auction close. Use Prisma `$transaction` with optimistic locking (version field). Atomic compare-and-swap on listing status for Buy Now.

5. **DNS editor saves invalid record combinations** -- CNAME cannot coexist with other records at the same name, CNAME cannot exist at zone apex, MX needs priority + hostname (not IP). Implement RFC-compliant validation on both client and server. Users who know DNS will immediately lose trust if invalid configs are accepted.

## Implications for Roadmap

Based on research, the build order follows the dependency chain: Database -> Auth -> Domain Service -> Search UI -> Dashboard -> DNS -> Marketplace. Each phase produces a usable increment.

### Phase 1: Foundation and Project Setup
**Rationale:** Everything depends on the database schema, authentication, and the Registrar Adapter interface. The adapter pattern MUST be established before any domain logic is written (Pitfall 3). Auth state management must be centralized from the start (Pitfall 6).
**Delivers:** Next.js project scaffold, Prisma schema (all models including marketplace for future), Auth.js with Credentials provider, Registrar Adapter interface + SimulatedRegistrar implementation, TLD configuration in database (Pitfall 8), design system extraction (Tailwind v4 theme from existing CSS variables), reusable UI component library (Button, Input, Card, Modal using Radix + Tailwind).
**Addresses:** User accounts (auth), responsive design foundation, design tokens, accessibility audit of color combinations (Pitfall 11)
**Avoids:** Pitfalls 3, 6, 8, 9 (brownfield over-conversion), 11

### Phase 2: Domain Search and Landing Page
**Rationale:** Domain search is the entry point and core product experience. The RDAP integration already works in the existing code but must be moved server-side (Pitfall 1) and rate-limited (Pitfall 2). This phase delivers the first user-visible feature.
**Delivers:** Landing page (hero, search bar, TLD pricing), server-side RDAP availability checking with caching and rate limiting, multi-TLD simultaneous search, domain name validation per RFC 5891 (Pitfall 7), search results with pricing, registration modal (connects to Phase 3)
**Addresses:** Domain search with availability check, TLD pricing display, domain name validation
**Avoids:** Pitfalls 1, 2, 7

### Phase 3: Domain Registration and Dashboard
**Rationale:** Registration connects search to ownership -- the core conversion action. Dashboard provides the post-registration experience. These belong together because the registration flow must immediately redirect to a populated dashboard.
**Delivers:** Domain registration flow (simulated via RegistrarAdapter), domain management dashboard (list, status badges, expiry dates, stats cards), auto-renew toggle with confirmation dialog (Pitfall 14), domain locking, WHOIS privacy toggle, renewal management with UTC time handling (Pitfall 12)
**Addresses:** Domain registration, dashboard, auto-renew, domain locking, WHOIS privacy, renewal management
**Avoids:** Pitfalls 12, 14

### Phase 4: DNS Management
**Rationale:** DNS management is the primary ongoing value proposition after registration. The DNS editor is a complex interactive form that requires type-specific validation rules (Pitfall 5). It depends on having registered domains from Phase 3.
**Delivers:** DNS record editor (CRUD for A, AAAA, CNAME, MX, TXT, NS, SRV, CAA), RFC-compliant validation (CNAME conflicts, apex restrictions, IP format checking), DNSSEC toggle, domain selector for multi-domain management
**Addresses:** DNS record management, DNSSEC toggle
**Avoids:** Pitfall 5

### Phase 5: Marketplace and Auctions
**Rationale:** Highest complexity feature with the most pitfalls (concurrency, search indexing). Deferred to Phase 5 because it depends on domain ownership (Phase 3) and has no blockers on the core registrar experience. Needs database transactions with row-level locking from day one (Pitfall 4).
**Delivers:** Marketplace listings (fixed price + auction), bidding with concurrency control, Buy Now with atomic status transitions, auction countdown timers, marketplace search with proper indexing (Pitfall 10), domain transfer on sale
**Addresses:** Domain marketplace, auction system, domain transfer
**Avoids:** Pitfalls 4, 10

### Phase 6: Power Features and Polish
**Rationale:** These features layer on top of the complete registrar experience. They increase stickiness and serve power users but are not required for core functionality.
**Delivers:** Bulk domain search, domain name suggestions (when first choice is taken), Developer API (REST endpoints over service layer), pricing tiers with feature gating (Mild/Medium/Extra Spicy), chatbot (port Taco Bot with XSS prevention -- Pitfall 13), keyboard shortcuts expansion, domain parking pages
**Addresses:** Bulk search, developer API, pricing tiers, chatbot, domain suggestions
**Avoids:** Pitfall 13

### Phase Ordering Rationale

- **Dependency-driven:** Each phase builds on the previous. Auth gates all ownership. Domain service gates search and registration. Registration gates dashboard. Dashboard gates DNS. Domain ownership gates marketplace.
- **Value-driven:** After Phase 2, users can search domains. After Phase 3, they can register and manage. After Phase 4, they can configure DNS. Each phase delivers a complete, usable increment.
- **Risk-driven:** The highest-risk items (RDAP CORS, rate limiting, adapter pattern) are addressed in Phases 1-2 before significant UI investment. Marketplace concurrency (the most complex pitfall) is deferred to Phase 5 where it gets focused attention.
- **Brownfield-safe:** Phases align with individual features, not "convert all pages at once" (Pitfall 9). The existing index.html serves as a design reference, not a porting source.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 1 (Foundation):** Auth.js v5 Credentials provider configuration has caveats and version-specific behavior. Verify current `next-auth` package tag and Prisma adapter compatibility. Tailwind CSS v4 integration with Next.js may have edge cases.
- **Phase 4 (DNS Management):** DNS validation rules are complex. Research RFC 1035 constraints thoroughly. May need a dedicated validation library or comprehensive test suite.
- **Phase 5 (Marketplace):** Auction concurrency patterns in Prisma need research. Optimistic locking and `$transaction` with `SELECT FOR UPDATE` behavior should be tested against the target PostgreSQL version.

Phases with standard patterns (skip research-phase):
- **Phase 2 (Domain Search):** RDAP protocol is well-documented; the existing code demonstrates the pattern. Server-side proxy is a standard Next.js pattern.
- **Phase 3 (Registration/Dashboard):** Standard CRUD with Server Actions and Server Components. Well-documented in Next.js docs.
- **Phase 6 (Power Features):** REST API over existing service layer, keyword chatbot port, and bulk search are straightforward extensions of existing patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Next.js 15, React 19, Prisma, PostgreSQL, Tailwind are all well-established. Only Auth.js v5 and Tailwind v4 have minor version uncertainty (both released ~early 2025, verify current state). |
| Features | MEDIUM | Feature hierarchy is based on training knowledge of major registrars (Namecheap, Porkbun, Cloudflare, GoDaddy). Any registrar feature changes after mid-2025 are not reflected. Core feature ordering is stable. |
| Architecture | HIGH | Layered monolith with service abstraction is the standard pattern for this type of application. Next.js App Router patterns are well-documented. The Registrar Adapter pattern is a textbook Strategy pattern. |
| Pitfalls | MEDIUM | RDAP CORS and rate limiting findings are based on training data. Actual RDAP server behavior (rate limits, CORS headers) should be verified against current endpoints. DNS validation rules are based on RFCs and are stable. |

**Overall confidence:** MEDIUM -- technology choices and architecture patterns are high-confidence, but RDAP endpoint behavior and some library versions need runtime verification. The core approach is sound.

### Gaps to Address

- **Auth.js v5 stable release status:** Was `@beta` in early 2025. Verify current package tag and breaking changes before installation. If still unstable, consider pinning to a tested version.
- **Tailwind CSS v4 + Next.js integration:** Relatively new combination. Verify `@tailwindcss/postcss` plugin works with current Next.js version. The `prettier-plugin-tailwindcss` v4 support should be confirmed.
- **RDAP server rate limits:** Exact rate limits per RDAP server (Verisign, rdap.org) are not documented in public specs. Test empirically during Phase 2 and adjust queue settings.
- **Prisma `$transaction` with `SELECT FOR UPDATE`:** Confirm this pattern works as expected in Prisma 6.x for marketplace concurrency control. May need raw SQL for row-level locking.
- **Neon PostgreSQL branching with Vercel preview deployments:** The integration pattern should be verified. Neon's free tier limits may affect development workflow.
- **Existing fonts (Anybody, Outfit, JetBrains Mono) via `next/font`:** Verify all three are available in `next/font/google`. Anybody is a less common font and may need fallback configuration.

## Sources

### Primary (HIGH confidence)
- Existing `index.html` codebase (925 lines) -- RDAP integration pattern, design system CSS variables, UI mockups for all features, font choices, feature list
- PROJECT.md -- scope definition, constraints (simulated backend, no real payments), feature requirements
- Next.js App Router documentation (nextjs.org/docs) -- Server Components, Server Actions, route groups, API routes, caching
- Prisma ORM documentation (prisma.io/docs) -- schema modeling, migrations, Next.js integration
- IETF RFCs 7480-7484, 9224 (RDAP protocol) -- availability checking patterns, JSON response formats

### Secondary (MEDIUM confidence)
- Auth.js documentation (authjs.dev) -- v5 configuration, Prisma adapter, Credentials provider caveats
- Tailwind CSS v4 announcement (tailwindcss.com/blog) -- CSS-first config, `@theme` blocks, breaking changes from v3
- DNS standards (RFC 1035, RFC 5891/5892) -- record validation rules, domain name constraints
- Registrar feature analysis -- based on training knowledge of Namecheap, GoDaddy, Porkbun, Cloudflare Registrar, Squarespace Domains

### Tertiary (LOW confidence)
- Auth.js v5 package distribution status -- may have moved from `@beta` to `@latest` by 2026
- RDAP server rate limits -- not publicly documented, need empirical testing
- Neon PostgreSQL free tier capabilities -- pricing and limits may have changed

---
*Research completed: 2026-03-11*
*Ready for roadmap: yes*
