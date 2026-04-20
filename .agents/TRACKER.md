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

### [REFACTOR-002] Multi-brand config system (Brand Config)
- **Type:** refactor
- **Priority:** medium
- **Status:** backlog
- **Spec:** Extrair tudo o que é específico de uma marca (cores, logo, fontes, metadata) para um arquivo de configuração por marca (`brand/<name>/config.ts` + `brand/<name>/theme.css`). Uma variável de ambiente `BRAND` seleciona qual configuração carregar em build time. Isso permite usar o mesmo repositório para múltiplas lojas, cada uma deployada como projeto separado na Vercel com seu próprio `.env`. O `app/globals.css` atual mistura infraestrutura de theming (mapeamento `@theme inline`) com valores concretos de cores — esses valores concretos devem migrar para `brand/hypecult/theme.css`. O `components/logo.tsx` tem o path `/HYPECULT.svg` hardcoded. O `app/layout.tsx` tem fontes e metadata hardcoded.
- **Acceptance criteria:**
  - [ ] Existe `brand/hypecult/theme.css` com os blocos `:root` e `.dark` migrados de `app/globals.css`
  - [ ] Existe `brand/hypecult/config.ts` exportando `storeName`, `metadata` (title/description), `fonts`, `logoPath` e `logoAlt`
  - [ ] Existe `brand.config.ts` na raiz que lê `process.env.BRAND` e re-exporta o config correto (fallback para `hypecult`)
  - [ ] `app/globals.css` importa o theme CSS da marca ativa via `@import` gerado/resolvido pelo config, mantendo apenas o bloco `@theme inline` e a infra base
  - [ ] `app/layout.tsx` usa `brandConfig.metadata` e `brandConfig.fonts` em vez de valores hardcoded
  - [ ] `components/logo.tsx` usa `brandConfig.logoPath` e `brandConfig.logoAlt` em vez de strings hardcoded
  - [ ] `server/env.ts` adiciona `BRAND: z.string().default("hypecult")`
  - [ ] Criar uma segunda marca de exemplo (`brand/example/`) demonstra que a troca funciona apenas mudando `BRAND=example`
  - [ ] Nenhum comportamento existente da loja Hypecult é alterado
- **Files likely affected:** `app/globals.css`, `app/layout.tsx`, `components/logo.tsx`, `server/env.ts`, `public/` (reorganizar SVGs por marca), novos: `brand/hypecult/theme.css`, `brand/hypecult/config.ts`, `brand.config.ts`
- **Notes:** Tailwind v4 usa CSS-based config com `@theme inline` e variáveis CSS — a separação é cirúrgica. O `components.json` (shadcn) tem `baseColor`, `menuColor` e `menuAccent` específicos da marca; avaliar se deve fazer parte do config ou permanecer por projeto. Não é necessário suportar troca de marca em runtime — apenas em build/deploy time.

---

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

## In Progress

_No items currently in progress._

---

## Done

### [FEAT-011] Admin CRUD de taxonomia (`/admin/taxonomy`) — DONE (2026-04-20)
- **Summary:** Novo router tRPC `taxonomy` (`adminSummary`, listagens com busca, create/update/delete para `ProductCategory` e `Subcategory`). Páginas: `/admin/taxonomy` (hub com cards para categorias e temas; ícones Hugeicons `Layers01Icon`, `Folder01Icon`, `Folder02Icon`), `/admin/taxonomy/categories` e `/admin/taxonomy/subcategories` com tabela no estilo de promoções, filtro por nome/slug, `Dialog` para criar/editar (nome + slug) e `AlertDialog` para excluir. Componente compartilhado `components/admin/taxonomy-crud-table.tsx`. Sidebar e painel admin ganham atalho “Taxonomia”; invalidação inclui `product.listCategories` / `listSubcategories`.
- **Files likely affected:** `server/api/routers/taxonomy.ts`, `server/api/root.ts`, `components/admin/taxonomy-crud-table.tsx`, `app/admin/taxonomy/page.tsx`, `app/admin/taxonomy/categories/page.tsx`, `app/admin/taxonomy/subcategories/page.tsx`, `app/admin/layout.tsx`, `app/admin/page.tsx`

