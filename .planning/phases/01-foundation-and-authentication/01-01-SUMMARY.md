---
phase: 01-foundation-and-authentication
plan: 01
subsystem: project-scaffold
tags: [nextjs, prisma, tailwind, typescript, registrar-adapter]
dependency_graph:
  requires: []
  provides: [next-app, prisma-schema, tailwind-theme, registrar-adapter, auth-validators]
  affects: [01-02, 01-03, 01-04]
tech_stack:
  added: [next@16, react@19, prisma@6, tailwindcss@4, zod@4, next-auth@beta, radix-ui, lucide-react, bcryptjs, vitest]
  patterns: [app-router, css-first-tailwind, prisma-singleton, adapter-pattern, zod-validation]
key_files:
  created:
    - package.json
    - tsconfig.json
    - next.config.ts
    - postcss.config.mjs
    - eslint.config.mjs
    - src/app/globals.css
    - src/app/layout.tsx
    - src/app/page.tsx
    - src/lib/utils.ts
    - prisma/schema.prisma
    - src/lib/db/prisma.ts
    - src/lib/adapters/registrar.adapter.ts
    - src/lib/adapters/simulated.adapter.ts
    - src/lib/validators/auth.schema.ts
    - .env.local
    - .env.example
    - .env
    - .gitignore
  modified: []
decisions:
  - Used Prisma v6 instead of v7 because v7 removed url from schema.prisma requiring prisma.config.ts migration config
  - Used SQLite for dev simplicity (file:./dev.db)
  - Used string fields with comments for enums (SQLite does not support native enums)
  - Created .env file alongside .env.local for Prisma CLI compatibility
  - Used zod/v4 import path for Zod v4 compatibility
metrics:
  duration: 8m
  completed: 2026-03-11T19:04:41Z
---

# Phase 1 Plan 01: Project Scaffold Summary

Next.js 15 scaffold with Tailwind v4 taco dark theme, full Prisma schema (9 models), Zod auth validators, and RegistrarAdapter interface with SimulatedRegistrar stub.

## What Was Done

### Task 1: Scaffold Next.js 15 with Tailwind v4 taco theme (0a38015)

Manually scaffolded Next.js 15 project (create-next-app refused non-empty directory). Installed all Phase 1 dependencies in one pass. Configured Tailwind v4 CSS-first theme with full taco color palette mapped from existing index.html CSS variables: fire (#ff5722), lime (#76ff03), cyan (#00e5ff), gold (#ffd740), plus surface/border/text colors. Loaded Anybody, Outfit, and JetBrains Mono fonts via next/font/google. Created cn() utility with clsx + tailwind-merge. Generated NEXTAUTH_SECRET via Node crypto. Verified with `npm run build` -- passes clean.

### Task 2: Prisma schema, auth validators, and RegistrarAdapter (e4b3f54)

Created full Prisma schema with 9 models: User, Account, Session, VerificationToken (Auth.js), Domain, DNSRecord, MarketplaceListing, Bid, Transaction (future phases). Used string fields with comments for enum-like values since SQLite lacks native enum support. Created PrismaClient singleton with globalThis caching. Built 6 Zod auth validation schemas (signUp, signIn, forgotPassword, resetPassword, updateProfile, passwordSchema) with strong password rules. Defined RegistrarAdapter interface with 8 methods and SimulatedRegistrar stub class. Verified with `npx prisma validate`, `npx tsc --noEmit`, and `npm run build` -- all pass clean.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Prisma v7 incompatibility with traditional schema url config**
- **Found during:** Task 2
- **Issue:** Prisma v7 removed the `url` property from `datasource` in schema.prisma, requiring a new prisma.config.ts approach
- **Fix:** Downgraded to Prisma v6 (^6.19.2) which supports the traditional `url = env("DATABASE_URL")` in schema.prisma
- **Files modified:** package.json, package-lock.json
- **Commit:** e4b3f54

**2. [Rule 3 - Blocking] Prisma CLI does not read .env.local**
- **Found during:** Task 2
- **Issue:** `npx prisma validate` failed because Prisma only reads `.env`, not `.env.local`
- **Fix:** Created `.env` file with DATABASE_URL for Prisma CLI usage (added to .gitignore)
- **Files modified:** .env (created, gitignored)
- **Commit:** e4b3f54

**3. [Rule 3 - Blocking] create-next-app refused non-empty directory**
- **Found during:** Task 1
- **Issue:** `npx create-next-app . --yes` refused because the directory contained existing files (index.html, taco_logo.png, .planning/, .claude/)
- **Fix:** Manually scaffolded the entire Next.js 15 project structure matching App Router defaults
- **Files modified:** All Task 1 files
- **Commit:** 0a38015

## Verification Results

| Check | Result |
|-------|--------|
| `npm run build` | PASS -- compiled successfully, 2 static routes |
| `npx prisma validate` | PASS -- schema valid |
| `npx prisma db push` | PASS -- SQLite dev.db created |
| `npx tsc --noEmit` | PASS -- zero type errors |

## Decisions Made

1. **Prisma v6 over v7** -- v7 requires a fundamentally different configuration approach (prisma.config.ts) that is incompatible with the traditional schema.prisma url pattern. v6 is stable and widely documented.
2. **String fields for enums** -- SQLite does not support native enum types, so we used String fields with inline comments documenting valid values. This works correctly with Prisma and can be migrated to native enums when switching to PostgreSQL.
3. **Separate .env for Prisma** -- Prisma CLI only reads `.env` (not `.env.local`), so a minimal `.env` with just DATABASE_URL was created alongside `.env.local` for Next.js.

## Self-Check: PASSED

All 17 key files verified present. Both task commits (0a38015, e4b3f54) verified in git log.
