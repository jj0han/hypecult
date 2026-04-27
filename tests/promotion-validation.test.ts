import assert from "node:assert/strict";
import test from "node:test";
import {
  type PromotionValidationPromotion,
  validatePromotionBusinessRules,
} from "@/server/lib/promotion-validation";

const productA = "1ec6de18-d840-4d58-b615-f0079f632742";
const productB = "5a2f7b6d-c9ef-4f2d-b8ee-7f48eefe3ca1";

function promotion(
  overrides: Partial<PromotionValidationPromotion> = {}
): PromotionValidationPromotion {
  return {
    id: "promo-1",
    code: "HYPE10",
    description: "10% off",
    active: true,
    discountType: "percentage",
    discountAmount: 10,
    freeShipping: false,
    freeShippingMaxAmount: null,
    allowOnDiscountedItems: true,
    limit: null,
    userLimit: null,
    minOrderAmount: null,
    maxOrderAmount: null,
    expiresAt: null,
    productPromotions: [],
    ...overrides,
  };
}

test("validatePromotionBusinessRules rejects expired promotions", () => {
  assert.throws(
    () =>
      validatePromotionBusinessRules({
        promotion: promotion({ expiresAt: new Date("2026-01-01") }),
        now: new Date("2026-01-02"),
      }),
    /Este cupom expirou/
  );
});

test("validatePromotionBusinessRules rejects global and per-user limit exhaustion", () => {
  assert.throws(
    () =>
      validatePromotionBusinessRules({
        promotion: promotion({ limit: 2 }),
        usageCount: 2,
      }),
    /limite máximo de usos/
  );

  assert.throws(
    () =>
      validatePromotionBusinessRules({
        promotion: promotion({ userLimit: 1 }),
        userUsageCount: 1,
      }),
    /número máximo de vezes/
  );
});

test("validatePromotionBusinessRules checks order amount limits", () => {
  assert.throws(
    () =>
      validatePromotionBusinessRules({
        promotion: promotion({ minOrderAmount: 200 }),
        orderAmount: 199.9,
      }),
    /Pedido mínimo/
  );

  assert.throws(
    () =>
      validatePromotionBusinessRules({
        promotion: promotion({ maxOrderAmount: 300 }),
        orderAmount: 300.01,
      }),
    /válido apenas/
  );
});

test("validatePromotionBusinessRules scopes discount to eligible products", () => {
  const result = validatePromotionBusinessRules({
    promotion: promotion({
      allowOnDiscountedItems: false,
      productPromotions: [{ productId: productA }],
    }),
    cartItems: [
      { productId: productA, hasDiscount: false, subtotal: 120 },
      { productId: productA, hasDiscount: true, subtotal: 80 },
      { productId: productB, hasDiscount: false, subtotal: 70 },
    ],
  });

  assert.deepEqual(result.productIds, [productA]);
  assert.equal(result.applicableSubtotal, 120);
});

test("validatePromotionBusinessRules rejects scoped promotions without matching products", () => {
  assert.throws(
    () =>
      validatePromotionBusinessRules({
        promotion: promotion({ productPromotions: [{ productId: productA }] }),
        cartItems: [{ productId: productB, hasDiscount: false, subtotal: 70 }],
      }),
    /não é válido para os produtos/
  );
});
