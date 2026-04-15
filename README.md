![Hypecult](./public/HYPECULT.svg)

---

### About

Hypecult is a **Brazilian print-on-demand e-commerce platform** built with Next.js (App Router), Prisma, and tRPC. It handles product listings, cart management, a multi-step checkout flow, and order processing — with fulfillment via **Gelato** (print-on-demand provider). Product imagery can be delivered via **Cloudinary**. The UI is in **pt-BR** and supports Brazilian address lookups (CEP via ViaCEP, state/city via IBGE).

> **This project is currently under construction.** Features and integrations are still being developed and may change significantly.

---

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Language | TypeScript (strict) |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| API layer | tRPC v11 |
| Data fetching | TanStack React Query v5 |
| Auth | NextAuth v4 (Prisma Adapter) — credentials + Google OAuth |
| Validation | Zod v4 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Base UI, Hugeicons) |
| Forms | React Hook Form |
| Rich text (admin) | TipTap |
| Animation | GSAP, Motion |
| Media | Cloudinary, next-cloudinary |
| Linting/Formatting | Biome |
| Package manager | pnpm |
| Fulfillment | Gelato API |

---

### Running locally

**1. Install dependencies**

```bash
pnpm install
```

**2. Configure environment variables**

Create a `.env` file in the project root. Values are validated in `server/env.ts` at startup (see that file for the exact schema).

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hypecult"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth (required by env schema; use Google Cloud OAuth client values to enable Google sign-in)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Gelato
GELATO_API_KEY="your-gelato-api-key"
GELATO_ORDER_API_URL="https://order.gelatoapis.com"
GELATO_ECOMMERCE_API_URL="https://ecommerce.gelatoapis.com"
GELATO_ECOMMERCE_STORE_ID="your-store-id"
GELATO_SYNC_SECRET="your-sync-secret"

# Cloudinary (from your Cloudinary dashboard)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloud-name"
NEXT_PUBLIC_CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**3. Set up the database**

```bash
pnpm db:migrate      # run Prisma migrations
pnpm db:generate     # generate Prisma client
pnpm db:seed         # (optional) seed with sample products
```

**4. Start the dev server**

```bash
pnpm dev
```

---

### Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm check` | Run Biome lint + format (writes fixes) |
| `pnpm test:unit` | Run unit tests in `tests/` |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Create/apply migrations (development) |
| `pnpm db:migrate-deploy` | Apply migrations (production/CI) |
| `pnpm db:push` | Push schema without a migration (prototyping) |
| `pnpm db:reset` | Reset database and re-run migrations + seed |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio |

---

### Project Status

| Area | Status |
|------|--------|
| Product listing & detail | Working |
| Auth (login/register) | Working (credentials + Google) |
| Admin (products, promotions) | Working |
| Cart | Working |
| Checkout UI | Partial |
| Payments (PSP) | Planned — no PSP integrated yet |
| Gelato fulfillment | Partial — API client and routers exist |
| Promotions/Coupons | Working |
| Account area | Working |
| Product images | Cloudinary integrated (see env vars) |
