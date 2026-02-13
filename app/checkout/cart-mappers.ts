import type { CartItem } from "@/context/cart-context";

export function mapCartToOrderItems(cart: CartItem[] | null) {
  return (
    cart?.map((item) => ({
      id: item.variantId,
      name: item.name,
      price: item.price,
      originalPrice: item.price,
      image: item.image,
      quantity: item.quantity,
      discount: 0,
    })) ?? []
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

