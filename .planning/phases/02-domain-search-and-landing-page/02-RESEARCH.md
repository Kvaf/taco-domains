# Phase 2: Domain Search and Landing Page - Research

**Researched:** 2026-03-11
**Domain:** RDAP domain availability checking, Next.js server-side API proxying, landing page composition
**Confidence:** HIGH

## Summary

Phase 2 converts the existing `index.html` landing page into React components and moves the RDAP-based domain search from client-side to server-side. The existing codebase already has a working RDAP implementation (Verisign for .com/.net, rdap.org for others, DNS-over-HTTPS fallback via dns.google), TLD pricing data, and a full landing page with hero, tagline strip, services strip, how-it-works, features grid, taco specials, and pricing sections. The critical architectural shift is moving ALL RDAP lookups to a Next.js Route Handler to eliminate CORS issues.

The Phase 1 scaffold provides: Next.js 16 with App Router, Tailwind v4 with taco theme in globals.css, a public layout with PublicNavbar, a placeholder home page, the RegistrarAdapter interface with SimulatedRegistrar stub, UI components (Button, Input, Card, Label, Avatar), and Zod v4 for validation. The Prisma schema includes Domain model with string-based status fields (SQLite).

**Primary recommendation:** Build the RDAP client as a server-side utility module (`src/lib/rdap/`), expose it via a Next.js Route Handler (`/api/domain/check`), then build the search UI as a client component that calls the API. Port the landing page sections as server components with the search bar as the only client component island.

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SRCH-01 | User can search for domain availability across multiple TLDs in real-time via RDAP | Server-side RDAP client porting existing JS logic; Route Handler at `/api/domain/check`; parallel lookups across TLDs |
| SRCH-02 | User can see pricing per TLD in search results | TLD config module with RDAP server URLs + prices as single source of truth; prices displayed in search result items |
| SRCH-03 | User can bulk search multiple domains at once | Textarea input parsing; rate-limited parallel RDAP checks; streaming results back to UI |
| SRCH-04 | User sees alternative name suggestions when first choice is taken | Name suggestion algorithm: synonyms, prefix/suffix variations, alternate TLDs for taken domains |
| SRCH-05 | Domain names are validated per RFC 5891 before searching | Zod schema with RFC 5891 rules: 1-63 chars per label, no leading/trailing hyphens, no positions 3-4 hyphens unless xn--, max 253 total chars |
| UI-03 | Landing page with hero, search, features, pricing sections | Port 6 sections from index.html: hero, tagline strip, services strip, how-it-works, features grid, taco specials, pricing |

</phase_requirements>

## Standard Stack

### Core (already installed in Phase 1)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | ^16.1.6 | App Router, Route Handlers for API | Already scaffolded; Route Handlers provide server-side RDAP proxy |
| React | ^19.2.4 | UI components | Already installed |
| Tailwind CSS | ^4.2.1 | Styling with taco theme | Already configured with full color palette in globals.css |
| Zod | ^4.3.6 | Domain name validation schemas | Already installed; use for RFC 5891 validation |
| Lucide React | ^0.577.0 | Icons for landing page sections | Already installed |

### New for Phase 2

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `p-queue` | ^8.x | RDAP request rate limiting | Server-side rate limiter for RDAP endpoint calls to prevent IP bans |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| p-queue | bottleneck | p-queue is simpler, ESM-native, smaller; bottleneck has more features but heavier |
| Route Handler | Server Action | Route Handlers are better for streaming/polling search results; Server Actions are for mutations |
| Framer Motion (for animations) | CSS animations | Framer Motion is already in the stack plan but NOT installed yet; use CSS @keyframes for hero orbs and fadeUp to avoid adding a dependency in this phase |

**Installation:**
```bash
npm install p-queue
```

**Note:** Framer Motion is NOT needed in this phase. The existing index.html animations (orb float, fadeUp, scroll reveal) can all be achieved with CSS animations and the Intersection Observer API. Install Framer Motion later when more complex animations are needed.

## Architecture Patterns

