# Domain Pitfalls: Taco Domains

**Domain:** Domain registration platform (static HTML/CSS/JS with mock data)
**Researched:** 2026-03-11
**Scope:** Critical mistakes in themed, multi-page static sites with domain search/management interfaces

---

## Critical Pitfalls

Mistakes that cause rewrites, abandoned features, or failed launches.

### Pitfall 1: Mock Data Not Structured for API Swap

**What goes wrong:** Mock data is hardcoded into UI logic. When time comes to integrate real API, discover data structures don't match, filtering/sorting logic is entangled with display logic, and entire pages need rewriting.

**Why it happens:** Building the UI first without defining the API contract. Mock data is created "just to test the interface" without considering how real API calls will replace it.

**Consequences:**
- 40-60% rework when connecting to real backend
- Features built against demo data break with real data volumes or edge cases
- Time wasted rebuilding instead of validating with real data earlier

**Prevention:**
- **Define API contract first** — write mock data structure in `.js` files (e.g., `mockData/domains.js`) that matches the actual API shape you'll use (response structure, field names, pagination format)
- **Separate data layer from UI logic** — use module pattern or simple factory to fetch data (mock or real), not inline data in HTML/components
- **Structure example:**
  ```javascript
  // src/api/domains.js — swap this module, UI stays the same
  export async function searchDomains(query) {
    // Initially: return mock data
    // Later: return fetch('/api/domains/search?q=' + query)
    return mockSearchResults;
  }

  // src/pages/search.js — consumes data, doesn't know source
  async function handleSearch() {
    const results = await searchDomains(query);
    renderResults(results);
  }
  ```
- **Mock data matches real shape** — if API returns `{domains: [{name, tld, price, availability}]}`, mock data matches exactly
- **Test with edge cases** — empty results, 1000+ domains, missing optional fields, API errors

**Detection:**
- Warning signs: data hardcoded in HTML, API shape unknown, sorting/filtering logic in UI tied to specific data format
- Red flag: "We'll figure out the data structure when we integrate the API"

**Phase mapping:** Phase 1 (Foundation) — define API contract before building search page

---

### Pitfall 2: Domain Search Performance Degrades With Real Data

**What goes wrong:** Search works fast with 100 mock domains. When live with 10M+ real domains, pagination fails, filtering bogs down, availability checks timeout, autocomplete hangs.

**Why it happens:** Building search without considering real-world data volume. No backend filtering (doing it in frontend JS). No pagination strategy. No caching of WHOIS checks.

**Consequences:**
- Availability checking becomes unusable (each domain check is a real WHOIS query)
- Autocomplete or bulk search freezes the browser
- Users perceive platform as slow/broken
- Migrating to proper backend architecture mid-launch

**Prevention:**
- **Build pagination from day 1** — even with 100 mock domains, implement "show 20 results, next page" UI. Don't wait for real API
- **Assume backend filtering** — don't build multi-second filtering in JavaScript. Button press should trigger API call, not client-side filter 1000 items
- **Cache availability checks** — if checking if "example.com" is available, store result temporarily (30s-5min cache). Don't re-check on every keystroke
- **Batch operations** — bulk search should submit 10-100 domains in one request, not one request per domain
- **Mock the delays** — when building with mock data, artificially add `setTimeout` delays to simulate network latency. Helps catch UI that assumes instant responses
- **Test data volume** — generate 1000+ mock domains, verify search still feels fast
- **Structure example:**
  ```javascript
  // Simulate network delay in mock API
  export async function searchDomains(query) {
    // Simulate 200-400ms latency like real API
    await new Promise(r => setTimeout(r, Math.random() * 200 + 200));
    return mockSearchResults.filter(d => d.name.includes(query)).slice(0, 20);
  }

  // Cache availability checks
  const availabilityCache = new Map();
  export async function checkAvailability(domain) {
    if (availabilityCache.has(domain)) return availabilityCache.get(domain);
    const result = await mockWhoisCheck(domain);
    availabilityCache.set(domain, result);
    setTimeout(() => availabilityCache.delete(domain), 60000); // 1min cache
    return result;
  }
  ```

**Detection:**
- Warning signs: search with 50+ results feels sluggish, autocomplete typing lags, bulk operations freeze UI
- Red flag: all filtering happens in JavaScript, no concept of pagination during mock phase

