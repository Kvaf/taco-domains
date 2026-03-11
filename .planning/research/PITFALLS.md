# Domain Pitfalls

**Domain:** Domain registrar web application (simulated backend, real RDAP lookups)
**Project:** Taco Domains
**Researched:** 2026-03-11
**Confidence:** MEDIUM (training data only -- web search and fetch tools were unavailable)

---

## Critical Pitfalls

Mistakes that cause rewrites, broken features, or architectural dead ends.

### Pitfall 1: Client-Side RDAP Calls and CORS Failures

**What goes wrong:** The current `index.html` makes RDAP API calls directly from the browser. Most RDAP servers (especially `rdap.org` and many registry-specific servers) do not set `Access-Control-Allow-Origin` headers consistently. The existing code already has a DNS-over-HTTPS fallback for exactly this reason, but DNS-over-HTTPS is not a reliable availability check -- a domain can exist without having DNS records (parked, pending, etc.), and some registrars hold domains that never resolve.

**Why it happens:** RDAP was designed as a server-to-server protocol (replacement for WHOIS). Browser CORS was an afterthought. Verisign's RDAP server (`rdap.verisign.com`) does support CORS for `.com`/`.net`, but most other TLD registries do not. The existing code silently falls through to a DNS-based check that gives false positives ("available" when the domain is actually registered but not resolving).

**Consequences:**
- Users see "Available!" for domains that are actually taken (false positives from DNS fallback)
- Users see "Unknown" for perfectly checkable domains (CORS blocks on the RDAP call)
- Inconsistent results across TLDs erode trust immediately
- If users attempt to "register" a domain shown as available that is actually taken, the simulation diverges from reality

**Prevention:**
- Move ALL RDAP lookups to a Next.js API route (`/api/domain/check`). The server has no CORS restrictions.
- Keep the DNS-over-HTTPS fallback as a secondary signal, but label it clearly (e.g., "Likely available" vs "Available") when the RDAP call fails.
- Cache RDAP responses server-side with a short TTL (60-120 seconds) to reduce load on upstream servers.
- Implement proper error handling that distinguishes "domain not found" (404 = available) from "server error" (5xx = unknown) from "rate limited" (429 = retry later).

**Detection:** Test domain search for `.io`, `.ai`, `.app` TLDs from the browser. If you get "Unknown" or inconsistent results, CORS is the cause.

**Phase mapping:** Must be addressed in the very first phase (domain search). This is the core product experience.

---

### Pitfall 2: RDAP Rate Limiting Without Server-Side Throttling

**What goes wrong:** RDAP servers impose rate limits (typically 10-20 requests per second per IP for Verisign, lower for others). The existing code fires 10 parallel requests when a user searches without a TLD (one per TLD). With multiple concurrent users, the server IP gets rate-limited and all lookups fail simultaneously.

**Why it happens:** The landing page was designed for a single user demo. In a multi-user Next.js app where the server makes RDAP calls, all requests originate from the same server IP. Bulk search (already in the UI) makes this worse -- a user entering 20 domains triggers 20 simultaneous RDAP requests.

**Consequences:**
- Rate limiting (HTTP 429) from RDAP servers causes cascading failures
- All users lose domain search functionality at once (since they share the server IP)
- Some RDAP servers temporarily ban IPs that exceed limits, causing minutes-long outages

**Prevention:**
- Implement a request queue/rate limiter on the server side (e.g., `p-queue` or `bottleneck` library) that caps concurrent RDAP requests per TLD server.
- For bulk search, process domains sequentially or with a concurrency limit of 2-3 per TLD server.
- Cache results aggressively: if someone searched `taco-shop.com` 30 seconds ago, serve the cached result.
- Consider a Redis-based or in-memory rate limiter that tracks requests per RDAP endpoint.
- Show results as they stream in (partial results) rather than waiting for all checks to complete.

**Detection:** Test bulk search with 10+ domains. Monitor server logs for 429 responses from RDAP endpoints.

**Phase mapping:** Must be addressed alongside domain search (Phase 1). Without this, the feature breaks under any real usage.

---

### Pitfall 3: Simulated Backend That Cannot Be Swapped for Real APIs

