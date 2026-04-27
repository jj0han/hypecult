import type { CartItem } from "./cart-context";

export function normalizeCartItems(input: CartItem[]) {
  const byVariant = new Map<string, CartItem>();
  for (const item of input) {
    const row: CartItem = {
      ...item,
      productUid: item.productUid ?? null,
    };
    const existing = byVariant.get(row.variantId);
    if (!existing) {
      byVariant.set(row.variantId, row);
      continue;
    }

    byVariant.set(row.variantId, {
      ...existing,
      quantity: existing.quantity + row.quantity,
      productUid: existing.productUid ?? row.productUid ?? null,
    });
  }

  return Array.from(byVariant.values()).sort((a, b) =>
    a.variantId.localeCompare(b.variantId)
  );
}

export function addCartItem(cart: CartItem[] | null, item: CartItem) {
  if (!cart) return [item];

  const existingItem = cart.find((i) => i.variantId === item.variantId);
  if (!existingItem) return [...cart, item];

  return cart.map((i) =>
    i.variantId === item.variantId
      ? { ...i, quantity: i.quantity + item.quantity }
      : i
  );
}

export function removeCartItem(cart: CartItem[] | null, variantId: string) {
  if (!cart) return null;

  const nextCart = cart.filter((i) => i.variantId !== variantId);
  return nextCart.length > 0 ? nextCart : null;
}

export function incrementCartItem(
  cart: CartItem[] | null,
  variantId: string,
  quantity: number
) {
  if (!cart) return null;

  const target = cart.find((i) => i.variantId === variantId);
  if (!target) return cart;

  if (target.quantity + quantity <= 0) {
    return removeCartItem(cart, variantId);
  }

  return cart.map((i) =>
    i.variantId === variantId ? { ...i, quantity: i.quantity + quantity } : i
  );
}
