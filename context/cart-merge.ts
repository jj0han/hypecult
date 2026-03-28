import type { CartItem } from "./cart-context";

export function mergeCartItems(local: CartItem[], remote: CartItem[]) {
  const merged = new Map<string, CartItem>();

  for (const item of remote) {
    merged.set(item.variantId, item);
  }

  for (const item of local) {
    const existing = merged.get(item.variantId);
    if (!existing) {
      merged.set(item.variantId, item);
      continue;
    }

    merged.set(item.variantId, {
      ...existing,
      quantity: existing.quantity + item.quantity,
      productUid: existing.productUid ?? item.productUid ?? null,
    });
  }

  return Array.from(merged.values());
}

