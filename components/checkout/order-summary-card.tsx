import {
  Minus,
  Percent,
  Plus,
  ShoppingBag,
  Trash,
  X,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import type { CheckoutSummary } from "@/app/checkout/use-checkout-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
};

interface OrderSummaryCardProps {
  orderItems: OrderItem[];
  currentStep: number;
  appliedPromo: string;
  summary: CheckoutSummary;
  onRemovePromo: () => void;
}

export function OrderSummaryCard({
  orderItems,
  currentStep,
  appliedPromo,
  summary,
  onRemovePromo,
}: OrderSummaryCardProps) {
  const { remove, clear, increment } = useCart();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={ShoppingBag}
              strokeWidth={2}
              className="size-5"
            />
            <span>Resumo do pedido</span>
          </div>
          <Button
            size={"icon-xs"}
            variant={"destructive"}
            onClick={() => clear()}
            disabled={currentStep > 3}
          >
            <HugeiconsIcon icon={Trash} strokeWidth={2} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {orderItems?.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-12 h-12 shrink-0 border rounded-md">
                <Image
                  src={item.image}
                  alt={item.name}
                  className="object-cover rounded-md"
                  fill
                />
                <Badge className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center">
                  {item.quantity}
                </Badge>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between w-full gap-2">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <div className="text-sm font-semibold">
                    {(item.price * item.quantity).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                </div>
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      {item.price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                    {item.originalPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {item.originalPrice.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                    )}
                  </div>
                  <ButtonGroup>
                    <ButtonGroup>
                      <Button
                        size={"icon-xs"}
                        variant={"outline"}
                        onClick={() => increment(item.id, -1)}
                        disabled={currentStep > 3 || item.quantity <= 1}
                      >
                        <HugeiconsIcon icon={Minus} strokeWidth={2} />
                      </Button>
                      <Button
                        size={"icon-xs"}
                        variant={"outline"}
                        onClick={() => increment(item.id, 1)}
                        disabled={currentStep > 3}
                      >
                        <HugeiconsIcon icon={Plus} strokeWidth={2} />
                      </Button>
                    </ButtonGroup>
                    <ButtonGroup>
                      <Button
                        size={"icon-xs"}
                        variant={"destructive"}
                        onClick={() => remove(item.id)}
                        disabled={currentStep > 3}
                      >
                        <HugeiconsIcon icon={Trash} strokeWidth={2} />
                      </Button>
                    </ButtonGroup>
                  </ButtonGroup>
                </div>
              </div>
            </div>
          ))}
        </div>

        {appliedPromo && (
          <Item
            variant={"outline"}
            size={"xs"}
            className="border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-50"
          >
            <div className="flex items-center">
              <HugeiconsIcon
                icon={Percent}
                strokeWidth={2}
                className="size-4"
              />
            </div>
            <ItemContent>
              <ItemTitle>{appliedPromo}</ItemTitle>
            </ItemContent>
            <ItemActions>
              <Button variant="ghost" size="icon-xs" onClick={onRemovePromo}>
                <HugeiconsIcon icon={X} strokeWidth={2} className="size-4" />
              </Button>
            </ItemActions>
          </Item>
        )}

        <div className="flex flex-col gap-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>
                {summary.subtotal.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
            {summary.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto</span>
                <span>
                  -
                  {summary.discount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Frete</span>
              <span>
                {summary.shipping.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>
              {summary.total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
