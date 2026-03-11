# Architecture Patterns

**Domain:** Domain registrar web application (simulated backend)
**Researched:** 2026-03-11
**Confidence:** HIGH (Next.js App Router, Prisma, NextAuth are well-established; domain registrar patterns are well-documented)

## Recommended Architecture

Taco Domains follows a **layered full-stack monolith** architecture using Next.js App Router as the single deployment unit. The key architectural insight is the **simulation layer** -- a service abstraction that mimics real registrar API behavior (EPP protocol, WHOIS/RDAP, DNS provisioning) using database operations, designed so each simulated service can be swapped for a real provider integration later without touching UI or API route code.

```
+-------------------------------------------------------------------+
|                        CLIENT (Browser)                            |
|  React Server Components + Client Components (App Router)          |
|  Pages: Home | Dashboard | DNS | Marketplace | Auth                |
+-------------------------------------------------------------------+
          |                    |                      |
          v                    v                      v
+-------------------+  +----------------+  +------------------+
| Server Actions    |  | API Routes     |  | RDAP/DNS-over-   |
| (mutations)       |  | /api/v1/*      |  | HTTPS (external) |
| register, renew,  |  | (public API)   |  | (availability    |
| update DNS, bid   |  |                |  |  checking only)  |
+-------------------+  +----------------+  +------------------+
          |                    |
          v                    v
+-------------------------------------------------------------------+
|                     SERVICE LAYER                                   |
|  DomainService | DNSService | MarketplaceService | UserService     |
|  Each wraps a RegistrarAdapter interface                           |
+-------------------------------------------------------------------+
          |
          v
+-------------------------------------------------------------------+
|                  REGISTRAR ADAPTER (Strategy Pattern)               |
|  SimulatedRegistrar (now) | RealRegistrar (future)                 |
|  implements: register, renew, transfer, checkAvailability,         |
|  getDNSRecords, updateDNSRecords                                   |
+-------------------------------------------------------------------+
          |
          v
+-------------------------------------------------------------------+
|                     DATA LAYER                                      |
|  Prisma ORM -> PostgreSQL (prod) / SQLite (dev)                   |
|  Models: User, Domain, DNSRecord, MarketplaceListing, Bid,         |
|          Transaction, AuditLog                                      |
+-------------------------------------------------------------------+
```

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Pages/Layouts** (App Router) | UI rendering, route structure, auth guards | Server Actions, Client hooks |
| **Server Actions** | Mutation logic (register domain, update DNS, place bid) | Service Layer |
| **API Routes** (`/api/v1/*`) | Public REST API for external consumers, RDAP proxy | Service Layer |
| **DomainService** | Domain lifecycle: search, register, renew, transfer, lock | RegistrarAdapter, Prisma |
| **DNSService** | DNS record CRUD, zone management, validation | RegistrarAdapter, Prisma |
| **MarketplaceService** | Listings, auctions, bids, escrow state machine | Prisma, DomainService |
| **UserService** | Profile, authentication context, domain ownership | Prisma, NextAuth |
| **RegistrarAdapter** | Abstraction over domain operations (simulated now, real later) | Prisma (simulated) or EPP API (future) |
| **Prisma Client** | Database access, type-safe queries | PostgreSQL/SQLite |
| **NextAuth** | Session management, JWT, OAuth/credentials providers | Prisma (adapter) |
| **RDAP Client** | External availability checking (Verisign, rdap.org, Google DNS) | External APIs |

### Data Flow

**Domain Search Flow:**
```
User types query
  -> Client Component captures input (debounced)
  -> Server Action OR client-side fetch to RDAP/DNS-over-HTTPS
  -> For each TLD: parallel RDAP lookup (external, real)
  -> Fallback to DNS-over-HTTPS (Google) if RDAP fails (CORS)
  -> Results streamed back to UI as they resolve
  -> "Register" button triggers registration flow
```

**Domain Registration Flow:**
```
User clicks Register
  -> Server Action: registerDomain(name, years, options)
  -> Auth check (NextAuth session required)
  -> DomainService.register()
    -> RegistrarAdapter.register() [simulated: creates DB record]
    -> Creates Domain record (status: ACTIVE, expiresAt: now + years)
    -> Creates default DNS records (A, CNAME, MX placeholder)
    -> Creates Transaction record (simulated payment)
  -> Revalidate dashboard page cache
  -> Return success to client
```

**DNS Management Flow:**
```
User edits DNS record
  -> Server Action: updateDNSRecord(domainId, recordId, data)
  -> Auth check + ownership verification
  -> DNSService.updateRecord()
    -> Validate record (type-specific: A needs valid IP, MX needs priority, etc.)
    -> RegistrarAdapter.updateDNS() [simulated: updates DB]
    -> Log change to AuditLog
  -> Revalidate DNS page cache
```

