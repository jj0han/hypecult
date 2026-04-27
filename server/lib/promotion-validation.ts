import { TRPCError } from "@trpc/server";
import { formatCurrency } from "@/utils/formatters";

type DiscountType = "percentage" | "fixed";

type DecimalLike = number | string | { toString(): string } | null;

export type PromotionValidationCartItem = {
  productId?: string;
  hasDiscount: boolean;
  subtotal: number;
};

export type PromotionValidationPromotion = {
  id: string;
  code: string;
  description: string | null;
  active: boolean;
  discountType: DiscountType;
  discountAmount: DecimalLike;
  freeShipping: boolean;
  freeShippingMaxAmount: DecimalLike;
  allowOnDiscountedItems: boolean;
  limit: number | null;
  userLimit: number | null;
  minOrderAmount: DecimalLike;
  maxOrderAmount: DecimalLike;
  expiresAt: Date | null;
  productPromotions: { productId: string }[];
};

type ValidatePromotionInput = {
  promotion: PromotionValidationPromotion;
  orderAmount?: number;
  cartItems?: PromotionValidationCartItem[];
  usageCount?: number;
  userUsageCount?: number;
  now?: Date;
};

function toNumber(value: DecimalLike) {
  return value == null ? null : Number(value);
}

export function validatePromotionBusinessRules({
  promotion,
  orderAmount,
  cartItems,
  usageCount = 0,
  userUsageCount,
  now = new Date(),
}: ValidatePromotionInput) {
  if (!promotion.active) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Este cupom não está mais ativo",
    });
  }

  if (promotion.expiresAt && promotion.expiresAt < now) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Este cupom expirou",
    });
  }

  if (promotion.limit !== null && usageCount >= promotion.limit) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Este cupom atingiu o limite máximo de usos",
    });
  }

  if (
    promotion.userLimit !== null &&
    userUsageCount !== undefined &&
    userUsageCount >= promotion.userLimit
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Você já utilizou este cupom o número máximo de vezes",
    });
  }

  const minOrderAmount = toNumber(promotion.minOrderAmount);
  if (
    orderAmount !== undefined &&
    minOrderAmount !== null &&
    orderAmount < minOrderAmount
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Pedido mínimo de ${formatCurrency(minOrderAmount)} para usar este cupom`,
    });
  }

  const maxOrderAmount = toNumber(promotion.maxOrderAmount);
  if (
    orderAmount !== undefined &&
    maxOrderAmount !== null &&
    orderAmount > maxOrderAmount
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Este cupom é válido apenas para pedidos até ${formatCurrency(maxOrderAmount)}`,
    });
  }

  const scopedProductIds =
    promotion.productPromotions.length > 0
      ? promotion.productPromotions.map((pp) => pp.productId)
      : null;
  const scopedProductIdSet = scopedProductIds
    ? new Set(scopedProductIds)
    : null;

  let applicableSubtotal: number | null = null;
  if (cartItems && (scopedProductIdSet || !promotion.allowOnDiscountedItems)) {
    const applicableItems = cartItems.filter((item) => {
      const isInScope =
        !scopedProductIdSet ||
        (item.productId !== undefined &&
          scopedProductIdSet.has(item.productId));
      const canUseDiscounted =
        promotion.allowOnDiscountedItems || !item.hasDiscount;
      return isInScope && canUseDiscounted;
    });

    if (scopedProductIdSet && applicableItems.length === 0) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Este cupom não é válido para os produtos do carrinho",
      });
    }

    applicableSubtotal = applicableItems.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );
  }

  return {
    id: promotion.id,
    code: promotion.code,
    description: promotion.description,
    discountType: promotion.discountType,
    discountAmount: Number(promotion.discountAmount),
    freeShipping: promotion.freeShipping,
    freeShippingMaxAmount: toNumber(promotion.freeShippingMaxAmount),
    allowOnDiscountedItems: promotion.allowOnDiscountedItems,
    applicableSubtotal,
    minOrderAmount,
    maxOrderAmount,
    productIds: scopedProductIds,
  };
}
