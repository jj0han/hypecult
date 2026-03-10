"use client";
import { Bag, CheckCircle, Shirt01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/lib/trpc";
import { formatCurrency } from "@/utils/formatters";
import { getStatusLabel, getStatusVariant } from "@/utils/helpers";

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const trpc = useTRPC();
  const { data, isPending, refetch } = useQuery({
    ...trpc.order.byId.queryOptions({ id }),
    refetchInterval: 5000,
  });
  const router = useRouter();

  const statusMessage =
    data?.status === "pending"
      ? "Pagamento pendente. Assim que confirmado, iniciaremos a produção com a Prodigi."
      : data?.status === "paid"
        ? "Pagamento confirmado. Seu pedido esta sendo enviado para a produção."
        : data?.status === "production"
          ? "Pedido em produção sob demanda."
          : "Acompanhe o status do seu pedido e detalhes do pagamento.";

  return (
    <div className="grid grid-cols-3 gap-8">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon
              icon={CheckCircle}
              strokeWidth={2}
              className="size-5 text-green-600"
            />
            Pedido criado
          </CardTitle>
          <CardDescription>{statusMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isPending ? (
            <>
              <Skeleton className="w-full h-36" />
              <Skeleton className="w-full h-32" />
            </>
          ) : (
            <>
              <Item variant={"muted"}>
                <ItemHeader>
                  <ItemTitle>Informações do pedido</ItemTitle>
                </ItemHeader>
                <ItemContent>
                  <div className="flex justify-between">
                    <span>ID do pedido</span>
                    <span>{data?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status do pedido</span>
                    <Badge
                      variant={getStatusVariant(data?.status ?? "pending")}
                    >
                      {getStatusLabel(data?.status ?? "pending")}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete</span>
                    <span>{formatCurrency(Number(data?.shippingPrice))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>{formatCurrency(Number(data?.total))}</span>
                  </div>
                </ItemContent>
              </Item>
              <Item variant={"muted"}>
                <ItemHeader>
                  <ItemTitle>Endereço de entrega</ItemTitle>
                </ItemHeader>
                <ItemContent>
                  <p>{data?.address?.recipient}</p>
                  <p>{data?.address?.street}</p>
                  <p>
                    {data?.address?.city}, {data?.address?.state}{" "}
                    {data?.address?.zipCode}
                  </p>
                </ItemContent>
              </Item>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button
            size={"lg"}
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => refetch()}
          >
            Atualizar status
          </Button>
          <Button
            size={"lg"}
            className="w-full sm:w-auto sm:ml-auto"
            onClick={() => router.push("/")}
          >
            <HugeiconsIcon icon={Bag} strokeWidth={2} />
            Ir para a loja
          </Button>
        </CardFooter>
      </Card>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Bag} strokeWidth={2} className="size-5" />
            Resumo do pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isPending ? (
            <Skeleton className="w-full h-16" />
          ) : (
            data?.items.map((item) => (
              <Item
                key={item.id}
                variant={"muted"}
                onClick={() => router.push(`/product/${item.productId}`)}
                className="cursor-pointer"
              >
                <ItemMedia>
                  {item.productType === "tshirt" ? (
                    <HugeiconsIcon icon={Shirt01Icon} strokeWidth={2} />
                  ) : (
                    <HugeiconsIcon icon={Bag} strokeWidth={2} />
                  )}
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>
                    {item.name} {item.size ? `- ${item.size}` : ""}
                  </ItemTitle>
                  <ItemDescription>Quantidade: {item.quantity}</ItemDescription>
                </ItemContent>
              </Item>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
