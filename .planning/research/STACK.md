# Technology Stack: Taco Domains

**Project:** Taco Domains (Static HTML/CSS/JS Domain Registration Platform)
**Researched:** 2026-03-11
**Mode:** Ecosystem Stack
**Overall Confidence:** MEDIUM (training data through Feb 2025; WebSearch unavailable for real-time verification)

## Executive Summary

For a static HTML/CSS/JS domain registration platform, the 2025 standard stack balances **minimal dependencies** (per project constraints) with **modern tooling** that avoids frameworks. The recommended approach uses **Tailwind CSS** for styling (with optional Animate.css for animations), **Alpine.js** for lightweight interactivity, **Faker.js** for realistic mock data generation, and vanilla JavaScript for custom logic. This stack prioritizes fast load times, simple deployments to static hosts (GitHub Pages, Netlify), and clean separation between mock data and future API integration.

The key principle: **CSS-first design with JavaScript enhancement**, not JavaScript-heavy.

---

## Recommended Stack

### CSS & Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Tailwind CSS** | v3.4+ | Utility-first CSS framework | Industry standard for static sites in 2025. Zero runtime. Fast development. Works perfectly with plain HTML. Excellent responsive utilities (sm:, md:, lg: breakpoints). Easy to customize for taco theme (color palette: orange, green, red). All CSS included in production bundle. |
| **Animate.css** | v4.1+ | Pre-built CSS animations | Out-of-box animations for hero section, testimonial carousels, floating elements. No JavaScript required. Minimal footprint (4 KB gzipped). Use for attention-grabbing elements (animated hero, loading states, form feedback). |
| **CSS Custom Properties** | Native | Theme variables | For taco branding consistency (--color-orange, --color-guac-green, etc.). Reduces Tailwind config complexity. Better DX for dark mode support later. |

**Why NOT:**
- **Bootstrap** — Too heavy (bundle size), too many components you won't use, designed for large teams
- **Foundation** — Overkill for a marketing/dashboard site
- **CSS-in-JS (styled-components, Emotion)** — Requires JavaScript runtime, conflicts with static HTML-first approach
- **PostCSS plugins (except autoprefixer)** — Adds build complexity (breaks "no build step" ideal, though npm run build is acceptable)

### JavaScript Interactivity

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Alpine.js** | v3.13+ | Lightweight interactivity | Perfect for static sites. Minimal learning curve. Replaces jQuery. Handles modals, tabs, dropdowns, form validation, state management without framework overhead. 16 KB gzipped. Directly in HTML with `x-*` attributes. Ships with full docs and examples. |
| **htmx** | v1.9+ | AJAX/WebSocket enhancement | Minimal JavaScript for dynamic interactions. Swap HTML fragments without page reloads. Future-proof for server integration. Use for form submissions (search, DNS updates) that should feel instant. 14 KB gzipped. Optional—use only if heavily dynamic (domain search, dashboard filtering). |
| **Vanilla JavaScript** | ES2020+ | Custom logic | Use for domain search logic, price calculations, testimonial carousel control, random domain generator. Modern APIs (fetch, Promises, async/await) eliminate need for jQuery. Keep modules small and organized in separate files. |

**Why NOT:**
- **React, Vue, Svelte** — Violates "no frameworks" constraint, adds ~40 KB+ runtime overhead, requires build step
- **jQuery** — Legacy; modern vanilla JS is simpler and faster
- **Web Components** — Overkill for this scope; Alpine.js handles component-like behavior better for static sites

### Mock Data & Generation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Faker.js** | v8.3+ | Generate realistic mock data | Create hundreds of domain names, registrars, prices, user profiles without manual data entry. Single npm install. Use in build script or browser (UMD bundle). Generates: domains, names, emails, addresses, dates (renewals), prices. |
| **JSON embedded in HTML** | Native | Static mock datasets | For small, fixed datasets (TLDs, pricing tiers, partner logos). Embed in `<script type="application/json" id="data-*">` tags. Parse with `JSON.parse()` in JS. Zero external dependency. Fast loading. |
| **Local Storage** | Native API | Persist mock state | Store user's mock domain cart, dashboard settings, preference changes across page reloads. Simple key-value store. No external lib needed. Native `localStorage.setItem()` / `getItem()`. |
| **Fetch mock data** | Native API | Simulate API calls | Use fetch to load mock JSON files from `/data/` folder. Structure like real API responses. Makes future backend swap trivial: change URL, swap endpoint. |

**Why NOT:**
- **Sequelize, Prisma** — Backend ORMs, not relevant for static site
- **GraphQL client libraries** — Premature for v1
- **Custom data generation** — Faker.js is battle-tested; use existing tool
- **Firebase/Supabase** — Adds external dependency and complexity, conflicts with "static files only" goal

