/** biome-ignore-all lint/suspicious/noArrayIndexKey: skeleton placeholders have no meaningful key */
"use client";
import {
  ArrowRightIcon,
  CancelCircleIcon,
  SearchIcon,
  SearchRemoveIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CldImage } from "next-cloudinary";
import { useEffect, useRef, useState } from "react";
import { ProductCardSkeleton } from "@/components/product-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Item,
  ItemContent,
  ItemGroup,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { useTRPC } from "@/lib/trpc";
import { formatCurrency } from "@/utils/formatters";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";

interface SearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchSheet({ open, onOpenChange }: SearchSheetProps) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const trpc = useTRPC();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const hasQuery = debouncedQuery.length > 0;

  const { data, isPending } = useQuery({
    ...trpc.product.list.queryOptions({ search: debouncedQuery }),
    enabled: hasQuery,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="top" className="p-6">
        <div className="flex flex-col items-center">
          <div className="w-full space-y-4 max-w-7xl">
            <InputGroup className="w-full">
              <InputGroupAddon align="inline-start">
                <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
              </InputGroupAddon>
              <InputGroupInput
                ref={inputRef}
                placeholder="Pesquisar produtos..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && inputValue.trim()) {
                    onOpenChange(false);
                    router.push(
                      `/search?q=${encodeURIComponent(inputValue.trim())}` as Route
                    );
                  }
                }}
              />
              {inputValue && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => {
                      setInputValue("");
                      setDebouncedQuery("");
                      inputRef.current?.focus();
                    }}
                  >
                    <HugeiconsIcon icon={CancelCircleIcon} strokeWidth={2} />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>

            {!hasQuery && (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
                  </EmptyMedia>
                  <EmptyTitle>Digite para pesquisar</EmptyTitle>
                  <EmptyDescription>
                    Dica: use palavras-chave como "oversized", "grupo musical",
                    "jogo", etc.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}

            {hasQuery && isPending && (
              <ItemGroup className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </ItemGroup>
            )}

            {hasQuery && !isPending && data?.length === 0 && (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <HugeiconsIcon icon={SearchRemoveIcon} strokeWidth={2} />
                  </EmptyMedia>
                  <EmptyTitle>
                    Nenhum produto encontrado para "{debouncedQuery}"
                  </EmptyTitle>
                  <EmptyDescription>
                    Tente buscar por outro termo ou categoria.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}

            {hasQuery && !isPending && data && data.length > 0 && (
              <div className="space-y-4">
                <ItemGroup className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {data.slice(0, 4).map((product) => {
                    const originalPrice = Number(product.price);
                    const finalPrice = product.finalPrice
                      ? Number(product.finalPrice)
                      : originalPrice;
                    const hasDiscount = Number(product.discountAmount ?? 0) > 0;
                    const discountLabel = hasDiscount
                      ? product.discountType === "percentage" &&
                        product.discountAmount
                        ? `${Number(product.discountAmount)}% OFF`
                        : `- ${formatCurrency(originalPrice - finalPrice)}`
                      : null;
                    const image = product.images?.[0];

                    return (
                      <SheetClose
                        key={product.id}
                        render={<Link href={`/product/${product.id}`} />}
                      >
                        <Item
                          variant="default"
                          size="xs"
                          className="items-start"
                        >
                          <ItemHeader>
                            <div className="relative aspect-square border rounded-lg overflow-hidden size-full!">
                              <CldImage
                                src={
                                  image?.publicId ?? image?.url ?? "placeholder"
                                }
                                alt={image?.alt ?? ""}
                                fill
                                crop="fill"
                                gravity="auto"
                                sizes="(max-width: 768px) 50vw, 25vw"
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
                      </SheetClose>
                    );
                  })}
                </ItemGroup>
                <div className="flex justify-center">
                  <SheetClose
                    render={
                      <Button
                        variant="link"
                        render={
                          <Link
                            href={
                              `/search?q=${encodeURIComponent(debouncedQuery)}` as Route
                            }
                          />
                        }
                      />
                    }
                  >
                    Ver todos os resultados
                    <HugeiconsIcon icon={ArrowRightIcon} strokeWidth={2} />
                  </SheetClose>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
