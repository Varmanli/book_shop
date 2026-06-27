# Architecture Guide

## Overview

Single-vendor second-hand bookstore built on Next.js 16 App Router with a strict layered architecture:

```
Request → Server Action → Service → Repository → Drizzle ORM → PostgreSQL
```

UI components never touch the database directly. All mutations go through Server Actions; all reads go through either Server Actions or `fetch`-wrapped repository calls with cache tags.

---

## Folder Structure

```
src/
├── app/                         # Next.js App Router
│   ├── (public)/                # Routes accessible to everyone
│   ├── (customer)/              # Routes requiring USER login
│   ├── (admin)/                 # Routes requiring ADMIN role
│   ├── api/                     # API Route Handlers (auth, uploadthing)
│   ├── globals.css              # Tailwind v4 design tokens (OKLCH)
│   └── layout.tsx               # Root shell (lang=fa, dir=rtl)
│
├── actions/                     # Server Actions — thin validation + service delegation
├── components/                  # Shared UI components
│   └── ui/                      # Shadcn-generated primitives (do not hand-edit)
├── config/                      # Static app config (site, quality grades, order states)
├── db/
│   ├── schema/                  # Drizzle table definitions (one file per domain)
│   └── index.ts                 # Singleton Drizzle client
├── lib/                         # Pure utilities and singleton clients
├── repositories/                # All DB queries — no business logic
├── services/                    # Business logic — orchestrates repositories
├── types/                       # Domain types, API envelope, Auth.js augmentation
└── validations/                 # Zod schemas (one file per domain)
```

---

## Request Flow

### Mutation (form submit)
1. `<form action={serverAction}>` in a Client Component
2. **Server Action** (`src/actions/*.actions.ts`): authenticate with `requireAuth()` / `requireAdmin()`, validate FormData with Zod, call service, call `revalidateTag(tag, "max")`
3. **Service** (`src/services/*.service.ts`): enforce business rules, orchestrate one or more repositories, throw descriptive errors on constraint violations
4. **Repository** (`src/repositories/*.repository.ts`): execute the Drizzle query, return typed rows, never throw business errors

### Read (page render)
1. Next.js renders a Server Component
2. Server Component calls a repository function directly (or via a service for complex queries)
3. Repository wraps the query in `unstable_cache` keyed by `CACHE_TAGS.*` constants
4. `revalidateTag(tag, "max")` in the relevant action invalidates those entries

---

## Coding Conventions

### Server Actions
- File: `src/actions/<domain>.actions.ts`
- Always `"use server"` at top
- Return type: `Promise<ApiResponse<T>>` (never throw to the client — return `fail(message)`)
- Call `requireAuth()` or `requireAdmin()` as the first statement
- Validate all user input with the matching Zod schema before touching a service
- After mutations, call `revalidateTag(CACHE_TAGS.xxx, "max")` for every affected tag
- `redirect()` is intentionally outside try/catch (it throws internally and must propagate)

### Services
- File: `src/services/<domain>.service.ts`
- No `"use server"` — services are plain async functions
- Own all business rules: stock checks, permission guards beyond role, price calculations
- May call multiple repositories in a transaction where atomicity matters
- Throw `Error` with a human-readable Persian message on validation failure

### Repositories
- File: `src/repositories/<domain>.repository.ts`
- One responsibility: translate a query intent into a Drizzle query
- Never contain business logic or policy decisions
- Wrap read queries in `unstable_cache` with the correct `CACHE_TAGS` array
- Mutations are not cached — they return the affected row(s) directly

### Components
- Server Components by default — add `"use client"` only when you need browser APIs or event handlers
- Never import from `@/actions` in a Server Component — call the repository/service directly
- `"use client"` components accept data as props; they do not fetch

---

## Naming Conventions

| Layer | Pattern | Example |
|-------|---------|---------|
| Server Action | `<verb><Entity>Action` | `createBookAction` |
| Service function | `<verb><Entity>` | `createBook` |
| Repository function | `<verb><Entity>` | `insertBook` |
| Zod schema | `<verb><Entity>Schema` | `createBookSchema` |
| Cache tag constant | `CACHE_TAGS.<entity>` | `CACHE_TAGS.books` |
| Route segment | kebab-case | `/admin/books/[id]/edit` |
| DB table | snake_case plural | `order_items` |
| TypeScript type | PascalCase | `BookWithGenres` |

---

## Database Schema

All schemas live in `src/db/schema/`. Import from `@/db/schema` (barrel re-export).

| File | Tables |
|------|--------|
| `users.ts` | `users`, `accounts`, `sessions`, `verificationTokens` |
| `books.ts` | `books`, `categories`, `genres`, `bookGenres` |
| `orders.ts` | `orders`, `orderItems`, `addresses` |
| `cart.ts` | `cartItems` |
| `blog.ts` | `posts` |
| `wishlist.ts` | `wishlistItems` |
| `settings.ts` | `settings` |

Key decisions:
- **Prices as integers** (rials/cents) to avoid floating-point errors
- **`images text[]`** array column on books (UploadThing URLs)
- **`bookSnapshot jsonb`** on `orderItems` — captures title/author/price at purchase time; immutable after order creation
- **`shippingAddress jsonb`** on `orders` — snapshot of the address at order time
- **Guest cart**: `cartItems.sessionId` (nullable) enables pre-login carts; `mergeGuestCartIntoUserCart` runs on sign-in

---

## Authentication

- **Auth.js v5 beta** (`next-auth@5.0.0-beta.31`) with JWT session strategy
- **DrizzleAdapter** from `@auth/drizzle-adapter` persists OAuth accounts
- **Credentials provider**: password hashed with `crypto.scrypt` (native Node, no bcrypt)
- **Session shape** augmented in `src/types/auth.d.ts` to include `id` and `role`
- **Middleware** (`middleware.ts`) guards `/admin/*`, `/account/*`, `/cart`, `/checkout`; redirects authenticated users away from `/auth/*`

---

## Caching Strategy

- `"use cache"` directive (Next.js 16 opt-in) on layouts/pages that are safe to cache
- `unstable_cache` in repositories with domain-specific tags
- `revalidateTag(tag, "max")` — `"max"` profile means invalidate the cache entry everywhere (edge + serverless), not just the current region
- Cache tag naming: `CACHE_TAGS.books` (list), `CACHE_TAGS.book(slug)` (single item)

---

## Environment Variables

Validated at startup by `src/lib/env.ts` (Zod). The app will refuse to boot if any required variable is missing or malformed.

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | Min 32 chars; used to sign JWTs |
| `UPLOADTHING_TOKEN` | Yes | From UploadThing dashboard |
| `NEXT_PUBLIC_APP_URL` | Yes | Full URL including protocol |
| `AUTH_GOOGLE_ID` | No | Enables Google OAuth |
| `AUTH_GOOGLE_SECRET` | No | Enables Google OAuth |

---

## Key Third-Party Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| `drizzle-orm` | 0.45.2 | Type-safe ORM |
| `next-auth` | 5.0.0-beta.31 | Authentication |
| `uploadthing` | 7.7.4 | File uploads (book/blog images) |
| `zod` | 3.25.76 | Schema validation |
| `tailwindcss` | v4 | Styling (zero-config, `@import "tailwindcss"`) |
| `class-variance-authority` | latest | Variant-based component styling |

---

## Running Locally

```bash
# 1. Copy and fill env
cp .env.example .env.local

# 2. Install dependencies
npm install

# 3. Push schema to DB
npm run db:push

# 4. Seed development data
npm run db:seed

# 5. Start dev server
npm run dev
```

Admin login after seed: `admin@bookshop.com` / `Admin123!`
