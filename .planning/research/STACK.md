# Technology Stack

**Project:** Taco Domains
**Researched:** 2026-03-11
**Overall Confidence:** MEDIUM (version numbers based on training data through early 2025; verify exact latest versions with `npm view <pkg> version` before installing)

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Next.js | ^15.x | Full-stack React framework | App Router is the standard for new projects. Server Components reduce client bundle size. API Routes replace the need for a separate backend. SSR/SSG for SEO on landing and marketplace pages. The project already specifies Next.js. | HIGH |
| React | ^19.x | UI library (bundled with Next.js 15) | React 19 ships with Next.js 15. Server Components, Actions, and `use()` hook are production-ready. | HIGH |
| TypeScript | ^5.x | Type safety | Non-negotiable for a full-stack app of this size. Prisma generates types, Next.js has first-class TS support. Catches domain model errors at compile time. | HIGH |

### Authentication

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Auth.js (NextAuth.js v5) | ^5.x (`next-auth@beta` or stable) | Authentication | The standard auth library for Next.js. v5 has native App Router support, Edge compatibility, and built-in Prisma adapter. Supports Credentials provider for email/password (needed here) plus OAuth providers for future expansion. | MEDIUM |
| bcrypt (or bcryptjs) | ^5.x / ^2.x | Password hashing | Required for Credentials provider. Use `bcryptjs` (pure JS) to avoid native compilation issues on deployment platforms. | HIGH |

### Database

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| PostgreSQL | 16+ | Primary database | Relational model fits perfectly: users have domains, domains have DNS records, marketplace has listings with bids. JSON columns available for flexible config. Full-text search for domain marketplace. Production-grade. | HIGH |
| Prisma ORM | ^6.x | Database access & migrations | Best-in-class DX for Next.js. Auto-generated TypeScript types from schema. Declarative migrations. Built-in Auth.js adapter. Handles relations (User -> Domain -> DnsRecord) cleanly. | MEDIUM |
| SQLite (dev only) | via Prisma | Local development | Use SQLite for fast local dev with `prisma db push`. Switch to PostgreSQL for staging/production. Prisma makes this a one-line datasource change. | HIGH |

### Styling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Tailwind CSS | ^4.x | Utility-first CSS | Tailwind v4 (released Jan 2025) has a new Rust-based engine, CSS-first configuration, and automatic content detection. Perfect for the dark theme with custom CSS variables (fire/lime/cyan palette from existing design). Eliminates the tailwind.config.js file -- config lives in CSS. | MEDIUM |
| @tailwindcss/postcss | ^4.x | PostCSS integration | Required plugin for Next.js integration with Tailwind v4. Replaces the old `tailwindcss` PostCSS plugin. | MEDIUM |
| tailwind-merge | ^2.x | Class merging | Prevents Tailwind class conflicts when composing component variants. Essential for reusable component library. | HIGH |
| clsx | ^2.x | Conditional classes | Lightweight class name builder. Pairs with tailwind-merge for a `cn()` utility. | HIGH |

### UI Components

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Radix UI Primitives | ^1.x | Accessible headless components | Unstyled, accessible primitives for modals, dropdowns, tabs, tooltips, and dialogs. The domain management dashboard needs complex UI patterns (DNS record editor, domain settings panels). Radix provides the accessibility and keyboard navigation; Tailwind provides the styling. | HIGH |
| Lucide React | ^0.4x | Icons | Consistent, tree-shakeable icon set. Lighter than FontAwesome. Already has domain-relevant icons (globe, search, shield, settings). | HIGH |
| Framer Motion | ^11.x | Animations | The existing landing page has orb animations, fade-ups, and transitions. Framer Motion handles these declaratively in React. Server Component compatible via `"use client"` boundaries. | HIGH |

### Domain Availability Checking

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Native fetch (Next.js) | Built-in | RDAP API calls | The existing `index.html` already uses RDAP (Verisign at `rdap.verisign.com`) and DNS-over-HTTPS (Google at `dns.google`). These are simple REST/JSON calls -- no library needed. Use Next.js Route Handlers as a proxy to avoid CORS and add rate limiting. | HIGH |
| RDAP Protocol | N/A | Domain availability | WHOIS replacement. JSON-based, no parsing needed. Verisign provides `.com`/`.net` lookups. IANA RDAP bootstrap provides registrar discovery for other TLDs. This is the correct modern approach -- do NOT use WHOIS libraries. | HIGH |

### State Management & Data Fetching

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| React Server Components | Built-in | Server-side data loading | Default in Next.js App Router. Database queries happen on the server, no API layer needed for reads. Prisma calls go directly in Server Components. | HIGH |
| Server Actions | Built-in | Mutations (forms, writes) | Native Next.js pattern for form submissions, domain registration, DNS record updates. Progressive enhancement -- forms work without JS. Replaces traditional API POST endpoints for most mutations. | HIGH |
| React `useOptimistic` | Built-in | Optimistic UI | Built-in React 19 hook for instant UI feedback on mutations (e.g., adding DNS record shows immediately before server confirms). | HIGH |
| nuqs | ^2.x | URL search params state | Type-safe URL search parameter management. Perfect for domain search queries, marketplace filters, and pagination. Keeps state in the URL for shareability. | MEDIUM |

