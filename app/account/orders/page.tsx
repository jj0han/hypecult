"use client";
import { ArrowRight01Icon, ShoppingBag } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Item, ItemContent, ItemDescription } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc";
import { formatCurrency } from "@/utils/formatters";
import { getStatusLabel, getStatusVariant } from "@/utils/helpers";

export default function Page() {
  const trpc = useTRPC();
  const { data, isPending } = useQuery(trpc.order.list.queryOptions());

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-52 w-full" />
      </div>
    );
  }

  if (!data?.length) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Voce ainda nao fez nenhum pedido.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((order) => (
        <Link
          href={`/account/orders/${order.id}`}
          key={order.id}
          className="block"
        >
          <Card className="transition-colors hover:bg-muted/40">
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <HugeiconsIcon
                    icon={ShoppingBag}
                    strokeWidth={2}
                    className="size-5"
                  />
                  Pedido #{order.id.slice(0, 8)}
                </CardTitle>
                <Badge variant={getStatusVariant(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Item variant={"muted"}>
                <ItemContent className="grid grid-cols-2 gap-4!">
                  <ItemDescription>
                    Data: {format(new Date(order.createdAt), "dd/MM/yyyy")}
                  </ItemDescription>
                  <ItemDescription>
                    Total: {formatCurrency(Number(order.total))}
                  </ItemDescription>
                  <ItemDescription>
                    {order.items
                      .map((item) => `${item.name} (${item.quantity})`)
                      .join(", ")}
                  </ItemDescription>
                  {order.externalStatus && (
                    <ItemDescription>
                      Produção: {order.externalStatus}
                    </ItemDescription>
                  )}
                </ItemContent>
              </Item>
            </CardContent>
            <CardFooter>
              <div className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                Ver detalhes
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="size-4"
                />
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