**Phase mapping:** Phase 1 (Search) — implement pagination and caching patterns even with mock data

---

### Pitfall 3: Taco-Themed Branding Obscures Core Functionality

**What goes wrong:** Cute branded terms ("Frijoles Faltan" for 404, "Salsa Sync" for DNS sync, "Taco Bell" for notifications) confuse or distract users trying to complete real tasks. Domain buyers are serious about the purchase; playfulness can undermine trust.

**Why it happens:** Enthusiasm for the brand identity. Underestimating how much users care about clarity in a financial/technical product.

**Consequences:**
- First-time users don't understand what features do
- Power users frustrated by whimsical labels on serious tools
- Accessibility issues (screen readers struggle with branded names)
- Reduced conversion rate on domain search/purchase path

**Prevention:**
- **Primary label = clear, secondary label = taco-themed** — "DNS Sync" (primary), "Salsa Sync" (subtitle/nickname). Never hide function behind branding
- **Critical paths stay clear** — domain search, checkout, DNS setup, password recovery use standard terminology. Reserve playfulness for notifications, error messages, empty states
- **Test with target users** — especially non-technical users doing domain search for first time. Can they find what they need?
- **Provide translations** — alt-text, title attributes, aria-labels should use clear terminology for accessibility
- **Example:**
  ```html
  <h2>DNS Management <span class="subtitle">Salsa Sync</span></h2>
  <!-- vs confusing: -->
  <h2>Salsa Sync</h2> <!-- user: what is this? -->

  <!-- Error message: playful is OK -->
  <div class="error">
    <h3>Frijoles Faltan!</h3>
    <p>Page not found. Let's get you back to the guacamole.</p>
  </div>

  <!-- But critical flow: clear -->
  <button>Proceed to Checkout</button> <!-- not "Time for Salsa" -->
  ```

**Detection:**
- Warning signs: users asking "what does this button do?", poor conversion on search-to-checkout funnel
- Red flag: branded terms used in critical user flows without clear explanations

**Phase mapping:** Phase 1 (Foundation) — establish branding guidelines with clarity-first hierarchy. Phase 2-3+ (Features) — enforce consistency

---

### Pitfall 4: DNS Editor UX Built Without Understanding DNS Complexity

**What goes wrong:** DNS record editor lets users create invalid records, doesn't validate MX priorities or CNAME conflicts, doesn't warn about propagation time, doesn't explain what A vs CNAME means. Users create broken configs, blame the platform.

**Why it happens:** DNS is technical. Designer/developer builds UI without consulting DNS best practices or testing with actual DNS workflows.

**Consequences:**
- Users' email stops working because MX record priorities are wrong
- Users create CNAME conflicts (CNAME + A record on same host)
- DNS propagation takes 24h but users expect instant results, file support tickets
- Complex UX gets blamed for support burden

**Prevention:**
- **Validate DNS records** — reject invalid combinations (CNAME + A, MX without priority, etc.), validate TTL ranges, check syntax
- **Explain DNS in UI** — hoverable help icons explain what each record type does, example values for common configs (email forwarding, web host)
- **Warn about consequences** — "Changing this A record will affect email if you have MX records pointing here"
- **Set realistic expectations** — "Changes can take up to 24 hours to propagate worldwide. Check propagation here [link]"
- **Provide templates** — "Quick Setup" presets for common configs (email forwarding with Namecheap, pointing to Vercel, etc.) remove guesswork
- **Example:**
  ```html
  <fieldset>
    <legend>Add MX Record <help-icon>?</help-icon></legend>
    <div class="help-text">
      Mail Exchange (MX) records tell email servers where to deliver mail for your domain.
      <a href="/docs/dns/mx">Learn more</a>
    </div>
    <input type="number" name="priority" min="0" max="65535"
           aria-describedby="priority-help">
    <div id="priority-help">Lower number = higher priority. Typically 10-30.</div>
    <input type="text" name="value" placeholder="mail.example.com." required>
    <button type="button" onclick="validateMX()">Validate Record</button>
  </fieldset>

  <!-- Warning if conflict detected -->
  <div class="warning" id="conflict-warning" style="display:none;">
    You already have an A record for @. CNAME records cannot coexist with A records.
  </div>
  ```

**Detection:**
- Warning signs: users report email breaking after DNS changes, users confused about record types
- Red flag: DNS editor has no validation, no help text, no warnings about conflicts