**What goes wrong:** Building simulated domain operations (register, renew, transfer) as direct database writes scattered throughout the codebase, making it impossible to later swap in a real registrar API (like Namecheap, GoDaddy Reseller, or OpenSRS) without rewriting every call site.

**Why it happens:** Developers treat the simulation as "just saving to the database" and put domain logic directly in API route handlers. When the time comes to integrate a real registrar API, the registration logic is entangled with UI state management, validation, and database writes.

**Consequences:**
- Major rewrite required when transitioning from simulated to real registrar
- Business logic (pricing, validation, availability) is duplicated across API routes
- No clear boundary between "what the registrar does" and "what our app does"

**Prevention:**
- Create a `RegistrarService` interface/abstract class with methods like `checkAvailability()`, `register()`, `renew()`, `transfer()`, `getDnsRecords()`, `setDnsRecords()`.
- Build a `SimulatedRegistrarService` that implements the interface using database operations.
- All API routes call the service interface, never the database directly for domain operations.
- Document the interface contract so a `RealRegistrarService` can be implemented later as a drop-in replacement.
- Keep registrar-specific concerns (EPP codes, WHOIS data formats, transfer workflows) in the service layer even in simulation mode.

**Detection:** Ask "Could I swap the simulated registrar for a real API by changing one file?" If the answer is no, the abstraction is leaking.

**Phase mapping:** Must be established in the architecture/foundation phase (Phase 1). Retrofitting this abstraction is a rewrite.

---

### Pitfall 4: Auction/Marketplace Without Concurrency Control

**What goes wrong:** The marketplace allows bidding and "Buy Now" on domains. Without proper concurrency handling, two users can "buy now" the same domain, or a bid can be placed after an auction ends, or the winning bid amount is inconsistent due to race conditions.

**Why it happens:** In a simulated environment, developers skip transaction safety because "it's just a database." But marketplace operations are inherently concurrent -- multiple users acting on the same listing simultaneously.

**Consequences:**
- Two users "purchase" the same domain (double-sell)
- Bids recorded after auction end time
- Bid amounts out of order (lower bid overwrites higher bid due to race condition)
- Users lose trust in the marketplace immediately

