# Hypecult — Project Context

> Reference this file in any Cursor chat with `@.agents/CONTEXT.md` to give the AI full project understanding.

---

## Overview

Hypecult is a **Brazilian print-on-demand e-commerce platform**. Customers browse products (t-shirts, hoodies, mugs, stickers), add them to a cart, go through a multi-step checkout, and orders are fulfilled via **Gelato** (print-on-demand provider). The UI is in **pt-BR** and addresses follow the Brazilian format (CEP, CPF, IBGE state/city lookups).

The project is **under active development** — some integrations are partially wired or pending.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.1.6 |
| UI library | React | 19.2.3 |
| Language | TypeScript (strict) | ^5 |
| ORM | Prisma | ^7.3.0 |
| Database | PostgreSQL (via `@prisma/adapter-pg` + `pg`) | — |
| API layer | tRPC | ^11.9.0 |
| Data fetching | TanStack React Query | ^5 |
| Auth | NextAuth (Prisma Adapter) | ^4.24.13 |
| Validation | Zod | ^4.3.6 |
| Styling | Tailwind CSS | ^4 |
| Component library | shadcn/ui (Base UI variant, Hugeicons) | ^4.1.0 |
| Forms | React Hook Form + @hookform/resolvers | ^7.71 |
| Animation | GSAP, Motion (Framer Motion) | ^3.14, ^12.33 |
| Charts | recharts | 3.8.0 |
| Formatting/Linting | Biome | 2.3.13 |
| Package manager | pnpm | — |
| Fulfillment | Gelato API | — |

---

## Folder Structure

```
hypecult/
├── app/                    # Next.js App Router
│   ├── (store)/            # Public storefront (home, product/[slug], policies/refund-policy)
│   ├── admin/              # Admin shell (role-gated); quick-access overview; `/admin/products` list+filters; `/admin/products/[id]` edit
│   ├── (auth)/             # Auth pages (log-in, sign-up, forgot-password)
│   ├── account/            # Authenticated user area (orders, addresses)
│   ├── checkout/           # Multi-step checkout flow + success page
│   ├── api/
│   │   ├── trpc/[trpc]/    # tRPC HTTP handler
│   │   ├── auth/[...nextauth]/ # NextAuth route
│   │   ├── gelato/sync/    # Gelato catalog sync endpoint
│   │   ├── viacep/[cep]/   # Brazilian CEP address lookup
│   │   └── ibge/           # IBGE state/city API proxies
│   ├── layout.tsx          # Root layout (fonts: Outfit + Geist, lang="pt-BR")
│   ├── providers.tsx       # All client providers (Session, Auth, Cart, tRPC, Query, Theme)
│   └── globals.css         # Tailwind + CSS variables
├── server/
│   ├── api/
│   │   ├── root.ts         # tRPC app router (merges all sub-routers)
│   │   ├── trpc.ts         # tRPC init, context, middleware
│   │   └── routers/        # Domain routers: product, auth, address, order, cart, promotion, gelato.*
│   ├── auth/               # NextAuth config, password utilities
│   ├── db/                 # Prisma client instance + generated client
│   ├── integrations/gelato/ # Gelato API client (orders, quotes, sync)
│   └── env.ts              # Zod-validated environment variables
├── components/
│   ├── ui/                 # shadcn/ui primitives (button, dialog, sidebar, carousel, etc.)
│   ├── checkout/           # Checkout step components (identification, shipping, payment, review)
│   ├── header.tsx          # Site header
│   ├── footer.tsx          # Site footer
│   └── logo.tsx            # Brand logo
├── context/                # React contexts (auth-context, cart-context, cart-merge)
├── schemas/                # Zod schemas (user, address, cart, checkout, order, shipping, auth)
├── hooks/                  # Custom hooks (use-mobile)
├── lib/                    # Shared utilities (utils.ts, trpc.ts client wiring)
├── prisma/
│   ├── schema.prisma       # Data model
│   ├── seed.ts             # Seed script
│   └── migrations/         # Prisma migrations
├── tests/                  # Unit tests (cart-merge.test.ts)
└── public/                 # Static assets (SVG logo, etc.)
```

---

## Architecture

```
Browser ──> Next.js App Router ──> tRPC HTTP Handler ──> tRPC Routers ──> Prisma ──> PostgreSQL
                │                                             │
                │                                             ├──> Gelato API (quotes, orders, sync)
                │                                             └──> bcryptjs (password hashing)
                ├──> NextAuth (session, JWT)
                └──> React Context (auth state, cart state)
```

