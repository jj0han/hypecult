"use client";
import {
  ArrowRight01Icon,
  MapPin,
  ShoppingBag,
  Store01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { ComponentProps, ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/lib/trpc";

export default function Page() {
  const trpc = useTRPC();
  const session = useSession();
  const orders = useQuery(trpc.order.list.queryOptions());
  const addresses = useQuery(trpc.address.list.queryOptions());

  const firstName = session.data?.user?.name?.split(" ")[0] ?? "Cliente";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Olá, {firstName}</CardTitle>
          <CardDescription>
            Acesse rapidamente os recursos mais importantes da sua conta.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {session.status === "loading" ? (
          <>
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36 col-span-full" />
          </>
        ) : (
          <>
            <QuickAccessCard
              href="/account/orders"
              title="Meus pedidos"
              description="Acompanhe status e detalhes dos seus pedidos."
              icon={ShoppingBag}
              badgeLabel={
                orders.isPending ? <Spinner /> : `${orders.data?.length ?? 0}`
              }
              cta="Ver pedidos"
            />

            <QuickAccessCard
              href="/account/addresses"
              title="Meus endereços"
              description="Gerencie seus endereços de entrega salvos."
              icon={MapPin}
              badgeLabel={
                addresses.isPending ? (
                  <Spinner />
                ) : (
                  `${addresses.data?.length ?? 0}`
                )
              }
              cta="Gerenciar endereços"
            />

            <QuickAccessCard
              href="/"
              title="Continuar comprando"
              description="Veja os últimos lançamentos da loja."
              icon={Store01Icon}
              cta="Ir para loja"
              className="sm:col-span-2"
            />
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
    <Link href={href} className={className}>
      <Card className="h-full transition-colors hover:bg-muted/40">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <HugeiconsIcon icon={icon} strokeWidth={2} className="size-5" />
              {title}
            </CardTitle>
            {badgeLabel && (
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
