"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, ShoppingBag } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Fragment, useEffect, useRef, useState } from "react";
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
import type { GelatoCreateQuoteResponse } from "@/server/integrations/gelato/gelato.types";
import { mapCartToCheckoutItems, mapCartToOrderItems } from "./cart-mappers";
import { checkoutSteps } from "./constants";
import { type PromotionData, useCheckoutSummary } from "./use-checkout-summary";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, clear, set, isLoading } = useCart();
  const session = useSession();
  const [currentStep, setCurrentStep] = useState<number>(
    session.status === "authenticated" ? 1 : 0
  );
  const hasRefreshed = useRef(false);
  const [gelatoQuoteData, setGelatoQuoteData] =
    useState<GelatoCreateQuoteResponse | null>(null);
  const [promotionData, setPromotionData] = useState<PromotionData | null>(
    null
  );

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      cpf: "",
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

  const refreshCart = useMutation(
    trpc.cart.refresh.mutationOptions({
      onSuccess: ({ items, removedVariantIds }) => {
        set(items);
        if (removedVariantIds.length > 0) {
          toast.warning(
            `${removedVariantIds.length} produto(s) foram removidos do carrinho pois não estão mais disponíveis.`
          );
        }
      },
    })
  );

  const listAddresses = useQuery(
    trpc.address.list.queryOptions(undefined, {
      enabled: session.status === "authenticated",
    })
  );

  const fetchQuote = useMutation(
    trpc.gelatoQuote.create.mutationOptions({
      onSuccess: (data) => setGelatoQuoteData(data),
      onError: () => toast.error("Não foi possível calcular o frete"),
    })
  );

  const updateUser = useMutation(
    trpc.auth.update.mutationOptions({
      onSuccess: () => {
        toast.success("Usuário atualizado com sucesso");
      },
      onError: (error) => toast.error(error.message),
    })
  );

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

  const validatePromo = useMutation(
    trpc.promotion.validate.mutationOptions({
      onSuccess: (data) => {
        setPromotionData(data);
        form.setValue("appliedPromo", data.code);
        toast.success(`Cupom "${data.code}" aplicado com sucesso!`);
      },
      onError: (error) => {
        toast.error(error.message);
        removePromo();
      },
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

  // Build the Gelato quote request from current form values
  function buildQuoteRequest() {
    const normalizedZip = watchedValues.zipCode.replace(/\D/g, "");
    return {
      orderReferenceId: crypto.randomUUID(),
      customerReferenceId: session.data?.user?.id ?? "guest",
      currency: "BRL",
      allowMultipleQuotes: false,
      recipient: {
        country: "BR",
        firstName: watchedValues.firstName,
        lastName: watchedValues.lastName,
        addressLine1: `${watchedValues.address}, ${watchedValues.number}`,
        addressLine2: watchedValues.complement || undefined,
        city: watchedValues.city,
        postCode: normalizedZip,
        email: watchedValues.email,
        phone: watchedValues.phone || undefined,
      },
      products:
        cart?.map((item) => ({
          itemReferenceId: item.variantId,
          productUid:
            "apparel_product_gca_t-shirt_gsc_crewneck_gcu_unisex_gqa_heavy-weight_gsi_s_gco_white_gpr_4-0_gildan_5000",
          quantity: item.quantity,
        })) ?? [],
    };
  }

  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1: {
        const isValid = await form.trigger([
          "firstName",
          "lastName",
          "email",
          "cpf",
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
    if (!isValid) return;

    const next = Math.min(currentStep + 1, checkoutSteps.length - 1);

    // Fetch Gelato quotes when moving into the shipping method step
    if (next === 2 && cart && cart.length > 0) {
      fetchQuote.mutate(buildQuoteRequest());
    }

    setCurrentStep(next);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const removePromo = () => {
    form.setValue("appliedPromo", "");
    setPromotionData(null);
  };

  // All available shipment methods flattened across quotes
  const allShipmentMethods =
    gelatoQuoteData?.quotes.flatMap((q) => q.shipmentMethods) ?? [];

  const summary = useCheckoutSummary({
    items: orderItems,
    promotion: promotionData,
    shippingMethodId: watchedValues.shippingMethod,
    shippingMethods: allShipmentMethods.map((m) => ({
      id: m.shipmentMethodUid,
      price: m.price,
    })),
    onError: () => {
      toast.error("Este cupom não pode ser aplicado a itens já com desconto");
      removePromo();
    },
  });

  const applyPromo = (code: string) => {
    validatePromo.mutate({
      code,
      orderAmount: summary.subtotal,
      cartItems: orderItems.map((item) => ({
        hasDiscount: item.hasDiscount ?? false,
        subtotal: item.price * item.quantity,
      })),
    });
  };

  async function onSubmit() {
    const selectedMethod = allShipmentMethods.find(
      (m) => m.shipmentMethodUid === watchedValues.shippingMethod
    );
    if (!selectedMethod || checkoutItems.length === 0) {
      toast.error("Revise itens do carrinho e método de frete");
      return;
    }

    const normalizedZipCode = watchedValues.zipCode.replace(/\D/g, "");
    const paymentIntentId = searchParams.get("payment_intent") ?? undefined;

    await createOrder.mutateAsync({
      items: checkoutItems,
      paymentIntentId,
      cpf: watchedValues.cpf.replace(/\D/g, ""),
      promoCode: watchedValues.appliedPromo || undefined,
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
        id: selectedMethod.shipmentMethodUid,
        label: selectedMethod.name,
        price: selectedMethod.price,
        deadline: `${selectedMethod.minDeliveryDays}–${selectedMethod.maxDeliveryDays} dias úteis`,
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

  // biome-ignore lint/correctness/useExhaustiveDependencies: hasRefreshed guards against multiple fires
  useEffect(() => {
    if (isLoading || !cart || cart.length === 0 || hasRefreshed.current) return;
    hasRefreshed.current = true;
    refreshCart.mutate(
      cart.map((i) => ({
        variantId: i.variantId,
        productId: i.productId,
        quantity: i.quantity,
      }))
    );
  }, [isLoading, cart]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: we want to fetch quotes when the cart changes
  useEffect(() => {
    if (cart && cart.length > 0) {
      fetchQuote.mutate(buildQuoteRequest());
      if (promotionData) {
        validatePromo.mutate({
          code: promotionData.code,
          orderAmount: summary.subtotal,
          cartItems: orderItems.map((item) => ({
            hasDiscount: item.hasDiscount ?? false,
            subtotal: item.price * item.quantity,
          })),
        });
      }
    }
  }, [cart]);

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
                  onNext={() => {
                    updateUser.mutate({
                      cpf: form.getValues("cpf"),
                    });
                    nextStep();
                  }}
                />
              )}
              {currentStep === 2 && (
                <StepShippingMethod
                  form={form}
                  quoteData={gelatoQuoteData}
                  quoteLoading={fetchQuote.isPending}
                  isPending={createAddress.isPending || fetchQuote.isPending}
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
                  shippingMethods={gelatoQuoteData?.quotes.flatMap(
                    (q) => q.shipmentMethods
                  )}
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
                promoLoading={validatePromo.isPending}
                onApplyPromo={applyPromo}
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
