"use client";
import { Bag, CheckCircle, Shirt01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
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

export default function Page() {
  const { id } = useParams<{ id: string }>();
  const trpc = useTRPC();
  const { data, isPending } = useQuery(trpc.order.byId.queryOptions({ id }));
  const router = useRouter();
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
            Pedido confirmado
          </CardTitle>
          <CardDescription>
            Acompanhe o status do seu pedido e detalhes do pagamento.
          </CardDescription>
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
                    <span className="font-bold">{data?.status}</span>
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
          <Button size={"lg"} className="w-full sm:w-auto sm:ml-auto">
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