**Prevention:**
- Use database transactions with row-level locking (`SELECT ... FOR UPDATE` via Prisma's `$transaction`) for all marketplace operations.
- Implement optimistic locking on listings (version field that must match on update).
- Validate auction end times server-side, never trust client timestamps.
- For "Buy Now," use a `status` field with atomic compare-and-swap: only succeed if `status = 'LISTED'`, and set it to `'SOLD'` atomically.
- Add a `bids` table with a unique constraint on `(listing_id, bid_amount)` and validate `new_bid > current_highest_bid` inside the transaction.

**Detection:** Write concurrent test scenarios: two simultaneous "Buy Now" clicks, bid placed at auction end time, rapid sequential bids.

**Phase mapping:** Must be addressed when building the marketplace (likely Phase 3-4). Design the data model with concurrency in mind from the start, even if the implementation comes later.

---

### Pitfall 5: DNS Record Editor Without Validation

**What goes wrong:** The DNS editor allows users to create/edit A, CNAME, MX, TXT records. Without proper validation, users can create records that conflict (CNAME at zone apex, CNAME coexisting with other records at the same name), enter invalid IP addresses, or create circular references -- and the UI happily saves them.

**Why it happens:** DNS validation rules are surprisingly complex and non-obvious. Developers validate individual field formats (e.g., "is this a valid IP?") but miss relational constraints between records.

**Consequences:**
- Users save invalid DNS configurations that would break real DNS resolution
- When the simulation is swapped for a real DNS provider, saved records cannot be pushed upstream
- User confusion when their "saved" DNS records don't match what any real DNS server would accept
- Loss of trust: users who know DNS will immediately see the editor is fake/broken

**Prevention:**
- Validate DNS constraints server-side:
  - CNAME cannot coexist with any other record type at the same name
  - CNAME cannot exist at the zone apex (`@`)
  - A records must be valid IPv4 addresses, AAAA must be valid IPv6
  - MX records must have a priority (integer) and a hostname (not an IP)
  - TXT records have a 255-character per string limit (can be concatenated)
  - TTL must be between 60 and 86400 (or use sane defaults)
- Show validation errors inline in the editor, not just on save.
- Consider a "Validate Zone" button that checks all records together for conflicts.
- Model DNS records with proper types in Prisma schema (enum for record type, validated value fields).

**Detection:** Try creating a CNAME record at `@` alongside an existing A record at `@`. If the editor allows it, validation is missing.

**Phase mapping:** Address when building the DNS editor (Phase 2-3). The validation logic should be shared between client and server.

---

## Moderate Pitfalls

### Pitfall 6: Authentication State Split Between Server and Client

**What goes wrong:** In Next.js with NextAuth, there's a common pattern of checking auth state differently in server components (via `getServerSession`), client components (via `useSession`), API routes (via `getServerSession` again), and middleware (via `getToken`). When these get out of sync or use different session resolution logic, users experience phantom logouts, unauthorized API calls succeeding, or authenticated pages showing login prompts.

**Prevention:**
- Centralize auth checks: create a single `getCurrentUser()` utility for server contexts and rely on NextAuth's `useSession` hook for client contexts.
- Use NextAuth middleware for route protection rather than checking auth in individual page components.
- Test the auth flow end-to-end: login, navigate to protected page, refresh, call API, logout, attempt to access protected page.
- Store user role/permissions in the JWT token to avoid extra database calls on every request.

**Detection:** Log in, navigate to the dashboard, hard-refresh the page. If you see a flash of the login page before the dashboard loads, session hydration is broken.

**Phase mapping:** Address in the authentication phase (Phase 1). Getting this wrong early means debugging auth issues in every subsequent phase.

---

### Pitfall 7: Domain Name Validation That Is Too Permissive or Too Restrictive

**What goes wrong:** The existing code uses `replace(/[^a-z0-9-]/g, '')` for domain name sanitization. This is too permissive (allows leading/trailing hyphens, consecutive hyphens in positions 3-4 which are reserved for IDN/punycode) and too restrictive (rejects internationalized domain names). Users either get confusing errors or are allowed to "register" invalid domain names.

**Prevention:**
- Validate domain labels per RFC 5891/5892:
  - 1-63 characters per label
  - Only lowercase alphanumerics and hyphens
  - Cannot start or end with a hyphen
  - Cannot have hyphens in positions 3 and 4 unless it's a valid punycode label (`xn--`)
  - Total domain name cannot exceed 253 characters
- For the simulated registrar, accept only ASCII domains initially. Flag IDN support as a future enhancement.
- Validate on both client (for UX) and server (for security).
- Show specific error messages: "Domain names cannot start with a hyphen" rather than silently stripping characters.

**Detection:** Try searching for `--test.com`, `-test.com`, `test-.com`, or a domain name with 64+ characters. The system should reject all of these with clear messages.

**Phase mapping:** Address alongside domain search (Phase 1).

---

### Pitfall 8: Hardcoded TLD Prices and RDAP Server Mappings

**What goes wrong:** The existing code has `TLD_PRICES` and `RDAP_SERVERS` as hardcoded JavaScript objects. When converting to Next.js, these tend to get duplicated -- once in the frontend for display, once in the API for validation, maybe once more in seed data. Prices change, new TLDs are added, RDAP server URLs change -- and the system gets inconsistent.

**Prevention:**
- Store TLD configuration in the database or a single configuration file that both frontend and backend read.
- Create a `tlds` table in the database with columns: `tld`, `price`, `rdap_server_url`, `is_active`, `renewal_price`, `transfer_price`.
- Seed this table during setup and provide an admin interface (or at minimum a seed script) to update it.
- API routes read from the database; the frontend fetches from an API endpoint.
- Never hardcode prices in UI components.

**Detection:** Search the codebase for price values like `$12.99`. If they appear in more than one file, they're duplicated.

**Phase mapping:** Address in the data model/foundation phase (Phase 1). This informs the Prisma schema design.

---

### Pitfall 9: Brownfield Conversion That Tries to Port Everything at Once

**What goes wrong:** The existing `index.html` is a 925-line monolith with CSS, HTML, and JavaScript all inline. The temptation is to convert everything to React components in one big phase. This leads to a massive, untestable changeset where the converted app doesn't look or behave like the original, and bugs are impossible to isolate.

**Prevention:**
- Convert page by page, not all at once. Start with the domain search (core value), then dashboard, then DNS editor, then marketplace.
- Extract the design tokens first (CSS custom properties are already defined in `:root`) into a Tailwind config or CSS module. This ensures visual consistency before touching functionality.
- The existing RDAP/DNS-over-HTTPS JavaScript logic should be ported to a server-side utility function, tested independently, and then connected to the UI.
- Do not try to achieve pixel-perfect parity with the original. The goal is "refreshed" (per PROJECT.md), not "identical."
- Keep the original `index.html` as a visual reference but do not import it into the Next.js project.

**Detection:** If a single PR touches more than 3-4 pages simultaneously, the conversion is too broad. Each page should be a separate, reviewable unit.

**Phase mapping:** This is a meta-pitfall about project structure. Address by structuring phases around individual features/pages, not "convert everything."

---

### Pitfall 10: Marketplace Search and Filtering Without Proper Indexing

**What goes wrong:** The marketplace needs search (by domain name), filtering (by TLD, price range, auction status), and sorting (by price, time remaining, number of bids). Without proper database indexing and query design, these operations become slow even with a few hundred listings, and the code accumulates complex raw SQL or Prisma query chains.

**Prevention:**
- Design the marketplace data model with querying in mind:
  - Index on `domain_name` (for search/partial matching)
  - Index on `tld` (for filtering)
  - Composite index on `(status, end_time)` (for "active auctions ending soon")
  - Index on `current_price` (for price sorting/filtering)
- Use Prisma's `where`, `orderBy`, and pagination (`skip`/`take` or cursor-based) rather than fetching all listings and filtering in JavaScript.
- For domain name search, use PostgreSQL's `ILIKE` with a prefix pattern (`domain ILIKE 'taco%'`) rather than full-text search (overkill for domain names).
- Implement cursor-based pagination from the start; offset pagination breaks at scale.

**Detection:** Add 500+ test marketplace listings and test search/filter performance. If queries take more than 100ms, indexing is missing.

**Phase mapping:** Address when building the marketplace (Phase 3-4). The Prisma schema should include indexes from day one.

---

## Minor Pitfalls

### Pitfall 11: Dark Theme Accessibility Failures

**What goes wrong:** The taco-themed dark UI uses low-contrast color combinations. The existing design has `--text3:#60607a` on `--bg:#070709`, which fails WCAG AA contrast requirements. Status badges, form labels, and secondary text become unreadable for users with visual impairments.

**Prevention:**
- Run all color combinations through a contrast checker during the design token extraction phase.
- Ensure all text meets WCAG AA (4.5:1 for normal text, 3:1 for large text).
- The fire gradient (`#ff5722` to `#ffc107`) on dark backgrounds is generally fine, but test gold (`#ffd740`) on dark backgrounds -- it often fails.
- Add focus indicators to all interactive elements (the existing CSS has no `:focus-visible` styles).

**Detection:** Use browser dev tools Accessibility panel or the axe extension. Check the "Expiring Soon" badge and secondary text specifically.

**Phase mapping:** Address during the design system/component library phase (Phase 1-2).

---

### Pitfall 12: Domain Expiry and Renewal Logic Without Time Zone Handling

**What goes wrong:** Domain expiration dates are stored and compared without consistent time zone handling. A domain expiring on "2026-04-02" might be treated as expiring at midnight UTC, midnight server-local-time, or midnight user-local-time -- leading to domains showing as "expired" a day early or "active" a day late depending on the user's location.

**Prevention:**
- Store all dates as UTC in the database (PostgreSQL `TIMESTAMPTZ` / Prisma `DateTime`).
- Display dates in the user's local time zone on the frontend using `Intl.DateTimeFormat` or a library like `date-fns-tz`.
- For "expiring soon" calculations, compare against UTC timestamps server-side, not client-side.
- Auto-renew checks should run as a server-side job (or simulated on page load) using UTC comparisons.

**Detection:** Set the system clock to a time zone offset from UTC and check if "Expiring Soon" badges appear/disappear correctly.

**Phase mapping:** Address when implementing domain management (Phase 2).

---

### Pitfall 13: Chatbot XSS via User Message Rendering

**What goes wrong:** The existing chatbot uses `box.innerHTML += \`<div class="c-msg user">${msg}</div>\`` -- directly interpolating user input into HTML. This is a textbook XSS vulnerability. When converting to React, the same pattern can appear if using `dangerouslySetInnerHTML` or if the chatbot logic bypasses React's default escaping.

**Prevention:**
- In React, render chat messages as text content (`{message}`) not as HTML.
- If the bot responses need formatting (links, bold), use a safe markdown renderer or explicitly allowed HTML tags.
- Never use `dangerouslySetInnerHTML` for user-generated content.
- Sanitize all user input on the server side as well, even for chat messages.

**Detection:** Type `<img src=x onerror=alert(1)>` into the chatbot. If an alert fires, XSS is present.

**Phase mapping:** Address when converting the chatbot component (whenever it's ported to React).

---

### Pitfall 14: Auto-Renew Toggle Without Confirmation or Undo

**What goes wrong:** The existing UI has auto-renew toggles that fire on click with no confirmation. In the full-stack version, accidentally toggling auto-renew off on a critical domain could lead to unintentional domain expiration. Since this is simulated, the consequences are less severe, but the UX pattern trains bad habits.

**Prevention:**
- Add a confirmation dialog for disabling auto-renew: "Are you sure? [domain] will expire on [date] if not manually renewed."
- Log all auto-renew changes with timestamps for audit.
- Send a notification (in-app at minimum) when auto-renew is toggled off.
- Consider a "grace period" in the simulation where recently disabled auto-renew can be re-enabled easily.

**Detection:** Click the auto-renew toggle rapidly. If it fires multiple API calls and the final state is ambiguous, debouncing and confirmation are missing.

**Phase mapping:** Address when building domain management (Phase 2).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Domain Search (RDAP) | CORS failures on client-side RDAP calls (Pitfall 1) | Move ALL RDAP to server-side API routes from day one |
| Domain Search (RDAP) | Rate limiting crashes bulk search (Pitfall 2) | Implement request queue with per-server rate limits |
| Foundation/Architecture | Simulated backend is not swappable (Pitfall 3) | Define RegistrarService interface before writing any domain logic |
| Foundation/Architecture | Brownfield over-conversion (Pitfall 9) | Convert feature-by-feature, not page-by-page |
| Authentication | Auth state desync across server/client (Pitfall 6) | Centralize auth utilities, use middleware for protection |
| Data Model | Hardcoded TLD config gets duplicated (Pitfall 8) | Store TLD configuration in database, single source of truth |
| Domain Management | Timezone-related expiry bugs (Pitfall 12) | UTC everywhere, display in user's timezone |
| DNS Editor | Invalid DNS records saved without validation (Pitfall 5) | Implement RFC-compliant validation on both client and server |
| Marketplace | Race conditions on bids/purchases (Pitfall 4) | Database transactions with row-level locking |
| Marketplace | Slow search without indexes (Pitfall 10) | Design Prisma schema with composite indexes from start |
| UI/Design | Dark theme contrast failures (Pitfall 11) | Audit all color combinations against WCAG AA |
| Chatbot | XSS via innerHTML (Pitfall 13) | Use React text rendering, never dangerouslySetInnerHTML |

---

## Sources

- Analysis of existing `index.html` codebase (925 lines, inline CSS/JS/HTML)
- PROJECT.md requirements and constraints
- Training data knowledge on RDAP protocol (RFC 7480-7484, RFC 9224), DNS standards (RFC 1035), domain name validation (RFC 5891/5892), and Next.js/NextAuth patterns
- **Confidence note:** Web search and documentation fetch tools were unavailable during this research. Findings are based on training data (cutoff May 2025). RDAP server behavior, rate limits, and CORS policies should be verified against current documentation before implementation. All Next.js/NextAuth patterns should be verified against current versions.
