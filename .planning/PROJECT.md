# Taco Domains

## What This Is

A full-featured domain registration platform with a fun, taco-themed brand identity. Built as a production-ready static website (HTML/CSS/JS) with mock data designed for easy API integration later. The platform covers domain search, management dashboard, DNS hosting, marketplace, and developer tools — all wrapped in a playful, memorable UX that makes domain management feel as easy as ordering a taco.

## Core Value

Users can search, discover, and manage domains through an interface so fun and simple that even non-technical users feel confident — while power users get the depth they need.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Responsive landing page with hero section, domain search bar, feature sections, testimonials, and footer
- [ ] Interactive domain search with TLD selector and availability checking (mock data)
- [ ] Random domain suggestion generator
- [ ] Domain management dashboard with centralized control panel
- [ ] DNS record editor (A, CNAME, MX, TXT, etc.) with mock data
- [ ] Domain forwarding & parking UI
- [ ] Renewal reminders & auto-renew toggle UI
- [ ] Email forwarding setup and MX configuration wizard
- [ ] SSL/TLS certificate management UI (free + premium options)
- [ ] Domain marketplace & auction system UI
- [ ] Brandable subdomains & shortlinks with click analytics UI
- [ ] Developer API documentation section with code examples
- [ ] Billing & subscription management UI with transparent pricing
- [ ] Mobile-responsive navigation with hamburger menu
- [ ] Auto-rotating testimonial carousel
- [ ] Animated hero section with floating taco-themed elements
- [ ] Taco-themed UX throughout (error messages, loading states, notifications)
- [ ] "Guac Guard" security bundle UI (WHOIS privacy, SSL, 2FA, registry lock)
- [ ] Bulk domain search functionality
- [ ] WHOIS privacy toggle on registration flow
- [ ] Partner logos section
- [ ] "How It Works" onboarding flow
- [ ] Customer support section with AI chatbot placeholder and "Taco Tips" guides
- [ ] Referral program UI with "Taco Tokens" rewards
- [ ] Wallet system for prepaid credits UI
- [ ] Team billing & permission tiers UI

### Out of Scope

- Real domain registrar API integration (Porkbun, Namecheap, etc.) — mock data first, API swap later
- User authentication backend — UI only for v1
- Payment processing — UI mockup only
- Real AI chatbot — placeholder for v1
- Mobile native app — web responsive only
- Real-time DNS propagation — simulated in UI
- Actual email forwarding service — UI and configuration only

## Context

- Brand identity: Taco-themed with playful personality ("Frijoles Faltan!" for 404, "Taco Bell" for notification center, "Salsa Sync" for DNS sync, "Spicy Mode" for advanced settings)
- Color palette: Orange, green, red (taco-inspired)
- Typography: Poppins for headings
- Target audience: From non-technical first-time domain buyers to developers needing API-driven DNS automation
- Competitive positioning: Fun, simple, transparent alternative to GoDaddy/Namecheap/Cloudflare — better UX, no hidden fees, personality-driven brand
- All mock data should be structured for easy replacement with real API calls

## Constraints

- **Tech stack**: HTML, CSS, vanilla JavaScript only — no frameworks
- **Data**: Mock/demo data throughout, structured for future API integration
- **Hosting**: Must be deployable as static files (any web server, GitHub Pages, Netlify, etc.)
- **Responsive**: Must work on mobile, tablet, and desktop
- **Performance**: Fast loading — no heavy dependencies

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Static HTML/CSS/JS over framework | Simplicity, no build step, universal hosting | — Pending |
| Mock data with API-ready structure | Ship fast, validate UX before backend investment | — Pending |
| Full MVP scope (not just landing page) | User wants search + dashboard + DNS + marketplace | — Pending |
| Taco-themed everything | Brand differentiation in a boring market | — Pending |

---
*Last updated: 2026-03-11 after initialization*
