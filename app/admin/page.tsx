"use client";
import {
  DiscountIcon,
  GridViewIcon,
  Layers01Icon,
  ShoppingBag,
  Store01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { QuickAccessCard } from "@/components/quick-access-card";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useTRPC } from "@/lib/trpc";

export default function Page() {
  const trpc = useTRPC();
  const summary = useQuery(trpc.product.adminSummary.queryOptions());
  const taxonomySummary = useQuery(trpc.taxonomy.adminSummary.queryOptions());
  const { status } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <HugeiconsIcon
              icon={GridViewIcon}
              strokeWidth={2}
              className="size-6"
            />
            Painel administrativo
          </CardTitle>
          <CardDescription>
            Acesse rapidamente catálogo, promoções e outras áreas de gestão.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {status === "loading" ? (
          <>
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36 col-span-full" />
          </>
        ) : (
          <>
            <QuickAccessCard
              href="/admin/products"
              title="Produtos"
              description="Listar e editar produtos sincronizados com a Gelato."
              icon={ShoppingBag}
              badgeLabel={
                summary.isPending ? (
                  <Spinner />
                ) : (
                  `${summary.data?.products ?? 0}`
                )
              }
              cta="Ver produtos"
              className="sm:col-span-2"
            />

            <QuickAccessCard
              href="/admin/promotions"
              title="Promoções"
              description="Gerencie cupons e campanhas promocionais."
              icon={DiscountIcon}
              badgeLabel={
                summary.isPending ? (
                  <Spinner />
                ) : (
                  `${summary.data?.promotions ?? 0}`
                )
              }
              cta="Ver promoções"
            />

            <QuickAccessCard
              href="/admin/taxonomy"
              title="Taxonomia"
              description="Categorias de vitrine e temas (subcategorias)."
              icon={Layers01Icon}
              badgeLabel={
                taxonomySummary.isPending ? (
                  <Spinner />
                ) : (
                  `${(taxonomySummary.data?.categories ?? 0) + (taxonomySummary.data?.subcategories ?? 0)}`
                )
              }
              cta="Gerenciar taxonomia"
            />

            <QuickAccessCard
              href="/"
              title="Ver loja"
              description="Abrir a vitrine como cliente."
              icon={Store01Icon}
              cta="Ir para a loja"
              className="sm:col-span-2"
            />

            <FieldLabel htmlFor="switch-share">
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldTitle>
                    Tema {theme === "dark" ? "Escuro" : "Claro"}
                  </FieldTitle>
                  <FieldDescription>
                    Alterna entre o tema claro e escuro.
                  </FieldDescription>
                </FieldContent>
                <Switch
                  id="switch-share"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                />
              </Field>
            </FieldLabel>
          </>
        )}
      </div>
    </div>
  );
}