### Animations & Interactivity Effects

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **Native CSS Animations** | ES2020+ | Transforms, keyframes, transitions | First choice. Zero JS overhead. Hero section: floating tacos. Form inputs: expand/focus effects. Button hovers: scale + color shift. Carousels: slide transitions. |
| **Animate.css** | v4.1+ | Pre-built animation library | Fallback for complex sequences. Attention seekers (bounce, pulse for "new domain alert"). Timing control. 4 KB gzipped. |
| **GSAP** | v3.12+ | Advanced choreography | Only if building complex animated sequences (multiple elements, staggered timing, scroll-triggered). Likely overkill for v1. 32 KB gzipped (cost-benefit threshold). Use only for "dashboard reveal" or "onboarding flow" animations. |

**Why NOT:**
- **Framer Motion** — React library, violates no-framework constraint
- **Three.js** — 3D graphics library; way out of scope
- **Lottie** — Adds 40+ KB; use only if shipping complex after-effects animations

---

## Build & Tooling

### Optional (Recommended for v1)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| **npm scripts** | — | Light build automation | `npm run build` to: minify CSS, combine Tailwind output, generate Faker mock data, validate links. No webpack/vite required. Simple `package.json` scripts. Deployable as static files. |
| **PostCSS** | v8.4+ | CSS transformation | Autoprefixer for browser compatibility. PurgeCSS to remove unused Tailwind classes from production build. Reduces final CSS from ~150 KB to ~30 KB. |
| **Prettier** | v3.x | Code formatting | Consistency across HTML/CSS/JS. Optional but recommended for team. |

### DO NOT USE

- **Webpack, Vite, Parcel** — Build tools for framework-heavy projects. Not needed for static HTML/CSS/JS. Adds complexity. Keep deployment simple.
- **TypeScript** — Adds compilation step. Not needed for v1 static site. Consider for v2 if scaling to larger codebase.
- **Testing frameworks** — Jest, Vitest, etc. Not needed for UI validation. Test in browser manually. Automate later if needed.

---

## Installation & Setup

### Phase 1: Core HTML/CSS/JS (No Build)

```bash
# Initialize npm (optional, for package management)
npm init -y

# Install CSS framework (optional)
npm install tailwindcss@latest

# Install JavaScript utilities
npm install alpinejs@latest
npm install faker@latest

# Install animation library (optional)
npm install animate.css@latest
```

### Phase 2: With Light Build (Recommended)

```bash
# Install build tooling
npm install --save-dev tailwindcss postcss autoprefixer prettier

# Create tailwind.config.js and postcss.config.js
npx tailwindcss init -p

# Install mock data generator (run-time)
npm install faker@latest

# Create npm scripts in package.json
```

**package.json scripts:**

```json
{
  "scripts": {
    "build:css": "tailwindcss -i ./src/styles.css -o ./dist/styles.css --minify",
    "build:data": "node scripts/generate-mock-data.js",
    "build": "npm run build:css && npm run build:data && echo 'Build complete'",
    "serve": "python -m http.server 8000 --directory dist"
  }
}
```

### Phase 3: Deployment

Static files to any of:
- **GitHub Pages** — Free, automatic deploys from repo
- **Netlify** — Drag-and-drop or Git-based. Free tier generous.
- **Vercel** — Similar to Netlify. Fast CDN.
- **Any web server** — Apache, Nginx, etc. Just serve static files.

No server-side rendering needed. No API backend required for v1.

---

## Recommended Implementation Pattern

### Structure

```
taco-domains/
├── index.html              # Homepage
├── search.html             # Domain search page
├── dashboard.html          # User dashboard
├── dns-editor.html         # DNS records UI
├── marketplace.html        # Domain marketplace
├── api-docs.html           # Developer docs
├── src/
│   ├── styles.css          # Tailwind imports + custom CSS
│   ├── main.js             # Entry point
│   ├── modules/
│   │   ├── domain-search.js
│   │   ├── cart.js
│   │   ├── dashboard.js
│   │   └── animations.js
│   └── data/
│       ├── mock-domains.json
│       ├── tlds.json
│       └── users.json
├── dist/                   # Build output
│   ├── index.html
│   ├── styles.css          # Minified
│   ├── main.js             # Minified
│   └── data/
└── package.json
```

### CSS Strategy

```css
/* tailwind imports */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Custom component classes */
.btn-taco { /* ... */ }
.card-domain { /* ... */ }

/* Custom animations */
@keyframes float-taco {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}
```

### JavaScript Strategy

```javascript
// Alpine.js for UI state (modals, tabs, dropdowns)
// Vanilla JS for business logic (search, cart, calculations)
// Faker.js to generate mock data at build time or in browser

// Example: Domain search with Alpine
<div x-data="domainSearch()">
  <input x-model="query" @keyup="search()">
  <div x-show="results.length">
    <template x-for="domain in results" :key="domain.id">
      <div class="card-domain" x-text="domain.name"></div>
    </template>
  </div>
</div>

<script>
function domainSearch() {
  return {
    query: '',
    results: [],
    search() {
      // Vanilla JS: filter mock data, or fetch from /data/
    }
  }
}
</script>
```

