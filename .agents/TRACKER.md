# Hypecult — Development Tracker

> Reference this file in any Cursor chat with `@.agents/TRACKER.md` to show the AI what needs to be done.
>
> **Workflow**: spec an item first, then implement it, then move it to Done.
> Ask the AI to update this file after completing work.

---

## Entry Conventions

Each entry uses a unique ID with a type prefix:

| Prefix | Meaning |
|--------|---------|
| `FEAT` | New feature |
| `FIX` | Bug fix |
| `REFACTOR` | Code refactoring / cleanup |
| `UPDATE` | Enhancement to an existing feature |
| `CHORE` | Tooling, config, docs, tests |

**Priority**: `critical` > `high` > `medium` > `low`

**Entry template** (copy this when adding new items):

```markdown
### [TYPE-NNN] Short title
- **Type:** feature | fix | refactor | update | chore
- **Priority:** critical | high | medium | low
- **Status:** backlog | in-progress | done | cancelled
- **Spec:** What needs to happen and why. Be specific.
- **Acceptance criteria:**
  - [ ] Criterion 1
  - [ ] Criterion 2
- **Files likely affected:** `path/to/file`, `path/to/other`
- **Notes:** Any additional context, links, or decisions.
```

---

## Backlog

### [FEAT-001] Payment integration (PSP)
- **Type:** feature
- **Priority:** critical
- **Status:** backlog
- **Spec:** Integrate a payment service provider (likely Stripe) for order payments. The checkout payment step (`components/checkout/step-payment.tsx`) exists but is not connected to any live PSP. The `Order` model already has a `paymentIntentId` field ready for this.
- **Acceptance criteria:**
  - [ ] User can complete payment during checkout
  - [ ] Webhook endpoint receives payment confirmation and updates order status to `paid`
  - [ ] `paymentIntentId` is stored on the Order record
  - [ ] Failed/cancelled payments are handled gracefully
- **Files likely affected:** `server/api/routers/order.ts`, `app/api/` (new webhook route), `app/checkout/`, `components/checkout/step-payment.tsx`, `server/env.ts`, `package.json`
- **Notes:** The `Order.orderId` field is currently typed as `String` (non-optional) which may cause issues creating orders before Gelato submission. Evaluate if it should be optional.

---

### [FEAT-002] End-to-end Gelato fulfillment flow
- **Type:** feature
- **Priority:** high
- **Status:** backlog
- **Spec:** The Gelato integration has API clients, tRPC routers (`gelatoOrder`, `gelatoQuote`), and a sync endpoint, but the full flow (payment confirmed -> submit to Gelato -> track status) needs to be validated and wired end-to-end.
- **Acceptance criteria:**
  - [ ] After payment confirmation, order is automatically submitted to Gelato
  - [ ] Gelato `orderId` is stored on the local Order
  - [ ] Order status updates flow from Gelato back into the app (webhook or polling)
  - [ ] Shipping quotes from Gelato are displayed during checkout
- **Files likely affected:** `server/integrations/gelato/`, `server/api/routers/gelato.order.ts`, `server/api/routers/gelato.quote.ts`, `app/checkout/`, `server/api/routers/order.ts`
- **Notes:** Depends on FEAT-001 (payment must work before fulfillment submission makes sense).

---


---

### [CHORE-002] Expand test coverage
- **Type:** chore
- **Priority:** medium
- **Status:** backlog
- **Spec:** Only `tests/cart-merge.test.ts` exists. Add unit tests for critical business logic: promotion validation, price/discount calculations, order creation flow, and Zod schema validation.
- **Acceptance criteria:**
  - [ ] Tests for promotion validation logic (limits, expiration, product scoping)
  - [ ] Tests for discount calculation (product-level and variant-level, percentage and fixed)
  - [ ] Tests for cart operations (add, remove, update quantity, merge)
  - [ ] All tests pass with `pnpm test:unit`
- **Files likely affected:** `tests/` (new test files), potentially `server/api/routers/` if logic needs to be extracted for testability
- **Notes:** Currently using `tsx --test` (Node built-in test runner). Evaluate if a framework like Vitest would be beneficial.

---

### [REFACTOR-001] Make `Order.orderId` optional
- **Type:** refactor
- **Priority:** high
- **Status:** backlog
- **Spec:** `Order.orderId` (the Gelato order ID) is currently `String @unique` (required). Orders are created locally before being submitted to Gelato, so this field should be optional (`String?`) to avoid needing a placeholder value at creation time.
- **Acceptance criteria:**
  - [ ] `orderId` field is `String? @unique` in the Prisma schema
  - [ ] Migration is created and applied
  - [ ] Code that reads `orderId` handles the null case
- **Files likely affected:** `prisma/schema.prisma`, `server/api/routers/order.ts`, `server/api/routers/gelato.order.ts`
- **Notes:** Should be done before FEAT-001 to unblock local order creation.

---

### [UPDATE-001] Checkout shipping step with live Gelato quotes
- **Type:** update
- **Priority:** medium
- **Status:** backlog
- **Spec:** The checkout shipping method step should fetch real shipping quotes from the Gelato API (via the `gelatoQuote` tRPC router) based on the user's address and cart contents, instead of using hardcoded or placeholder options.
- **Acceptance criteria:**
  - [ ] Shipping options are fetched dynamically after user enters address
  - [ ] Loading and error states are handled
  - [ ] Selected shipping method and price are carried into the order
- **Files likely affected:** `components/checkout/step-shipping-method.tsx`, `server/api/routers/gelato.quote.ts`, `app/checkout/`
- **Notes:** Depends on the Gelato integration working (FEAT-002).

---

### [FIX-001] Validate env vars include NextAuth secrets
- **Type:** fix
- **Priority:** low
- **Status:** backlog
- **Spec:** `server/env.ts` validates Gelato and database env vars but does not include `NEXTAUTH_URL` or `NEXTAUTH_SECRET`. These should be validated at startup to catch misconfigurations early.
- **Acceptance criteria:**
  - [ ] `NEXTAUTH_URL` and `NEXTAUTH_SECRET` are included in the Zod schema in `server/env.ts`
  - [ ] App fails fast with a clear error if they are missing
- **Files likely affected:** `server/env.ts`
- **Notes:** Minor but prevents confusing runtime errors.

---

## In Progress

_No items currently in progress._

---

## Done

### [CHORE-001] Update README to match actual stack — DONE (2026-03-24)
- **Summary:** Rewrote `README.md` to remove references to Stripe and Dimona. Now accurately reflects the tech stack (Next.js, Prisma, tRPC, Gelato), includes complete setup instructions with all required environment variables, a scripts reference, and a project status table.

<!-- When moving items here, use this format:
### [TYPE-NNN] Short title — DONE (YYYY-MM-DD)
- **Summary:** Brief description of what was implemented.
- **Commits/PRs:** Reference any relevant commits or PRs.
-->

---

## Cancelled

_No items cancelled._
