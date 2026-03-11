# Phase 1: Foundation and Authentication - Research

**Researched:** 2026-03-11
**Domain:** Next.js full-stack authentication, session management, responsive UI
**Confidence:** HIGH (core patterns verified against current 2026 docs; Auth.js v5 beta status confirmed as production-ready)

## Summary

Phase 1 establishes the technical foundation for Taco Domains: authentication, user management, and a polished app shell. The architecture requires Auth.js v5 (beta but production-ready) with Prisma adapter for session management, bcryptjs for password hashing, and Tailwind v4 for responsive dark-themed UI. Critical technical decision: session persistence across browser refresh requires proper cookie configuration (HttpOnly, Secure, SameSite=Lax) and NEXTAUTH_SECRET in all environments. Password reset flow is manual (console.log in dev, no real email provider needed for Phase 1). The full database schema is defined upfront but only User/Account/Session models are functional—a decision that prevents migration headaches later.

**Primary recommendation:** Establish Auth.js v5 with Prisma adapter immediately, configure middleware for route protection, and implement cookie-based session persistence with explicit testing of the refresh scenario (AUTH-02). Do not defer the RegistrarAdapter interface stub to Phase 2—define it now with method stubs.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Sidebar nav for dashboard, top nav for public pages** — Keep the existing layout pattern from the mockup
- **Dedicated `/login` and `/signup` pages (not modals)** — After signup redirect to dashboard with empty state
- **Preserve existing colors/fonts** — Fire #ff5722, Lime #76ff03, Cyan #00e5ff, Gold #ffd740; Anybody, Outfit, JetBrains Mono via next/font/google
- **Full Prisma schema upfront** — Define all models (User, Domain, DNSRecord, etc.) but only User/Account/Session functional in Phase 1
- **RegistrarAdapter interface + SimulatedRegistrar stub** — Define interface in Phase 1, stub implementations deferred to later phases
- **Route structure:** /, /login, /signup, /forgot-password, /reset-password, /dashboard, /dashboard/settings
- **Password reset:** console.log email in dev (no real email provider for simulated backend)
- **Responsive design targets:** 375px (mobile), 768px (tablet), 1440px (desktop)

### Claude's Discretion
None — user provided complete specification for Phase 1.

### Deferred Ideas (OUT OF SCOPE)
None — all gray areas had defaults selected.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can create account with email and password | bcryptjs password hashing + Zod validation + Credentials provider. Database schema includes User model with unique email and passwordHash field. |
| AUTH-02 | User can log in and session persists across browser refresh | Auth.js v5 with Prisma adapter provides JWT or database session strategy. Cookies must have HttpOnly, Secure, SameSite=Lax flags. NEXTAUTH_SECRET required in all environments. Test explicitly with hard browser refresh. |
| AUTH-03 | User can log out from any page | NextAuth provides signOut() callable from Server Actions or useSession hook on client. Session cleared from database (if DB sessions) or JWT invalidated immediately. |
| AUTH-04 | User can reset password via email link | Password reset flow: /forgot-password form → Server Action generates signed token (JWT or database-stored VerificationToken) → console.log email + link in dev → /reset-password?token=xxx validates token + sets new password. Prisma VerificationToken model already exists. |
| AUTH-05 | User can update profile (display name, avatar) | Server Action for /dashboard/settings. User model includes `name` and `image` fields. Zod schema validates display name (required, 1-100 chars). Avatar upload deferred or uses gravatar/placeholder in Phase 1. |
| UI-01 | Refreshed taco-themed dark design converted to React components | Tailwind v4 with custom theme mapping CSS variables (fire, lime, cyan, gold) to theme. Radix UI primitives for interactive components. Preserve existing color palette and fonts. |
| UI-02 | Responsive layout (mobile 375px, tablet 768px, desktop 1440px) | Tailwind responsive prefixes (sm:, md:, lg:). Playwright e2e testing with device emulation. Mobile-first approach. Test critical flows (login, signup, dashboard nav) on all three viewports. |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.x | Full-stack React framework | App Router is the standard for new projects (2025+). Server Components reduce client bundle, API Routes handle auth + RDAP proxy, SSR/SSG for SEO. |
| React | 19.x | UI library (bundled with Next.js 15) | React 19 ships with Next.js 15. Server Components, Actions, and `use()` hook production-ready. |
| TypeScript | 5.x | Type safety | Eliminates entire classes of auth bugs (user ID type mismatches, session shape inconsistencies). |
| Tailwind CSS | 4.x | Utility-first CSS framework | CSS-first config (no tailwind.config.js needed). New Rust engine is 5x faster. Custom CSS variables map directly to theme (fire, lime, cyan palette). |

### Authentication & Password
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Auth.js (next-auth) | 5.x beta (stable usage) | Session management, OAuth, Credentials provider | **Beta status UPDATE (2026-03-11):** v5 is production-ready despite beta tag. Core APIs are stable. Moving from @next-auth to @auth scope for database adapters. Handles cookies, JWT, Prisma integration seamlessly. |
| @auth/prisma-adapter | 5.x | Database session storage | Official adapter for Auth.js v5. No breaking changes to database schema from v4. Handles Account, Session, VerificationToken models automatically. |
| bcryptjs | 2.x | Password hashing | Pure JavaScript (no native compilation issues on Vercel). Work factor 13 = ~250-500ms on modern hardware (OWASP 2026 recommended). bcryptjs is slower than bcrypt but avoids deployment compilation issues. |

