import type { CartItem } from "@/context/cart-context";

export function mapCartToOrderItems(cart: CartItem[] | null) {
  return (
    cart?.map((item) => {
      const hasDiscount =
        item.originalPrice !== undefined && item.originalPrice > item.price;
      return {
        id: item.variantId,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        quantity: item.quantity,
        size: item.size,
        hasDiscount,
      };
    }) ?? []
  );
}

export function mapCartToCheckoutItems(cart: CartItem[] | null) {
  return (
    cart?.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
    })) ?? []
  );
}