### Recommended Project Structure (new files for Phase 2)
```
src/
  app/
    (public)/
      page.tsx                    # Landing page (replace placeholder)
    api/
      domain/
        check/route.ts            # RDAP proxy Route Handler
  lib/
    rdap/
      rdap-client.ts              # Server-side RDAP lookup logic
      dns-fallback.ts             # Google DNS-over-HTTPS fallback
      tld-config.ts               # TLD prices + RDAP server URLs (single source of truth)
    validators/
      domain.schema.ts            # RFC 5891 domain validation schemas
    suggestions.ts                # Domain name suggestion algorithm
  components/
    domain/
      search-bar.tsx              # Client component: search input + TLD pills
      search-results.tsx          # Client component: result list with streaming updates
      bulk-search.tsx             # Client component: textarea bulk input
    landing/
      hero-section.tsx            # Server component: hero with orb background
      tagline-strip.tsx           # Server component: scrolling taglines
      services-strip.tsx          # Server component: service cards grid
      how-it-works.tsx            # Server component: 3-step process
      features-grid.tsx           # Server component: feature cards
      taco-specials.tsx           # Server component: bonus features
      pricing-section.tsx         # Server component: 3-tier pricing
      footer.tsx                  # Server component: footer with links
```

### Pattern 1: Server-Side RDAP Proxy
**What:** All RDAP lookups go through a Next.js Route Handler. The client never calls RDAP servers directly.
**When to use:** Every domain availability check.
**Example:**
```typescript
// src/app/api/domain/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkDomains } from '@/lib/rdap/rdap-client';
import { domainSearchSchema } from '@/lib/validators/domain.schema';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { domains } = domainSearchSchema.parse(body);

  const results = await checkDomains(domains);
  return NextResponse.json({ results });
}
```

### Pattern 2: TLD Configuration as Single Source of Truth
**What:** One module exports both RDAP server URLs and prices per TLD. No duplication.
**When to use:** Both the RDAP client (server-side) and the search results UI (client-side via API response) use this data.
**Example:**
```typescript
// src/lib/rdap/tld-config.ts
export interface TLDConfig {
  tld: string;
  rdapServer: string | null;  // null = no RDAP, use DNS fallback
  price: number;              // annual price in USD
  label: string;              // display price e.g. "$12.99"
}

export const TLD_CONFIGS: TLDConfig[] = [
  { tld: 'com', rdapServer: 'https://rdap.verisign.com/com/v1/domain/', price: 12.99, label: '$12.99' },
  { tld: 'net', rdapServer: 'https://rdap.verisign.com/net/v1/domain/', price: 11.99, label: '$11.99' },
  { tld: 'org', rdapServer: 'https://rdap.org/domain/', price: 10.99, label: '$10.99' },
  { tld: 'io',  rdapServer: 'https://rdap.org/domain/', price: 39.99, label: '$39.99' },
  { tld: 'ai',  rdapServer: 'https://rdap.org/domain/', price: 79.99, label: '$79.99' },
  { tld: 'app', rdapServer: 'https://rdap.org/domain/', price: 14.99, label: '$14.99' },
  { tld: 'dev', rdapServer: 'https://rdap.org/domain/', price: 14.99, label: '$14.99' },
  { tld: 'xyz', rdapServer: 'https://rdap.org/domain/', price: 2.99,  label: '$2.99'  },
  { tld: 'tech',rdapServer: 'https://rdap.org/domain/', price: 6.99,  label: '$6.99'  },
  { tld: 'se',  rdapServer: 'https://rdap.org/domain/', price: 19.99, label: '$19.99' },
  { tld: 'nu',  rdapServer: 'https://rdap.org/domain/', price: 17.99, label: '$17.99' },
  { tld: 'info',rdapServer: 'https://rdap.org/domain/', price: 9.99,  label: '$9.99'  },
  { tld: 'co',  rdapServer: 'https://rdap.org/domain/', price: 24.99, label: '$24.99' },
  { tld: 'taco',rdapServer: null, price: 4.20, label: '$4.20' },
];

export const TLD_MAP = Object.fromEntries(TLD_CONFIGS.map(c => [c.tld, c]));
export const DEFAULT_TLDS = ['com', 'io', 'ai', 'app', 'se', 'nu', 'tech', 'xyz', 'dev', 'taco'];
```