### Database & ORM
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma ORM | 6.x | Type-safe database access | Best-in-class DX. Auto-generates TypeScript from schema. Handles relations cleanly. Built-in Auth.js adapter. Declarative migrations. |
| PostgreSQL | 16+ | Production database | Relational model fits (User → Domain → DNSRecord → Bid). Full-text search for marketplace. JSON columns for flexible config. Use Neon for managed hosting with branching. |
| SQLite | Latest | Development only | Fast local dev via Prisma. Switch to PostgreSQL in staging/production with one datasource change. |

### UI Components & Styling
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Radix UI Primitives | 1.x | Accessible headless components | Unstyled, keyboard-navigable, ARIA-compliant. Needed for dialogs (password reset), dropdowns (user menu), tabs. Pair with Tailwind for styling. |
| Lucide React | 0.4x | Icons | Lightweight, tree-shakeable. 500+ icons. Domain-relevant (globe, lock, shield, settings). |
| Framer Motion | 11.x | Animations | Existing landing page has orb animations, fade-ups. Server Component compatible via "use client" boundaries. |
| clsx + tailwind-merge | 2.x + 2.x | Class composition | Prevents Tailwind conflicts. Build `cn()` utility for reusable component variants. |

### Form & Validation
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zod | 3.x | Schema validation (client + server) | Validates both sides of the auth boundary. Email format, password strength, domain name formats. TypeScript inference. |
| React Hook Form | 7.x | Complex form state | Only needed for multi-field forms (DNS editor, marketplace listing). Signup/login use Server Actions + Zod directly. |

### Testing (Phase 1 baseline)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Vitest | 2.x | Unit & integration tests | Auth logic tests: bcryptjs hashing, Zod validation, password reset token generation. Fast, ESM-native. |
| Playwright | 1.x | E2E tests | Critical auth flows: signup → login → dashboard. Session persistence on refresh. Responsive design on 375px/768px/1440px viewports. |
| Testing Library | 16.x | Component tests | Form components (LoginForm, SignupForm), isolated rendering tests. |

### Development Tools
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| ESLint | 9.x | Linting | Flat config (eslint.config.js). Includes next/core-web-vitals. |
| Prettier | 3.x | Code formatting | prettier-plugin-tailwindcss for class sorting. Enforces consistency. |
| Husky + lint-staged | 9.x / 15.x | Git hooks | Pre-commit linting/formatting. Catches issues before commit. |

### Infrastructure & Deployment
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Vercel | N/A | Hosting | First-party Next.js hosting. Zero-config. Edge Functions if needed. Environment variables managed in dashboard. |
| Docker Compose | N/A | Local PostgreSQL | Single `docker-compose.yml` for dev (PostgreSQL + optional pgAdmin). |

## Installation

```bash
# Initialize Next.js 15 with TypeScript and Tailwind v4
npx create-next-app@latest taco-domains --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Core auth dependencies
npm install next-auth@beta @auth/prisma-adapter prisma @prisma/client
npm install bcryptjs
npm install @types/bcryptjs --save-dev

# Validation & forms
npm install zod react-hook-form @hookform/resolvers

# UI & styling
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-switch @radix-ui/react-alert-dialog
npm install lucide-react framer-motion
npm install clsx tailwind-merge

# State & URL management
npm install nuqs

# Testing
npm install -D vitest @testing-library/react @testing-library/jest-dom playwright

# Dev tools
npm install -D prettier prettier-plugin-tailwindcss
npm install -D husky lint-staged
```