### Form Handling & Validation

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Zod | ^3.x | Schema validation | Validates on both client and server. Shared schemas for domain registration forms, DNS record inputs, auth forms. Prisma types + Zod = full type safety from DB to UI. | HIGH |
| React Hook Form | ^7.x | Form state management | Only needed for complex forms (DNS record editor with dynamic fields, marketplace listing form). Simple forms use Server Actions + Zod directly. | HIGH |

### Testing

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vitest | ^2.x | Unit & integration tests | Fast, Vite-based. ESM-native. Better DX than Jest for modern stacks. | HIGH |
| Playwright | ^1.x | E2E tests | Cross-browser testing for critical flows: domain search, registration, auth. | HIGH |
| Testing Library | ^16.x | Component tests | `@testing-library/react` for component testing alongside Vitest. | HIGH |

### Development Tools

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| ESLint | ^9.x | Linting | Flat config format (eslint.config.js). Next.js provides `eslint-config-next`. | HIGH |
| Prettier | ^3.x | Code formatting | Consistent formatting. Use `prettier-plugin-tailwindcss` for class sorting. | HIGH |
| Husky + lint-staged | ^9.x / ^15.x | Git hooks | Pre-commit formatting and linting. Catches issues before they hit CI. | HIGH |

### Infrastructure & Deployment

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| Vercel | N/A | Hosting & deployment | First-party Next.js hosting. Zero-config deployments, preview URLs per PR, Edge Functions, built-in analytics. Best DX for Next.js by far. | HIGH |
| Docker Compose | N/A | Local PostgreSQL | Run PostgreSQL locally without installing it. Single `docker-compose.yml` for DB + optional pgAdmin. | HIGH |
| Neon or Supabase (DB hosting) | N/A | Managed PostgreSQL | Neon has a generous free tier with branching (great for preview deployments). Supabase is an alternative with a dashboard. Either works with Prisma. Use Neon because its branching model maps to Vercel preview deployments. | MEDIUM |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Framework | Next.js 15 | Remix / SvelteKit | Project spec already requires Next.js. Ecosystem is larger. |
| Auth | Auth.js v5 | Clerk / Lucia | Auth.js is free, self-hosted, has Prisma adapter. Clerk adds cost. Lucia was archived in early 2025. |
| ORM | Prisma | Drizzle | Prisma has mature migrations, Auth.js adapter, and better docs. Drizzle is faster at runtime but Prisma DX wins for this project size. Type generation from schema is more intuitive. |
| Database | PostgreSQL | MySQL / SQLite | PostgreSQL has better JSON support, full-text search, and is the standard for Prisma + Next.js stacks. SQLite is dev-only. |
| Styling | Tailwind CSS v4 | CSS Modules / styled-components | Tailwind pairs perfectly with the existing design system (CSS custom properties map to Tailwind theme). CSS Modules add friction for component variants. styled-components has SSR complexity. |
| UI Primitives | Radix UI | shadcn/ui / Headless UI | shadcn/ui is built on Radix -- you could use it, but the taco-themed design is custom enough that raw Radix primitives + Tailwind give more control. Headless UI has fewer components. |
| State | Server Components + nuqs | TanStack Query / Zustand | Server Components eliminate most client-side data fetching. TanStack Query is overkill when RSC handles reads. No global client state complex enough for Zustand. |
| Animation | Framer Motion | CSS animations / GSAP | The existing site has complex animations. Framer Motion is declarative and React-native. GSAP has licensing concerns for SaaS. |
| Testing | Vitest | Jest | Vitest is faster, ESM-native, and has better DX. Jest requires more configuration for ESM. |
| Icons | Lucide React | Heroicons / FontAwesome | Lucide has the broadest icon set, tree-shakes well, and has consistent design. FontAwesome is bloated. |

## Key Architecture Decision: Tailwind CSS v4 vs v3

**Recommendation: Use Tailwind CSS v4** if the project is greenfield (which it is -- converting from vanilla HTML).

Tailwind v4 key changes:
- **CSS-first configuration** -- no `tailwind.config.js`, config lives in `@theme` blocks in CSS
- **Automatic content detection** -- no `content` array needed
- **New import syntax** -- `@import "tailwindcss"` instead of `@tailwind` directives
- **CSS custom properties for all theme values** -- maps perfectly to the existing `--fire`, `--lime`, `--cyan` variables in the landing page
- **Breaking change**: Some utility names changed. Since we are writing fresh components (not migrating existing Tailwind code), this is a non-issue.

**Risk**: Tailwind v4 is relatively new (released ~Jan 2025). Some third-party plugins may not support v4 yet. Mitigation: the project does not need complex plugins; the `prettier-plugin-tailwindcss` does support v4.

## Key Architecture Decision: Auth.js v5 Credentials Provider

**Important caveat**: Auth.js documentation officially discourages the Credentials provider for security reasons (password handling is complex). However, the project requirements specify email/password auth, and Auth.js Credentials provider is the pragmatic choice because:

