# TasteLab

**Know What You Eat. Share What You Think.**

TasteLab is a QR-code-driven product transparency and feedback platform for food brands. It is **not** a food ordering, delivery, or marketplace app — it is a digital companion to a physical food product: scan the QR code on a package, see nutrition facts and description, and read or leave ratings/reviews.

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Folder Structure](#folder-structure)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Authentication Setup](#authentication-setup)
8. [Development](#development)
9. [Production Build](#production-build)
10. [Deployment (Vercel)](#deployment-vercel)
11. [Key Architecture Decisions](#key-architecture-decisions)

---

## Technology Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Server Components by default) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| UI Primitives | Custom brutalist/neomorphic components built on Radix UI |
| Animations | Framer Motion (available; used selectively) |
| Icons | lucide-react |
| Database | PostgreSQL |
| ORM | Prisma |
| Validation | Zod |
| Forms | React Hook Form |
| Authentication | Better Auth (Email/Password + Google OAuth) |
| Charts | Recharts |
| Notifications | Sonner |
| Image Uploads | UploadThing |
| QR Codes | `qrcode` package |
| Deployment Target | Vercel |

---

## Folder Structure

```
tastelab/
├── prisma/
│   ├── schema.prisma          # Full data model (see Key Architecture Decisions)
│   └── seed.ts                 # Brand, categories, nutrition types, sample foods/reviews
├── scripts/
│   └── promote-kitchen.ts      # CLI: promote a registered user to a Kitchen account
├── public/
│   ├── images/foods/           # Placeholder food photos (replace with real assets)
│   ├── manifest.json
│   └── og-image.png, favicon.ico, icon-192.png, icon-512.png
├── src/
│   ├── actions/                # Server Actions ("use server") — the only way pages mutate data
│   │   ├── catalog.actions.ts  # Kitchen: Food/Category/NutritionType CRUD
│   │   ├── feedback.actions.ts # Customer: Rating/Review CRUD
│   │   ├── moderation.actions.ts # Kitchen: hide/unhide review text
│   │   └── profile.actions.ts  # Customer/Kitchen: profile + password
│   ├── app/                    # App Router routes
│   │   ├── (auth)/login, /register
│   │   ├── api/auth/[...all]   # Better Auth route handler
│   │   ├── api/uploadthing     # UploadThing route handler
│   │   ├── api/qrcode/[foodId] # Per-food QR PNG generator (Kitchen-only)
│   │   ├── food/[slug]         # Food Detail page — the QR code landing target
│   │   ├── kitchen/            # Kitchen dashboard (requireKitchen-protected layout)
│   │   ├── menu/                # Public catalog with category filter
│   │   ├── our-story/
│   │   ├── profile/            # Customer/Kitchen profile (requireUser-protected)
│   │   ├── layout.tsx, page.tsx, globals.css
│   │   ├── sitemap.ts, robots.ts
│   ├── components/
│   │   ├── ui/                 # Button, Card, Input, Textarea, Label, Badge, Switch, Skeleton
│   │   ├── layout/              # Navbar, Footer
│   │   ├── auth/                 # Login/Register/Profile forms
│   │   ├── catalog/            # FoodCard, NutritionTable
│   │   ├── feedback/           # StarRatingDisplay/Input, GiveFeedbackForm, ReviewList
│   │   └── kitchen/             # Sidebar, StatCard, FoodForm, CategoryManager, etc.
│   ├── constants/site.ts        # Nav links, rating labels, site config
│   ├── contexts/                # (reserved for future client-side global state)
│   ├── hooks/                   # (reserved for future shared client hooks)
│   ├── lib/                     # prisma client, auth config, auth-utils, utils, qrcode, uploadthing
│   ├── providers/providers.tsx  # Sonner Toaster wrapper
│   ├── services/                # Read-side data access (catalog.service, stats.service)
│   ├── types/index.ts           # Shared domain types built on Prisma types
│   ├── validations/              # Zod schemas: auth, catalog, feedback
│   └── middleware.ts             # Edge-level auth cookie check for /kitchen, /profile
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

**Why Server Actions instead of a separate REST API for mutations?** Next.js Server Actions give end-to-end type safety between the client and the mutation, without hand-rolling a `fetch` + API route + Zod-parse boilerplate for every CRUD operation. Route Handlers (`app/api/**`) are used only where a non-React client needs to call in (Better Auth's own routes, UploadThing's callback, and the QR PNG download endpoint).

---

## Prerequisites

- Node.js 20+
- A PostgreSQL 14+ database (local install, Docker, or a hosted provider like Supabase/Neon/Railway)
- A Google Cloud OAuth Client ID/Secret (for Google login)
- An UploadThing account + API token (for image uploads)

---

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy the environment template and fill in real values
cp .env.example .env
```

---

## Environment Variables

See [`.env.example`](./.env.example) — every variable is documented inline. Summary:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string used by Prisma |
| `BETTER_AUTH_SECRET` | Signs Better Auth session cookies — generate with `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Public base URL — used for OAuth callbacks, QR code target URLs, sitemap, Open Graph |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth credentials |
| `UPLOADTHING_TOKEN` | UploadThing API token for profile picture + food image uploads |

---

## Database Setup

```bash
# 1. Generate the Prisma client and run the initial migration
npm run db:migrate
# You'll be prompted for a migration name the first time, e.g. "init"

# 2. Seed the database: creates the TasteLab brand, 4 categories, 9 nutrition
#    types, all 6 sample foods (Potato Pops, Chicken Popcorn, Korean Chicken,
#    Cheese Ball, Loaded Fries, Corn Dog) with nutrition data, and one demo
#    customer with a sample rating + review on every food.
npm run db:seed
```

### Creating your first Kitchen account

Kitchen accounts are **provisioned, not self-registered** (per the approved architecture — Kitchen is an operator account, not a public sign-up). To create one:

```bash
# 1. Register a normal account at http://localhost:3000/register
#    with the email you want to use for Kitchen access.

# 2. Promote that account to Kitchen (attaches it to the seeded "tastelab" brand):
npm run make:kitchen -- your-email@example.com

# 3. Log out and back in (or just refresh) — you'll now see /kitchen/dashboard.
```

### Useful Prisma commands

```bash
npm run db:studio   # Visual database browser
npm run db:reset    # Drop, recreate, migrate, and re-seed (destructive)
```

---

## Authentication Setup

TasteLab uses [Better Auth](https://www.better-auth.com/) with two providers:

**Email & Password** — works out of the box once `DATABASE_URL` and `BETTER_AUTH_SECRET` are set.

**Google OAuth**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an OAuth 2.0 Client ID (type: Web application).
3. Add an authorized redirect URI: `{NEXT_PUBLIC_APP_URL}/api/auth/callback/google` (e.g. `http://localhost:3000/api/auth/callback/google` for local dev).
4. Copy the Client ID and Client Secret into `.env`.

---

## Development

```bash
npm run dev
```

Visit `http://localhost:3000`. The Menu, Food Detail, Login, and Register pages work immediately after seeding. Kitchen pages require a promoted account (see above).

---

## Production Build

```bash
npm run build
npm run start
```

`npm run build` runs `prisma generate` automatically via the `postinstall` hook, so no separate generate step is needed in CI as long as `npm install` runs first.

---

## Deployment (Vercel)

1. Push this repository to GitHub/GitLab/Bitbucket.
2. Import the project into Vercel.
3. Add all variables from `.env.example` to the Vercel project's Environment Variables (set `NEXT_PUBLIC_APP_URL` to your production domain, and update the Google OAuth redirect URI to match).
4. Set the Postgres `DATABASE_URL` to your production database (e.g. Vercel Postgres, Supabase, Neon, or Railway).
5. Deploy. Run `npx prisma migrate deploy` (via a Vercel deploy hook, or manually against the production `DATABASE_URL`) before the first request hits the site.
6. Run `npm run db:seed` once against production if you want the sample catalog, then `npm run make:kitchen -- <email>` to provision your real Kitchen account.

---

## Key Architecture Decisions

These were finalized during the architecture phase and are implemented exactly as specified — see inline code comments for the "why" at each relevant file:

- **Multi-tenant-ready schema**: every catalog table carries `brandId`, even though v1 ships with a single seeded brand and single-tenant UI.
- **One rating + one review per (customer, food)**: enforced via `@@unique([userId, foodId])` on both `Rating` and `Review`. Editing replaces the existing row; there is no review history/versioning.
- **Review visibility vs. moderation are separate concerns**: `Review.visibility` (`PUBLIC`/`PRIVATE`) is customer-controlled and toggles who can read the *text*. `Review.isHidden` is Kitchen-controlled moderation of the *text only* — it can never be used to hide or alter the numeric `Rating`, which always counts toward the public average.
- **Dynamic nutrition via a lookup table**: `NutritionType` is a reusable, brand-scoped master list (e.g. "Protein" → default unit "g") that Kitchen selects from when adding nutrition to a `Food`, via the join table `FoodNutrition` (which also carries `displayOrder` so the nutrition panel renders in a consistent, packaging-like order rather than arbitrary insertion order).
- **Guest draft preservation**: if a guest starts rating/reviewing and gets redirected to `/login`, their in-progress input is saved to `sessionStorage` and restored after successful authentication, then cleared.
- **QR code target**: each food has its own generated QR code (downloadable from the Kitchen product list) encoding a direct link to that food's Detail page — not the general catalog — per the finalized implementation spec.
- **Categories are a flat list** — no nested hierarchy, matching the size of a typical snack-brand catalog.
- **Soft-delete moderation**: hiding a review via Kitchen sets `isHidden = true` rather than deleting the row, preserving an audit trail.
