# Phase 1: Foundation & Landing - Context

**Gathered:** 2026-03-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Shared infrastructure (CSS system, mock data schemas, layout templates) and a complete landing page with hero section, feature highlights, testimonials, How It Works, partner logos, and comprehensive footer. All with taco-themed branding and responsive design across mobile/tablet/desktop. This phase establishes the visual foundation all subsequent pages will inherit.

</domain>

<decisions>
## Implementation Decisions

### Hero Section
- Full-bleed immersive layout — full-screen background with search bar overlaid for maximum visual impact
- Standard-sized search bar below the headline — clean and balanced, not oversized
- Floating taco elements style: Claude's discretion on exact style (emoji, SVG, or CSS shapes)
- Headline: "Get Your Domain. No Salsa Required. (But Highly Recommended.)"
- Two CTA buttons: "Search Your Domain" and "How It Works"

### Color & Typography
- Base background: Warm cream/off-white — friendly, approachable, restaurant vibes
- Primary brand color: Warm/earthy orange (#E8871E range) — appetizing, not aggressive
- Accent colors: Green (guacamole) and red (salsa) as secondary palette
- Headings: Poppins — weight at Claude's discretion (should pair well with cream + earthy orange)
- Body text: System font stack — fast loading, Poppins only for headings
- Dark text on cream background for readability

### Navigation
- Desktop: Simple top bar — Logo + 5-6 links + CTA area
- Nav links: Claude's discretion on grouping (user has 12 pages — pick the most logical top-level items, rest in footer)
- CTA area: "Sign In" text link + "Get Started" colored button — covers both user types
- Mobile: Dropdown below nav bar (pushes content down) — simple, no overlay animations
- Logo placement: Left side, standard

### Content Sections
- Feature cards: 3-column grid layout — icon + title + description per card, with hover effects
- Testimonials: Single testimonial at a time with left/right arrows — focused attention, with indicator dots
- How It Works: Claude's discretion on layout (3-step horizontal or vertical timeline)
- Partner logos: Standard logo strip
- Footer: Claude's discretion on layout — should accommodate remaining nav links and brand tone

### Micro-interactions & Animations
- Confetti/celebration effects: Claude's discretion on timing and placement (CTA hover, search submit, etc.)
- Floating taco elements in hero: gentle CSS animation (float/bob)
- Feature cards: hover effects (subtle lift/shadow)
- Buttons: hover color transitions

### Claude's Discretion
- Exact Poppins weight for headings (500-800 range)
- Footer layout and density
- How It Works section layout style
- Navigation link grouping
- Confetti/micro-interaction placement and triggers
- Floating element visual style (emoji vs SVG vs CSS shapes)
- Exact green and red accent color values
- Loading state animations
- Error page styling ("Frijoles Faltan!")

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project, this phase creates the foundation

### Established Patterns
- None — this phase establishes all patterns (CSS variables, layout structure, JS modules)

### Integration Points
- All subsequent pages (search, dashboard, DNS, etc.) will inherit the nav, footer, CSS system, and mock data schemas created here

</code_context>

<specifics>
## Specific Ideas

- Taco-themed error messages: "Frijoles Faltan!" for 404, playful copy throughout
- Feature names from brief: "Guac Guard" (security), "Salsa Sync" (DNS), "Taco Bell" (notifications), "Spicy Mode" (advanced settings) — use as feature card labels alongside clear descriptions
- "What you see is what you taco" — transparent pricing copy
- "Even your abuela could point her domain to Shopify" — approachable messaging tone
- Background should feel vibrant and playful per original brief

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-landing*
*Context gathered: 2026-03-11*