### Pattern 3: Streaming Search Results
**What:** Show placeholder "Checking..." items, then update each result as its RDAP response arrives. Do not wait for all results before rendering.
**When to use:** Domain search (both single and bulk).
**Example:**
```typescript
// Client component pattern
const [results, setResults] = useState<Map<string, DomainResult>>(new Map());

// Show placeholders immediately
const placeholders = domains.map(d => ({ domain: d, status: 'checking' as const }));

// Fetch results, update state per-domain as they arrive
const response = await fetch('/api/domain/check', {
  method: 'POST',
  body: JSON.stringify({ domains }),
});
const data = await response.json();
// Update results map
```

### Pattern 4: Landing Page as Server Components with Client Islands
**What:** The landing page is primarily server-rendered. Only the search bar, search results, and bulk search toggle are client components.
**When to use:** The landing page.
**Why:** Server components reduce JavaScript bundle size. The landing page sections (hero, features, pricing) are static content that benefits from SSR/SSG.

### Anti-Patterns to Avoid
- **Client-side RDAP calls:** CORS will fail for most TLDs except .com/.net. Always go through the Route Handler.
- **Hardcoded prices in components:** Use `TLD_CONFIGS` from `tld-config.ts`. Never put "$12.99" in a JSX component.
- **Single massive page.tsx:** Split each landing section into its own component file. The page.tsx should be a composition of imports.
- **Using Server Actions for search:** Search is a read operation, not a mutation. Use a Route Handler (GET or POST) so results can be cached and the request can be aborted.
- **Blocking on all RDAP results:** Show results incrementally. Some RDAP servers are slow (2-5s). Do not make the user wait for the slowest TLD.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| RDAP rate limiting | Custom setTimeout/retry logic | `p-queue` with concurrency limit | Handles queuing, concurrency caps, and backpressure properly |
| Domain name validation | Regex string matching | Zod schema with RFC 5891 rules | Composable, reusable on client+server, proper error messages |
| Request timeouts | Manual AbortController wiring | `AbortSignal.timeout(ms)` (built-in) | Already used in existing code; native API, no library needed |
| Scroll reveal animations | Custom IntersectionObserver code | CSS `@starting-style` or simple IO hook | Existing index.html uses IO; keep it simple, avoid Framer Motion overhead for basic reveals |
| TLD pill selection UI | Custom toggle state management | Simple `useState<Set<string>>` | No library needed; it's just a set of selected TLDs |

**Key insight:** The existing index.html already solves most of these problems. The main work is porting JS logic server-side and decomposing HTML into React components -- not inventing new solutions.

## Common Pitfalls

### Pitfall 1: CORS Failures on Client-Side RDAP (CRITICAL)
**What goes wrong:** Calling RDAP servers directly from the browser. Most RDAP servers (rdap.org, registry-specific) do not set CORS headers.
**Why it happens:** The existing index.html does this and it works only for Verisign (.com/.net). Other TLDs silently fall through to DNS-over-HTTPS which gives false positives.
**How to avoid:** ALL RDAP calls go through `/api/domain/check` Route Handler. The server has no CORS restrictions.
**Warning signs:** "Unknown" status for .io, .ai, .app domains in search results.

### Pitfall 2: RDAP Rate Limiting Crashes Bulk Search
**What goes wrong:** Bulk search with 10+ domains fires 10+ parallel RDAP requests from the same server IP. Verisign rate limits at ~10-20 req/s.
**Why it happens:** No server-side rate limiting; all requests fire simultaneously.
**How to avoid:** Use `p-queue` with concurrency limit of 3-5 per RDAP server. Process bulk search domains with controlled parallelism.
**Warning signs:** HTTP 429 responses from RDAP servers; all searches failing simultaneously.

### Pitfall 3: Domain Validation Too Permissive
**What goes wrong:** Existing code uses `replace(/[^a-z0-9-]/g, '')` which silently strips characters. This allows `--test`, `test-`, and overly long names.
**Why it happens:** Sanitization instead of validation. Stripping characters changes the user's intent without feedback.
**How to avoid:** Validate with Zod and return specific error messages. Do NOT silently modify input.
**Warning signs:** Users can search for `---.com` or a 100-character domain name without errors.