### [FEAT-010] Taxonomia de produtos — aliases, categoria de vitrine e subcategorias — DONE (2026-04-17)
- **Summary:** Prisma: `ProductCategory`, `Subcategory` (nome único), junção `_ProductToSubcategory`, `ProductAlias` (índice em `alias`, unique por produto+alias), `Product.categoryId` opcional; migration `20260417172511_add_product_taxonomy`. `product.list` filtra por nome ou alias (contains, insensitive) e por `subcategoryIds` com **OR** (comentário no schema Zod); inclui `subcategories` e `aliases` no retorno. `product.adminList` estende busca com match em aliases além de nome/sku. Novos endpoints públicos `listCategories` e `listSubcategories`. `product.update` substitui subcategorias e aliases quando enviados. `/search`: query params repetidos `?sub=<uuid>` sincronizados com combobox multi ("Selecione um tema"); filtro **Tipo de peça** permanece explícito (`ProductType`). Admin `/admin/products/[id]`: card de taxonomia com Select de categoria de vitrine, combobox de subcategorias e aliases (um por linha). Gelato sync não exige os novos campos.

### [FEAT-009] Search results page (`/search`) — DONE (2026-04-15)
- **Summary:** Extended `listProductsSchema` in `server/api/routers/product.ts` with `sort: z.enum(["newest","price_asc","price_desc","name_asc"]).default("newest")` and `type: z.enum(ProductType).optional()`; `product.list` applies the correct `orderBy` per sort value. Created `app/(store)/search/page.tsx` as a `"use client"` page wrapped in `<Suspense>`: reads `?q=` and `?sort=` and `?type=` from `useSearchParams()`; shows `Resultados para "<term>"` / `Todos os produtos` header with product count; renders a sort `Select` and a category-type `Select` toolbar that updates the URL via `router.replace`; uses the same `Item`/`CldImage`/`Badge` card pattern as the homepage with `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4`; 8-card skeleton loading state and an `Empty`/`EmptyHeader`/`EmptyMedia`/`EmptyTitle` empty state. Updated `components/search-sheet.tsx`: added `onKeyDown` Enter handler on `InputGroupInput` that closes the sheet and navigates to `/search?q=<term>`; added "Ver todos os resultados →" `SheetClose`+`Button`+`Link` at the bottom of results when results are present. No TypeScript or Biome errors.

### [FEAT-008] Search sheet — top drawer with live product results — DONE (2026-04-15)
- **Summary:** Created `components/search-sheet.tsx`: a controlled `Sheet` (`side="top"`) with an auto-focused `InputGroupInput`, 300 ms debounce via `useState` + `useEffect`, and `product.list` tRPC query (enabled only when query is non-empty). Results render in a `grid grid-cols-2 sm:grid-cols-4 gap-4` of product cards (CldImage crop/fill, discount badge, name, final/original price). Each card uses `SheetClose render={<Link href="/product/[id]" />}` to navigate and close simultaneously. Loading shows 4 `SearchItemSkeleton` components; empty-string input shows an idle prompt; no-results shows a pt-BR message. Updated `components/header.tsx`: both Sheets converted to controlled state (`searchOpen`, `mobileNavOpen`); desktop `InputGroup` is `readOnly` and opens the search sheet on click; mobile nav `InputGroup` closes the mobile nav then opens the search sheet. No TypeScript or Biome errors.

### [FIX-001] Validate env vars include NextAuth secrets — DONE (2026-04-13)
- **Summary:** `server/env.ts` Zod schema includes `NEXTAUTH_SECRET` (`z.string()`) and `NEXTAUTH_URL` (`z.url()`). `envSchema.parse(process.env)` runs at module load, so missing or invalid values throw before the app serves traffic. Same pattern as other required env vars (Gelato, Google OAuth, Cloudinary).

### [UPDATE-004] Footer — links reais para páginas de políticas — DONE (2026-04-13)
- **Summary:** `components/footer.tsx` usa `next/link` em todos os itens legais do rodapé via o padrão `Button` + `render={<Link href={...} />}` com `href` tipado como `Route` onde necessário. Rotas: `/policies/privacy-policy`, `/policies/terms-of-use`, `/policies/shipping-policy`, `/policies/refund-policy`, `/policies/cookie-policy`. Incluídos envio e cookies além de privacidade, termos e reembolsos. Sem `useRouter`. Rótulos na UI: "Trocas e reembolsos" e "Cookies" (em vez dos textos longos do critério de aceite).

