"use client";
import { ArrowRight, SearchRemoveIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductGrid } from "@/components/product-card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTRPC } from "@/lib/trpc";
import type { ProductType } from "@/server/db/generated/prisma/client";

type SortOption = "newest" | "price_asc" | "price_desc" | "name_asc";

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Mais recentes",
  price_asc: "Menor preço",
  price_desc: "Maior preço",
  name_asc: "Nome A–Z",
};

const TYPE_LABELS: Record<string, string> = {
  tshirt: "Camiseta",
  hoodie: "Moletom",
  mug: "Caneca",
  sticker: "Adesivo",
  other: "Outros",
};

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const trpc = useTRPC();

  const q = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") ?? "newest") as SortOption;
  const type = searchParams.get("type") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/search?${params.toString()}` as Route);
  }

  const { data, isPending } = useQuery(
    trpc.product.list.queryOptions({
      search: q || undefined,
      sort,
      type: type ? (type as ProductType) : undefined,
    })
  );

  const productCount = data?.length ?? 0;

  return (
    <div className="px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-6 min-h-screen">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <Link href="/">Home</Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <HugeiconsIcon icon={ArrowRight} strokeWidth={2} />
            </BreadcrumbSeparator>
            <BreadcrumbPage>Produtos</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">
              {q ? `Resultados para "${q}"` : "Todos os produtos"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {productCount === 1
                ? "1 produto encontrado"
                : `${productCount} produtos encontrados`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={SORT_LABELS[sort]}
              defaultValue={SORT_LABELS[sort]}
              onValueChange={(value) =>
                updateParam(
                  "sort",
                  Object.keys(SORT_LABELS).find(
                    (key) => SORT_LABELS[key as SortOption] === value
                  ) as SortOption
                )
              }
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent align="start" className="w-fit">
                {Object.entries(SORT_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={TYPE_LABELS[type]}
              defaultValue={TYPE_LABELS[type]}
              onValueChange={(value) =>
                updateParam(
                  "type",
                  Object.keys(TYPE_LABELS).find(
                    (key) => TYPE_LABELS[key as ProductType] === value
                  ) as ProductType
                )
              }
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent align="start" className="w-fit">
                {Object.entries(TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {!isPending && data?.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={SearchRemoveIcon} strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle>
                {q
                  ? `Nenhum produto encontrado para "${q}"`
                  : "Nenhum produto encontrado"}
              </EmptyTitle>
              <EmptyDescription>
                Tente buscar por outro termo ou mudar os filtros.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ProductGrid
            products={data}
            isPending={isPending}
            skeletonCount={8}
          />
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchPageContent />
    </Suspense>
  );
}
