/**
 * Computes the effective price after applying a product-level or variant-level discount.
 * Returns the original price unchanged when no discount is set.
 */
export function computeFinalPrice(
  price: number,
  discountType: string | null | undefined,
  discountAmount: number | null | undefined
): number {
  /** Rounds a price to exactly 2 decimal places, eliminating IEEE-754 drift. */
  if (!discountType || discountAmount == null || discountAmount === 0) {
    return price;
  }
  if (discountType === "percentage") {
    return Math.round(price * (1 - discountAmount / 100) * 10) / 10;
  }
  if (discountType === "fixed") {
    return (Math.round(price - discountAmount) * 10) / 10;
  }
  return price;
}

/**
 * Returns the effective final price for a variant, respecting the priority rule:
 *  1. Variant has its own price → apply variant discount (if any), else variant price as-is
 *  2. No variant price → fall back to product's finalPrice (or compute from product price)
 */
export function computeVariantFinalPrice(opts: {
  productPrice: number;
  productDiscountType: string | null | undefined;
  productDiscountAmount: number | null | undefined;
  variantPrice: number | null | undefined;
  variantDiscountType: string | null | undefined;
  variantDiscountAmount: number | null | undefined;
}): number {
  const {
    productPrice,
    productDiscountType,
    productDiscountAmount,
    variantPrice,
    variantDiscountType,
    variantDiscountAmount,
  } = opts;

  if (variantPrice != null) {
    // Variant has its own price — apply variant discount if set, otherwise no discount
    return computeFinalPrice(
      variantPrice,
      variantDiscountType,
      variantDiscountAmount
    );
  }

  // No variant price — inherit product's final price
  return computeFinalPrice(
    productPrice,
    productDiscountType,
    productDiscountAmount
  );
}
