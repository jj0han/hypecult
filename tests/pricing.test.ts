import assert from "node:assert/strict";
import test from "node:test";
import { computeFinalPrice, computeVariantFinalPrice } from "@/server/lib/pricing";

test("computeFinalPrice applies percentage discounts with two-decimal rounding", () => {
  assert.equal(computeFinalPrice(179.9, "percentage", 10), 161.91);
  assert.equal(computeFinalPrice(79.9, "percentage", 15), 67.92);
});

test("computeFinalPrice applies fixed discounts and preserves cents", () => {
  assert.equal(computeFinalPrice(179.9, "fixed", 50), 129.9);
  assert.equal(computeFinalPrice(100, "fixed", 12.345), 87.66);
});

test("computeVariantFinalPrice prioritizes variant pricing and discounts", () => {
  assert.equal(
    computeVariantFinalPrice({
      productPrice: 100,
      productDiscountType: "percentage",
      productDiscountAmount: 20,
      variantPrice: 90,
      variantDiscountType: "fixed",
      variantDiscountAmount: 5,
    }),
    85
  );
});

test("computeVariantFinalPrice falls back to product pricing", () => {
  assert.equal(
    computeVariantFinalPrice({
      productPrice: 100,
      productDiscountType: "percentage",
      productDiscountAmount: 20,
      variantPrice: null,
      variantDiscountType: null,
      variantDiscountAmount: null,
    }),
    80
  );
});
