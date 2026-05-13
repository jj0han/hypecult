/** biome-ignore-all lint/suspicious/noArrayIndexKey: skeleton placeholders have no meaningful key */
"use client";
import {
  ClipboardCopy,
  Edit01Icon,
  Share04Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Decimal } from "@prisma/client/runtime/client";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CldImage } from "next-cloudinary";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  DiscountType,
  ProductImage,
  ProductType,
  ProductVariant,
} from "@/server/db/generated/prisma/client";
import { formatCurrency } from "@/utils/formatters";

export type ProductCardData = {
  id: string;
  name: string;
  type: ProductType;
  price: Decimal;
  discountType: DiscountType | null;
  discountAmount: Decimal | null;
  finalPrice: Decimal | null;
  images: ProductImage[];
  variants: ProductVariant[];
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { data: session } = useSession();
  const originalPrice = Number(product.price);
  const finalPrice = product.finalPrice
    ? Number(product.finalPrice)
    : originalPrice;
  const hasDiscount = Number(product.discountAmount ?? 0) > 0;

  const discountLabel = hasDiscount
    ? product.discountType === "percentage" && product.discountAmount
      ? `${Number(product.discountAmount)}% OFF`
      : `- ${formatCurrency(originalPrice - finalPrice)}`
    : null;

  const image = product.images?.[0];

  function copyToClipboard() {
    navigator.clipboard.writeText(
      `${window.location.origin}/product/${product.id}`
    );
    toast("Link copiado", {
      icon: (
        <HugeiconsIcon
          icon={ClipboardCopy}
          strokeWidth={2}
          className="size-4 text-primary"
        />
      ),
    });
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger
        render={<Link href={`/product/${product.id}`} role="listitem" />}
      >
        <Item variant="default" size="xs" className="items-start">
          <ItemHeader>
            <div className="relative aspect-square border rounded-lg overflow-hidden size-full!">
              <CldImage
                src={image?.publicId ?? image?.url ?? "placeholder"}
                alt={image?.alt ?? ""}
                format="webp"
                width={600}
                height={600}
                crop="fill"
                gravity="auto"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"
                style={{ objectFit: "cover" }}
              />
              {discountLabel && (
                <Badge className="absolute top-2 left-2 bg-green-700">
                  {discountLabel}
                </Badge>
              )}
            </div>
          </ItemHeader>
          <ItemContent className="space-y-2">
            <div>
              <ItemTitle className="text-base font-bold">
                {product.name}
              </ItemTitle>
            </div>
            <div className="flex items-baseline gap-2">
              <ItemTitle className="text-base font-bold">
                {formatCurrency(finalPrice)}
              </ItemTitle>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through font-normal">
                  {formatCurrency(originalPrice)}
                </span>
              )}
            </div>
          </ItemContent>
        </Item>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuGroup>
          <ContextMenuLabel>{product.name}</ContextMenuLabel>
          <ContextMenuItem onClick={copyToClipboard}>
            <HugeiconsIcon icon={Share08Icon} strokeWidth={2} />
            Compartilhar
          </ContextMenuItem>
          <ContextMenuItem
            render={<Link href={`/product/${product.id}`} target="_blank" />}
          >
            <HugeiconsIcon icon={Share04Icon} strokeWidth={2} />
            Abrir em nova aba
          </ContextMenuItem>
        </ContextMenuGroup>
        {session?.user?.role === "admin" && (
          <ContextMenuGroup>
            <ContextMenuLabel>Admin</ContextMenuLabel>
            <ContextMenuItem
              render={<Link href={`/admin/products/${product.id}`} />}
            >
              <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} />
              Editar
            </ContextMenuItem>
          </ContextMenuGroup>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function ProductCardSkeleton() {
  return (
    <Item variant="default" size="xs" className="items-start">
      <ItemHeader>
        <Skeleton className="rounded-lg aspect-square size-full relative" />
      </ItemHeader>
      <ItemContent className="space-y-2">
        <div className="space-y-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-1/3" />
        </div>
        <Skeleton className="h-5 w-3/4" />
      </ItemContent>
    </Item>
  );
}

export function ProductGrid({
  products,
  isPending,
  skeletonCount = 4,
}: {
  products: ProductCardData[] | undefined;
  isPending: boolean;
  skeletonCount?: number;
}) {
  return (
    <ItemGroup className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {isPending
        ? Array.from({ length: skeletonCount }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))
        : products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
    </ItemGroup>
  );
}