### Pitfall 4: Landing Page JavaScript Bundle Bloat
**What goes wrong:** Making the entire landing page a client component to support the search bar.
**Why it happens:** Search bar needs interactivity, so developers mark the whole page `"use client"`.
**How to avoid:** Only the search bar and results components are client components. Everything else (hero, features, pricing) stays as server components.
**Warning signs:** `page.tsx` starts with `"use client"` directive.

### Pitfall 5: Missing Error States in Search UI
**What goes wrong:** RDAP servers can return 429 (rate limited), 500 (server error), or simply timeout. Without proper error handling, the UI shows "Checking..." forever.
**Why it happens:** Only handling success (200/404) paths, not error paths.
**How to avoid:** Handle all states: checking, available, taken, unknown (RDAP failed), error (network/timeout). Show appropriate UI for each.
**Warning signs:** Spinner stays forever on some TLD results.

### Pitfall 6: Name Suggestions Without Taken-Domain Context
**What goes wrong:** SRCH-04 requires showing alternatives when first choice is taken. Building a suggestion engine that ignores which TLDs were checked.
**Why it happens:** Generating random alternatives without considering what the user searched for.
**How to avoid:** Suggestions should be contextual: if `taco-shop.com` is taken, suggest `taco-shop.io`, `taco-shop.dev`, `my-taco-shop.com`, `taco-shops.com`, `tacoshop.com`. Mix TLD alternatives with name variations.
**Warning signs:** Suggestions are completely unrelated to the searched domain.

## Code Examples

### RFC 5891 Domain Validation with Zod
```typescript
// src/lib/validators/domain.schema.ts
import { z } from 'zod/v4';

/** Validates a single domain label (part before TLD) per RFC 5891 */
export const domainLabelSchema = z.string()
  .min(1, 'Domain name is required')
  .max(63, 'Domain label cannot exceed 63 characters')
  .regex(/^[a-z0-9]/, 'Domain name must start with a letter or number')
  .regex(/[a-z0-9]$/, 'Domain name must end with a letter or number')
  .regex(/^[a-z0-9-]+$/, 'Domain name can only contain lowercase letters, numbers, and hyphens')
  .refine(
    (val) => !(val[2] === '-' && val[3] === '-' && !val.startsWith('xn--')),
    'Hyphens in positions 3-4 are reserved for internationalized domain names'
  );

/** Validates a full domain name (label + TLD) */
export const fullDomainSchema = z.string()
  .max(253, 'Domain name cannot exceed 253 characters')
  .transform(val => val.toLowerCase().trim())
  .pipe(z.string().regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]?\.[a-z]{2,}$/, 'Invalid domain format'));

/** Schema for the search API request */
export const domainSearchSchema = z.object({
  domains: z.array(z.string()).min(1).max(50, 'Maximum 50 domains per search'),
});

/** Schema for single search input (may or may not include TLD) */
export const searchInputSchema = z.string()
  .min(1, 'Please enter a domain name')
  .max(253, 'Domain name too long')
  .transform(val => val.toLowerCase().trim())
  .refine(val => /^[a-z0-9][a-z0-9-.]*$/.test(val), 'Invalid characters in domain name');
```

