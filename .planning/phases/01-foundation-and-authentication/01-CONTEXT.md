# Phase 1 Context: Foundation and Authentication

**Phase goal:** Users can create accounts, log in, and navigate a polished taco-themed application shell with responsive design
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, UI-01, UI-02

## Decisions

### App Shell Layout
- **Decision:** Sidebar navigation for the dashboard (like the existing mockup), top navbar for public pages
- **Rationale:** The existing `index.html` already has a sidebar layout in the dashboard mockup (`.dash-side` with nav items like Overview, My Domains, DNS Records, Email, SSL Certs, Shortlinks, Marketplace, Billing, Settings). Keep this pattern — it's proven for domain management tools (Namecheap, Cloudflare use similar layouts)
- **Details:**
  - Public pages: top navbar with logo, nav links, "Get Started" CTA (match existing design)
  - Dashboard: collapsible sidebar + main content area
  - Sidebar items for Phase 1: Overview, My Domains (empty state), Settings/Profile
  - Other sidebar items (DNS, Marketplace, etc.) visible but marked as "Coming Soon" or hidden until their phase

### Auth UX Flow
- **Decision:** Dedicated `/login` and `/signup` pages (not modals). After signup → redirect to dashboard with empty state welcome
- **Rationale:** Dedicated pages are better for SEO, bookmarking, and password managers. Modals can be added later as a progressive enhancement
- **Details:**
  - `/login` — email + password form, "Forgot password?" link, "Sign up" link
  - `/signup` — email + password + display name form, "Already have an account?" link
  - After signup → redirect to `/dashboard` with a welcome message ("Welcome to Taco Domains! 🌮 Start by searching for your first domain.")
  - After login → redirect to `/dashboard`
  - Password reset → `/forgot-password` (enter email) → email with link → `/reset-password?token=xxx` (new password form)
  - Password reset email: use console log in dev (no real email provider needed for simulated backend)

### Design Refresh Scope
- **Decision:** Keep the existing color palette and fonts, modernize the component style when converting to React/Tailwind
- **Rationale:** The current design is already polished and cohesive. A full redesign would be scope creep. The "refresh" means cleaner components, better spacing, and Tailwind utility classes — not new colors or branding
- **Details:**
  - Colors: Keep `--fire` (#ff5722), `--lime` (#76ff03), `--cyan` (#00e5ff), `--gold` (#ffd740), dark backgrounds (#070709, #0e0e14, etc.)
  - Fonts: Keep Anybody (headings), Outfit (body), JetBrains Mono (code/mono) — load via `next/font/google`
  - Gradients: Keep `--gradient-fire` (linear-gradient 135deg, #ff5722, #ff9800, #ffc107)
  - Logo: Keep `taco_logo.png`
  - "Refresh" means: convert inline styles to Tailwind classes, use Radix UI for interactive components (modals, dropdowns), improve spacing consistency, add proper focus states and accessibility

### Database Schema (Phase 1 scope)
- **Decision:** Create the full Prisma schema in Phase 1 (including Domain, DNSRecord, MarketplaceListing models) but only the User and Account models need to be functional
- **Rationale:** Defining the full schema upfront prevents migration headaches later. But only User-related tables need seed data and working CRUD in Phase 1
- **Details:**
  - Functional in Phase 1: User, Account, Session, VerificationToken (Auth.js models)
  - Defined but unused until later phases: Domain, DNSRecord, MarketplaceListing, Bid, Transaction

### Registrar Adapter (Phase 1 scope)
- **Decision:** Define the RegistrarAdapter interface in Phase 1 with a SimulatedRegistrar stub
- **Rationale:** Research identified this as non-negotiable (Pitfall 3). The interface must exist before any domain logic
- **Details:**
  - Interface: `RegistrarAdapter` with methods like `checkAvailability()`, `register()`, `renew()`, `transfer()`, `updateDNS()`
  - Implementation: `SimulatedRegistrar` that reads/writes to the database via Prisma
  - Phase 1 only defines the interface and stub — actual method implementations come in Phases 2-5

## Code Context

### Existing Assets to Preserve
- `taco_logo.png` — logo image, copy to `/public/`
- CSS color variables from `index.html` lines 11-23 — map to Tailwind theme
- Font choices: Anybody, Outfit, JetBrains Mono — load via next/font
- Existing page structure: public home, dashboard, DNS, marketplace, pricing, API — informs route structure

### Route Structure (Phase 1)
```
/ (public landing - placeholder for Phase 2)
/login
/signup
/forgot-password
/reset-password
/dashboard (protected - overview with empty state)
/dashboard/settings (profile management)
```

## Deferred Ideas

None — user opted for defaults on all gray areas.

---
*Context captured: 2026-03-11*
*Method: Defaults (user skipped discussion)*
