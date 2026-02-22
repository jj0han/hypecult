## Hypecult

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/
api-reference/cli/create-next-app).

### Running locally

```bash
pnpm install
pnpm dev
```

### Required environment variables

Set these variables in your runtime environment:

- `DATABASE_URL`
- `STRIPE_WEBHOOK_SECRET`
- `INTERNAL_RETRY_SECRET`
- `DIMONA_API_URL` (default: `https://api.dimonatee.com`)
- `DIMONA_API_KEY`
- `DIMONA_API_KEY_HEADER` (default: `x-api-key`)
- `DIMONA_CREATE_ORDER_PATH` (default: `/orders`)
- `DIMONA_ORDER_STATUS_PATH_TEMPLATE` (default: `/orders/{id}`)
- `DIMONA_TIMEOUT_MS` (default: `15000`)

### Integration endpoints

- `POST /api/stripe/webhook`: receives Stripe payment events, marks order as `paid`, and starts Dimona sync.
- `POST /api/internal/dimona/retry`: protected endpoint to reprocess failed/queued Dimona syncs.
  - required header: `x-internal-secret: <INTERNAL_RETRY_SECRET>`

### Notes

- Stripe webhook expects an order reference in `metadata.orderId` (for `checkout.session.completed` and/or `payment_intent.succeeded`).
- Dimona sync runs only after payment confirmation.
- If Dimona sync fails, retry metadata is persisted on `Order`.