### Server-Side RDAP Client
```typescript
// src/lib/rdap/rdap-client.ts
import PQueue from 'p-queue';
import { TLD_MAP, type TLDConfig } from './tld-config';

const RDAP_TIMEOUT = 6000;
const DNS_TIMEOUT = 4000;

// One queue per RDAP server to prevent rate limiting
const queues = new Map<string, PQueue>();

function getQueue(server: string): PQueue {
  if (!queues.has(server)) {
    queues.set(server, new PQueue({ concurrency: 3, interval: 1000, intervalCap: 5 }));
  }
  return queues.get(server)!;
}

export interface DomainCheckResult {
  domain: string;
  tld: string;
  available: boolean | 'unknown';
  price: string;
  source: 'rdap' | 'dns' | 'local' | 'simulated';
}

export async function checkSingleDomain(domain: string): Promise<DomainCheckResult> {
  const parts = domain.split('.');
  const tld = parts[parts.length - 1].toLowerCase();
  const config = TLD_MAP[tld];
  const price = config?.label ?? '$9.99';

  // .taco is always available (simulated TLD)
  if (tld === 'taco') {
    return { domain, tld, available: true, price, source: 'simulated' };
  }

  if (!config?.rdapServer) {
    return { domain, tld, available: 'unknown', price, source: 'rdap' };
  }

  const queue = getQueue(config.rdapServer);

  try {
    return await queue.add(async () => {
      const url = config.rdapServer!.startsWith('https://rdap.org')
        ? `https://rdap.org/domain/${domain}`
        : `${config.rdapServer}${domain}`;

      const resp = await fetch(url, { signal: AbortSignal.timeout(RDAP_TIMEOUT) });

      if (resp.status === 404 || resp.status === 400) {
        return { domain, tld, available: true, price, source: 'rdap' as const };
      }
      if (resp.ok) {
        const data = await resp.json();
        const taken = data.objectClassName === 'domain' || data.ldhName;
        return { domain, tld, available: !taken, price, source: 'rdap' as const };
      }
      return { domain, tld, available: 'unknown' as const, price, source: 'rdap' as const };
    }) as DomainCheckResult;
  } catch {
    // RDAP failed -- fall back to DNS-over-HTTPS
    return dnsFallback(domain, tld, price);
  }
}

async function dnsFallback(domain: string, tld: string, price: string): Promise<DomainCheckResult> {
  try {
    const resp = await fetch(
      `https://dns.google/resolve?name=${domain}&type=A`,
      { signal: AbortSignal.timeout(DNS_TIMEOUT) }
    );
    const data = await resp.json();
    if (data.Status === 3) { // NXDOMAIN
      return { domain, tld, available: true, price, source: 'dns' };
    }
    if (data.Answer?.length > 0) {
      return { domain, tld, available: false, price, source: 'dns' };
    }
    return { domain, tld, available: 'unknown', price, source: 'dns' };
  } catch {
    return { domain, tld, available: 'unknown', price, source: 'dns' };
  }
}

export async function checkDomains(domains: string[]): Promise<DomainCheckResult[]> {
  return Promise.all(domains.map(d => checkSingleDomain(d)));
}
```

### Domain Name Suggestions
```typescript
// src/lib/suggestions.ts
import { TLD_MAP, DEFAULT_TLDS } from './rdap/tld-config';

export function generateSuggestions(name: string, takenTlds: string[]): string[] {
  const suggestions: string[] = [];

  // 1. Try other TLDs
  const availableTlds = DEFAULT_TLDS.filter(t => !takenTlds.includes(t));
  suggestions.push(...availableTlds.slice(0, 3).map(t => `${name}.${t}`));

  // 2. Name variations
  const prefixes = ['my', 'get', 'try', 'use', 'go'];
  const suffixes = ['app', 'hq', 'hub', 'io', 'dev'];

  // Add prefix variations for .com
  prefixes.forEach(p => suggestions.push(`${p}-${name}.com`));

  // Add suffix variations for .com
  suffixes.forEach(s => suggestions.push(`${name}-${s}.com`));

  // 3. Remove hyphens or add them
  if (name.includes('-')) {
    suggestions.push(`${name.replace(/-/g, '')}.com`);
  } else if (name.length > 6) {
    // Try splitting at likely word boundaries
    const mid = Math.floor(name.length / 2);
    suggestions.push(`${name.slice(0, mid)}-${name.slice(mid)}.com`);
  }

  return [...new Set(suggestions)].slice(0, 8);
}
```

### Search Bar Client Component Pattern
```typescript
// src/components/domain/search-bar.tsx
'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { DEFAULT_TLDS } from '@/lib/rdap/tld-config';

interface SearchBarProps {
  onSearch: (domains: string[]) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(() => {
    const input = query.trim().toLowerCase();
    if (!input) return;

    // Extract name (strip TLD if present)
    const hasTLD = input.includes('.') && input.split('.').pop()!.length >= 2;

    if (hasTLD) {
      onSearch([input]);
    } else {
      // Search across default TLDs
      const name = input.replace(/[^a-z0-9-]/g, '');
      if (!name) { setError('Please enter a valid domain name'); return; }
      onSearch(DEFAULT_TLDS.map(t => `${name}.${t}`));
    }
    setError(null);
  }, [query, onSearch]);

