"use client";
import { MapPin, ShoppingBag, Truck } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc";
import { formatCurrency, formatZipCode } from "@/utils/formatters";
import { getStatusLabel, getStatusVariant } from "@/utils/helpers";

export default function Page() {
  const trpc = useTRPC();
  const { id } = useParams<{ id: string }>();
  const { data, isPending } = useQuery(trpc.order.byId.queryOptions({ id }));

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Pedido nao encontrado ou sem permissao para visualizacao.
          </p>
          <Link href="/account/orders">
            <Button variant="outline">Voltar para pedidos</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon
                icon={ShoppingBag}
                strokeWidth={2}
                className="size-5"
              />
              Pedido #{data.id.slice(0, 8)}
            </CardTitle>
            <Badge variant={getStatusVariant(data.status)}>
              {getStatusLabel(data.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Item variant={"muted"}>
            <ItemContent className="grid grid-cols-2 gap-4!">
              <ItemDescription>
                Data: {format(new Date(data.createdAt), "dd/MM/yyyy")}
              </ItemDescription>
              <ItemDescription>
                Total: {formatCurrency(Number(data.total))}
              </ItemDescription>
              <ItemDescription>{data.items.length} item(s)</ItemDescription>
              <ItemDescription>
                Frete: {formatCurrency(Number(data.shippingPrice))}
              </ItemDescription>
            </ItemContent>
          </Item>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={MapPin} strokeWidth={2} className="size-5" />
            Endereço de entrega
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <Item variant={"muted"}>
            <ItemHeader>
              <ItemTitle>
                <p>
                  {data.address?.city}, {data.address?.state}{" "}
                  {formatZipCode(data.address?.zipCode ?? "")}
                </p>
              </ItemTitle>
            </ItemHeader>
            <ItemContent>
              <ItemDescription>{data.address?.district}</ItemDescription>
              <ItemDescription>
                {data.address?.street}, {data.address?.number}{" "}
                {data.address?.complement}
              </ItemDescription>
              <ItemDescription>{data.address?.recipient}</ItemDescription>
            </ItemContent>
          </Item>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Truck} strokeWidth={2} className="size-5" />
            Itens do pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.items.map((item) => (
            <Item key={item.id} variant="muted">
              <ItemHeader>
                <ItemTitle className="line-clamp-none">
                  {item.name} {item.size ? `- ${item.size}` : ""}
                </ItemTitle>
                <ItemTitle>
                  {formatCurrency(Number(item.price) * item.quantity)}
                </ItemTitle>
              </ItemHeader>
              <ItemContent>
                <ItemDescription className="line-clamp-none">
                  Quantidade: {item.quantity} | Unitario:{" "}
                  {formatCurrency(Number(item.price))}
                </ItemDescription>
              </ItemContent>
            </Item>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produção sob demanda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Item variant="muted">
            <ItemContent className="grid grid-cols-1 sm:grid-cols-2 gap-2!">
              <ItemDescription>
                Provider: {data.externalProvider ?? "-"}
              </ItemDescription>
              <ItemDescription>
                Pedido externo: {data.externalOrderId ?? "-"}
              </ItemDescription>
              <ItemDescription>
                Status externo: {data.externalStatus ?? "-"}
              </ItemDescription>
              <ItemDescription>
                Última sincronização:{" "}
                {data.externalSyncedAt
                  ? format(new Date(data.externalSyncedAt), "dd/MM/yyyy HH:mm")
                  : "-"}
              </ItemDescription>
            </ItemContent>
          </Item>
          {data.externalLastError && (
            <Item variant="muted">
              <ItemHeader>
                <ItemTitle>Erro de sincronização</ItemTitle>
              </ItemHeader>
              <ItemContent>
                <ItemDescription className="line-clamp-none">
                  {data.externalLastError}
                </ItemDescription>
              </ItemContent>
            </Item>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
