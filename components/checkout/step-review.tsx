import {
  Check,
  ChevronLeft,
  LockKeyhole,
  Wallet,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { Route } from "next";
import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { paymentMethods } from "@/app/checkout/constants";
import type { CheckoutSummary } from "@/app/checkout/use-checkout-summary";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError } from "@/components/ui/field";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { CheckoutFormData } from "@/schemas/checkout";
import type { GelatoShipmentMethod } from "@/server/integrations/gelato/gelato.types";
import { formatCurrency } from "@/utils/formatters";

interface StepReviewProps {
  form: UseFormReturn<CheckoutFormData>;
  watchedValues: CheckoutFormData;
  shippingMethods: GelatoShipmentMethod[] | undefined;
  orderPending: boolean;
  summary: CheckoutSummary;
  onPrev: () => void;
  onValidateAndSubmit: () => Promise<void>;
}

export function StepReview({
  form,
  watchedValues,
  shippingMethods,
  orderPending,
  summary,
  onPrev,
  onValidateAndSubmit,
}: StepReviewProps) {
  const selectedShipping = shippingMethods?.find(
    (m) => m.shipmentMethodUid === watchedValues.shippingMethod
  );
  const selectedPayment = paymentMethods.find(
    (method) => method.value === watchedValues.paymentType
  );

  return (
    <Card className="flex flex-col gap-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={Check} strokeWidth={2} className="size-5" />
          Revisar pedido
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <Item variant={"muted"}>
          <ItemContent>
            <ItemDescription className="line-clamp-none">
              O pedido será criado agora e o status será atualizado
              automaticamente após a confirmação do pagamento.
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item variant={"muted"}>
          <ItemHeader>
            <ItemTitle>Endereço de entrega</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <ItemDescription>
              {watchedValues.firstName} {watchedValues.lastName}
            </ItemDescription>
            <ItemDescription>{watchedValues.address}</ItemDescription>
            <ItemDescription>
              {watchedValues.city}, {watchedValues.state}{" "}
              {watchedValues.zipCode}
            </ItemDescription>
            <ItemDescription>{watchedValues.email}</ItemDescription>
          </ItemContent>
        </Item>

        <Item variant={"muted"}>
          <ItemHeader>
            <ItemTitle>Método de entrega</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <ItemDescription>{selectedShipping?.name || "-"}</ItemDescription>
            <ItemDescription>
              {selectedShipping
                ? `${selectedShipping.minDeliveryDays}–${selectedShipping.maxDeliveryDays} dias úteis`
                : "-"}
            </ItemDescription>
          </ItemContent>
        </Item>

        <Item variant={"muted"}>
          <ItemHeader>
            <ItemTitle>Método de pagamento</ItemTitle>
          </ItemHeader>
          <ItemContent>
            <ItemDescription>
              <span className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={selectedPayment?.icon || Wallet}
                  strokeWidth={2}
                  className={cn("size-4", selectedPayment?.className)}
                />
                <span>{selectedPayment?.label || "Método de pagamento"}</span>
              </span>
            </ItemDescription>
          </ItemContent>
        </Item>

        <Controller
          name="agreeToTerms"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label
                  htmlFor={field.name}
                  className="text-sm leading-relaxed inline"
                >
                  <span>Concordo com os </span>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    render={
                      <Link
                        href={"/policies/terms-of-use" as Route}
                        target="_blank"
                      />
                    }
                  >
                    Termos de uso
                  </Button>{" "}
                  e{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    render={
                      <Link
                        href={"/policies/privacy-policy" as Route}
                        target="_blank"
                      />
                    }
                  >
                    Política de privacidade
                  </Button>
                </Label>
              </div>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </CardContent>
      <CardFooter className="flex justify-between flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          variant="outline"
          onClick={onPrev}
          disabled={orderPending}
          className="w-full sm:w-auto"
        >
          <HugeiconsIcon icon={ChevronLeft} strokeWidth={2} />
          Voltar
        </Button>
        <Button
          size="lg"
          onClick={onValidateAndSubmit}
          disabled={orderPending}
          className="w-full sm:w-auto"
        >
          {orderPending ? (
            <Spinner />
          ) : (
            <>
              <HugeiconsIcon icon={LockKeyhole} strokeWidth={2} />
              Finalizar pedido {formatCurrency(summary.total)}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