**Marketplace Bid Flow:**
```
User places bid on auction
  -> Server Action: placeBid(listingId, amount)
  -> Auth check + balance verification
  -> MarketplaceService.placeBid()
    -> Validate: bid > current highest, auction still open
    -> Create Bid record
    -> Update listing currentBid
    -> (Future: hold funds in escrow)
  -> Revalidate marketplace listing cache
```

## Project Structure

```
taco-domains/
  src/
    app/                          # Next.js App Router
      (public)/                   # Route group: public pages (no auth)
        page.tsx                  # Landing/home page (domain search)
        pricing/page.tsx
        marketplace/page.tsx      # Browse listings (public)
        layout.tsx                # Public layout with nav
      (dashboard)/                # Route group: authenticated pages
        dashboard/
          page.tsx                # Overview
          domains/page.tsx        # My domains list
          domains/[id]/page.tsx   # Single domain management
          dns/page.tsx            # DNS editor (domain selector)
          dns/[domainId]/page.tsx # DNS records for specific domain
          marketplace/page.tsx    # My listings & bids
          settings/page.tsx       # Profile & preferences
        layout.tsx                # Dashboard layout with sidebar
      api/
        auth/[...nextauth]/       # NextAuth handler
        v1/                       # Public API
          domains/route.ts        # GET search, POST register
          domains/[id]/route.ts   # GET/PUT/DELETE domain
          dns/[domainId]/route.ts # DNS record CRUD
          marketplace/route.ts    # Listings API
      layout.tsx                  # Root layout (providers, fonts, theme)

    lib/
      services/                   # Business logic layer
        domain.service.ts
        dns.service.ts
        marketplace.service.ts
        user.service.ts
      adapters/                   # Registrar abstraction
        registrar.adapter.ts      # Interface definition
        simulated.adapter.ts      # Database-backed simulation
      rdap/                       # External availability checking
        rdap-client.ts            # RDAP server mappings + fetch
        dns-fallback.ts           # Google DNS-over-HTTPS fallback
      auth/                       # Auth configuration
        auth-options.ts           # NextAuth config
        auth-guard.ts             # Session helpers
      db/
        prisma.ts                 # Singleton Prisma client
      validators/                 # Input validation (Zod schemas)
        domain.schema.ts
        dns.schema.ts
        marketplace.schema.ts

    components/
      ui/                         # Generic UI components
      domain/                     # Domain-specific components
        search-bar.tsx
        search-results.tsx
        registration-modal.tsx
        domain-table.tsx
      dns/                        # DNS-specific components
        record-editor.tsx
        record-row.tsx
        zone-import.tsx
      marketplace/                # Marketplace components
        listing-card.tsx
        auction-timer.tsx
        bid-form.tsx
      dashboard/                  # Dashboard components
        sidebar.tsx
        stats-cards.tsx
      layout/                     # Layout components
        navbar.tsx
        footer.tsx
        chatbot.tsx

  prisma/
    schema.prisma                 # Database schema
    migrations/                   # Auto-generated migrations
    seed.ts                       # Seed data (demo domains, listings)
```

## Database Schema (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  domains       Domain[]
  bids          Bid[]
  listings      MarketplaceListing[]
  sessions      Session[]
  accounts      Account[]
}

