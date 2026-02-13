import { useMemo } from "react";

type OrderItem = {
  price: number;
  quantity: number;
};

type ShippingMethod = {
  id: string;
  price: number;
};

export interface CheckoutSummary {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export function calculateCheckoutSummary({
  items,
  promoCode,
  shippingMethodId,
  shippingMethods,
}: {
  items: OrderItem[];
  promoCode: string;
  shippingMethodId?: string;
  shippingMethods?: readonly ShippingMethod[];
}): CheckoutSummary {
  if (!items.length) {
    return { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 };
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = promoCode === "SAVE10" ? subtotal * 0.1 : 0;
  const shipping =
    shippingMethods?.find((method) => method.id === shippingMethodId)?.price ?? 0;
  const tax = (subtotal - discount) * 0.00;
  const total = subtotal - discount + shipping + tax;

  return { subtotal, discount, shipping, tax, total };
}

export function useCheckoutSummary({
  items,
  promoCode,
  shippingMethodId,
  shippingMethods,
}: {
  items: OrderItem[];
  promoCode: string;
  shippingMethodId?: string;
  shippingMethods?: readonly ShippingMethod[];
}) {
  return useMemo<CheckoutSummary>(
    () =>
      calculateCheckoutSummary({
        items,
        promoCode,
        shippingMethodId,
        shippingMethods,
      }),
    [items, promoCode, shippingMethodId, shippingMethods]
  );
}

