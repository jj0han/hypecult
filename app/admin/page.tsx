"use client";
import {
  ArrowRight01Icon,
  DiscountIcon,
  ShoppingBag,
  Store01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
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
  const { status } = useSession();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Painel administrativo</CardTitle>
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

type QuickAccessCardProps = {
  href: string;
  title: string;
  description: string;
  icon: ComponentProps<typeof HugeiconsIcon>["icon"];
  badgeLabel?: string | ReactNode;
  cta: string;
  className?: string;
};

function QuickAccessCard({
  href,
  title,
  description,
  icon,
  badgeLabel,
  cta,
  className,
}: QuickAccessCardProps) {
  return (
    <Link href={href as Route} className={className}>
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <HugeiconsIcon icon={icon} strokeWidth={2} className="size-5" />
              {title}
            </CardTitle>
            {badgeLabel !== undefined && badgeLabel !== null && (
              <Badge variant="secondary" className="size-5 p-0">
                {badgeLabel}
              </Badge>
            )}
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="inline-flex items-center gap-1 text-sm font-medium text-primary">
            {cta}
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-4"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