---

### [FEAT-007] Policy pages — privacy, terms of use, shipping & cookies — DONE (2026-04-12)
- **Summary:** Criadas as 4 páginas de políticas legais em `app/(store)/policies/`: `privacy-policy/page.tsx` (LGPD — dados coletados incluindo CPF e OAuth Google, bases legais em tabela, compartilhamento com Gelato, direitos do titular, retenção), `terms-of-use/page.tsx` (elegibilidade, regras de conta, uso permitido, propriedade intelectual, limitação de responsabilidade conforme CDC, foro, referências cruzadas às demais políticas), `shipping-policy/page.tsx` (modelo PoD via Gelato, prazos de produção 2–5 dias úteis + prazos de entrega por modalidade, áreas atendidas, rastreamento, ausência do destinatário, extravio), `cookie-policy/page.tsx` (três categorias: necessários, preferências e analíticos com bases legais LGPD, cookies de terceiros Google, links de instruções por navegador). Todas as páginas seguem o mesmo layout de `refund-policy/page.tsx` (max-w-3xl, header com data de atualização, article com secções numeradas, texto em pt-BR). Cada página exporta `metadata` com `title` e `description`. Sem erros de lint (Biome).

---

### [FEAT-006] TipTap rich text editor component — DONE (2026-04-12)
- **Summary:** Installed `@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/extension-typography`, and `@tiptap/extension-underline` (added for Underline toolbar button). Created `components/ui/rich-text-editor.tsx`: a controlled `"use client"` component accepting `value`, `onChange`, `placeholder`, and `disabled` props. Toolbar uses the project's `Button` (`variant="ghost"`, `size="icon-sm"`) and `ButtonGroup`/`ButtonGroupSeparator` primitives with Hugeicons (`TextBoldFreeIcons`, `TextItalicFreeIcons`, `TextUnderlineFreeIcons`, `Heading02FreeIcons`, `Heading03FreeIcons`, `LeftToRightListBulletFreeIcons`, `LeftToRightListNumberFreeIcons`, `LinkFreeIcons`, `CodeSimpleIcon`) for groups: Bold, Italic, Underline | H2, H3 | Bullet list, Ordered list | Link | HTML source toggle. The HTML source toggle switches the editor area to a monospace `Textarea` showing raw HTML; switching back re-parses and syncs the HTML back into the TipTap editor and calls `onChange`. Border/focus-ring styling matches other project inputs (`border-input`, `focus-within:ring-ring/50`). Integrated with `react-hook-form` via `Controller` (`field.value`/`field.onChange`). The product description `Textarea` in `app/admin/products/[id]/page.tsx` was replaced with `<RichTextEditor />`. No TypeScript or lint errors.

### [UPDATE-003] Product pricing & variant stock/price editing in admin — DONE (2026-04-11)
- **Summary:** Extended `productUpdateSchema` in `server/api/routers/product.ts` to accept `price`, `discountType`, `discountAmount`, `finalPrice` at the product level, and a `variants` array with `id`, `stock`, `price`, `discountType`, `discountAmount`, `finalPrice` per variant. The `update` mutation now persists variant rows via `prisma.productVariant.update` (run in parallel). On the frontend (`app/admin/products/[id]/page.tsx`): added a "Preços do produto" card with four fields in a responsive 4-column grid; product-level `finalPrice` auto-computes via `computeFinalPrice` (imported from `server/lib/pricing`) whenever `price` or discount fields change through a `useEffect`, but remains manually editable. Added "Aplicar a todas as variantes" button that propagates product-level `discountType`/`discountAmount` to all variant rows and recomputes their `finalPrice` in form state. Added a "Variantes" card with a horizontally-scrollable table (one row per `ProductVariant`) with read-only `color`/`size` columns and editable `stock`, `price`, `discountType` (Select), `discountAmount`, and `finalPrice` inputs; variant `finalPrice` auto-computes on each field's `onChange` via `recomputeVariantFinalPrice`. Zod schemas validate all fields (price > 0, stock ≥ 0, discount ≥ 0). No lint errors.

