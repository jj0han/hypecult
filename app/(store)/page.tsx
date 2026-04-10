/** biome-ignore-all lint/suspicious/noArrayIndexKey: we need to use the index as a key */
"use client";
import {
  ArrowRightIcon,
  ClipboardCopy,
  Edit01Icon,
  Share04Icon,
  Share08Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Decimal } from "@prisma/client/runtime/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { CldImage } from "next-cloudinary";
import { Fragment } from "react/jsx-runtime";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Marquee,
  MarqueeContent,
  MarqueeItem,
  MaskedMarqueeItem,
} from "@/components/ui/marquee";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc";
import type {
  DiscountType,
  ProductImage,
  ProductType,
  ProductVariant,
} from "@/server/db/generated/prisma/client";

type ProductProps =
  | ({
      images: ProductImage[];
      variants: ProductVariant[];
    } & {
      id: string;
      sku: string;
      name: string;
      description: string;
      type: ProductType;
      price: Decimal;
      discountType: DiscountType | null;
      discountAmount: Decimal | null;
      finalPrice: Decimal | null;
      active: boolean;
      createdAt: Date;
      updatedAt: Date;
    })[]
  | undefined;

export default function Page() {
  const trpc = useTRPC();
  const { data, isPending } = useQuery(trpc.product.list.queryOptions());

  return (
    <Fragment>
      <Marquee className="py-8">
        <ProgressiveBlur
          direction="left"
          className="absolute left-0 bottom-0 z-10 h-full sm:w-36 w-24"
          blurIntensity={2}
          blurLayers={6}
        />
        <MarqueeContent speed={50} pauseOnHover={false}>
          {new Array(4).fill(null).map((_, index) => (
            <MarqueeItem
              key={index}
              className="h-14 sm:h-24 lg:h-36 sm:mx-16 mx-8"
            >
              <MaskedMarqueeItem
                bg="/background.png"
                mask="/HYPECULT-WHITE.svg"
              />
            </MarqueeItem>
          ))}
        </MarqueeContent>
        <ProgressiveBlur
          direction="right"
          className="absolute right-0 bottom-0 z-10 h-full sm:w-36 w-24"
          blurIntensity={2}
          blurLayers={6}
        />
      </Marquee>

      <div className="px-6">
        <div className="max-w-7xl mx-auto">
          <ProductList
            data={data}
            isPending={isPending}
            title="Novidades"
            category="novidades"
          />
        </div>
      </div>
    </Fragment>
  );
}

function ProductList({
  data,
  isPending,
  title,
}: {
  data: ProductProps;
  isPending: boolean;
  title: string;
  category: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
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
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button variant="link" onClick={() => router.push(`/`)}>
          Ver todos
          <HugeiconsIcon icon={ArrowRightIcon} strokeWidth={2} />
        </Button>
      </div>
      <ItemGroup className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isPending &&
          Array.from({ length: 4 }).map((_, index) => (
            <ItemSkeleton key={index} />
          ))}
        {data?.map((product) => {
          const originalPrice = Number(product.price);
          // finalPrice is pre-computed in DB; fall back to originalPrice when null
          const finalPrice = product.finalPrice
            ? Number(product.finalPrice)
            : originalPrice;
          const hasDiscount = Number(product.discountAmount ?? 0) > 0;

          const discountLabel = hasDiscount
            ? product.discountType === "percentage" && product.discountAmount
              ? `${Number(product.discountAmount)}% OFF`
              : `- ${(originalPrice - finalPrice).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}`
            : null;

          const image = product.images?.[0];

          return (
            <ContextMenu key={product.id}>
              <ContextMenuTrigger
                render={
                  <Link key={product.id} href={`/product/${product.id}`} />
                }
              >
                <Item variant={"default"} size={"xs"} className="items-start">
                  <ItemHeader>
                    <div className="relative aspect-square border rounded-lg overflow-hidden size-full!">
                      <CldImage
                        src={image?.publicId ?? image?.url ?? "placeholder"}
                        alt={image?.alt ?? ""}
                        fill
                        crop="fill"
                        gravity="auto"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                      {discountLabel && (
                        <Badge className="absolute top-2 left-2 bg-green-600">
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
                        {finalPrice.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </ItemTitle>
                      {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through font-normal">
                          {originalPrice.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      )}
                    </div>
                  </ItemContent>
                </Item>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-56">
                <ContextMenuGroup>
                  <ContextMenuLabel>{product.name}</ContextMenuLabel>
                  <ContextMenuItem
                    onClick={() =>
                      copyToClipboard(
                        `${window.location.origin}/product/${product.id}`
                      )
                    }
                  >
                    <HugeiconsIcon icon={Share08Icon} strokeWidth={2} />
                    Compartilhar
                  </ContextMenuItem>
                  <ContextMenuItem
                    render={
                      <Link href={`/product/${product.id}`} target="_blank" />
                    }
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
        })}
      </ItemGroup>
    </div>
  );
}

function ItemSkeleton() {
  return (
    <Item variant={"default"} size={"xs"} className="items-start">
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