**Phase mapping:** Phase 3 (DNS Editor) — research DNS best practices and build validation before launch

---

### Pitfall 5: Mock Data Inconsistency Creates Confusing UX

**What goes wrong:** Domain search returns different data structure than dashboard. Pricing shown in search doesn't match cart. Availability status contradicts renewal status. Mock data wasn't designed consistently across pages.

**Why it happens:** Different pages built by different contributors or at different times. No shared mock data schema. Each page tweaks data format to fit its needs.

**Consequences:**
- Users see "Domain available" in search, then "Not available" in cart — perception of broken system
- Pricing changes mid-flow — trust erosion
- Developers confused what real API should return
- Difficult to test user flows across pages

**Prevention:**
- **Centralized mock data source** — single `src/mockData/` directory with schema definitions
- **Shared schema across pages:**
  ```javascript
  // src/mockData/schemas.js
  const domainSchema = {
    name: String,        // e.g., "example"
    tld: String,         // e.g., "com"
    fullDomain: String,  // e.g., "example.com"
    availability: 'available' | 'registered' | 'premium',
    price: Number,       // annual renewal price
    registrationPrice: Number,
    premiumPrice: Number | null,
    registrar: String,   // which provider
    expiresAt: Date,     // null if not registered
  };

  // src/mockData/domains.js — all pages use this
  export const mockDomains = [
    {
      name: "taco",
      tld: "com",
      fullDomain: "taco.com",
      availability: "premium", // consistent across search, dashboard, cart
      price: 8.99,
      registrationPrice: 99.99,
      premiumPrice: 1999.99,
    }
  ];
  ```
- **Single source of truth** — search page, dashboard, cart all import from same `mockDomains.js`
- **Type checking** — use JSDoc or TypeScript to document expected structure, catch inconsistencies early

**Detection:**
- Warning signs: same domain shows different info on different pages, pricing inconsistencies
- Red flag: data duplicated across files, multiple versions of "mock domains"

**Phase mapping:** Phase 1 (Foundation) — establish shared mock data schema before building multiple pages

---

### Pitfall 6: Responsive Design Not Tested on Real Mobile Devices

**What goes wrong:** Site looks fine in DevTools mobile emulation (375px width), but on actual iPhone/Android:
- Touch targets too small, users can't tap buttons
- Hamburger menu doesn't work consistently
- Domain search input doesn't trigger mobile keyboard properly
- Pricing tables don't reflow, users have to scroll horizontally
- Forms have poor mobile interaction patterns

**Why it happens:** Responsive design tested only in browser DevTools. No device-in-hand testing with real users on real network speeds.

**Consequences:**
- Mobile conversion rate 30-50% lower than desktop
- Users complete search on mobile, abandon at checkout
- Support tickets about broken mobile experience
- Reputation damage ("terrible on my phone")

**Prevention:**
- **Test on real devices early and often** — at least one iPhone and one Android device. Use actual mobile networks, not WiFi only
- **Mobile-first search specifically** — domain search is highest-traffic path on mobile. Test:
  - Can users type query without autocorrect interfering?
  - Do search results fit viewport without horizontal scroll?
  - Is "Check Availability" button easily tappable (min 44x44px)?
  - Does pagination work with thumb/one-handed use?
- **Hamburger menu testing** — menu opens/closes, doesn't block content, closes when item selected, works on scroll
- **Form testing** — checkout form on mobile keyboard visible? Field labels don't overlap with input? Password visibility toggle works?
- **Network testing** — test on 4G/LTE (not just WiFi), with simulated slow connection (DevTools throttling)
- **Accessibility on mobile** — VoiceOver (iOS) and TalkBack (Android) can navigate domain search and checkout
- **Example checklist:**
  ```markdown
  ## Mobile Testing Checklist
  - [ ] Search bar: type query, see results without horizontal scroll
  - [ ] Results page: touch each result, no accidental adjacent-tap
  - [ ] Pagination: next/prev buttons accessible with thumb from bottom of screen
  - [ ] Checkout form: all inputs visible without scrolling past keyboard
  - [ ] Hamburger menu: opens from 0.3s, closes on nav, doesn't block main content
  - [ ] Dashboard: tables don't require horizontal scroll, or have horizontal scroll with clear UX
  - [ ] On real 4G: page loads and is interactive within 3s
  ```