### [FEAT-005] Product image management via Cloudinary — DONE (2026-04-09)
- **Summary:** Added `publicId String?` to `ProductImage` in `prisma/schema.prisma` (migration `20260409170415_add_product_image_public_id` applied, client regenerated). Added two `adminProcedure` mutations to `server/api/routers/product.ts`: `product.addImage` (persists the Cloudinary upload result, auto-increments `order`, enforces 6-image cap server-side) and `product.removeImage` (deletes the DB row; asset is kept in Cloudinary). Updated `app/admin/products/[id]/page.tsx`: replaced plain `Image` with `CldImage` (`crop="fill" gravity="auto"` for optimized delivery), wired `CldUploadWidget.onSuccess` to `addImage` so uploads persist immediately, added per-image hover delete button via `removeImage`, dynamic `maxFiles` on the widget, disabled "Adicionar imagens" button at the 6-image limit, and an empty-state message when no images exist.

---

### [FEAT-004] Admin promotions/coupons management page — DONE (2026-04-08)
- **Summary:** Added `promotion.adminList` (filters: search, status, discountType; returns `_count.orders` as usage), `promotion.adminById`, and `promotion.adminUpdate` (id-based partial update, admin-only) to `server/api/routers/promotion.ts`. Created `/admin/promotions` (filter card + table with Code, Type, Amount, Free Shipping, Usage, Expires At, Status columns; DropdownMenu/ContextMenu row actions with Editar link and inline active Switch), `/admin/promotions/[id]` (full edit form for all Promotion model fields via `adminUpdate`), and `/admin/promotions/new` (create form via `promotion.create`). All pages protected via `adminProcedure` on the backend.

### [FEAT-003] Admin Gelato product catalog (list + edit) — DONE (2026-04-06)
- **Summary:** `/admin` now uses `QuickAccessCard`-style links with counts from `product.adminSummary`. Added `product.adminList` (filters: search, status, type, Gelato sync) and `product.adminSummary`; fixed `product.update` to omit `id` from Prisma `data`. New pages: `/admin/products` (filter row + table) and `/admin/products/[id]` (form for name, description, active). Corrected admin sidebar active state (`/admin` vs `/account`).

### [FIX-002] Floating-point rounding corrupts prices during Gelato sync — DONE (2026-03-24)
- **Summary:** Added a `round2` helper (`Math.round(value * 100) / 100`) in `server/lib/pricing.ts` and applied it to every return path in `computeFinalPrice`. Because `computeVariantFinalPrice` delegates to `computeFinalPrice`, both functions now always return an exact two-decimal value. This prevents IEEE-754 drift from the `Number(prismaDecimal)` cast (e.g. `179.90` → `179.90000000000001`) from being written back to a `Decimal(10,2)` Postgres column as `179.91`.

### [UPDATE-002] Non-destructive Gelato product sync — DONE (2026-03-24)
- **Summary:** Removed all destructive `deleteMany` calls from `prisma/seed.ts` — the seed now runs purely via upserts. Promotions are upserted by `code` so re-runs are idempotent and existing promotions/`productPromotion` links are preserved. Added orphan cleanup to `gelato.sync.service.ts`: after processing all products, `deleteOrphanProducts` removes any local `Product` (+ child variants, images, print files, cart items, order items) whose `gelatoProductId` is no longer in the Gelato API response; after syncing each product's variants, any local `ProductVariant` not in the current active variant list is similarly deleted. `SyncResult` now includes `productsDeleted` and `variantsDeleted` counts, surfaced in both the seed output and the `POST /api/gelato/sync` response.

### [REFACTOR-001] Make `Order.orderId` optional — DONE (2026-03-24)
- **Summary:** Changed `Order.orderId` from `String @unique` (required) to `String? @unique` (optional) in the Prisma schema. Removed the `crypto.randomUUID()` placeholder that was being set at order creation time — the field now starts as `null` and is populated via a subsequent `order.update` call once the Gelato submission succeeds. Migration `20260324180839_make_order_order_id_optional` created and applied; Prisma client regenerated.

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
