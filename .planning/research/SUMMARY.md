# Research Summary: Taco Domains

**Synthesized:** 2026-03-11
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md

## Key Findings

**Stack:** Static HTML/CSS/JS. Tailwind CSS for styling, Alpine.js for lightweight interactivity, vanilla JS modules for business logic, Faker.js for mock data generation. No frameworks, no build step required (optional PostCSS for optimization).

**Table Stakes:** Domain search with TLD selector, availability checking, pricing display, shopping cart/checkout, WHOIS privacy toggle, domain dashboard, DNS record editor, responsive mobile design, transparent pricing.

**Differentiators:** Taco-themed brand identity throughout, random domain suggestion generator, "Guac Guard" security bundle, email forwarding wizard, marketplace/auctions, developer API docs, shortlinks with analytics.

**Architecture:** Multi-page static site with shared layout, centralized mock data layer (`/data/*.json`), API abstraction modules (`src/api/*.js`) for easy backend swap, localStorage for cart/session state.

**Watch Out For:**
1. Mock data must be structured to match future API contracts — define schemas before building pages
2. Taco branding should enhance, not obscure functionality — clear labels first, fun names second
3. DNS editor needs validation and help text — users create broken configs without guidance
4. Organize CSS/JS from day 1 — static sites become unmaintainable fast without structure
5. Accessibility built in from start — keyboard nav, semantic HTML, color contrast
6. Simulate network delays in mock data — prevents building UI that assumes instant responses

## Build Order Recommendation

1. **Foundation** — Shared layout, CSS system, mock data schema, API abstraction layer
2. **Landing Page** — Hero, features, testimonials, search bar entry point
3. **Search & Cart** — Domain search, results, availability, cart, checkout flow
4. **Dashboard & DNS** — Domain management, DNS editor, email forwarding, security
5. **Marketplace & Extras** — Marketplace, shortlinks, API docs
6. **Billing & Support** — Billing UI, team management, referral program, support section

## Cross-Cutting Concerns

- **Responsive design** tested on real devices at every phase
- **Accessibility** (keyboard nav, ARIA, contrast) at every phase
- **Mock data consistency** enforced via shared schemas
- **Taco branding guidelines** established in Phase 1, applied consistently