**Detection:**
- Warning signs: mobile users have lower conversion rates, design looks perfect in DevTools but feels broken on actual device
- Red flag: no mobile device testing, only browser emulation

**Phase mapping:** Phase 2+ (Search, Dashboard) — mobile testing integrated into QA before shipping each major feature

---

### Pitfall 7: Static Files Don't Scale With Feature Count

**What goes wrong:** Start with one `index.html` and `style.css`. After adding 10 pages and features:
- CSS becomes 3000+ lines, impossible to maintain, specificity wars
- Single CSS file loads even for pages that don't use those styles
- HTML pages duplicate navigation, header, footer 10 times
- Adding a new page requires copying/pasting boilerplate
- No build system to minify or version assets

**Why it happens:** "Static HTML/CSS/JS" feels simple, so developers avoid any build tooling. Doesn't scale past 5-10 pages.

**Consequences:**
- CSS bloat, slow load times
- Page size balloons (100KB+ CSS when only 5KB needed per page)
- Maintenance nightmare, easy to break things accidentally
- Difficult to add new pages without breaking existing ones

**Prevention:**
- **Organize from day 1:**
  ```
  src/
    css/
      base.css        (global styles, reset)
      typography.css  (fonts, headings)
      components.css  (buttons, cards, etc.)
      layouts/
        search.css      (search page specific)
        dashboard.css   (dashboard specific)
    js/
      utils/           (shared helpers)
      pages/           (page-specific logic)
      api/             (mock data layer)
    html/
      layouts/         (header, footer, nav templates)
      pages/           (each page, includes layout)
    assets/            (images, logos)
  ```
- **Use CSS organization strategy** (BEM, utility-first, or component-scoped) to prevent specificity battles
- **HTML templates, not duplication** — create `_header.html`, `_footer.html`, include in each page (or use a simple templating approach)
- **Lazy-load CSS per page** — each page only links CSS it needs, or use critical CSS inline + defer non-critical
- **Version static assets** — when deploying, add hash to filenames (`style.abc123.css`) to bust cache and enable aggressive caching
- **Consider a simple build step** — even just a Node script that minifies CSS/JS and generates versioned filenames, doesn't require complex tooling
- **Example structure:**
  ```html
  <!-- Each page includes base + page-specific -->
  <link rel="stylesheet" href="/css/base.css">
  <link rel="stylesheet" href="/css/search.css"> <!-- only for search page -->

  <!-- Header/footer are included, not duplicated -->
  <header class="site-header"><!-- define once --></header>
  <main><!-- page content --></main>
  <footer class="site-footer"><!-- define once --></footer>
  ```

**Detection:**
- Warning signs: CSS file over 1000 lines, styles duplicated across pages, adding new page takes 30+ minutes
- Red flag: zero build process, all CSS in one file, HTML heavily duplicated

**Phase mapping:** Phase 1 (Foundation) — establish CSS/HTML organization structure before Phase 2 (when adding search page)

---

### Pitfall 8: Interactivity Logic Scattered and Fragile

**What goes wrong:** Click handlers, form validation, state management spread across inline `<script>` tags, global functions, jQuery-style queries. One change breaks three features. Hard to trace bugs. Impossible to test.

**Why it happens:** Vanilla JS without framework feels like "no architecture needed." Logic grows organically, no structure enforced.

**Consequences:**
- Bugs in one feature break unrelated features
- Difficult to add new pages (copy-paste code, then modify, leads to divergence)
- Complex interactions (show/hide DNS fields based on record type) become spaghetti
- No way to test logic independently of HTML
- Impossible to refactor without breaking things

**Prevention:**
- **Module pattern from day 1:**
  ```javascript
  // src/js/pages/search.js
  export const SearchPage = (() => {
    const state = {
      query: '',
      results: [],
      loading: false,
    };

    function init() {
      document.querySelector('#search-form').addEventListener('submit', handleSearch);
    }

    async function handleSearch(e) {
      e.preventDefault();
      state.query = e.target.querySelector('input').value;
      state.loading = true;
      state.results = await searchDomains(state.query);
      state.loading = false;
      render();
    }

    function render() {
      // Update DOM based on state
    }

    return { init };
  })();

  // index.html loads modules
  <script type="module">
    import { SearchPage } from './js/pages/search.js';
    SearchPage.init();
  </script>
  ```
