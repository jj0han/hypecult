import assert from "node:assert/strict";
import test from "node:test";
import {
  addCartItem,
  incrementCartItem,
  normalizeCartItems,
  removeCartItem,
} from "@/context/cart-operations";
import type { CartItem } from "@/context/cart-context";

const productA = "1ec6de18-d840-4d58-b615-f0079f632742";
const productB = "5a2f7b6d-c9ef-4f2d-b8ee-7f48eefe3ca1";
const variantA = "3f892614-c5ee-40f6-b59a-f2f2d0e0dcd7";
const variantB = "7ca2a98f-4fd2-44fc-9482-66856f75608b";

function cartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: productA,
    productUid: "uid-a",
    variantId: variantA,
    name: "Camiseta A",
    sku: "SKU-A",
    color: "Branco",
    price: 79.9,
    image: "/a.png",
    quantity: 1,
    size: "M",
    ...overrides,
  };
}

test("addCartItem inserts a new item into an empty cart", () => {
  assert.deepEqual(addCartItem(null, cartItem()), [cartItem()]);
});

test("addCartItem sums quantities for an existing variant", () => {
  const cart = addCartItem([cartItem({ quantity: 2 })], cartItem({ quantity: 3 }));

  assert.equal(cart[0]?.quantity, 5);
});

test("removeCartItem removes by variant and returns null for an empty cart", () => {
  assert.equal(removeCartItem([cartItem()], variantA), null);

  const nextCart = removeCartItem(
    [
      cartItem(),
      cartItem({
        productId: productB,
        productUid: "uid-b",
        variantId: variantB,
        name: "Camiseta B",
      }),
    ],
    variantA
  );

  assert.equal(nextCart?.length, 1);
  assert.equal(nextCart?.[0]?.variantId, variantB);
});

test("incrementCartItem updates quantity and removes depleted items", () => {
  const incremented = incrementCartItem([cartItem({ quantity: 2 })], variantA, 1);
  assert.equal(incremented?.[0]?.quantity, 3);

  const depleted = incrementCartItem([cartItem({ quantity: 2 })], variantA, -2);
  assert.equal(depleted, null);
});

test("normalizeCartItems merges duplicate variants and keeps a productUid", () => {
  const normalized = normalizeCartItems([
    cartItem({ productUid: null, quantity: 1 }),
    cartItem({ productUid: "uid-a", quantity: 2 }),
  ]);

  assert.equal(normalized.length, 1);
  assert.equal(normalized[0]?.quantity, 3);
  assert.equal(normalized[0]?.productUid, "uid-a");
});