  return (
    <div className="w-full max-w-[680px]">
      <div className="flex overflow-hidden rounded-full border-2 border-border bg-bg2 transition-all focus-within:border-fire focus-within:shadow-[0_0_0_4px_rgba(255,87,34,0.12)]">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Find your perfect domain name..."
          className="flex-1 bg-transparent px-6 py-4 text-text outline-none placeholder:text-text4 font-[family-name:var(--font-outfit)]"
        />
        <button
          onClick={handleSearch}
          className="bg-gradient-to-r from-fire to-gold px-8 py-4 font-[family-name:var(--font-anybody)] font-bold text-black transition-opacity hover:opacity-90"
        >
          Search
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red">{error}</p>}
      {/* TLD pills */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {['.com', '.io', '.ai', '.app', '.se', '.nu', '.tech', '.xyz', '.dev'].map(tld => (
          <button
            key={tld}
            onClick={() => {
              const name = query.trim().replace(/\.\w+$/, '');
              setQuery(name + tld);
            }}
            className="rounded-full border border-border bg-surface px-3.5 py-1 font-mono text-xs text-text3 transition-colors hover:border-fire hover:text-fire"
          >
            {tld}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side RDAP via fetch | Server-side RDAP via Route Handler | This phase | Eliminates CORS; enables rate limiting and caching |
| WHOIS text protocol parsing | RDAP JSON protocol | RFC 7480 (2015) | No text parsing needed; structured JSON responses |
| Single-page `showPage()` routing | Next.js App Router file-based routing | Already done in Phase 1 | Proper SSR, code splitting, SEO |
| Inline CSS in `<style>` tag | Tailwind v4 utility classes + @theme | Already done in Phase 1 | Theme tokens already mapped |
| Vanilla JS DOM manipulation | React components with state | This phase | Declarative UI, component reuse |

**Deprecated/outdated:**
- The `dns.google/resolve` fallback should be labeled as "likely available" rather than "available" since DNS absence does not guarantee registration availability
- Client-side RDAP calls (from index.html) are being replaced entirely with server-side calls

## Landing Page Sections to Port

Detailed mapping from index.html to React components:

| Section | HTML Source | React Component | Type | Notes |
|---------|-----------|-----------------|------|-------|
| Hero | `.hero` section | `hero-section.tsx` | Server + Client island | Orb background (CSS), chip badge, logo, h1, subtitle, CTA buttons, search bar (client) |
| Tagline Strip | `.tagline-strip` | `tagline-strip.tsx` | Server | CSS `@keyframes scrollX` animation, duplicated content for seamless loop |
| Services Strip | `.services-strip` | `services-strip.tsx` | Server | 5 service cards in auto-fit grid |
| How It Works | `#how-it-works` | `how-it-works.tsx` | Server | 3-step cards with CSS counter, scroll reveal |
| Features Grid | `#features` | `features-grid.tsx` | Server | 10 feature cards with hover effects, tags (HOT, FREE, NEW, PRO) |
| Taco Specials | Bonus section | `taco-specials.tsx` | Server | 4 cards with gradient backgrounds |
| Pricing | `#page-pricing` | `pricing-section.tsx` | Server | 3-tier pricing cards; "Medium" is featured with ribbon |
| Footer | `<footer>` | `footer.tsx` | Server | 4-column grid, brand section, links, copyright |

### CSS Animations to Port (no Framer Motion needed)
- **Orb float:** `@keyframes orbFloat` -- CSS animation on 3 absolute-positioned blurred circles
- **Fade up:** `@keyframes fadeUp` -- entry animation for hero elements (use CSS animation-delay for stagger)
- **Tagline scroll:** `@keyframes scrollX` -- infinite horizontal scroll of tagline strip
- **Scroll reveal:** Intersection Observer + CSS transition (opacity/transform)
- **Feature card hover:** CSS `:hover` with `::before` pseudo-element scale animation

## Open Questions

1. **RDAP server reliability for non-Verisign TLDs**
   - What we know: rdap.org is a free proxy service; it may have its own rate limits or downtime
   - What's unclear: Whether rdap.org is still operational and reliable in 2026
   - Recommendation: Implement graceful fallback to DNS-over-HTTPS with "Likely available" label. Consider adding direct registry RDAP servers for popular TLDs (.io uses `rdap.nic.io`, .ai uses `rdap.nic.ai`, .app uses `rdap.nic.google`) as alternatives to rdap.org

2. **Name suggestion quality (SRCH-04)**
   - What we know: Basic prefix/suffix and TLD variation works for simple cases
   - What's unclear: Whether users expect AI-powered suggestions or simple algorithmic ones
   - Recommendation: Start with algorithmic suggestions (prefix variations, TLD swaps, hyphen toggling). This is sufficient for v1. Flag AI-powered suggestions as a v2 enhancement.

3. **Search result caching**
   - What we know: RDAP results should be cached to reduce upstream load
   - What's unclear: Whether in-memory cache is sufficient or if persistent cache (Redis) is needed
   - Recommendation: Use a simple in-memory Map with TTL (60-120 seconds) for v1. The simulated environment does not need Redis. Add cache headers to the Route Handler response.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest ^4.0.18 |
| Config file | none -- see Wave 0 |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SRCH-01 | RDAP lookup returns availability status for multiple TLDs | unit | `npx vitest run src/lib/rdap/rdap-client.test.ts -t "checkSingleDomain"` | No -- Wave 0 |
| SRCH-02 | Search results include TLD pricing | unit | `npx vitest run src/lib/rdap/tld-config.test.ts` | No -- Wave 0 |
| SRCH-03 | Bulk search processes multiple domains with rate limiting | unit | `npx vitest run src/lib/rdap/rdap-client.test.ts -t "checkDomains"` | No -- Wave 0 |
| SRCH-04 | Suggestions generated for taken domains | unit | `npx vitest run src/lib/suggestions.test.ts` | No -- Wave 0 |
| SRCH-05 | Domain validation rejects invalid names per RFC 5891 | unit | `npx vitest run src/lib/validators/domain.schema.test.ts` | No -- Wave 0 |
| UI-03 | Landing page renders all sections | smoke | `npx vitest run src/app/(public)/page.test.tsx` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Vitest configuration with path aliases matching tsconfig
- [ ] `src/lib/rdap/rdap-client.test.ts` -- RDAP client unit tests (mock fetch)
- [ ] `src/lib/rdap/tld-config.test.ts` -- TLD config validation
- [ ] `src/lib/validators/domain.schema.test.ts` -- RFC 5891 validation edge cases
- [ ] `src/lib/suggestions.test.ts` -- suggestion algorithm tests

## Sources

### Primary (HIGH confidence)
- Existing `index.html` -- direct code inspection of RDAP servers map, TLD prices, checkDomain() logic, search UI, landing page HTML structure, CSS design tokens (all already mapped to Tailwind in Phase 1)
- Phase 1 codebase -- confirmed existing files: RegistrarAdapter interface, SimulatedRegistrar stub, PublicNavbar, placeholder page.tsx, globals.css with theme, UI components
- RDAP protocol (RFC 7480-7484) -- HTTP 404 = available, 200 with domain data = taken; Verisign endpoint format confirmed in existing code

### Secondary (MEDIUM confidence)
- Next.js Route Handler pattern -- standard App Router pattern for API endpoints; well-documented
- p-queue library -- ESM-native queue with concurrency control; standard choice for rate limiting

### Tertiary (LOW confidence)
- rdap.org availability and rate limits in 2026 -- may need to swap for direct registry RDAP servers
- Specific RDAP rate limits per registry -- Verisign is ~10-20 req/s per IP based on training data; other registries vary

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries already installed except p-queue; patterns well-established
- Architecture: HIGH - direct port of working RDAP logic from index.html to server-side; patterns verified in existing code
- Pitfalls: HIGH - CORS and rate limiting pitfalls directly observed in existing index.html code analysis
- Landing page mapping: HIGH - all 8 sections identified with exact CSS class references from source

**Research date:** 2026-03-11
**Valid until:** 2026-04-11 (stable domain; RDAP protocol and Next.js patterns unlikely to change)
