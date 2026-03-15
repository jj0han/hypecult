/** biome-ignore-all lint/suspicious/noArrayIndexKey: template */
import { ChevronLeft, Truck } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { Currency } from "@/app/api/awesome/last/[currencies]/route";
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
import type { ProdigiQuotes } from "@/server/integrations/prodigi/prodigi.types";

interface StepShippingMethodProps {
  form: UseFormReturn<CheckoutFormData>;
  shippingMethods: ProdigiQuotes | undefined;
  shippingLoading: boolean;
  isPending: boolean;
  onNext: () => void;
  onPrev: () => void;
}

export function StepShippingMethod({
  form,
  shippingMethods,
  shippingLoading,
  isPending,
  onNext,
  onPrev,
}: StepShippingMethodProps) {
  const listCurrency = useQuery({
    queryKey: ["currency", "list"],
    queryFn: async () => {
      const response = await fetch("/api/awesome/last/USD-BRL");
      return (await response.json()) as Currency;
    },
    enabled: !!shippingMethods,
    placeholderData: keepPreviousData,
  });
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
          <div className="flex flex-col gap-4">
            {shippingLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-20 w-full" />
              ))}
            <Controller
              name="shippingMethod"
              control={form.control}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange}>
                  {shippingMethods?.quotes.map((quote) => (
                    <FieldLabel
                      key={quote.shipmentMethod}
                      htmlFor={quote.shipmentMethod}
                    >
                      <Field orientation="horizontal">
                        <RadioGroupItem
                          value={quote.shipmentMethod}
                          id={quote.shipmentMethod}
                        />
                        <FieldContent>
                          <FieldTitle>{quote.shipmentMethod}</FieldTitle>
                          <FieldDescription>
                            {quote.shipments[0].carrier.name}
                          </FieldDescription>
                        </FieldContent>
                        <FieldContent className="flex items-end">
                          <FieldTitle>
                            {(
                              Number(quote.costSummary.shipping.amount) *
                              Number(listCurrency.data?.USDBRL.bid)
                            ).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </FieldTitle>
                        </FieldContent>
                      </Field>
                    </FieldLabel>
                  ))}
                </RadioGroup>
              )}
            />
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