1. It integrates with the same session management as OAuth providers
2. The Prisma adapter handles user/session storage
3. Adding OAuth later (Google, GitHub) is just adding providers -- no architectural change
4. Alternative: implement custom JWT auth, but this duplicates what Auth.js already provides

**Mitigation for Credentials risks**: Use bcryptjs for hashing, enforce password strength with Zod validation, implement rate limiting on login endpoint, use CSRF protection (built into Auth.js).

## Custom Theme System

The existing landing page defines a comprehensive CSS variable system:

```css
:root {
  --bg: #070709;
  --fire: #ff5722;
  --lime: #76ff03;
  --cyan: #00e5ff;
  --gold: #ffd740;
  /* ... etc */
}
```

With Tailwind v4, these map directly to theme values:

```css
@import "tailwindcss";

@theme {
  --color-bg: #070709;
  --color-fire: #ff5722;
  --color-fire-light: #ff8a65;
  --color-lime: #76ff03;
  --color-cyan: #00e5ff;
  --color-gold: #ffd740;
  /* ... */
}
```

Usage: `bg-fire`, `text-lime`, `border-cyan`, `from-fire to-gold` (gradients).

## Fonts

The existing site uses three Google Fonts that should be carried over:

| Font | Usage | Next.js Approach |
|------|-------|-----------------|
| Anybody | Headings, brand text | `next/font/google` with `variable` prop |
| Outfit | Body text | `next/font/google` with `variable` prop |
| JetBrains Mono | Code, domain names, TLD badges | `next/font/google` with `variable` prop |

Use `next/font` to self-host these fonts -- eliminates the Google Fonts external request, improves performance, and prevents layout shift.

## Installation

```bash
# Initialize Next.js project
npx create-next-app@latest taco-domains --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Core dependencies
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client
npm install zod react-hook-form @hookform/resolvers
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-switch @radix-ui/react-toast
npm install lucide-react framer-motion
npm install nuqs
npm install clsx tailwind-merge
npm install bcryptjs
npm install @types/bcryptjs --save-dev

# Dev dependencies
npm install -D vitest @testing-library/react @testing-library/jest-dom playwright
npm install -D prettier prettier-plugin-tailwindcss
npm install -D husky lint-staged
```

**Note on `next-auth@beta`**: As of early 2025, Auth.js v5 was distributed under the `@beta` tag. By 2026, it may have moved to `@latest`. Verify with `npm view next-auth versions` before installing.

## RDAP Integration Details

The existing `index.html` demonstrates the RDAP pattern that should be preserved:

**Verisign RDAP endpoint**: `https://rdap.verisign.com/com/v1/domain/{domain}`
- Returns JSON with domain registration status
- HTTP 404 = domain is available
- HTTP 200 with registration data = domain is taken

**Google DNS-over-HTTPS**: `https://dns.google/resolve?name={domain}&type=A`
- Fallback/supplementary check
- No DNS records = likely available

**Architecture in Next.js**:
```
Client Component (search bar)
  -> Server Action or Route Handler (/api/domain/check)
    -> fetch() to RDAP endpoints (server-side, no CORS)
    -> Aggregate results
  <- Return availability status to client
```

This keeps API keys (if any) on the server and allows rate limiting. The existing client-side RDAP calls work but are better proxied through the Next.js backend.

## Project Structure

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
    (main)/
      page.tsx              # Landing page (hero + search)
      dashboard/
        page.tsx            # Domain portfolio
        [domain]/
          page.tsx          # Domain detail
          dns/page.tsx      # DNS management
      marketplace/
        page.tsx            # Listings
        [id]/page.tsx       # Listing detail
      pricing/page.tsx
    api/
      auth/[...nextauth]/route.ts
      domain/
        check/route.ts      # RDAP availability check
    layout.tsx
    globals.css
  components/
    ui/                     # Reusable primitives (Button, Input, Card, etc.)
    domain/                 # Domain-specific (SearchBar, ResultItem, DnsEditor)
    layout/                 # Nav, Footer, Sidebar
    marketplace/            # Marketplace-specific components
  lib/
    auth.ts                 # Auth.js config
    prisma.ts               # Prisma client singleton
    rdap.ts                 # RDAP/DNS checking utilities
    utils.ts                # cn() helper, formatters
    validators/             # Zod schemas
  types/
    index.ts                # Shared TypeScript types
prisma/
  schema.prisma
  seed.ts                   # Seed data for development
```

## Sources

- Next.js documentation (nextjs.org/docs) -- App Router, Server Components, Server Actions
- Auth.js documentation (authjs.dev) -- v5 migration guide, Prisma adapter
- Prisma documentation (prisma.io/docs) -- Next.js integration guide
- Tailwind CSS v4 announcement (tailwindcss.com/blog/tailwindcss-v4) -- new engine, CSS-first config
- RDAP RFC 7482/7483 -- Registration Data Access Protocol specification
- Existing index.html -- RDAP integration pattern, design system variables, font choices

**Confidence note**: Version numbers are based on training data through early 2025. The recommendations for *which* technologies to use are HIGH confidence. Exact latest version numbers should be verified at install time with `npm view <package> version`.
