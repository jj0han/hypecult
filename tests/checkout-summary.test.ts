import assert from "node:assert/strict";
import test from "node:test";
import { calculateCheckoutSummary } from "@/app/checkout/use-checkout-summary";

const items = [
  { price: 100, quantity: 1 },
  { price: 50, quantity: 2 },
];

// One item is already discounted (e.g. product has a sale price)
const itemsWithDiscount = [
  { price: 80, quantity: 1, hasDiscount: true },  // was 100, now 80
  { price: 50, quantity: 2, hasDiscount: false },
];

const shippingMethods = [
  { id: "pac", price: 19.9 },
  { id: "sedex", price: 34.9 },
] as const;

test("calculateCheckoutSummary applies percentage promo and shipping", () => {
  const summary = calculateCheckoutSummary({
    items,
    promotion: {
      id: "promo-1",
      code: "SAVE10",
      discountType: "percentage",
      discountAmount: 10,
      freeShipping: false,
      freeShippingMaxAmount: null,
      allowOnDiscountedItems: true,
      applicableSubtotal: null,
      minOrderAmount: null,
      maxOrderAmount: null,
      productIds: null,
    },
    shippingMethodId: "sedex",
    shippingMethods,
  });

  assert.equal(summary.subtotal, 200);
  assert.equal(summary.discount, 20);
  assert.equal(summary.shipping, 34.9);
  assert.equal(summary.tax, 0);
  assert.equal(summary.total, 214.9);
});

test("calculateCheckoutSummary applies fixed promo", () => {
  const summary = calculateCheckoutSummary({
    items,
    promotion: {
      id: "promo-2",
      code: "FLAT50",
      discountType: "fixed",
      discountAmount: 50,
      freeShipping: false,
      freeShippingMaxAmount: null,
      allowOnDiscountedItems: true,
      applicableSubtotal: null,
      minOrderAmount: null,
      maxOrderAmount: null,
      productIds: null,
    },
    shippingMethodId: "pac",
    shippingMethods,
  });

  assert.equal(summary.subtotal, 200);
  assert.equal(summary.discount, 50);
  assert.equal(summary.shipping, 19.9);
  assert.equal(summary.total, 169.9);
});

test("calculateCheckoutSummary: free shipping with no cap", () => {
  const summary = calculateCheckoutSummary({
    items,
    promotion: {
      id: "promo-3",
      code: "FREESHIP100",
      discountType: "fixed",
      discountAmount: 0,
      freeShipping: true,
      freeShippingMaxAmount: null,
      allowOnDiscountedItems: true,
      applicableSubtotal: null,
      minOrderAmount: null,
      maxOrderAmount: null,
      productIds: null,
    },
    shippingMethodId: "sedex",
    shippingMethods,
  });

  assert.equal(summary.subtotal, 200);
  assert.equal(summary.discount, 0);
  assert.equal(summary.shipping, 0);
  assert.equal(summary.total, 200);
});

test("calculateCheckoutSummary: free shipping with R$30 cap (sedex = R$34.90 → user pays R$4.90)", () => {
  const summary = calculateCheckoutSummary({
    items,
    promotion: {
      id: "promo-4",
      code: "FREESHIP",
      discountType: "fixed",
      discountAmount: 0,
      freeShipping: true,
      freeShippingMaxAmount: 30,
      allowOnDiscountedItems: true,
      applicableSubtotal: null,
      minOrderAmount: null,
      maxOrderAmount: null,
      productIds: null,
    },
    shippingMethodId: "sedex",
    shippingMethods,
  });

  assert.equal(summary.subtotal, 200);
  assert.equal(summary.shipping, 4.9);
  assert.equal(summary.total, 204.9);
});

test("calculateCheckoutSummary: coupon skips already-discounted items (applicableSubtotal from server)", () => {
  // Server computed applicableSubtotal = 100 (only the non-discounted item: 50*2=100)
  const summary = calculateCheckoutSummary({
    items: itemsWithDiscount,
    promotion: {
      id: "promo-5",
      code: "FLAT50",
      discountType: "fixed",
      discountAmount: 50,
      freeShipping: false,
      freeShippingMaxAmount: null,
      allowOnDiscountedItems: false,
      applicableSubtotal: 100, // only non-discounted items
      minOrderAmount: null,
      maxOrderAmount: null,
      productIds: null,
    },
    shippingMethodId: "pac",
    shippingMethods,
  });

  // subtotal = 80 + 100 = 180
  assert.equal(summary.subtotal, 180);
  // discount applies only to the 100 (non-discounted) → R$50 fixed
  assert.equal(summary.discount, 50);
  assert.equal(summary.shipping, 19.9);
  assert.equal(summary.total, 149.9);
});

test("calculateCheckoutSummary: coupon skips discounted items computed locally", () => {
  // No server applicableSubtotal — computed locally from hasDiscount flags
  const summary = calculateCheckoutSummary({
    items: itemsWithDiscount,
    promotion: {
      id: "promo-5",
      code: "FLAT50",
      discountType: "fixed",
      discountAmount: 30,
      freeShipping: false,
      freeShippingMaxAmount: null,
      allowOnDiscountedItems: false,
      applicableSubtotal: null, // not pre-computed
      minOrderAmount: null,
      maxOrderAmount: null,
      productIds: null,
    },
    shippingMethodId: "pac",
    shippingMethods,
  });

  // subtotal = 80 + 100 = 180; applicable = 50*2=100; discount = 30 (fixed)
  assert.equal(summary.subtotal, 180);
  assert.equal(summary.discount, 30);
  assert.equal(summary.total, 169.9);
});

test("calculateCheckoutSummary without promo", () => {
  const summary = calculateCheckoutSummary({
    items,
    promotion: null,
    shippingMethodId: "pac",
    shippingMethods,
  });

  assert.equal(summary.subtotal, 200);
  assert.equal(summary.discount, 0);
  assert.equal(summary.shipping, 19.9);
  assert.equal(summary.total, 219.9);
});

test("calculateCheckoutSummary returns zeroes for empty cart", () => {
  const summary = calculateCheckoutSummary({
    items: [],
    promotion: null,
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
