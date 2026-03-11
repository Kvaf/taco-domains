# Taco Domains

## What This Is

A full-stack domain registrar web application built with Next.js. Users can search for domain availability, register domains (simulated backend), manage their portfolio through a dashboard, configure DNS records, and trade domains on a marketplace. The product features a refreshed version of the existing taco-themed dark design with fire/lime/cyan accent colors.

## Core Value

Users can search, register, and manage domains through a polished, intuitive interface — the full registrar experience with a fun taco-themed brand, backed by simulated domain operations ready to be swapped for real registrar APIs later.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User accounts (signup, login, profile management)
- [ ] Domain search with real-time RDAP availability checking
- [ ] Domain registration flow (simulated backend)
- [ ] Domain management dashboard (renewals, status, auto-renew)
- [ ] DNS record management (A, CNAME, MX, TXT records)
- [ ] Domain marketplace with buy/sell/auction functionality
- [ ] Responsive, refreshed taco-themed dark UI (React components)
- [ ] Persistent data storage for users, domains, and marketplace listings

### Out of Scope

- Real ICANN registrar integration — simulated for now, designed to be swappable
- Payment processing (Stripe etc.) — build flows first, integrate payments later
- Email forwarding / actual MX handling — UI only
- SSL certificate provisioning — UI mockup only
- Mobile native app — web-first, responsive design
- Real-time chat support — keep the existing simple chatbot

## Context

- Existing landing page (`index.html`, ~925 lines) with domain search via RDAP, dashboard mockup, DNS editor mockup, marketplace mockup, pricing page, API docs, and chatbot
- Domain search already uses RDAP (Verisign) and DNS-over-HTTPS (Google) for real availability checking — this logic should be preserved and enhanced
- The taco branding (fire gradients, dark theme, taco puns) is core to the identity but the design should be modernized when converting to React components
- The `taco_logo.png` asset exists and should be carried over
- Tech stack: Next.js (React), PostgreSQL (or SQLite for simplicity), Prisma ORM
- All domain operations (register, renew, transfer) are simulated in the database — no real registrar API calls

## Constraints

- **Tech stack**: Next.js with React, TypeScript
- **Database**: PostgreSQL with Prisma ORM (or SQLite for dev simplicity)
- **Auth**: NextAuth.js or similar — email/password at minimum
- **Styling**: Tailwind CSS or CSS Modules — refresh the current aesthetic, keep the dark theme and taco brand
- **Domain backend**: All domain operations simulated via database — designed so a real registrar API can replace the simulation layer later
- **Existing code**: Current `index.html` serves as the design reference and feature spec

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js full-stack | Single framework for frontend + API, SSR for SEO, popular ecosystem | — Pending |
| Simulated domain backend | Focus on UX first, swap for real API later | — Pending |
| Refreshed design | Keep taco brand but modernize when converting to React | — Pending |
| PostgreSQL + Prisma | Structured data (users, domains, DNS records) fits relational model well | — Pending |

---
*Last updated: 2026-03-11 after initialization*
