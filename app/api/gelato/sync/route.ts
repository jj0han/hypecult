import { prisma } from "@/server/db/prisma";
import { env } from "@/server/env";
import { syncGelatoProducts } from "@/server/services/gelato.sync.service";

/**
 * POST /api/gelato/sync
 *
 * Fetches all products from the configured Gelato store and upserts them
 * into the local database.
 *
 * Authentication: pass the GELATO_SYNC_SECRET value in the
 * `x-sync-secret` header.
 *
 * Usage:
 *   curl -X POST https://your-domain.com/api/gelato/sync \
 *     -H "x-sync-secret: your-secret"
 *
 * New products are created with price = 0 and active = false.
 * Set a price in the admin panel to activate each product for purchase.
 */
export async function POST(request: Request) {
  const secret = request.headers.get("x-sync-secret");
  if (!secret || secret !== env.GELATO_SYNC_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncGelatoProducts(prisma);

    return Response.json({
      ok: true,
      productsUpserted: result.productsUpserted,
      variantsUpserted: result.variantsUpserted,
      imagesUpdated: result.imagesUpdated,
      productsDeleted: result.productsDeleted,
      variantsDeleted: result.variantsDeleted,
      errors: result.errors,
    });
  } catch (err) {
    console.error("[gelato/sync] Fatal error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Sync failed" },
      { status: 500 }
    );
  }
}
