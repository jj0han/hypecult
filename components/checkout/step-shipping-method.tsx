/** biome-ignore-all lint/suspicious/noArrayIndexKey: template */
import {
  ArrowRight01Icon,
  ChevronLeft,
  Fire02Icon,
  Truck,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import type { CheckoutFormData } from "@/schemas/checkout";
import type { GelatoCreateQuoteResponse } from "@/server/integrations/gelato/gelato.types";
import { Badge } from "../ui/badge";

interface StepShippingMethodProps {
  form: UseFormReturn<CheckoutFormData>;
  quoteData: GelatoCreateQuoteResponse | undefined | null;
  quoteLoading: boolean;
  isPending: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function StepShippingMethod({
  form,
  quoteData,
  quoteLoading,
  isPending,
  onNext,
  onPrev,
}: StepShippingMethodProps) {
  // Flatten all shipment methods across quotes (allowMultipleQuotes: false → usually one quote)
  const shipmentMethods =
    quoteData?.quotes.flatMap((q) => q.shipmentMethods) ?? [];

  return (
    <Card className="flex flex-col gap-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={Truck} strokeWidth={2} className="size-5" />
          Frete
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <Label>Método de entrega</Label>
          <div className="flex flex-col gap-3">
            {!quoteLoading && shipmentMethods.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum método de frete disponível para o endereço informado.
              </p>
            )}
            {quoteLoading ? (
              Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))
            ) : (
              <Controller
                name="shippingMethod"
                control={form.control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    {shipmentMethods.map((method) => (
                      <FieldLabel
                        key={method.shipmentMethodUid}
                        htmlFor={method.shipmentMethodUid}
                      >
                        <Field orientation="horizontal">
                          <RadioGroupItem
                            value={method.shipmentMethodUid}
                            id={method.shipmentMethodUid}
                          />
                          <FieldContent className="flex-2">
                            <FieldTitle className="flex flex-col items-start gap-1 sm:gap-2 sm:flex-row sm:items-center">
                              <span>{method.name}</span>
                              <div className="flex gap-1 sm:gap-2">
                                {method.type === "express" && (
                                  <Badge variant="destructive">
                                    <HugeiconsIcon
                                      icon={Fire02Icon}
                                      strokeWidth={2}
                                    />
                                    Express
                                  </Badge>
                                )}
                                <Badge variant="outline">
                                  {quoteData?.quotes[0].fulfillmentCountry ===
                                  "BR"
                                    ? "BR"
                                    : "US"}
                                  <HugeiconsIcon
                                    icon={ArrowRight01Icon}
                                    strokeWidth={2}
                                  />
                                  BR
                                </Badge>
                              </div>
                            </FieldTitle>
                            <div className="flex gap-2 items-end">
                              <FieldDescription>
                                {method.minDeliveryDays}–
                                {method.maxDeliveryDays} dias úteis
                              </FieldDescription>
                            </div>
                          </FieldContent>
                          <FieldContent className="flex items-end">
                            <FieldTitle>
                              {method.price.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: method.currency,
                              })}
                            </FieldTitle>
                          </FieldContent>
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                )}
              />
            )}
            {form.formState.errors.shippingMethod && (
              <FieldError errors={[form.formState.errors.shippingMethod]} />
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between flex-col sm:flex-row gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={onPrev}
          className="w-full sm:w-auto"
        >
          <HugeiconsIcon icon={ChevronLeft} strokeWidth={2} />
          Voltar
        </Button>
        <Button
          size="lg"
          onClick={onNext}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          {isPending ? <Spinner /> : "Continuar"}
        </Button>
      </CardFooter>
    </Card>
  );
}