**tRPC routers** serve as the API layer. Each domain has its own router:

| Router | Purpose |
|--------|---------|
| `product` | Product listing, detail, search |
| `auth` | Registration, login helpers |
| `address` | CRUD for user saved addresses |
| `order` | Order creation, listing, detail |
| `cart` | Server-side cart (add, remove, update, clear) |
| `promotion` | Coupon validation and application |
| `gelatoOrder` | Submit orders to Gelato for fulfillment |
| `gelatoQuote` | Get shipping quotes from Gelato |

**Auth**: NextAuth supports **credentials** (email/password) and **Google** OAuth; session JWT includes `user.id`, `user.cpf`, and `user.role`.

**Client providers** are composed in `app/providers.tsx`: SessionProvider > AuthProvider > CartProvider > tRPC + TanStack Query > ThemeProvider.

---

## Data Model (Key Entities)

```
User ──< Address
User ──< Order ──< OrderItem
                ──1 OrderAddress
                ──1 Shipping
                ──? Promotion
User ──< CartItem
User ──< UserPromotion >── Promotion

Product ──< ProductVariant
Product ──< ProductImage
Product ──< ProductPrintFile
Product ──< ProductPromotion >── Promotion
```

- **User**: `role` (`UserRole`: `user` | `admin`), name, email, optional password, cpf (Brazilian tax ID), emailVerified, optional OAuth `image`
- **Product**: sku, name, description, type (tshirt/hoodie/mug/sticker/other), price with optional discount (percentage or fixed), finalPrice, optional gelatoProductId
- **ProductVariant**: color, optional size (PP–XGG), stock, optional variant-level pricing/discount, optional Gelato IDs
- **Order**: status (pending/paid/production/shipped/delivered/cancelled), totals, optional Gelato orderId, optional promotionId
- **CartItem**: denormalized product snapshot per user (unique on userId+variantId)
- **Promotion**: code-based coupons with discount rules, free shipping, usage limits, product scoping, expiration

---

## Conventions

- **Language/Locale**: UI text in pt-BR; Brazilian address format (CEP, state via IBGE, CPF)
- **Path alias**: `@/*` maps to project root (configured in `tsconfig.json`)
- **Prisma output**: generated client lives at `server/db/generated/prisma`
- **Naming**: camelCase for variables/functions, PascalCase for components/types, kebab-case for file names
- **Formatting**: Biome handles format + lint (`pnpm check` to run both)
- **Package manager**: pnpm (do not use npm or yarn)
- **Scripts**: `pnpm dev`, `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm db:studio`
- **Environment variables**: validated via Zod in `server/env.ts`
- **Serialization**: tRPC uses superjson (handles Decimal, Date, etc.)

---

## Current State & Known Gaps

| Area | Status | Notes |
|------|--------|-------|
| Product listing & detail | Working | Products seeded; storefront pages render |
| Auth (login/register) | Working | NextAuth: credentials + Google OAuth; Prisma adapter; JWT includes `role` |
| Admin area | Partial | `/admin`, `/admin/products`, `/admin/products/[id]` implemented (tRPC `product.adminList`, `product.adminSummary`, `product.update`); `/admin/promotions` still missing |
| Cart | Working | Server-side cart with merge on login |
| Checkout UI | Partial | Multi-step form exists; payment step not integrated with a PSP |
| Payments | Not wired | `paymentIntentId` field exists on Order but no Stripe (or other PSP) integration in code |
| Gelato fulfillment | Partial | API client, routers, and sync endpoint exist; end-to-end flow may need testing |
| Promotions/Coupons | Working | Full CRUD + validation + usage tracking |
| Account area | Working | Orders list, order detail, address management |
| README | Outdated | Mentions Stripe and Dimona; actual stack uses Gelato, no Stripe yet |
| Tests | Minimal | Only `cart-merge.test.ts` exists |

---

## Environment Variables

Defined in `server/env.ts`:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `GELATO_ORDER_API_URL` | Gelato order API base URL |
| `GELATO_ECOMMERCE_API_URL` | Gelato e-commerce API base URL |
| `GELATO_ECOMMERCE_STORE_ID` | Gelato store identifier |
| `GELATO_API_KEY` | Gelato API authentication key |
| `GELATO_SYNC_SECRET` | Secret for the Gelato sync webhook endpoint |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (NextAuth Google provider) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

NextAuth also requires `NEXTAUTH_URL` and `NEXTAUTH_SECRET` (configured in `server/auth/`).
