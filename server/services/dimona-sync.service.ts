import { prisma } from "@/server/db/prisma";
import {
  DimonaSyncError,
  type DimonaOrderPayload,
  createDimonaOrder,
} from "@/server/services/dimona.service";

const MAX_RETRIES = 5;
const BASE_DELAY_MINUTES = 5;

export function calculateNextRetryAt(retryCount: number) {
  const delayMinutes = BASE_DELAY_MINUTES * 2 ** Math.max(0, retryCount - 1);
  return new Date(Date.now() + delayMinutes * 60 * 1000);
}

export function shouldRetrySync(retryCount: number, retryable: boolean) {
  return retryable && retryCount < MAX_RETRIES;
}

async function buildPayload(orderId: string): Promise<DimonaOrderPayload> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, address: true, shipping: true },
  });

  if (!order) {
    throw new DimonaSyncError("ORDER_NOT_FOUND", false);
  }
  if (order.status !== "paid" && order.status !== "production") {
    throw new DimonaSyncError("ORDER_NOT_READY_FOR_PRODUCTION", false);
  }
  if (!order.address || !order.shipping) {
    throw new DimonaSyncError("ORDER_MISSING_ADDRESS_OR_SHIPPING", false);
  }

  const variantIds = order.items.map((item) => item.variantId).filter(Boolean) as string[];
  if (variantIds.length !== order.items.length) {
    throw new DimonaSyncError("MISSING_VARIANT_ID_ON_ORDER_ITEM", false);
  }

  const mappings = await prisma.productProviderMapping.findMany({
    where: {
      provider: "dimona",
      variantId: { in: variantIds },
    },
  });

  const mappingByVariantId = new Map(mappings.map((mapping) => [mapping.variantId, mapping]));
  const missingMapping = variantIds.find((variantId) => !mappingByVariantId.has(variantId));

  if (missingMapping) {
    throw new DimonaSyncError(`MISSING_DIMONA_MAPPING_FOR_VARIANT: ${missingMapping}`, false);
  }

  return {
    externalId: order.id,
    recipient: {
      name: order.address.recipient,
      street: order.address.street,
      number: order.address.number,
      complement: order.address.complement ?? undefined,
      district: order.address.district,
      city: order.address.city,
      state: order.address.state,
      zipCode: order.address.zipCode,
      country: "BR",
    },
    shipping: {
      method: order.shipping.method,
      price: Number(order.shipping.price),
    },
    items: order.items.map((item) => {
      const mapping = mappingByVariantId.get(item.variantId!);
      return {
        sku: mapping?.externalSku ?? undefined,
        productId: mapping?.externalProductId ?? undefined,
        variantId: mapping?.externalVariantId ?? undefined,
        quantity: item.quantity,
        metadata: {
          localOrderId: order.id,
          localOrderItemId: item.id,
          localProductId: item.productId,
          localVariantId: item.variantId!,
        },
      };
    }),
    metadata: {
      localOrderId: order.id,
      localUserId: order.userId,
    },
  };
}

export async function syncOrderToDimona(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new DimonaSyncError("ORDER_NOT_FOUND", false);
  }

  if (order.externalProvider === "dimona" && order.externalOrderId) {
    return { ok: true, skipped: true };
  }

  const payload = await buildPayload(orderId);
  const now = new Date();

  try {
    const result = await createDimonaOrder(payload);
    const externalOrderId =
      String(result.id ?? result.orderId ?? "").trim() || `local-${orderId}`;
    const externalStatus = String(result.status ?? "created");

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "production",
        externalProvider: "dimona",
        externalOrderId,
        externalStatus,
        externalSyncedAt: now,
        externalLastError: null,
        externalRetryCount: 0,
        externalLastAttemptAt: now,
        externalNextRetryAt: null,
      },
    });

    console.info("[DimonaSync] synced", { orderId, externalOrderId, externalStatus });
    return { ok: true, skipped: false };
  } catch (error) {
    const retryCount = order.externalRetryCount + 1;
    const syncError = error instanceof DimonaSyncError ? error : new DimonaSyncError(String(error));
    const canRetry = shouldRetrySync(retryCount, syncError.retryable);

    await prisma.order.update({
      where: { id: orderId },
      data: {
        externalProvider: "dimona",
        externalStatus: "error",
        externalLastError: syncError.message.slice(0, 2000),
        externalRetryCount: retryCount,
        externalLastAttemptAt: now,
        externalNextRetryAt: canRetry ? calculateNextRetryAt(retryCount) : null,
      },
    });

    console.error("[DimonaSync] failed", {
      orderId,
      retryCount,
      canRetry,
      error: syncError.message,
    });

    throw syncError;
  }
}

export async function syncPendingDimonaOrders(limit = 20) {
  const now = new Date();
  const orders = await prisma.order.findMany({
    where: {
      status: "paid",
      externalOrderId: null,
      externalRetryCount: { lt: MAX_RETRIES },
      OR: [{ externalNextRetryAt: null }, { externalNextRetryAt: { lte: now } }],
    },
    orderBy: { updatedAt: "asc" },
    take: limit,
  });

  let success = 0;
  let failed = 0;

  for (const order of orders) {
    try {
      await syncOrderToDimona(order.id);
      success += 1;
    } catch {
      failed += 1;
    }
  }

  return {
    scanned: orders.length,
    success,
    failed,
  };
}

