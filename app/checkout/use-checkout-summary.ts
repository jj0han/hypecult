import { useMemo } from "react";
import { toast } from "sonner";

type OrderItem = {
  price: number;
  quantity: number;
  hasDiscount?: boolean;
};

type ShippingMethod = {
  id: string;
  price: number;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export type PromotionData = {
  id: string;
  code: string;
  description?: string | null;
  discountType: "percentage" | "fixed";
  discountAmount: number;
  freeShipping: boolean;
  /** Max shipping cost covered when freeShipping is true. null = fully free. */
  freeShippingMaxAmount: number | null;
  /** If false, the coupon does not apply to items that already have a product-level discount. */
  allowOnDiscountedItems: boolean;
  /**
   * Pre-computed subtotal from the server that the coupon should be applied to.
   * null when allowOnDiscountedItems=true (full subtotal).
   */
  applicableSubtotal: number | null;
  minOrderAmount: number | null;
  maxOrderAmount: number | null;
  productIds: string[] | null;
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
  promotion,
  shippingMethodId,
  shippingMethods,
  onError,
}: {
  items: OrderItem[];
  promotion: PromotionData | null;
  shippingMethodId?: string;
  shippingMethods?: readonly ShippingMethod[];
  onError?: () => void;
}): CheckoutSummary {
  if (!items.length) {
    return { subtotal: 0, discount: 0, shipping: 0, tax: 0, total: 0 };
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  let discount = 0;
  if (promotion) {
    // Determine which portion of the cart the coupon applies to.
    // If allowOnDiscountedItems=false, use server-computed applicableSubtotal when
    // available, otherwise compute it locally from the item flags.
    if (
      !promotion.allowOnDiscountedItems &&
      items.some((item) => item.hasDiscount)
    ) {
      onError?.();
    }
    const baseForDiscount =
      promotion.applicableSubtotal ??
      (promotion.allowOnDiscountedItems
        ? subtotal
        : items.reduce(
            (sum, item) =>
              item.hasDiscount ? sum : sum + item.price * item.quantity,
            0
          ));

    if (promotion.discountType === "percentage") {
      discount = roundMoney(baseForDiscount * (promotion.discountAmount / 100));
    } else {
      discount = promotion.discountAmount;
    }
    // Never discount more than the subtotal
    discount = Math.min(discount, subtotal);
  }

  const baseShipping =
    shippingMethods?.find((method) => method.id === shippingMethodId)?.price ??
    0;

  let shipping = baseShipping;
  if (promotion?.freeShipping) {
    if (promotion.freeShippingMaxAmount !== null) {
      // Cover up to freeShippingMaxAmount — user pays the remainder
      shipping = roundMoney(
        Math.max(0, baseShipping - promotion.freeShippingMaxAmount)
      );
    } else {
      shipping = 0;
    }
  }

  const tax = roundMoney((subtotal - discount) * 0.0);
  const total = roundMoney(subtotal - discount + shipping + tax);

  return { subtotal, discount, shipping, tax, total };
}

export function useCheckoutSummary({
  items,
  promotion,
  shippingMethodId,
  shippingMethods,
  onError,
}: {
  items: OrderItem[];
  promotion: PromotionData | null;
  shippingMethodId?: string;
  shippingMethods?: readonly ShippingMethod[];
  onError?: () => void;
}) {
  return useMemo<CheckoutSummary>(
    () =>
      calculateCheckoutSummary({
        items,
        promotion,
        shippingMethodId,
        shippingMethods,
        onError,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, promotion, shippingMethodId, shippingMethods]
  );
}
