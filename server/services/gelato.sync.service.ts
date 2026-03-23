import type {
  PrismaClient,
  ProductType,
  ShirtSize,
} from "@/server/db/generated/prisma/client";
import * as gelatoEcommerceService from "@/server/integrations/gelato/gelato.ecommerce.service";
import type { GelatoStoreProduct } from "@/server/integrations/gelato/gelato.ecommerce.types";
import {
  computeFinalPrice,
  computeVariantFinalPrice,
} from "@/server/lib/pricing";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Gelato size label → local ShirtSize enum.
 * Sizes that don't map (2XL, 3XL, etc.) return null — the productUid still
 * encodes the real size for Gelato fulfillment.
 */
function mapSize(sizeStr: string): ShirtSize | null {
  const sizeMap: Record<string, ShirtSize> = {
    XS: "PP",
    S: "P",
    M: "M",
    L: "G",
    XL: "GG",
    "2XL": "XG",
    "3XL": "XGG",
  };
  return sizeMap[sizeStr.toUpperCase().trim()] ?? null;
}

/**
 * Infer local ProductType from Gelato productUid.
 */
function inferProductType(productUid: string | undefined): ProductType {
  if (!productUid) return "other";
  if (productUid.includes("gca_t-shirt")) return "tshirt";
  if (productUid.includes("gca_hoodie")) return "hoodie";
  if (productUid.startsWith("mug_")) return "mug";
  if (productUid.startsWith("sticker_")) return "sticker";
  return "other";
}

/**
 * Parse Gelato variant title into color and size.
 *
 * Handles multiple formats returned by the real API:
 *   "White - S"                          → color: White, size: S
 *   "White - S - DTG (Direct-to-garment)" → color: White, size: S  (3 parts — size is always parts[1])
 *   "White / M"                           → color: White, size: M
 */
function parseVariantTitle(title: string): { color: string; size: string } {
  const separator = title.includes(" - ") ? " - " : " / ";
  const parts = title.split(separator);
  if (parts.length >= 2) {
    return {
      color: parts[0].trim(),
      size: parts[1].trim(), // always the second segment regardless of how many parts follow
    };
  }
  return { color: title.trim(), size: "" };
}

// ─── Result type ──────────────────────────────────────────────────────────────

export interface SyncResult {
  productsUpserted: number;
  variantsUpserted: number;
  imagesUpdated: number;
  errors: string[];
}

// ─── Main sync ────────────────────────────────────────────────────────────────

export async function syncGelatoProducts(
  prisma: PrismaClient
): Promise<SyncResult> {
  const result: SyncResult = {
    productsUpserted: 0,
    variantsUpserted: 0,
    imagesUpdated: 0,
    errors: [],
  };

  const products = await gelatoEcommerceService.listProducts();

  for (const gProduct of products) {
    try {
      // Fetch full product details individually — the list endpoint omits productImages,
      // but the single-product endpoint returns them with their URLs.
      const fullProduct = await gelatoEcommerceService.getProduct(gProduct.id);
      await syncProduct(prisma, fullProduct, result);
    } catch (err) {
      result.errors.push(
        `[${gProduct.id}] "${gProduct.title}": ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }

  return result;
}

// ─── Per-product sync ─────────────────────────────────────────────────────────

async function syncProduct(
  prisma: PrismaClient,
  gProduct: GelatoStoreProduct,
  result: SyncResult
) {
  const productType = inferProductType(gProduct.variants[0]?.productUid);
  const description = gProduct.description || gProduct.title;

  // Keep the existing price if this product was already synced before.
  // New products start at price 0 and inactive — admin must set price to activate.
  const existing = await prisma.product.findUnique({
    where: { gelatoProductId: gProduct.id },
    select: {
      price: true,
      discountType: true,
      discountAmount: true,
      active: true,
    },
  });

  const existingFinalPrice = existing
    ? computeFinalPrice(
        Number(existing.price),
        existing.discountType,
        existing.discountAmount ? Number(existing.discountAmount) : null
      )
    : 0;

  const product = await prisma.product.upsert({
    where: { gelatoProductId: gProduct.id },
    create: {
      gelatoProductId: gProduct.id,
      sku: gProduct.id,
      name: gProduct.title,
      description,
      type: productType,
      price: 0,
      finalPrice: 0,
      active: false, // inactive until admin sets a price
    },
    update: {
      name: gProduct.title,
      description,
      finalPrice: existingFinalPrice,
      // Preserve active state if price has been set; deactivate if Gelato unpublishes
      active:
        gProduct.status !== "created"
          ? false
          : existing
            ? Number(existing.price) > 0
            : false,
    },
  });

  result.productsUpserted++;

  // Prefer productImages (permanent hosted URLs added via the Gelato dashboard) over
  // previewUrl, which is a signed S3 URL that expires after 24 hours.
  // Use || (not ??) so empty strings are treated as missing.
  const dashboardImages = gProduct.productImages ?? [];

  if (dashboardImages.length > 0) {
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.$transaction(
      dashboardImages
        .filter((img) => !(img.productVariantIds.length > 0))
        .map((img, i) =>
          prisma.productImage.create({
            data: {
              productId: product.id,
              url: img.fileUrl,
              alt: gProduct.title,
              order: i + 1,
            },
          })
        )
    );
    result.imagesUpdated++;
  } else {
    // Fall back to the auto-generated previewUrl when no dashboard images exist.
    // Re-sync at least every 24h to keep this signed URL fresh.
    const previewUrl =
      gProduct.previewUrl ||
      gProduct.externalPreviewUrl ||
      gProduct.externalThumbnailUrl ||
      null;

    if (previewUrl) {
      await prisma.productImage.deleteMany({
        where: { productId: product.id },
      });
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: previewUrl,
          alt: gProduct.title,
          order: 1,
        },
      });
      result.imagesUpdated++;
    }
  }

  // Sync variants (skip "ignored" ones)
  for (const gVariant of gProduct.variants) {
    if (gVariant.connectionStatus === "ignored" || gVariant.isHidden) continue;

    const { color, size: sizeStr } = parseVariantTitle(gVariant.title);

    const existingVariant = await prisma.productVariant.findUnique({
      where: { gelatoVariantId: gVariant.id },
      select: { price: true, discountType: true, discountAmount: true },
    });

    // Compute variant finalPrice if variant has its own price; null otherwise (inherits product)
    const variantFinalPrice = existingVariant?.price
      ? computeVariantFinalPrice({
          productPrice: Number(product.price),
          productDiscountType: product.discountType,
          productDiscountAmount: product.discountAmount
            ? Number(product.discountAmount)
            : null,
          variantPrice: Number(existingVariant.price),
          variantDiscountType: existingVariant.discountType,
          variantDiscountAmount: existingVariant.discountAmount
            ? Number(existingVariant.discountAmount)
            : null,
        })
      : null;

    await prisma.productVariant.upsert({
      where: { gelatoVariantId: gVariant.id },
      create: {
        gelatoVariantId: gVariant.id,
        productId: product.id,
        productUid: gVariant.productUid,
        color,
        size: mapSize(sizeStr),
        stock: 9999, // Print-on-demand: unlimited stock
        finalPrice: null, // No price override at creation time
      },
      update: {
        productUid: gVariant.productUid,
        color,
        size: mapSize(sizeStr),
        finalPrice: variantFinalPrice,
      },
    });

    result.variantsUpserted++;
  }
}