### Mock Data Strategy

```javascript
// At build time (generate-mock-data.js):
const faker = require('faker');
const fs = require('fs');

const mockDomains = Array(500).fill().map(() => ({
  id: faker.datatype.uuid(),
  name: faker.internet.domainName(),
  tld: faker.helpers.arrayElement(['.com', '.org', '.net', '.io']),
  price: faker.datatype.number({ min: 8, max: 50 }),
  available: faker.datatype.boolean(0.7),
  registrar: faker.company.name(),
}));

fs.writeFileSync('dist/data/domains.json', JSON.stringify(mockDomains));
```

```html
<!-- In HTML: Embed or fetch mock data -->
<script type="application/json" id="mock-domains">
  [{...}, {...}]
</script>

<!-- Or fetch from JSON file -->
<script>
  fetch('/data/domains.json')
    .then(r => r.json())
    .then(domains => console.log(domains));
</script>
```

---

## Confidence Assessment

| Component | Confidence | Reasoning |
|-----------|-----------|-----------|
| **CSS (Tailwind + Animate.css)** | HIGH | Tailwind is 2025 industry standard for static sites. Animate.css is stable, widely used. Verified through training data (Feb 2025). |
| **JavaScript (Alpine.js + Vanilla)** | MEDIUM-HIGH | Alpine.js is well-established (v3.13 recent). Vanilla JS best practices stable. htmx less certain (less adoption data available). |
| **Mock Data (Faker.js + JSON)** | HIGH | Faker.js v8.3+ stable and widely used. JSON approach is fundamental. Pattern well-established. |
| **Animation Strategy** | MEDIUM | Native CSS + Animate.css is safe. GSAP recommendation tentative (may be overkill). Verify with actual design mockups. |
| **Build Tooling** | MEDIUM | npm + PostCSS + Tailwind is standard 2025, but "optional" reflects project constraint of "no frameworks." Real-world sites often use this. Consider Phase 2. |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| **CSS Framework** | Tailwind CSS | Pico CSS (classless) | Tailwind better for branded design control. Pico good for docs/blogs. |
| **CSS Framework** | Tailwind CSS | Custom CSS | Custom CSS possible; Tailwind saves time and consistency. |
| **Interactivity** | Alpine.js | htmx | htmx better for server-driven templates. Alpine better for client-side state. |
| **Interactivity** | Vanilla JS | jQuery | Vanilla JS faster, smaller, modern APIs. jQuery legacy. |
| **Animations** | CSS native | GSAP | GSAP powerful but overkill for v1. CSS animations cover 95% of needs. |
| **Mock Data** | Faker.js | Manual JSON | Faker.js scales to 500+ domains easily. Manual JSON becomes unmaintainable. |
| **Build Tool** | npm scripts | Webpack/Vite | npm scripts keep it simple. Webpack/Vite for larger projects. |

---

## Quick Reference: What to Install Now

**Bare minimum (v1 shipped):**
```bash
npm install tailwindcss alpinejs faker
```

**With build optimization (recommended v1):**
```bash
npm install --save-dev tailwindcss postcss autoprefixer
npm install alpinejs faker
```

**Add later if needed:**
```bash
npm install animate.css        # For complex animations
npm install gsap               # Only if building choreographed sequences
npm install htmx               # Only if heavy AJAX patterns
```

---

## Decision Rationale

**Why this stack?**

1. **No Frameworks** — Aligns with project constraint. Tailwind + Alpine provide 90% of framework benefits without the complexity.
2. **Fast to Market** — Minimal setup. Deploy as static files. No server needed.
3. **Easy Mock Data** — Faker.js + JSON makes realistic data generation trivial.
4. **Future API-Ready** — Fetch patterns structure for easy backend swap. Zero coupling to mock layer.
5. **Performance** — Tailwind CSS purges unused classes. Alpine.js is 16 KB. Total overhead minimal.
6. **Team Scalability** — Tailwind's popularity means future devs already know it. Alpine.js has excellent docs.
7. **Taco Branding** — Tailwind's color system and custom components make taco theme implementation straightforward.

---

## Sources

- Tailwind CSS Official Docs: https://tailwindcss.com/
- Alpine.js Official Docs: https://alpinejs.dev/
- Animate.css GitHub: https://github.com/animate-css/animate.css
- Faker.js Official Docs: https://fakerjs.dev/
- htmx Official: https://htmx.org/
- GSAP Official: https://gsap.com/
- MDN: Modern CSS Animations: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations
- MDN: Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

**Note:** Confidence level is MEDIUM overall due to WebSearch being unavailable for real-time 2025/2026 verification. Recommendations based on training data current through February 2025. Consider revisiting phase-specific decisions (e.g., animation complexity for hero section) with actual design mockups in Phase 2.
