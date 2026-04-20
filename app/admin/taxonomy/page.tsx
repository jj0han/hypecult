"use client";

import {
  Folder01Icon,
  Folder02Icon,
  Layers01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { QuickAccessCard } from "@/components/quick-access-card";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/lib/trpc";

export default function Page() {
  const trpc = useTRPC();
  const summary = useQuery(trpc.taxonomy.adminSummary.queryOptions());

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <HugeiconsIcon
              icon={Layers01Icon}
              strokeWidth={2}
              className="size-6"
            />
            Taxonomia
          </CardTitle>
          <CardDescription>
            Categorias de vitrine e temas (subcategorias) usados na ficha do
            produto e na busca.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {summary.isPending ? (
          <>
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </>
        ) : (
          <>
            <QuickAccessCard
              href="/admin/taxonomy/categories"
              title="Categorias de vitrine"
              description="Tipos de peça ou agrupamentos principais na vitrine."
              icon={Folder01Icon}
              badgeLabel={
                summary.isPending ? (
                  <Spinner />
                ) : (
                  `${summary.data?.categories ?? 0}`
                )
              }
              cta="Gerenciar categorias"
            />
            <QuickAccessCard
              href="/admin/taxonomy/subcategories"
              title="Temas (subcategorias)"
              description="Temas, coleções e filtros por estilo na busca."
              icon={Folder02Icon}
              badgeLabel={
                summary.isPending ? (
                  <Spinner />
                ) : (
                  `${summary.data?.subcategories ?? 0}`
                )
              }
              cta="Gerenciar temas"
            />
          </>
        )}
      </div>
    </div>
  );
}