- **Clear separation:** data (state), logic (functions), rendering (DOM updates)
- **No global state** — avoid `window.someVar`. Each module manages its own state
- **Event delegation** — use `document.addEventListener('click', handler)` with event.target checking, not listeners on individual elements
- **Simple state management** — if features share state, create a simple store (not Redux, just an object with getters/setters)
- **Testable functions** — pure functions that don't depend on DOM (e.g., `validateEmail(string)` not `validateForm(htmlElement)`)

**Detection:**
- Warning signs: lots of inline `<script>` tags, global functions, changing one feature breaks another, hard to explain how something works
- Red flag: "Let's just add this click handler here" approach, no module/folder structure for JS

**Phase mapping:** Phase 1 (Foundation) — establish module/state structure before Phase 2

---

### Pitfall 9: Accessibility Ignored Until "After MVP"

**What goes wrong:** Keyboard navigation doesn't work, color contrast too low, form labels missing, screen reader can't understand page structure, mobile accessibility ignored. "We'll fix it after MVP" never happens.

**Why it happens:** Accessibility seen as nice-to-have, not core. Testing accessibility is unfamiliar. Assumes all users have perfect vision/dexterity.

**Consequences:**
- ~15% of population (disability, age, temporary impairment) can't use product
- Legal/compliance risk (ADA lawsuits increasing in 2025-26)
- Reputation damage
- Missed market opportunity (seniors, accessibility-conscious users)
- Expensive retrofit later vs. built-in from start

