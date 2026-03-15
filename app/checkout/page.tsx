"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, ShoppingBag } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Fragment, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { City } from "@/app/api/ibge/estados/municipios/[uf]/route";
import type { State } from "@/app/api/ibge/estados/route";
import type { ViaCEPResponse } from "@/app/api/viacep/[cep]/route";
import { CheckoutProgress } from "@/components/checkout/checkout-progress";
import { CheckoutSkeleton } from "@/components/checkout/checkout-skeleton";
import { OrderSummaryCard } from "@/components/checkout/order-summary-card";
import { StepIdentification } from "@/components/checkout/step-identification";
import { StepPayment } from "@/components/checkout/step-payment";
import { StepReview } from "@/components/checkout/step-review";
import { StepShippingInfo } from "@/components/checkout/step-shipping-info";
import { StepShippingMethod } from "@/components/checkout/step-shipping-method";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useCart } from "@/context/cart-context";
import { useTRPC } from "@/lib/trpc";
import { type CheckoutFormData, checkoutFormSchema } from "@/schemas/checkout";
import { getColorLabel, getShirtSizeLabel } from "@/utils/helpers";
import type { Currency } from "../api/awesome/last/[currencies]/route";
import { mapCartToCheckoutItems, mapCartToOrderItems } from "./cart-mappers";
import { checkoutSteps } from "./constants";
import { useCheckoutSummary } from "./use-checkout-summary";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, clear, isLoading } = useCart();
  const session = useSession();
  const [currentStep, setCurrentStep] = useState<number>(
    session.status === "authenticated" ? 1 : 0
  );

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      number: "",
      shippingMethod: undefined,
      paymentType: "card",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      complement: "",
      neighborhood: "",
      nameOnCard: "",
      agreeToTerms: false,
      appliedPromo: "",
    },
    mode: "onChange",
  });

  const watchedValues = form.watch();

  const orderItems = mapCartToOrderItems(cart);
  const checkoutItems = mapCartToCheckoutItems(cart);

  const trpc = useTRPC();

  const listAddresses = useQuery(
    trpc.address.list.queryOptions(undefined, {
      enabled: session.status === "authenticated",
    })
  );
  const listQuotes = useQuery(
    trpc.prodigiQuote.list.queryOptions(
      {
        items:
          cart?.map((item) => ({
            sku: item.sku,
            copies: item.quantity,
            attributes: {
              color: getColorLabel(item.color),
              size: getShirtSizeLabel(item.size),
            },
            assets: [{ printArea: "front" }],
          })) ?? [],
        destinationCountryCode: "BR",
        currencyCode: "USD",
      },
      {
        enabled: !!cart,
      }
    )
  );
  const listCurrency = useQuery({
    queryKey: ["currency", "list"],
    queryFn: async () => {
      const response = await fetch("/api/awesome/last/USD-BRL");
      return (await response.json()) as Currency;
    },
    enabled: !!listQuotes.data,
    placeholderData: keepPreviousData,
  });
  const createAddress = useMutation(
    trpc.address.create.mutationOptions({
      onSuccess: () => listAddresses.refetch(),
      onError: (error) => toast.error(error.message),
    })
  );
  const removeAddress = useMutation(
    trpc.address.remove.mutationOptions({
      onSuccess: () => listAddresses.refetch(),
      onError: (error) => toast.error(error.message),
    })
  );
  const createOrder = useMutation(
    trpc.order.create.mutationOptions({
      onSuccess: (order) => {
        clear();
        toast.success("Pedido criado. Aguardando confirmação de pagamento.");
        router.push(`/checkout/success/${order.id}`);
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const listStates = useQuery<State[]>({
    queryKey: ["states", "list"],
    queryFn: async () => {
      const response = await fetch("/api/ibge/estados");
      return await response.json();
    },
  });
  const citiesByState = useMutation<City[] | undefined, Error, string>({
    mutationFn: async (uf: string) => {
      const response = await fetch(`/api/ibge/estados/municipios/${uf}`);
      return await response.json();
    },
  });
  const viacep = useMutation<ViaCEPResponse | undefined, Error, string>({
    mutationFn: async (cep: string) => {
      const response = await fetch(`/api/viacep/${cep}`);
      return await response.json();
    },
  });

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1: {
        const isValid = await form.trigger([
          "firstName",
          "lastName",
          "email",
          "address",
          "city",
          "state",
          "zipCode",
          "complement",
          "number",
          "neighborhood",
        ]);

        if (isValid && listAddresses.data?.length === 0) {
          await createAddress.mutateAsync({
            city: watchedValues.city,
            state: watchedValues.state,
            zipCode: watchedValues.zipCode,
            street: watchedValues.address,
            complement: watchedValues.complement,
            number: watchedValues.number,
            recipient: `${watchedValues.firstName} ${watchedValues.lastName}`,
            district: watchedValues.neighborhood,
          });
        }

        return isValid;
      }
      case 2:
        return await form.trigger(["shippingMethod"]);
      case 3:
        if (watchedValues.paymentType === "card") {
          return await form.trigger([
            "cardNumber",
            "expiryMonth",
            "expiryYear",
            "cvv",
            "nameOnCard",
          ]);
        }
        form.clearErrors("cardNumber");
        form.clearErrors("expiryMonth");
        form.clearErrors("expiryYear");
        form.clearErrors("cvv");
        form.clearErrors("nameOnCard");
        return true;
      case 4: {
        if (!watchedValues.agreeToTerms) {
          form.setError("agreeToTerms", {
            type: "manual",
            message: "Você deve concordar com os termos",
          });
          return false;
        }
        return true;
      }
      default:
        return false;
    }
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, checkoutSteps.length - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const removePromo = () => {
    form.setValue("appliedPromo", "");
  };

  const summary = useCheckoutSummary({
    items: orderItems,
    promoCode: watchedValues.appliedPromo,
    shippingMethodId: watchedValues.shippingMethod,
    shippingMethods: listQuotes.data?.quotes.map((quote) => ({
      id: quote.shipmentMethod,
      label: quote.shipmentMethod,
      price:
        Number(quote.costSummary.shipping.amount) *
        Number(listCurrency.data?.USDBRL.bid),
      deadline: quote.shipments[0].carrier.name,
    })),
  });

  async function onSubmit() {
    const selectedShipping = listQuotes.data?.quotes.find(
      (quote) => quote.shipmentMethod === watchedValues.shippingMethod
    );
    if (!selectedShipping || checkoutItems.length === 0) {
      toast.error("Revise itens do carrinho e método de frete");
      return;
    }

    const normalizedZipCode = watchedValues.zipCode.replace(/\D/g, "");
    const paymentIntentId = searchParams.get("payment_intent") ?? undefined;
    await createOrder.mutateAsync({
      items: checkoutItems,
      paymentIntentId,
      address: {
        recipient:
          `${watchedValues.firstName} ${watchedValues.lastName}`.trim(),
        zipCode: normalizedZipCode,
        street: watchedValues.address,
        number: watchedValues.number,
        complement: watchedValues.complement,
        neighborhood: watchedValues.neighborhood,
        city: watchedValues.city,
        state: watchedValues.state,
      },
      shipping: {
        id: selectedShipping.shipmentMethod,
        label: selectedShipping.shipmentMethod,
        price:
          Number(selectedShipping.costSummary.shipping.amount) *
          Number(listCurrency.data?.USDBRL.bid),
        deadline: selectedShipping.shipments[0].carrier.name,
      },
    });
  }

  useEffect(() => {
    if (session.status === "authenticated") {
      setCurrentStep(1);
      form.setValue("firstName", session.data?.user?.name?.split(" ")[0] ?? "");
      form.setValue("lastName", session.data?.user?.name?.split(" ")[1] ?? "");
      form.setValue("email", session.data?.user?.email ?? "");
    }
  }, [session.status, form.setValue, session.data]);

  return (
    <Fragment>
      {isLoading ? (
        <CheckoutSkeleton />
      ) : !cart ? (
        <Card className="flex flex-col gap-6 max-w-md mx-auto w-full">
          <CardHeader>
            <CardTitle>Nenhum item no carrinho</CardTitle>
            <CardDescription>
              Adicione itens ao carrinho para continuar com a compra
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => router.push("/")}
              size="lg"
              className="w-full sm:w-auto sm:ml-auto"
            >
              <HugeiconsIcon icon={ShoppingBag} strokeWidth={2} />
              Ir para a loja
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-muted-foreground text-sm">
              Complete sua compra de forma segura
            </p>
          </div>

          <CheckoutProgress currentStep={currentStep} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              {currentStep === 0 && (
                <StepIdentification
                  onLogin={() => router.push("/log-in?redirect=/checkout")}
                />
              )}
              {currentStep === 1 && (
                <StepShippingInfo
                  form={form}
                  addresses={listAddresses.data}
                  addressesLoading={listAddresses.isPending}
                  onAddressRemove={(id) => removeAddress.mutate({ id })}
                  removeAddressPending={removeAddress.isPending}
                  createAddressPending={createAddress.isPending}
                  states={listStates.data}
                  statesLoading={listStates.isPending}
                  cities={citiesByState.data}
                  citiesLoading={citiesByState.isPending}
                  onFetchCities={async (stateId) => {
                    await citiesByState.mutateAsync(stateId);
                  }}
                  onCepLookup={async (cep) => viacep.mutateAsync(cep)}
                  cepLoading={viacep.isPending}
                  onNext={nextStep}
                />
              )}
              {currentStep === 2 && (
                <StepShippingMethod
                  form={form}
                  shippingMethods={listQuotes.data}
                  shippingLoading={listQuotes.isPending}
                  isPending={createAddress.isPending}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStep === 3 && (
                <StepPayment
                  form={form}
                  paymentType={watchedValues.paymentType}
                  onNext={nextStep}
                  onPrev={prevStep}
                />
              )}
              {currentStep === 4 && (
                <StepReview
                  form={form}
                  watchedValues={watchedValues}
                  shippingMethods={listQuotes.data?.quotes}
                  orderPending={createOrder.isPending}
                  summary={summary}
                  onPrev={prevStep}
                  onValidateAndSubmit={async () => {
                    const isValid = await validateStep(currentStep);
                    if (isValid) await onSubmit();
                  }}
                />
              )}
            </div>

            <div className="flex flex-col gap-4">
              <OrderSummaryCard
                orderItems={orderItems}
                currentStep={currentStep}
                appliedPromo={watchedValues.appliedPromo}
                summary={summary}
                onRemovePromo={removePromo}
              />
              <Card>
                <CardHeader className="flex items-center gap-3">
                  <HugeiconsIcon
                    icon={Shield}
                    strokeWidth={2}
                    className="size-5 text-green-600"
                  />
                  <div>
                    <CardTitle>Seguro e encriptado</CardTitle>
                    <CardDescription>
                      Seus dados são protegidos com criptografia SSL
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </>
      )}
    </Fragment>
  );
}