**Auth.js v5 Beta Note:** As of 2026-03-11, `next-auth@beta` is the recommended tag. Monitor [npm registry](https://www.npmjs.com/package/next-auth?activeTab=versions) for v5 stable release. Likely to move to `next-auth@5.x` by mid-2026. The API is stable—beta reflects ongoing refinements, not experimental features. This is production-ready.

## Architecture Patterns

### Pattern 1: Auth.js v5 with Credentials Provider + Database Sessions

**What:** Email/password authentication using Auth.js v5 Credentials provider, Prisma adapter for database-backed sessions, bcryptjs for hashing.

**When:** All auth flows (signup, login, logout, session check).

**Configuration:**
```typescript
// lib/auth/auth-options.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db/prisma";
import bcryptjs from "bcryptjs";
import { signInSchema } from "@/lib/validators/auth.schema";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" }, // or "jwt" — database is simpler
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        });
        if (!user) return null;

        const isValid = await bcryptjs.compare(
          parsed.data.password,
          user.passwordHash || ""
        );
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signUp: "/signup",
    error: "/login?error=AuthError",
  },
};

export const { handlers, auth } = NextAuth(authOptions);
```

**Why:** Database sessions are simpler than JWT for this use case (no token refresh logic needed). Credentials provider is pragmatic for email/password (despite Auth.js warnings, it's standard when OAuth isn't available). Prisma adapter handles schema automatically.

### Pattern 2: Session Persistence Across Browser Refresh

**What:** User logs in, navigates to /dashboard, hard-refreshes (Cmd+Shift+R) — session is still valid.

**When:** Testing AUTH-02; critical for user trust.

**Implementation:**

The session persists because:
1. **HTTP-only cookie stores session ID** (client can't access, XSS-safe)
2. **Server looks up session in database on page load** (Server Component can call `auth()`)
3. **Session is rehydrated before render** (no flash of login page)

```typescript
// app/(dashboard)/dashboard/page.tsx
import { auth } from "@/lib/auth/auth-options";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

**Cookie Configuration (CRITICAL):**
In `auth-options.ts`, ensure cookies are set correctly:
```typescript
export const authOptions = {
  cookies: {
    sessionToken: {
      name: `${useSecureCookies ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,      // JS can't access (XSS safe)
        secure: true,        // HTTPS only in production
        sameSite: "lax",     // CSRF safe; allow top-level nav
        maxAge: 30 * 24 * 60 * 60, // 30 days
      },
    },
  },
};
```

**Environment variables (REQUIRED):**
```
NEXTAUTH_URL=http://localhost:3000         # Dev
NEXTAUTH_SECRET=<32-byte random secret>    # Generate with: openssl rand -base64 32
```

**Testing:**
```typescript
// tests/auth-session-refresh.e2e.ts (Playwright)
test("session persists after browser refresh", async ({ page }) => {
  // 1. Sign up
  await page.goto("/signup");
  await page.fill('input[type="email"]', "test@example.com");
  await page.fill('input[name="password"]', "SecurePass123!");
  await page.click('button[type="submit"]');
  await page.waitForURL("/dashboard");

  // 2. Check dashboard loads
  expect(page.url()).toContain("/dashboard");
  const heading = await page.locator("text=Welcome").first();
  expect(heading).toBeVisible();

  // 3. Hard refresh (Cmd+Shift+R)
  await page.reload({ waitUntil: "networkidle" });

  // 4. Should still see dashboard, no login redirect
  expect(page.url()).toContain("/dashboard");
  expect(heading).toBeVisible();
});
```

### Pattern 3: Password Reset with Token-Based Flow

**What:** User enters email → Server generates signed token → Link in console → User clicks link → Sets new password.

**When:** AUTH-04 (forgot password flow).

**Implementation:**

```typescript
// lib/validators/auth.schema.ts
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
});
```

```typescript
// app/(auth)/forgot-password/actions.ts
"use server";

import prisma from "@/lib/db/prisma";
import crypto from "crypto";

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if email exists (security)
    return { success: true };
  }

  // Generate signed token
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires: expiresAt,
    },
  });

  // In dev: log the reset link
  const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  console.log(`[DEV] Password reset link for ${email}:\n${resetLink}`);

  return { success: true };
}
```

```typescript
// app/(auth)/reset-password/actions.ts
"use server";

import prisma from "@/lib/db/prisma";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

export async function resetPassword(token: string, newPassword: string) {
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token: hashedToken },
  });

  if (!verificationToken || verificationToken.expires < new Date()) {
    throw new Error("Token expired or invalid");
  }

  const user = await prisma.user.findUnique({
    where: { email: verificationToken.identifier },
  });
  if (!user) throw new Error("User not found");

  // Hash new password
  const hashedPassword = await bcryptjs.hash(newPassword, 13); // Cost factor 13

  // Update user and delete token
  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashedPassword },
    }),
    prisma.verificationToken.delete({
      where: { token: hashedToken },
    }),
  ]);

  return { success: true };
}
```

### Pattern 4: Password Strength Validation with Zod

**What:** Client + server validation ensures passwords meet minimum requirements.

**When:** AUTH-01, AUTH-04 (signup and password reset).

**Implementation:**

```typescript
// lib/validators/auth.schema.ts
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Must contain lowercase letter")
  .regex(/[A-Z]/, "Must contain uppercase letter")
  .regex(/[0-9]/, "Must contain a number")
  .regex(/[!@#$%^&*]/, "Must contain a special character (!@#$%^&*)");

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  displayName: z.string().min(1).max(100),
});
```

**Why:** Matches OWASP password guidelines. Client-side provides UX feedback; server-side is mandatory (never trust client validation).

### Pattern 5: Responsive Design with Tailwind v4 + Device Emulation Testing

**What:** Single codebase renders correctly on 375px (mobile), 768px (tablet), 1440px (desktop).

**When:** UI-02 (responsive design requirement).

**Implementation:**

Tailwind v4 mobile-first approach:
```tsx
// components/layout/navbar.tsx
export function Navbar() {
  return (
    <nav className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center md:gap-6">
      {/* Mobile: stacked; tablet+: row layout */}
      <div className="text-sm sm:text-base md:text-lg">Logo</div>
      <ul className="hidden sm:flex gap-4 md:gap-6">
        {/* Hidden on mobile, visible on tablet+ */}
      </ul>
    </nav>
  );
}
```

**Playwright responsive testing:**
```typescript
// tests/responsive-design.e2e.ts
const viewports = [
  { width: 375, height: 667, name: "Mobile" },
  { width: 768, height: 1024, name: "Tablet" },
  { width: 1440, height: 900, name: "Desktop" },
];

for (const viewport of viewports) {
  test(`Login page renders on ${viewport.name} (${viewport.width}px)`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();
    await page.goto("/login");

    // Check key elements are visible and properly spaced
    const form = page.locator("form");
    expect(form).toBeVisible();

    // Mobile: full-width inputs
    if (viewport.width < 640) {
      const input = page.locator('input[type="email"]');
      const box = await input.boundingBox();
      expect(box!.width).toBeGreaterThan(viewport.width * 0.8); // 80%+ width
    }

    await context.close();
  });
}
```

### Pattern 6: RegistrarAdapter Interface (Stub for Phase 1)

**What:** Define an interface for registrar operations so the simulated backend can be swapped for real APIs later (Pitfall 3 prevention).

**When:** Define in Phase 1; implement stubs; full implementations in Phases 2-5.

**Implementation:**

```typescript
// lib/adapters/registrar.adapter.ts
export interface RegistrarAdapter {
  // Phase 1: stubs only
  checkAvailability(domain: string): Promise<AvailabilityResult>;
  register(domain: string, years: number, opts: RegisterOpts): Promise<DomainResult>;
  renew(domainId: string, years: number): Promise<DomainResult>;
  transfer(domain: string, authCode: string): Promise<DomainResult>;
  lock(domainId: string): Promise<void>;
  unlock(domainId: string): Promise<void>;
  getDNSRecords(domainId: string): Promise<DNSRecord[]>;
  setDNSRecords(domainId: string, records: DNSRecord[]): Promise<void>;
}

export interface AvailabilityResult {
  domain: string;
  available: boolean;
  source: "local" | "rdap" | "dns-fallback";
  checkedAt: Date;
}

export interface RegisterOpts {
  userId: string;
  autoRenew?: boolean;
  whoisPrivacy?: boolean;
  years: number;
}

export interface DomainResult {
  id: string;
  name: string;
  expiresAt: Date;
  status: "ACTIVE" | "PENDING" | "ERROR";
}
```

```typescript
// lib/adapters/simulated.adapter.ts
export class SimulatedRegistrar implements RegistrarAdapter {
  constructor(private prisma: PrismaClient) {}

  async checkAvailability(domain: string): Promise<AvailabilityResult> {
    // Phase 1: stub (implement in Phase 2 with RDAP)
    throw new Error("Not implemented in Phase 1");
  }

  async register(
    domain: string,
    years: number,
    opts: RegisterOpts
  ): Promise<DomainResult> {
    // Phase 1: stub (implement in Phase 3)
    throw new Error("Not implemented in Phase 1");
  }

  // ... other methods stubbed
}
```

**Why:** By defining this interface now, we ensure all domain logic goes through a service layer. When Phase 2-5 implement these methods, the UI and API routes don't need to change.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session management | Custom JWT implementation | Auth.js v5 with Prisma adapter | Auth.js handles cookie security, CSRF protection, session refresh, provider integration. Custom implementation has too many edge cases (XSS, token expiry, refresh logic). |
| Password hashing | Home-brew hash with random salt | bcryptjs with cost factor 13 | Bcryptjs handles salt generation, work factor tuning, timing-attack resistance. Home-brew hashing is cryptographically brittle. |
| Email validation | Regex pattern | zod.string().email() | Email validation is deceptively complex (RFC 5321). Zod uses battle-tested patterns. |
| Password reset token security | Plaintext tokens in database | Hashed tokens + expiration | If database leaks, plaintext tokens compromise all users. Hash tokens like passwords. |
| Responsive design | Media query breakpoints from scratch | Tailwind v4 responsive prefixes | Tailwind provides battle-tested breakpoints (sm: 640px, md: 768px, lg: 1024px). Don't hardcode pixel values. |
| Dark theme colors | Manual CSS variable assignment | Tailwind v4 @theme blocks | Tailwind's theme system ensures contrast compliance, consistent naming, and supports runtime overrides. Manual CSS requires auditing all color pairs. |
| Form validation (client + server) | Separate client and server schemas | Zod shared schema, parse on both sides | Single source of truth. Zod TypeScript inference prevents type mismatches. Separate schemas lead to bugs where client allows something server rejects. |
| User session queries | Direct Prisma in components | Centralized `getCurrentUser()` function | Direct queries bypass ownership checks. Centralized function ensures all user fetches include auth verification. |

## Common Pitfalls

### Pitfall 1: Auth State Desync Between Server and Client

**What goes wrong:** Auth is checked differently in Server Components (via `auth()`), API routes (via `auth()` again), Client Components (via `useSession()` hook), and middleware (via `getToken()`). When these diverge, you get phantom logouts (user sees login page when session exists) or security bypass (unauthorized API calls succeed).

**Why it happens:** Auth.js provides multiple entry points for different contexts. Developers use whichever is convenient, and subtle differences in how each resolves sessions (timing, cache behavior) cause them to disagree.

**Prevention:**
- Create a single `getCurrentUser()` utility for Server Components:
  ```typescript
  // lib/auth/get-current-user.ts
  export async function getCurrentUser() {
    const session = await auth();
    if (!session?.user?.id) return null;
    return session.user;
  }
  ```
- Use NextAuth middleware for route protection instead of checking auth in component code:
  ```typescript
  // middleware.ts
  export function middleware(request: NextRequest) {
    const token = getToken({ req: request });
    if (!token && request.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  export const config = { matcher: ["/dashboard/:path*"] };
  ```
- Test the flow end-to-end: login → navigate to protected page → hard refresh → should still see protected page (not login).

**Warning signs:** After login, hard refresh shows login page briefly before redirecting to dashboard. Or: can call protected API route without session.

**Phase mapping:** Address in Phase 1 auth setup. Getting this wrong cascades through all subsequent phases.

### Pitfall 2: Session Persistence Broken by Cookie Misconfiguration

**What goes wrong:** User logs in successfully, navigates to dashboard, then hard-refreshes the page → redirected back to login. Session was lost because cookies weren't persisted correctly.

**Why it happens:** Browser cookies have security attributes (HttpOnly, Secure, SameSite) that must be set correctly. Common mistakes: SameSite=Strict breaks navigation redirects; missing Secure flag causes HTTPS-only cookies to be ignored; missing HttpOnly allows JavaScript to access session tokens (XSS vulnerability).

**Consequences:**
- User can't stay logged in across page reloads (frustrating UX)
- Or: cookies are sent in cross-site requests (CSRF vulnerability)
- Or: JavaScript can steal session tokens (XSS vulnerability)

**Prevention:**
- In Auth.js options, explicitly configure cookies:
  ```typescript
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,    // ✓ JS can't access
        secure: process.env.NODE_ENV === "production", // ✓ HTTPS in prod
        sameSite: "lax",   // ✓ Top-level nav allowed, but not cross-site
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  }
  ```
- Set NEXTAUTH_SECRET in .env.local (dev) and environment (prod). If missing, sessions fail silently.
- Test explicitly: `npm run dev`, signup, hard-refresh, should not redirect to login.

**Detection:** Log in locally, hard-refresh (Cmd+Shift+R). If you see login page even though session cookie exists, configuration is wrong.

**Phase mapping:** Must be correct in Phase 1. This is a blocking issue if wrong.

### Pitfall 3: Password Hashing Without Proper Cost Factor

**What goes wrong:** Passwords are hashed with bcryptjs but with a work factor that's too low (cost < 10). On a modern GPU, attackers can brute-force the hash in minutes because the hash computation is fast.

**Why it happens:** Developers use bcryptjs example code that specifies `bcryptjs.hash(password, 10)` (cost 10 = ~10ms per hash). Cost 10 was safe in 2015, but hardware has improved. Current recommendation is cost 13-14 (250-500ms per hash).

**Prevention:**
- Use cost factor 13 minimum for bcryptjs:
  ```typescript
  const hashedPassword = await bcryptjs.hash(password, 13);
  ```
  This results in ~250-500ms per hash on modern hardware, making brute-force infeasible.
- Document why cost 13: "OWASP recommends tuning the cost so that the function runs as slow as possible without degrading user experience." 250ms on signup is acceptable; 10ms is not.
- Never expose the cost factor in user-facing code (it's part of the bcryptjs hash output, so it's visible, but don't use a lower value for "performance").

**Detection:** Time a bcryptjs.hash() call locally. Should be >200ms. If <50ms, cost is too low.

**Phase mapping:** Address in Phase 1 signup logic. Easy to get right from the start; hard to fix later (all existing passwords need re-hashing).

### Pitfall 4: Password Reset Tokens Without Expiration

**What goes wrong:** Password reset tokens are generated and stored in the database, but there's no expiration. An attacker who gains database access could reset any password at any time, even months later.

**Why it happens:** Developers focus on the happy path (user gets email, clicks link, resets password) and forget to add a TTL or expiration field.

**Prevention:**
- Always include `expires` field in VerificationToken:
  ```typescript
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
    },
  });
  ```
- On token validation, check expiration:
  ```typescript
  if (verificationToken.expires < new Date()) {
    throw new Error("Token expired");
  }
  ```
- Set up a database cleanup job (or use Prisma lifecycle hooks) to delete expired tokens.

**Detection:** Generate a reset token, wait 2 hours, attempt to use it. Should fail.

**Phase mapping:** Implement in Phase 1 password reset flow.

### Pitfall 5: Missing .env.local Secrets in Development

**What goes wrong:** NEXTAUTH_SECRET is not set, or only set in one environment. During development, sessions work fine locally. Deploy to staging, and all sessions fail with cryptic errors.

**Why it happens:** Developers follow auth setup guides that say "set NEXTAUTH_SECRET in production" but skip it in development. Then they don't test the production behavior locally before deploying.

**Prevention:**
- Generate NEXTAUTH_SECRET immediately and add to .env.local:
  ```bash
  openssl rand -base64 32 > .env.local && echo "NEXTAUTH_SECRET=$(cat /dev/urandom | base64 | head -c 32)" >> .env.local
  ```
- Verify it's set: `echo $NEXTAUTH_SECRET` (should be a 32-byte string).
- Add to .env.example (not .env.local):
  ```
  NEXTAUTH_SECRET=<32-byte-random-string-here>
  NEXTAUTH_URL=http://localhost:3000
  ```
- CI/deployment must set these environment variables. For Vercel, add them in the project settings.
- **Never commit .env.local to git.** Add to .gitignore.

**Detection:** Logs show "Invalid environment variable: NEXTAUTH_SECRET" or sessions silently fail.

**Phase mapping:** Set up in Phase 1. This is a blocking issue if missing.

### Pitfall 6: Testing Auth Flows Without Clearing Session State

**What goes wrong:** Tests sign up user A, then user B. But the test environment still has user A's session, so user B's login request uses user A's identity.

**Why it happens:** Browser-based tests (Playwright, Cypress) maintain cookies between tests. Developers forget to clear cookies or sign out between test cases.

**Prevention:**
- In Playwright, use `context` scope for test isolation:
  ```typescript
  test("signup flow", async ({ page }) => {
    // Each test gets a fresh context with no cookies
  });
  ```
  This is the default behavior, so you get isolation for free.
- If a test needs to persist session across multiple steps, manually clear it when done:
  ```typescript
  test.afterEach(async ({ context }) => {
    await context.clearCookies();
  });
  ```

**Detection:** Run `npm run test:e2e` twice in a row. If second run fails because of leftover state, isolation is broken.

**Phase mapping:** Implement in Phase 1 test setup.

### Pitfall 7: Responsive Design Breakpoints Not Tested

**What goes wrong:** Tailwind classes like `md:flex` hide/show elements on tablet. You test the desktop viewport (1440px) and see "logged in" button. Never test mobile. When a user opens the app on a 375px phone, the button is hidden and they can't access the logout feature.

**Why it happens:** Testing responsive design requires running the same test at multiple viewport sizes. Developers skip this because it's tedious.

**Prevention:**
- Use Playwright device emulation from the start:
  ```typescript
  test("logout button visible on all viewports", async ({ browser }) => {
    const viewports = [
      { width: 375, height: 667, name: "iPhone" },
      { width: 768, height: 1024, name: "iPad" },
      { width: 1440, height: 900, name: "Desktop" },
    ];

    for (const device of viewports) {
      const context = await browser.newContext({
        viewport: { width: device.width, height: device.height },
      });
      const page = await context.newPage();
      await page.goto("/dashboard");

      const logoutBtn = page.locator("button:has-text('Logout')");
      expect(logoutBtn).toBeVisible(
        `Logout button should be visible on ${device.name}`
      );

      await context.close();
    }
  });
  ```
- Add this test to CI so it runs on every PR.

**Detection:** Test on real phone (or use Firefox/Chrome device emulation tools), notice critical buttons are missing on mobile.

**Phase mapping:** Implement in Phase 1. Use these same tests for all subsequent UI changes.

## Code Examples

### Example 1: Auth Setup (Auth.js v5 + Prisma + Credentials)

**Source:** Auth.js official migration guide + Prisma adapter docs (2026-verified)

```typescript
// lib/auth/auth-options.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/db/prisma";
import bcryptjs from "bcryptjs";
import { signInSchema } from "@/lib/validators/auth.schema";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;

        const isValid = await bcryptjs.compare(password, user.passwordHash);
        if (!isValid) return null;

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
  ],
  session: {
    strategy: "database", // Simpler than JWT for this use case
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signUp: "/signup",
    error: "/login?error=AuthError",
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      },
    },
  },
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
};

export const { handlers, auth } = NextAuth(authOptions);
```

### Example 2: Signup Server Action with Validation

```typescript
// app/(auth)/signup/actions.ts
"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import bcryptjs from "bcryptjs";
import { signUpSchema } from "@/lib/validators/auth.schema";

export async function signUp(formData: FormData) {
  try {
    const data = signUpSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
      displayName: formData.get("displayName"),
    });

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new Error("User with this email already exists");
    }

    // Hash password with cost 13
    const passwordHash = await bcryptjs.hash(data.password, 13);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.displayName,
        passwordHash,
      },
    });

    // Redirect to login (user must log in to create session)
    redirect("/login?registered=true");
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error("Signup failed");
  }
}
```

### Example 3: Login Form Component

```typescript
// components/auth/login-form.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setIsLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        name="email"
        placeholder="you@example.com"
        required
        disabled={isLoading}
      />
      <Input
        type="password"
        name="password"
        placeholder="Password"
        required
        disabled={isLoading}
      />
      {error && <p className="text-fire text-sm">{error}</p>}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
```

### Example 4: Session Persistence Test (Playwright)

```typescript
// tests/auth-session-persistence.e2e.ts
import { test, expect } from "@playwright/test";

test.describe("Auth - Session Persistence", () => {
  test("session survives browser refresh", async ({ page }) => {
    // 1. Signup
    await page.goto("/signup");
    await page.fill('input[name="email"]', `user-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.fill('input[name="displayName"]', "Test User");
    await page.click("button:has-text('Sign up')");
    await page.waitForURL("/login?registered=true");

    // 2. Login
    await page.fill('input[name="email"]', `user-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "SecurePass123!");
    await page.click("button:has-text('Sign in')");
    await page.waitForURL("/dashboard");

    // 3. Verify dashboard is visible
    const heading = await page.locator("text=Welcome").first();
    expect(heading).toBeVisible();

    // 4. Hard refresh (clear cache, reload)
    await page.reload({ waitUntil: "networkidle" });

    // 5. Should still be on dashboard (session cookie persisted)
    expect(page.url()).toContain("/dashboard");
    expect(heading).toBeVisible();

    // 6. Verify logout works
    await page.click("button[aria-label='User menu']");
    await page.click("text=Logout");
    await page.waitForURL("/login");
  });

  test.describe("Responsive - All Viewports", () => {
    const viewports = [
      { width: 375, height: 667, name: "Mobile" },
      { width: 768, height: 1024, name: "Tablet" },
      { width: 1440, height: 900, name: "Desktop" },
    ];

    viewports.forEach((viewport) => {
      test(`login form visible and usable on ${viewport.name}`, async ({
        browser,
      }) => {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
        });
        const page = await context.newPage();

        await page.goto("/login");

        // Check form is visible
        const form = page.locator("form");
        expect(form).toBeVisible();

        // Check inputs are properly sized
        const emailInput = page.locator('input[name="email"]');
        const box = await emailInput.boundingBox();

        if (viewport.width < 640) {
          // Mobile: should be full width (minus padding)
          expect(box!.width).toBeGreaterThan(viewport.width * 0.75);
        }

        await context.close();
      });
    });
  });
});
```

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 2.x + Playwright 1.x |
| Config file | vitest.config.ts + playwright.config.ts |
| Quick run command | `npm run test:auth` (unit tests only, ~10 seconds) |
| Full suite command | `npm run test` (unit + e2e, ~60 seconds) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | User can signup with email/password and land on dashboard | E2E | `npx playwright test tests/auth-signup.e2e.ts --project=chromium` | ❌ Wave 0 |
| AUTH-02 | User can login and session persists on browser refresh | E2E | `npx playwright test tests/auth-session-persistence.e2e.ts` | ❌ Wave 0 |
| AUTH-03 | User can logout from any page and redirect to login | E2E | `npx playwright test tests/auth-logout.e2e.ts` | ❌ Wave 0 |
| AUTH-04 | User can request password reset and set new password via link | E2E | `npx playwright test tests/auth-password-reset.e2e.ts` | ❌ Wave 0 |
| AUTH-05 | User can update display name and avatar on settings page | E2E | `npx playwright test tests/auth-profile-update.e2e.ts` | ❌ Wave 0 |
| UI-01 | Taco-themed components render with correct colors/fonts | Unit | `npm run test:ui` (component snapshot tests) | ❌ Wave 0 |
| UI-02 | App renders correctly on 375px, 768px, 1440px viewports | E2E | `npx playwright test tests/responsive-design.e2e.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** Run quick auth unit tests: `npm run test:auth` (~10s)
- **Per wave merge:** Full test suite: `npm run test` (unit + e2e, ~60s)
- **Phase gate:** Full suite must pass before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/auth-signup.e2e.ts` — AUTH-01 (signup flow, email validation, password requirements)
- [ ] `tests/auth-login.e2e.ts` — AUTH-01, AUTH-02 (login, session creation)
- [ ] `tests/auth-session-persistence.e2e.ts` — AUTH-02 (hard refresh scenario)
- [ ] `tests/auth-logout.e2e.ts` — AUTH-03 (logout clears session, redirects to login)
- [ ] `tests/auth-password-reset.e2e.ts` — AUTH-04 (forgot password flow, token validation, new password set)
- [ ] `tests/auth-profile-update.e2e.ts` — AUTH-05 (display name change, avatar upload placeholder)
- [ ] `tests/responsive-design.e2e.ts` — UI-02 (375px/768px/1440px viewports for login, dashboard, settings)
- [ ] `tests/unit/auth.test.ts` — Unit tests for bcryptjs hashing, Zod validation schemas, password reset token generation
- [ ] `vitest.config.ts` — Configure Vitest with JSDOM environment for component tests
- [ ] `playwright.config.ts` — Configure Playwright with device emulation profiles
- [ ] Framework install: `npm install -D vitest @testing-library/react playwright` — if not already done during stack setup

## State of the Art

| Old Approach | Current Approach (2026) | When Changed | Impact |
|--------------|------------------------|--------------|--------|
| NextAuth.js v4 with session JWT | Auth.js v5 with database sessions or JWT (user choice) | 2024-2025 | v5 is more framework-agnostic, better App Router support, Prisma adapter now @auth/prisma-adapter scope |
| Custom Credentials logic in API route | Auth.js v5 Credentials provider | 2024+ | Centralized auth config, built-in CSRF, consistent error handling |
| Tailwind v3 with tailwind.config.js | Tailwind v4 with CSS-first config | Jan 2025 | 70% smaller output CSS, 5x faster builds, no config file needed, custom properties via @theme |
| bcryptjs cost 10 | bcryptjs cost 13+ | 2024+ | Hardware improved; cost 10 = 10ms is now crackable. Cost 13 = 250-500ms is current OWASP recommendation |
| Email-based password reset as afterthought | Integrated into Auth.js via Email provider or custom server action | 2025+ | Better security (token expiration), easier to implement correctly (no edge cases) |
| Session stored in JWT only | Session in database (with optional JWT for stateless) | 2024+ | Better for logout (can revoke immediately), easier for session listing/audit, same perf with Prisma caching |

**Deprecated/Outdated:**
- **NextAuth.js v3 or v4:** Upgrading to v5 (beta but production-ready). v4 reached EOL in late 2024.
- **Storing passwords in plaintext or with weak hashing (MD5, SHA1):** Never acceptable; all new code must use bcryptjs or Argon2.
- **Session persistence via localStorage:** Vulnerable to XSS. HTTP-only cookies are the standard.
- **WHOIS for domain availability:** Replaced by RDAP (more reliable, JSON-based, machine-parseable).

## Open Questions

1. **Should Phase 1 implement the full landing page (domain search), or just auth + empty dashboard?**
   - What we know: CONTEXT.md specifies route `/` exists but marked as "placeholder for Phase 2"
   - What's unclear: Whether to build a minimal home page (hero + CTA to signup) or redirect unauthenticated users directly to landing page
   - Recommendation: Build minimal landing page (hero, "Get Started" button) to support the auth user flow. Save full domain search UX for Phase 2.

2. **Is `RegistrarAdapter` interface definition sufficient for Phase 1, or should we build a stub implementation?**
   - What we know: CONTEXT.md says "define interface in Phase 1 with stub"
   - What's unclear: How detailed the stub should be
   - Recommendation: Define interface with full method signatures. SimulatedRegistrar class should exist but all methods throw "Not implemented" with a comment indicating which phase implements them.

3. **Should password reset email be sent via a real email provider, or just logged to console?**
   - What we know: CONTEXT.md explicitly says "console.log email in dev (no real email provider)"
   - What's unclear: For staging/production builds, do we still console.log, or should there be a stub email service?
   - Recommendation: Console.log everywhere in Phase 1 (simulated backend). Phase 2+ can integrate Resend or another provider if needed.

4. **Avatar upload: file storage or placeholder/gravatar?**
   - What we know: AUTH-05 requires "update profile (display name, avatar)"
   - What's unclear: Where do we store uploaded image files?
   - Recommendation: Phase 1 uses placeholder avatar (initials or gravatar by email). File upload and storage deferred to Phase 2+.

## Sources

### Primary (HIGH Confidence)
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5) — v5 API, Prisma adapter (@auth/prisma-adapter), session strategies (database vs JWT)
- [Auth.js Prisma Adapter Docs](https://authjs.dev/reference/prisma-adapter) — Database schema requirements, callback patterns, session handling
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) — App Router auth patterns, middleware, ServerSession, useSession
- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs) — CSS-first config, @theme blocks, responsive prefixes, v4 release changes
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) — bcrypt/Argon2 recommendations, cost factors, salt handling
- [Playwright Device Emulation](https://playwright.dev/docs/emulation) — Viewport sizes, device profiles, responsive testing patterns

### Secondary (MEDIUM Confidence)
- [Auth.js v5 / Next.js 15 / 2026 Setup Guide](https://noqta.tn/en/tutorials/nextjs-authjs-v5-authentication-guide-2026) — Current 2026 integration patterns, recent best practices
- [Clerk: NextAuth Session Management Issues 2025](https://clerk.com/articles/nextjs-session-management-solving-nextauth-persistence-issues) — Session persistence problems, cookie configuration debugging
- [Tailwind CSS v4 + Next.js 15 Setup](https://designrevision.com/blog/tailwind-nextjs-setup) — v4 integration with Next.js, performance improvements
- [Password Hashing Guide 2025/2026: Argon2 vs Bcrypt](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/) — Current cost factor recommendations, hardware acceleration concerns
- [Playwright Mobile Testing 2026](https://www.browserstack.com/guide/playwright-mobile-automation) — Device emulation, responsive testing strategies

### Tertiary (LOW Confidence - Informational)
- [Better Auth Password Reset Implementation](https://www.npmix.com/blog/better-auth-complete-implementation-with-nextjs-and-prisma) — Alternative auth library patterns (reference, not recommended for this project)

## Metadata

**Confidence breakdown:**
- **Standard Stack:** HIGH — All core technologies (Next.js 15, React 19, Auth.js v5, Prisma, Tailwind v4) verified against 2026 official docs. Auth.js v5 "beta" status confirmed as production-ready by multiple sources and the ecosystem adoption.
- **Authentication Patterns:** HIGH — NextAuth v5 + Prisma adapter is battle-tested. Session persistence requirements (cookies, NEXTAUTH_SECRET) verified against current Auth.js and Clerk documentation.
- **Responsive Design:** HIGH — Tailwind v4 responsive prefixes and Playwright device emulation are well-established patterns.
- **Pitfalls:** MEDIUM-HIGH — Auth state desync, cookie misconfiguration, password hashing, session persistence are well-known issues documented in Auth.js issues and community discussions.
- **Testing Architecture:** HIGH — Vitest + Playwright are current best practices. Test mapping to requirements is logical.

**Research date:** 2026-03-11
**Confidence overall:** HIGH
**Valid until:** 2026-04-10 (30 days — stable stack, no rapid changes expected for Auth.js or Tailwind in next month)
**Next review:** Before Phase 2 (domain search/RDAP), verify latest Auth.js v5 release status and any breaking changes in Playwright device profiles.
