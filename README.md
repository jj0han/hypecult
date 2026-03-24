![Hypecult](./public/HYPECULT.svg)

---

### About

Hypecult is a **Brazilian print-on-demand e-commerce platform** built with Next.js (App Router), Prisma, and tRPC. It handles product listings, cart management, a multi-step checkout flow, and order processing — with fulfillment via **Gelato** (print-on-demand provider). The UI is in **pt-BR** and supports Brazilian address lookups (CEP via ViaCEP, state/city via IBGE).

> **This project is currently under construction.** Features and integrations are still being developed and may change significantly.

---

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| ORM | Prisma 7 |
| Database | PostgreSQL |
| API layer | tRPC v11 |
| Data fetching | TanStack React Query v5 |
| Auth | NextAuth v4 (Prisma Adapter) |
| Validation | Zod v4 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui |
| Forms | React Hook Form |
| Animation | GSAP, Motion (Framer Motion) |
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

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hypecult"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Gelato
GELATO_API_KEY="your-gelato-api-key"
GELATO_ORDER_API_URL="https://order.gelatoapis.com"
GELATO_ECOMMERCE_API_URL="https://ecommerce.gelatoapis.com"
GELATO_ECOMMERCE_STORE_ID="your-store-id"
GELATO_SYNC_SECRET="your-sync-secret"
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
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed the database |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm check` | Run Biome lint + format check |

---

### Project Status

| Area | Status |
|------|--------|
| Product listing & detail | Working |
| Auth (login/register) | Working |
| Cart | Working |
| Checkout UI | Partial |
| Payments (PSP) | Planned — no PSP integrated yet |
| Gelato fulfillment | Partial — API client and routers exist |
| Promotions/Coupons | Working |
| Account area | Working |