model Domain {
  id            String    @id @default(cuid())
  name          String    @unique    // e.g. "spicy-salsa.com"
  tld           String               // e.g. "com"
  status        DomainStatus @default(ACTIVE)
  registeredAt  DateTime  @default(now())
  expiresAt     DateTime
  autoRenew     Boolean   @default(true)
  whoisPrivacy  Boolean   @default(true)
  locked        Boolean   @default(false)
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  dnsRecords    DNSRecord[]
  listing       MarketplaceListing?
  auditLogs     AuditLog[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum DomainStatus {
  ACTIVE
  EXPIRING      // within 30 days of expiry
  EXPIRED
  PARKED
  TRANSFERRING
  LOCKED
  PENDING_DELETE
}

model DNSRecord {
  id        String    @id @default(cuid())
  domainId  String
  domain    Domain    @relation(fields: [domainId], references: [id], onDelete: Cascade)
  type      DNSRecordType
  name      String    // "@", "www", "mail", etc.
  value     String    // IP, hostname, text value
  ttl       Int       @default(3600)
  priority  Int?      // For MX records
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([domainId])
}

enum DNSRecordType {
  A
  AAAA
  CNAME
  MX
  TXT
  NS
  SRV
  CAA
}

model MarketplaceListing {
  id          String        @id @default(cuid())
  domainId    String        @unique
  domain      Domain        @relation(fields: [domainId], references: [id])
  sellerId    String
  seller      User          @relation(fields: [sellerId], references: [id])
  type        ListingType
  askingPrice Decimal       @db.Decimal(10,2)
  currentBid  Decimal?      @db.Decimal(10,2)
  minBid      Decimal?      @db.Decimal(10,2)
  status      ListingStatus @default(ACTIVE)
  endsAt      DateTime?     // For auctions
  bids        Bid[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

enum ListingType {
  FIXED_PRICE
  AUCTION
}

enum ListingStatus {
  ACTIVE
  SOLD
  EXPIRED
  CANCELLED
}

model Bid {
  id        String    @id @default(cuid())
  listingId String
  listing   MarketplaceListing @relation(fields: [listingId], references: [id])
  bidderId  String
  bidder    User      @relation(fields: [bidderId], references: [id])
  amount    Decimal   @db.Decimal(10,2)
  createdAt DateTime  @default(now())

  @@index([listingId])
}

model AuditLog {
  id        String    @id @default(cuid())
  domainId  String
  domain    Domain    @relation(fields: [domainId], references: [id])
  action    String    // "REGISTERED", "RENEWED", "DNS_UPDATED", "TRANSFERRED", etc.
  details   Json?
  createdAt DateTime  @default(now())

  @@index([domainId])
}

model Transaction {
  id        String    @id @default(cuid())
  userId    String
  type      String    // "REGISTRATION", "RENEWAL", "MARKETPLACE_PURCHASE"
  amount    Decimal   @db.Decimal(10,2)
  status    String    @default("COMPLETED") // Simulated: always completed
  details   Json?
  createdAt DateTime  @default(now())
}

// NextAuth required models
model Account { ... }
model Session { ... }
model VerificationToken { ... }
```

## Patterns to Follow

### Pattern 1: Registrar Adapter (Strategy Pattern)

The most important architectural decision. All domain operations go through an adapter interface so the simulated backend can be swapped for a real EPP/registrar API later.

**What:** Define a TypeScript interface for all registrar operations. The simulated implementation uses Prisma directly. A future real implementation would call EPP or a registrar's REST API.

**When:** Every domain lifecycle operation (register, renew, transfer, check availability, manage DNS).

**Example:**
```typescript
// lib/adapters/registrar.adapter.ts
export interface RegistrarAdapter {
  checkAvailability(domain: string): Promise<AvailabilityResult>;
  register(domain: string, years: number, opts: RegisterOpts): Promise<DomainResult>;
  renew(domain: string, years: number): Promise<DomainResult>;
  transfer(domain: string, authCode: string): Promise<DomainResult>;
  lock(domain: string): Promise<void>;
  unlock(domain: string): Promise<void>;
  getDNSRecords(domain: string): Promise<DNSRecord[]>;
  setDNSRecords(domain: string, records: DNSRecord[]): Promise<void>;
}

// lib/adapters/simulated.adapter.ts
export class SimulatedRegistrar implements RegistrarAdapter {
  constructor(private prisma: PrismaClient) {}

  async register(domain: string, years: number, opts: RegisterOpts) {
    // Create domain in database with calculated expiry
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + years);

    return this.prisma.domain.create({
      data: {
        name: domain,
        tld: domain.split('.').pop()!,
        expiresAt,
        autoRenew: opts.autoRenew ?? true,
        whoisPrivacy: opts.whoisPrivacy ?? true,
        userId: opts.userId,
      }
    });
  }
  // ... other methods
}
```

### Pattern 2: Server Actions for Mutations

Use Next.js Server Actions (not API routes) for all user-facing mutations. API routes are reserved for the public REST API.

**What:** Colocate mutation logic with the forms/components that trigger them. Server Actions provide automatic form handling, optimistic updates, and error boundaries.

**When:** Any user action that writes data: register domain, update DNS, place bid, update profile.

**Example:**
```typescript
// app/(dashboard)/dashboard/dns/actions.ts
'use server'

import { auth } from '@/lib/auth/auth-options'
import { dnsService } from '@/lib/services/dns.service'
import { dnsRecordSchema } from '@/lib/validators/dns.schema'
import { revalidatePath } from 'next/cache'

export async function addDNSRecord(formData: FormData) {
  const session = await auth()
  if (!session?.user) throw new Error('Unauthorized')

  const data = dnsRecordSchema.parse({
    domainId: formData.get('domainId'),
    type: formData.get('type'),
    name: formData.get('name'),
    value: formData.get('value'),
    ttl: Number(formData.get('ttl')),
    priority: formData.get('priority') ? Number(formData.get('priority')) : undefined,
  })

  await dnsService.addRecord(session.user.id, data)
  revalidatePath(`/dashboard/dns/${data.domainId}`)
}
```

### Pattern 3: Hybrid Availability Checking

Preserve the existing RDAP + DNS-over-HTTPS approach but move it server-side to avoid CORS issues and add caching.

**What:** Domain availability checks use a waterfall: (1) check local database (already registered with us?), (2) RDAP query to authoritative server, (3) DNS-over-HTTPS fallback if RDAP fails. Cache results for 5 minutes.

**When:** Domain search on the home page and during registration validation.

**Example:**
```typescript
// lib/rdap/rdap-client.ts
const RDAP_SERVERS: Record<string, string> = {
  com: 'https://rdap.verisign.com/com/v1/domain/',
  net: 'https://rdap.verisign.com/net/v1/domain/',
  org: 'https://rdap.org/domain/',
  io:  'https://rdap.org/domain/',
  // ... all TLDs from existing code
};

export async function checkAvailability(domain: string): Promise<AvailabilityResult> {
  // 1. Check our own database first
  const ours = await prisma.domain.findUnique({ where: { name: domain } });
  if (ours) return { domain, available: false, source: 'local' };

  // 2. RDAP lookup (server-side, no CORS issues)
  try {
    const result = await rdapLookup(domain);
    return result;
  } catch {
    // 3. DNS-over-HTTPS fallback
    return dnsFallback(domain);
  }
}
```

### Pattern 4: Service Layer with Ownership Guards

Every service method that touches user data verifies ownership before proceeding.

**What:** Services accept userId as a parameter and verify the requesting user owns the resource before performing operations. This prevents one user from editing another's domains or DNS records.

**When:** All dashboard operations.

**Example:**
```typescript
// lib/services/domain.service.ts
export class DomainService {
  async getDomainForUser(userId: string, domainId: string) {
    const domain = await prisma.domain.findUnique({
      where: { id: domainId },
      include: { dnsRecords: true }
    });
    if (!domain || domain.userId !== userId) {
      throw new Error('Domain not found or access denied');
    }
    return domain;
  }
}
```

### Pattern 5: Zod Validation at the Boundary

Validate all inputs at the entry point (Server Actions, API routes) using Zod schemas. Services receive pre-validated data.

**What:** Define Zod schemas for every input shape. Parse (not just validate) in Server Actions and API route handlers before passing to services.

**When:** Every Server Action, every API route handler.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Direct Prisma in Components

**What:** Importing and calling Prisma directly from React components or pages.
**Why bad:** Bypasses validation, ownership checks, and the adapter pattern. Makes it impossible to swap the simulated backend later. Scatters business logic across the UI layer.
**Instead:** Always go through the service layer. Pages call services in Server Components; Client Components use Server Actions.

### Anti-Pattern 2: Client-Side Domain Operations

**What:** Performing domain registration, DNS updates, or marketplace operations via client-side fetch to external APIs.
**Why bad:** Exposes API keys, can't enforce ownership, no server-side validation, CORS issues with RDAP servers (the existing code already suffers from this).
**Instead:** All mutations through Server Actions. Availability checking moved server-side (RDAP calls from Next.js server have no CORS restrictions).

### Anti-Pattern 3: Monolithic API Route Files

**What:** Putting all domain logic in a single `/api/domains/route.ts` with a giant switch statement.
**Why bad:** Untestable, hard to maintain, mixes concerns.
**Instead:** Thin API route handlers that validate input, call the service layer, and return responses. Each route file handles one resource with standard HTTP methods (GET/POST/PUT/DELETE).

### Anti-Pattern 4: Storing State in URL Hash (SPA-style routing)

**What:** The existing `index.html` uses `showPage('dashboard')` with CSS class toggling for page visibility, like a single-page app.
**Why bad:** No deep linking, no SSR, no code splitting, no SEO, breaks browser back button.
**Instead:** Use Next.js App Router file-based routing. Each page is a separate route with its own URL, SSR capability, and code splitting.

### Anti-Pattern 5: Coupling Auction Logic with Domain Logic

**What:** Putting marketplace/auction state management inside the domain service.
**Why bad:** Different lifecycle, different rules, different access patterns. Auctions have temporal logic (countdown, auto-close), domains don't.
**Instead:** Separate MarketplaceService that references domains but owns its own state machine (listing created -> bids placed -> auction ended -> domain transferred).

## Key Architectural Decisions

### Server Components vs Client Components

| Component | Type | Reason |
|-----------|------|--------|
| Dashboard overview | Server | Fetches domain list, no interactivity needed for initial render |
| Domain table | Server + Client | Server fetches data, client handles sort/filter/toggle auto-renew |
| Domain search bar | Client | Real-time input, debounce, streaming results |
| Search results | Client | Updates incrementally as RDAP responses arrive |
| DNS record editor | Client | Interactive form with add/edit/delete operations |
| Marketplace listings | Server | Static render of current listings, pagination server-side |
| Auction timer | Client | Real-time countdown, must update every second |
| Bid form | Client | Form with validation, optimistic updates |
| Navbar | Client | Active state, mobile menu toggle |
| Chatbot | Client | Interactive chat widget |
| Registration modal | Client | Form with dynamic fields |

### Caching Strategy

| Resource | Cache Strategy | Revalidation |
|----------|---------------|--------------|
| Domain list (dashboard) | Server Component cache | On-demand (after register/delete/renew) |
| DNS records | Server Component cache | On-demand (after add/edit/delete record) |
| Marketplace listings | ISR (60s) | On-demand (after new listing/bid/sale) |
| Domain search/availability | No cache (real-time) | N/A -- always fresh |
| User profile | Session-based | On profile update |
| Pricing data | Static (build-time) | Rebuild on price change |

## Suggested Build Order

Based on component dependencies, the architecture implies this build sequence:

```
Phase 1: Foundation
  Database schema (Prisma) + Auth (NextAuth)
    -> Everything depends on these

Phase 2: Domain Core
  RegistrarAdapter interface + SimulatedRegistrar
  DomainService
  RDAP client (port existing JS logic server-side)
    -> Required before any domain features work

Phase 3: UI Shell
  Root layout + Nav + Footer
  Public pages (home, pricing)
  Domain search (port existing RDAP search)
    -> The landing experience; depends on Phase 2 for search

Phase 4: Dashboard
  Dashboard layout with sidebar
  Domain management (list, details, renew, auto-renew toggle)
  Registration flow (modal -> Server Action -> service)
    -> Depends on Phase 1 (auth) + Phase 2 (domain service)

Phase 5: DNS Management
  DNSService
  DNS record editor (CRUD)
  Record validation (type-specific)
    -> Depends on Phase 4 (need domains to attach DNS to)

Phase 6: Marketplace
  MarketplaceService
  Listings (create, browse, search)
  Auctions (bid, countdown, auto-close)
  Domain transfer on sale
    -> Most complex feature; depends on Phase 4 (domain ownership)
```

**Dependency chain:** Database -> Auth -> Domain Service -> Search UI -> Dashboard -> DNS -> Marketplace

Each phase produces a usable increment. After Phase 3, users can search domains. After Phase 4, they can register and manage. After Phase 5, they can configure DNS. After Phase 6, they can trade.

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| Database | SQLite works fine | PostgreSQL required, add connection pooling | Read replicas, consider domain table partitioning by TLD |
| RDAP lookups | Direct fetch, no rate limiting concern | Add server-side cache (Redis), batch parallel lookups | Rate limit per user, queue RDAP requests, cache aggressively |
| Marketplace | Simple queries | Add indexes on listing status + endsAt, pagination | Separate marketplace service, search index (e.g., Meilisearch) |
| Auth sessions | JWT (stateless) | JWT (stateless, no change) | JWT with short expiry + refresh tokens |
| DNS record storage | Flat table | Index on domainId (already suggested) | Consider partitioning or separate DNS table per user tier |
| Real-time (auctions) | Polling every 10s | Server-Sent Events | WebSocket server or Ably/Pusher for auction updates |

For the simulated scope of this project, the "100 users" column is the operating reality. The architecture supports growing to 10K without significant rework. The 1M column would require service extraction and is out of scope.

## Sources

- Next.js App Router documentation (nextjs.org/docs) -- project structure, Server Components, Server Actions, route groups, API routes [HIGH confidence, well-established patterns]
- Prisma ORM documentation (prisma.io/docs) -- schema modeling, relations, migrations [HIGH confidence]
- NextAuth.js documentation (next-auth.js.org) -- Prisma adapter, session management [HIGH confidence]
- IETF RFC 7480-7484 (RDAP protocol specification) -- availability checking patterns [HIGH confidence]
- Existing index.html codebase analysis -- RDAP servers, DNS-over-HTTPS fallback, UI feature mapping [HIGH confidence, direct code inspection]
- Domain registrar architecture patterns (EPP RFC 5730-5734) -- understanding of real registrar systems that the simulation layer mimics [MEDIUM confidence, from training data]