**Prevention:**
- **Keyboard navigation from day 1** — all interactive elements reachable via Tab, Enter, Space, Arrow keys. Test with only keyboard, no mouse
- **Color contrast** — text should be WCAG AA minimum (4.5:1). Tools: WebAIM Contrast Checker
- **Form labels & descriptions** — `<label for="domain-input">` linked to input, not just placeholder text. ARIA labels for icon buttons
- **Screen reader testing** — test with VoiceOver (Mac) or NVDA (Windows) on at least one key page (search)
- **Semantic HTML** — use `<button>` not `<div onclick>`, use `<nav>`, `<main>`, `<article>` to structure page
- **ARIA where needed** — if adding custom interactive component, add ARIA roles/labels so screen readers understand it
- **Focus indicators** — visible outline when tabbing through page (don't remove with `outline: none` without replacement)
- **Testing tools:**
  - Axe DevTools browser extension (catches many accessibility issues)
  - WAVE (WebAIM accessibility evaluator)
  - Manual testing: keyboard only, screen reader
- **Example:**
  ```html
  <!-- Good -->
  <label for="domain-search">Search for a domain</label>
  <input id="domain-search" type="text" required>
  <button type="submit">Search</button>

  <!-- Bad -->
  <input type="text" placeholder="Search..." required>
  <div onclick="search()" class="button">Search</div>

  <!-- Icon button needs ARIA -->
  <button aria-label="Open menu" class="hamburger">
    <span></span><span></span><span></span>
  </button>
  ```

**Detection:**
- Warning signs: can't navigate with keyboard only, low color contrast, form labels missing, no obvious focus indicator
- Red flag: "Accessibility is phase 2" plan, no accessible testing

**Phase mapping:** Phase 1 (Foundation) — establish accessibility standards. Phase 2+ (Features) — test each page for keyboard nav + screen reader before shipping

---

## Moderate Pitfalls

### Pitfall 10: Image & Asset Management Becomes Chaos

**What goes wrong:** Images stored in random locations, duplicates everywhere, no versioning. SVGs for taco logos not optimized, load at 500KB. Loader GIFs are animated PNGs (10MB), slow page load. No CDN strategy.

**Prevention:**
- Organize assets: `assets/images/`, `assets/icons/`, `assets/logos/`
- Optimize: compress JPGs (tinyjpg.com), use WebP with fallback, minify SVGs
- Use data URIs or sprite sheets for small icons
- Lazy-load images below the fold (`loading="lazy"`)
- Consider using a simple image compression step in deployment

---

### Pitfall 11: Testing Strategy Nonexistent

**What goes wrong:** Ship feature, user finds bug that breaks checkout. No way to test without manual clicking through search → add to cart → checkout. Regression bugs introduced frequently.

**Prevention:**
- Write simple unit tests for pure functions (validation, calculations)
- Create a test page that exercises key flows (search → checkout, DNS editor save)
- Manual testing checklist for each feature (copy-paste, run before shipping)
- Consider snapshot tests for critical UX flows

---

### Pitfall 12: Performance Not Measured, Assumed

**What goes wrong:** Site loads fast on high-end MacBook, but crawls on 4G on Android. No metrics tracked (First Contentful Paint, Interaction to Next Paint). "It's just static files, it must be fast."

**Prevention:**
- Use Lighthouse CI or similar to track performance
- Test on real devices, real networks (simulate 4G in DevTools)
- Profile JS execution (DevTools Performance tab)
- Measure Largest Contentful Paint, Interaction to Next Paint
- Set budgets (e.g., "search page loads interactive within 2s on 4G")

---

## Minor Pitfalls

### Pitfall 13: Error Handling Is Inconsistent or Missing

Missing error handling for failed API calls (when real API integrated), network timeouts not handled, loading states unclear. Users don't know if page is loading or broken.

**Prevention:**
- Always show loading state when waiting for data
- Display clear error messages ("Something went wrong. Try again in 30s")
- Retry logic for failed API calls
- Even with mock data, simulate errors occasionally to test error UI

---

### Pitfall 14: Cart/Checkout State Lost on Page Refresh

**What goes wrong:** User adds domain to cart, refreshes page, cart is empty. State only in JavaScript memory, not persisted.

**Prevention:**
- Use localStorage to persist cart
- Sync localStorage on page load
- Consider session-scoped state vs. persistent state (cart = persistent, filters = session)

---

### Pitfall 15: Analytics & Tracking Not Designed In

**What goes wrong:** Ship product with no way to measure what users do. "Which domain extensions are most popular?" "Where do users abandon search?" Unknown.

**Prevention:**
- Plan analytics early (even if not implemented in MVP)
- Structure pages with data-attributes for tracking (`data-event="search-submit"`)
- Know what metrics matter (search volume, add-to-cart rate, checkout rate)
- When adding real API, design logs/events for analytics integration

---

## Phase-Specific Warnings

| Phase | Topic | Likely Pitfall | Mitigation |
|-------|-------|---------------|------------|
| **Phase 1: Foundation** | Navigation & Layout | Hardcoded nav duplicated across pages | Create reusable layout/template structure |
| **Phase 1: Foundation** | Styling | Single massive CSS file grows to 3000+ lines | Organize by component/page from start |
| **Phase 1: Foundation** | Mock Data Schema | Data structure undefined | Define shared schema before Phase 2 |
| **Phase 1: Foundation** | Accessibility | Skipped, "phase 2 item" | Build in from start, keyboard nav + semantic HTML |
| **Phase 2: Search** | Availability Checks | Assumes instant response, no caching | Simulate network delay, implement cache |
| **Phase 2: Search** | TLD Selector | Too many TLDs, slow to render | Lazy-load, search within TLD list, group by category |
| **Phase 2: Search** | Mobile UX | Search input doesn't trigger keyboard properly | Test on real iOS/Android before shipping |
| **Phase 3: Dashboard** | State Management | User logs in, navigates away, state lost | Implement sessionStorage or simple state manager |
| **Phase 3: Dashboard** | DNS Editor | No validation, user creates invalid records | Validate before save, explain record types in UI |
| **Phase 4: Marketplace** | Performance | 1000+ listings loaded, page sluggish | Implement virtual scrolling or pagination |
| **Phase 5: Billing** | Pricing Display | Price changes between pages | Single source of truth for pricing data |
| **Phase 5: Billing** | Cart State | Cart cleared unexpectedly on nav | Persist cart to localStorage or URL params |

---

## Sources

Research based on:
- Domain registration platform UX patterns (GoDaddy, Namecheap, Porkbun, Cloudflare DNS)
- Static site architecture best practices (11ty, Hugo, vanilla JS patterns)
- Frontend performance optimization (Lighthouse, Core Web Vitals)
- Accessibility standards (WCAG 2.1 AA, WAI-ARIA)
- DNS management complexity (RFC 1035, common DNS misconfigurations)
- Mobile UX patterns and testing (responsive design, touch targets, mobile keyboards)
- Mock data architecture patterns (API-driven design, test data generation)

**Confidence:** MEDIUM-HIGH for domain registration domain pitfalls, based on training data of real platform UX patterns. Static site architecture and accessibility pitfalls are MEDIUM-HIGH (well-documented best practices). Some specific 2026 trends not available without WebSearch access.
