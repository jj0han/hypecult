import assert from "node:assert/strict";
import test from "node:test";
import { calculateCheckoutSummary } from "@/app/checkout/use-checkout-summary";

test("calculateCheckoutSummary applies promo, shipping and tax", () => {
  const summary = calculateCheckoutSummary({
    items: [
      { price: 100, quantity: 1 },
      { price: 50, quantity: 2 },
    ],
    promoCode: "SAVE10",
    shippingMethodId: "sedex",
    shippingMethods: [
      { id: "pac", price: 19.9 },
      { id: "sedex", price: 34.9 },
    ],
  });

  assert.equal(summary.subtotal, 200);
  assert.equal(summary.discount, 20);
  assert.equal(summary.shipping, 34.9);
  assert.equal(summary.tax, 14.4);
  assert.equal(summary.total, 229.3);
});

test("calculateCheckoutSummary returns zeroes for empty cart", () => {
  const summary = calculateCheckoutSummary({
    items: [],
    promoCode: "",
    shippingMethodId: undefined,
    shippingMethods: [],
  });

  assert.deepEqual(summary, {
    subtotal: 0,
    discount: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  });
});

