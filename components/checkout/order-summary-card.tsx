import {
  DiscountIcon,
  Minus,
  Plus,
  ShoppingBag,
  Trash,
  X,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import { CldImage } from "next-cloudinary";
import { useState } from "react";
import type { CheckoutSummary } from "@/app/checkout/use-checkout-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/context/cart-context";
import { useTRPC } from "@/lib/trpc";
import { Spinner } from "../ui/spinner";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  size?: string;
};

interface OrderSummaryCardProps {
  orderItems: OrderItem[];
  currentStep: number;
  appliedPromo: string;
  summary: CheckoutSummary;
  promoLoading?: boolean;
  onApplyPromo: (code: string) => void;
  onRemovePromo: () => void;
}

export function OrderSummaryCard({
  orderItems,
  currentStep,
  appliedPromo,
  summary,
  promoLoading,
  onApplyPromo,
  onRemovePromo,
}: OrderSummaryCardProps) {
  const { remove, increment, isUpdating } = useCart();
  const [promoInput, setPromoInput] = useState("");

  const trpc = useTRPC();

  const { data } = useQuery(
    trpc.promotion.byCode.queryOptions(appliedPromo, {
      enabled: !!appliedPromo,
    })
  );

  const handleApply = () => {
    if (!promoInput.trim()) return;
    onApplyPromo(promoInput.trim());
    setPromoInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleApply();
  };

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
          {/* <Button
            size={"icon-xs"}
            variant={"destructive"}
            onClick={() => clear()}
            disabled={currentStep > 3 || isUpdating}
          >
            <HugeiconsIcon icon={Trash} strokeWidth={2} />
          </Button> */}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {orderItems?.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-12 h-12 shrink-0 border rounded-md">
                <CldImage
                  src={item.image ?? "placeholder"}
                  alt={item.name}
                  fill
                  crop="fill"
                  gravity="auto"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                  className="rounded-md"
                />
                <Badge className="absolute -top-1 -right-1 size-4 p-0 flex items-center justify-center">
                  {item.quantity}
                </Badge>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex items-start gap-2 truncate">
                    {item.size && (
                      <p className="text-sm text-muted-foreground">
                        {item.size}
                      </p>
                    )}
                    <p className="text-sm font-medium truncate">{item.name}</p>
                  </div>
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
                        disabled={
                          currentStep > 3 || item.quantity <= 1 || isUpdating
                        }
                      >
                        <HugeiconsIcon icon={Minus} strokeWidth={2} />
                      </Button>
                      <Button
                        size={"icon-xs"}
                        variant={"outline"}
                        onClick={() => increment(item.id, 1)}
                        disabled={currentStep > 3 || isUpdating}
                      >
                        <HugeiconsIcon icon={Plus} strokeWidth={2} />
                      </Button>
                    </ButtonGroup>
                    <ButtonGroup>
                      <Button
                        size={"icon-xs"}
                        variant={"destructive"}
                        onClick={() => remove(item.id)}
                        disabled={currentStep > 3 || isUpdating}
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

        {/* Promo code input — only shown when no promo is applied yet */}
        {!appliedPromo && currentStep <= 3 && (
          <div className="flex gap-2">
            <Input
              placeholder="Cupom de desconto"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              onKeyDown={handleKeyDown}
              disabled={promoLoading}
              className="h-8 text-sm uppercase"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleApply}
              disabled={!promoInput.trim() || promoLoading}
              className="shrink-0"
            >
              {promoLoading ? <Spinner /> : "Aplicar"}
            </Button>
          </div>
        )}

        {appliedPromo && (
          <Item variant={"muted"} size={"xs"}>
            <HugeiconsIcon
              icon={DiscountIcon}
              strokeWidth={2}
              className="size-5"
            />
            <ItemContent>
              <ItemTitle>{data?.code}</ItemTitle>
              <ItemDescription>{data?.description}</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button
                variant="outline"
                size="icon-xs"
                onClick={onRemovePromo}
                disabled={currentStep > 3}
              >
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
              <div>
                {summary.shipping === 0 && data?.freeShipping ? (
                  <span className="text-green-600 font-medium">Grátis</span>
                ) : summary.shipping >= 0 && data?.freeShipping ? (
                  <span className="text-green-600 font-medium">
                    {summary.shipping.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                ) : (
                  summary.shipping.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                )}
              </div>
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
