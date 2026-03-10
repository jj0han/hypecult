/** biome-ignore-all lint/suspicious/noArrayIndexKey: template */
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  ChevronLeft,
  CreditCard,
  Edit04Icon,
  Lock,
  LockKeyhole,
  LogIn,
  Mail,
  MapPin,
  Minus,
  Percent,
  Phone,
  Plus,
  Search,
  Shield,
  ShoppingBag,
  Trash,
  Truck,
  User,
  Wallet,
  X,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Fragment, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useCart } from "@/context/cart-context";
import { useTRPC } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { formatPhone, formatZipCode } from "@/utils/formatters";
import type { City } from "../api/ibge/estados/municipios/[uf]/route";
import type { State } from "../api/ibge/estados/route";
import type { ViaCEPResponse } from "../api/viacep/[cep]/route";
import { mapCartToCheckoutItems, mapCartToOrderItems } from "./cart-mappers";
import { checkoutSteps, paymentMethods } from "./constants";
import { useCheckoutSummary } from "./use-checkout-summary";

const checkoutFormSchema = z
  .object({
    // Basic Information
    firstName: z.string().min(1, "Nome é obrigatório"),
    lastName: z.string().min(1, "Sobrenome é obrigatório"),
    email: z.email("E-mail inválido"),
    phone: z.string(),
    // Shipping Address
    address: z.string().min(1, "Endereço é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().min(1, "Estado é obrigatório"),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    zipCode: z.string().min(1, "CEP é obrigatório"),
    complement: z.string().optional(),
    number: z.string().min(1, "Número é obrigatório"),
    // Shipping Method
    shippingMethod: z.string({ error: "Método de entrega é obrigatório" }),
    // Payment
    paymentType: z.string(),
    cardNumber: z.string(),
    expiryMonth: z.string(),
    expiryYear: z.string(),
    cvv: z.string(),
    nameOnCard: z.string(),
    // Review
    agreeToTerms: z.boolean(),
    // Promo
    appliedPromo: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentType === "card") {
      if (!data.cardNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número do cartão é obrigatório",
          path: ["cardNumber"],
        });
      }
      if (!data.expiryMonth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mês de expiração é obrigatório",
          path: ["expiryMonth"],
        });
      }
      if (!data.expiryYear) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ano de expiração é obrigatório",
          path: ["expiryYear"],
        });
      }
      if (!data.cvv) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CVV é obrigatório",
          path: ["cvv"],
        });
      }
      if (!data.nameOnCard) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nome no cartão é obrigatório",
          path: ["nameOnCard"],
        });
      }
    }
  });

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cart, clear } = useCart();
  const session = useSession();
  const [currentStep, setCurrentStep] = useState<number>(
    session.status === "authenticated" ? 1 : 0
  );
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

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
  const calculateShipping = useQuery(
    trpc.shipping.calculate.queryOptions(
      {
        addressId: selectedAddress ?? "",
      },
      { enabled: !!selectedAddress }
    )
  );
  const createAddress = useMutation(
    trpc.address.create.mutationOptions({
      onSuccess: () => {
        listAddresses.refetch();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
  const removeAddress = useMutation(
    trpc.address.remove.mutationOptions({
      onSuccess: () => {
        listAddresses.refetch();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );
  const createOrder = useMutation(
    trpc.order.create.mutationOptions({
      onSuccess: (order) => {
        clear(); // Clear cart after successful order creation
        toast.success("Pedido criado. Aguardando confirmação de pagamento.");
        router.push(`/checkout/success/${order.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
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
          const createdAddress = await createAddress.mutateAsync({
            city: watchedValues.city,
            state: watchedValues.state,
            zipCode: watchedValues.zipCode,
            street: watchedValues.address,
            complement: watchedValues.complement,
            number: watchedValues.number,
            recipient: `${watchedValues.firstName} ${watchedValues.lastName}`,
            district: watchedValues.neighborhood,
          });
          setSelectedAddress(createdAddress.id);
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
        } else {
          form.clearErrors("cardNumber");
          form.clearErrors("expiryMonth");
          form.clearErrors("expiryYear");
          form.clearErrors("cvv");
          form.clearErrors("nameOnCard");
        }
        return true;
      case 4: {
        if (!watchedValues.agreeToTerms) {
          form.setError("agreeToTerms", {
            type: "manual",
            message: "Você deve concordar com os termos",
          });
          return false;
        } else {
          return true;
        }
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
    shippingMethods: calculateShipping.data,
  });

  const CheckoutSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 flex flex-col gap-6">
        <Card>
          <CardContent className="p-6 flex flex-col gap-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col gap-4">
            <Skeleton className="h-6 w-24" />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const OrderSummaryCard = () => {
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
          {/* Order Items */}
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
                          disabled={currentStep > 3}
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
          {/* Applied Promo */}
          {watchedValues.appliedPromo && (
            <Item
              variant={"outline"}
              size={"xs"}
              className="border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-50"
            >
              <ItemMedia variant="icon">
                <HugeiconsIcon
                  icon={Percent}
                  strokeWidth={2}
                  className="size-4"
                />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{watchedValues.appliedPromo}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <Button variant="ghost" size="icon-xs" onClick={removePromo}>
                  <HugeiconsIcon icon={X} strokeWidth={2} className="size-4" />
                </Button>
              </ItemActions>
            </Item>
          )}

          {/* Pricing Breakdown */}
          <div className="flex flex-col gap-2">
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
  };

  async function onSubmit() {
    const selectedShipping = calculateShipping.data?.find(
      (method) => method.id === watchedValues.shippingMethod
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
      shipping: selectedShipping,
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
      {!cart ? (
        <Card className="flex flex-col gap-6">
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
          {/* Progress Steps */}
          <div className="flex items-center justify-start gap-2">
            {checkoutSteps.map(({ step, label, icon: Icon }, index) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex items-center justify-center size-8 rounded-full border-2 transition-colors",
                      currentStep > step
                        ? "bg-primary border-primary text-white"
                        : currentStep >= step
                          ? "border-primary text-primary"
                          : "border-border text-muted-foreground"
                    )}
                  >
                    <HugeiconsIcon
                      icon={Icon}
                      strokeWidth={2}
                      className="size-4"
                    />
                  </div>
                  <span
                    className={cn(
                      "text-sm font-medium hidden sm:block",
                      currentStep >= step
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {index < checkoutSteps.length - 1 && (
                  <Separator
                    className={cn(
                      "w-4! sm:w-8! h-0.5!",
                      currentStep > step ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
          {session.status === "loading" ? (
            <CheckoutSkeleton />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Step 0: Identification */}
                {currentStep === 0 && (
                  <Card className="">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={User}
                          strokeWidth={2}
                          className="size-5"
                        />
                        Identificação
                      </CardTitle>
                      <CardDescription className="text-base inline-flex items-center gap-2">
                        Entre ou crie sua conta
                        <Image
                          src="/HYPECULT.svg"
                          alt="Hypecult"
                          width={80}
                          height={80}
                          className="object-contain mt-1"
                        />
                        para continuar com a compra.
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button
                        onClick={() =>
                          router.push("/log-in?redirect=/checkout")
                        }
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        <HugeiconsIcon
                          icon={LogIn}
                          strokeWidth={2}
                          className="size-4"
                        />
                        Entrar ou criar conta
                      </Button>
                    </CardFooter>
                  </Card>
                )}
                {/* Step 1: Shipping Information */}
                {currentStep === 1 && (
                  <Card className="flex flex-col gap-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={MapPin}
                          strokeWidth={2}
                          className="size-5"
                        />
                        Informações de entrega
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Controller
                          name="firstName"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name}>
                                Nome *
                              </FieldLabel>
                              <InputGroup>
                                <InputGroupAddon>
                                  <HugeiconsIcon
                                    icon={User}
                                    strokeWidth={2}
                                    className="size-4"
                                  />
                                </InputGroupAddon>
                                <InputGroupInput
                                  {...field}
                                  id={field.name}
                                  placeholder="João"
                                  aria-invalid={fieldState.invalid}
                                />
                              </InputGroup>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                        <Controller
                          name="lastName"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name}>
                                Sobrenome *
                              </FieldLabel>
                              <Input
                                {...field}
                                id={field.name}
                                placeholder="Silva"
                                aria-invalid={fieldState.invalid}
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                        <Controller
                          name="email"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name}>
                                E-mail *
                              </FieldLabel>
                              <InputGroup>
                                <InputGroupAddon>
                                  <HugeiconsIcon
                                    icon={Mail}
                                    strokeWidth={2}
                                    className="size-4"
                                  />
                                </InputGroupAddon>
                                <InputGroupInput
                                  {...field}
                                  id={field.name}
                                  type="email"
                                  placeholder="joao@example.com"
                                  aria-invalid={fieldState.invalid}
                                />
                              </InputGroup>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                        <Controller
                          name="phone"
                          control={form.control}
                          render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name}>
                                Telefone
                              </FieldLabel>
                              <InputGroup>
                                <InputGroupAddon>
                                  <HugeiconsIcon
                                    icon={Phone}
                                    strokeWidth={2}
                                    className="size-4"
                                  />
                                </InputGroupAddon>
                                <InputGroupInput
                                  {...field}
                                  id={field.name}
                                  type="tel"
                                  placeholder="(11) 99999-9999"
                                  aria-invalid={fieldState.invalid}
                                  value={formatPhone(field.value)}
                                />
                              </InputGroup>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                      </div>
                      {listAddresses.data && listAddresses.data?.length > 0 && (
                        <div className="flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <Label>Endereço de entrega</Label>
                            <Button variant="outline" size="xs">
                              <HugeiconsIcon icon={Plus} strokeWidth={2} />
                              Adicionar endereço
                            </Button>
                          </div>
                          <div className="flex flex-col gap-4">
                            <RadioGroup
                              value={
                                listAddresses.data?.find(
                                  (address) =>
                                    address.zipCode === watchedValues.zipCode
                                )?.id
                              }
                              onValueChange={(value) => {
                                const address = listAddresses.data?.find(
                                  (address) => address.id === value
                                );
                                setSelectedAddress(address?.id ?? null);
                                if (address) {
                                  form.setValue("address", address.street);
                                  form.setValue("number", address.number);
                                  form.setValue(
                                    "complement",
                                    address.complement ?? ""
                                  );
                                  form.setValue(
                                    "neighborhood",
                                    address.district
                                  );
                                  form.setValue("city", address.city);
                                  form.setValue("state", address.state);
                                  form.setValue("zipCode", address.zipCode);
                                }
                              }}
                            >
                              {listAddresses.data?.map((address) => (
                                <FieldLabel
                                  key={address.id}
                                  htmlFor={address.id}
                                >
                                  <Field orientation="horizontal">
                                    <RadioGroupItem
                                      value={address.id}
                                      id={address.id}
                                    />
                                    <FieldContent>
                                      <FieldTitle>
                                        {address.recipient}
                                      </FieldTitle>
                                      <FieldDescription>
                                        {address.street}, {address.number}{" "}
                                        {address.complement} {address.district}{" "}
                                        {address.city} {address.state}{" "}
                                        {address.zipCode}
                                      </FieldDescription>
                                    </FieldContent>
                                    <FieldContent className="flex flex-col sm:flex-row justify-end items-end gap-2">
                                      <Button variant="outline" size="xs">
                                        <HugeiconsIcon
                                          icon={Edit04Icon}
                                          strokeWidth={2}
                                        />
                                        Atualizar
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="icon-xs"
                                        onClick={() =>
                                          removeAddress.mutate({
                                            id: address.id,
                                          })
                                        }
                                        disabled={removeAddress.isPending}
                                      >
                                        {removeAddress.isPending ? (
                                          <Spinner />
                                        ) : (
                                          <HugeiconsIcon
                                            icon={Trash}
                                            strokeWidth={2}
                                          />
                                        )}
                                      </Button>
                                    </FieldContent>
                                  </Field>
                                </FieldLabel>
                              ))}
                            </RadioGroup>
                          </div>
                          {form.formState.errors.address && (
                            <FieldError
                              errors={[form.formState.errors.address]}
                            />
                          )}
                        </div>
                      )}
                      {listAddresses.data?.length === 0 && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                              name="address"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Endereço *
                                  </FieldLabel>
                                  <Input
                                    {...field}
                                    id={field.name}
                                    placeholder="Rua das Flores, 123"
                                    aria-invalid={fieldState.invalid}
                                  />
                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )}
                            />
                            <Controller
                              name="neighborhood"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Bairro *
                                  </FieldLabel>
                                  <Input
                                    {...field}
                                    id={field.name}
                                    placeholder="Centro"
                                    aria-invalid={fieldState.invalid}
                                  />
                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )}
                            />
                            <Controller
                              name="city"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Cidade *
                                  </FieldLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    disabled={listStates.isPending}
                                  >
                                    <SelectTrigger className={"w-full"}>
                                      {citiesByState.isPending && <Spinner />}
                                      <SelectValue placeholder="Selecione a cidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {citiesByState.data?.map((city) => (
                                        <SelectItem
                                          key={city.id}
                                          value={city.nome}
                                        >
                                          {city.nome}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )}
                            />
                            <Controller
                              name="state"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Estado *
                                  </FieldLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={async (value) => {
                                      if (!value) return;
                                      field.onChange(value);
                                      form.setValue("city", "");
                                      const id = listStates.data?.find(
                                        (state) => state.sigla === value
                                      )?.id;
                                      if (!id) return;
                                      await citiesByState.mutateAsync(
                                        id.toString()
                                      );
                                    }}
                                    disabled={listStates.isPending}
                                  >
                                    <SelectTrigger className={"w-full"}>
                                      {listStates.isPending && <Spinner />}
                                      <SelectValue placeholder="Selecione o estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {listStates.data?.map((state) => (
                                        <SelectItem
                                          key={state.id}
                                          value={state.sigla}
                                        >
                                          {state.nome} ({state.sigla})
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Controller
                              name="number"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Número *
                                  </FieldLabel>
                                  <Input
                                    {...field}
                                    id={field.name}
                                    placeholder="123"
                                    aria-invalid={fieldState.invalid}
                                  />
                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )}
                            />
                            <Controller
                              name="complement"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Complemento
                                  </FieldLabel>
                                  <Input
                                    {...field}
                                    id={field.name}
                                    placeholder="Apto 101"
                                    aria-invalid={fieldState.invalid}
                                  />
                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )}
                            />
                            <Controller
                              name="zipCode"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    CEP *
                                  </FieldLabel>
                                  <InputGroup>
                                    <InputGroupAddon>
                                      <HugeiconsIcon
                                        icon={Search}
                                        strokeWidth={2}
                                      />
                                    </InputGroupAddon>
                                    <InputGroupInput
                                      {...field}
                                      id={field.name}
                                      placeholder="00000-000"
                                      aria-invalid={fieldState.invalid}
                                      value={formatZipCode(field.value)}
                                      onChange={async (e) => {
                                        if (e.target.value.length >= 9) return;
                                        field.onChange(
                                          formatZipCode(e.target.value)
                                        );
                                        if (e.target.value.length < 8) return;
                                        console.log(e.target.value);
                                        const response =
                                          await viacep.mutateAsync(
                                            e.target.value
                                          );
                                        if (response) {
                                          form.setValue(
                                            "address",
                                            response.logradouro
                                          );
                                          form.setValue(
                                            "neighborhood",
                                            response.bairro
                                          );
                                          form.setValue(
                                            "city",
                                            response.localidade
                                          );
                                          form.setValue("state", response.uf);
                                        }
                                      }}
                                    />
                                    <InputGroupAddon align={"inline-end"}>
                                      {viacep.isPending && <Spinner />}
                                    </InputGroupAddon>
                                  </InputGroup>
                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )}
                            />
                          </div>
                        </>
                      )}
                      {listAddresses.isPending && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="space-y-3">
                              <Skeleton className="h-5 w-1/3" />
                              <Skeleton className="h-9 w-full" />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        onClick={nextStep}
                        disabled={
                          createAddress.isPending || listStates.isPending
                        }
                        size="lg"
                        className="w-full sm:w-auto ml-auto"
                      >
                        {createAddress.isPending ? <Spinner /> : "Continuar"}
                      </Button>
                    </CardFooter>
                  </Card>
                )}
                {/* Step 2: Shipping */}
                {currentStep === 2 && (
                  <Card className="flex flex-col gap-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={Truck}
                          strokeWidth={2}
                          className="size-5"
                        />
                        Frete
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                      <div className="flex flex-col gap-3">
                        <Label>Método de entrega</Label>
                        <div className="flex flex-col gap-4">
                          {calculateShipping.isPending &&
                            Array.from({ length: 3 }).map((_, index) => (
                              <Skeleton key={index} className="h-20 w-full" />
                            ))}
                          <Controller
                            name="shippingMethod"
                            control={form.control}
                            render={({ field }) => (
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                {calculateShipping.data?.map((method) => (
                                  <FieldLabel
                                    key={method.id}
                                    htmlFor={method.id}
                                  >
                                    <Field orientation="horizontal">
                                      <RadioGroupItem
                                        value={method.id}
                                        id={method.id}
                                      />
                                      <FieldContent>
                                        <FieldTitle>{method.label}</FieldTitle>
                                        <FieldDescription>
                                          {method.deadline}
                                        </FieldDescription>
                                      </FieldContent>
                                      <FieldContent className="flex items-end">
                                        <FieldTitle>
                                          {method.price.toLocaleString(
                                            "pt-BR",
                                            {
                                              style: "currency",
                                              currency: "BRL",
                                            }
                                          )}
                                        </FieldTitle>
                                      </FieldContent>
                                    </Field>
                                  </FieldLabel>
                                ))}
                              </RadioGroup>
                            )}
                          />
                          {form.formState.errors.shippingMethod && (
                            <FieldError
                              errors={[form.formState.errors.shippingMethod]}
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between flex-col sm:flex-row gap-4">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={prevStep}
                        className="w-full sm:w-auto"
                      >
                        <HugeiconsIcon icon={ChevronLeft} strokeWidth={2} />
                        Voltar
                      </Button>
                      <Button
                        size="lg"
                        onClick={nextStep}
                        disabled={createAddress.isPending}
                        className="w-full sm:w-auto"
                      >
                        {createAddress.isPending ? <Spinner /> : "Continuar"}
                      </Button>
                    </CardFooter>
                  </Card>
                )}
                {/* Step 3: Payment Information */}
                {currentStep === 3 && (
                  <Card className="flex flex-col gap-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={CreditCard}
                          strokeWidth={2}
                          className="size-5"
                        />
                        Informações de pagamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                      {/* Payment Method Selection */}
                      <div className="flex flex-col gap-4">
                        <Label className="font-medium">
                          Escolha o método de pagamento
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <Controller
                            name="paymentType"
                            control={form.control}
                            render={({ field }) => (
                              <RadioGroup
                                value={field.value}
                                onValueChange={field.onChange}
                                className="grid grid-cols-subgrid col-span-full gap-3"
                              >
                                {paymentMethods.map(
                                  ({
                                    value,
                                    label,
                                    description,
                                    icon,
                                    className,
                                  }) => (
                                    <FieldLabel key={value} htmlFor={value}>
                                      <Field orientation="horizontal">
                                        <HugeiconsIcon
                                          icon={icon}
                                          strokeWidth={2}
                                          className={className}
                                        />
                                        <FieldContent>
                                          <FieldTitle>{label}</FieldTitle>
                                          <FieldDescription>
                                            {description}
                                          </FieldDescription>
                                        </FieldContent>
                                        <RadioGroupItem
                                          value={value}
                                          id={value}
                                        />
                                      </Field>
                                    </FieldLabel>
                                  )
                                )}
                              </RadioGroup>
                            )}
                          />
                        </div>
                      </div>

                      {/* Credit Card Form - Only show when card is selected */}
                      {watchedValues.paymentType === "card" && (
                        <div className="flex flex-col gap-4">
                          <Controller
                            name="nameOnCard"
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Nome no cartão *
                                </FieldLabel>
                                <InputGroup>
                                  <InputGroupAddon>
                                    <HugeiconsIcon
                                      icon={User}
                                      strokeWidth={2}
                                      className="size-4"
                                    />
                                  </InputGroupAddon>
                                  <InputGroupInput
                                    {...field}
                                    id={field.name}
                                    placeholder="João Silva"
                                    aria-invalid={fieldState.invalid}
                                  />
                                </InputGroup>
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )}
                          />
                          <Controller
                            name="cardNumber"
                            control={form.control}
                            render={({ field, fieldState }) => (
                              <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>
                                  Número do cartão *
                                </FieldLabel>
                                <InputGroup>
                                  <InputGroupAddon>
                                    <HugeiconsIcon
                                      icon={CreditCard}
                                      strokeWidth={2}
                                      className="size-4"
                                    />
                                  </InputGroupAddon>
                                  <InputGroupInput
                                    {...field}
                                    id={field.name}
                                    placeholder="0000 0000 0000 0000"
                                    aria-invalid={fieldState.invalid}
                                  />
                                </InputGroup>
                                {fieldState.invalid && (
                                  <FieldError errors={[fieldState.error]} />
                                )}
                              </Field>
                            )}
                          />
                          <div className="grid grid-cols-3 gap-4">
                            <Controller
                              name="expiryMonth"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Mês *
                                  </FieldLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="MM" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 12 }, (_, i) => (
                                        <SelectItem
                                          key={i + 1}
                                          value={String(i + 1).padStart(2, "0")}
                                        >
                                          {String(i + 1).padStart(2, "0")}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )}
                            />
                            <Controller
                              name="expiryYear"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Ano *
                                  </FieldLabel>
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="YYYY" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 10 }, (_, i) => (
                                        <SelectItem
                                          key={2024 + i}
                                          value={String(2024 + i)}
                                        >
                                          {2024 + i}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )}
                            />
                            <Controller
                              name="cvv"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <FieldLabel htmlFor={field.name}>
                                    Código de segurança *
                                  </FieldLabel>
                                  <InputGroup>
                                    <InputGroupAddon>
                                      <HugeiconsIcon
                                        icon={Lock}
                                        strokeWidth={2}
                                        className="size-4"
                                      />
                                    </InputGroupAddon>
                                    <InputGroupInput
                                      {...field}
                                      id={field.name}
                                      placeholder="000"
                                      maxLength={4}
                                      aria-invalid={fieldState.invalid}
                                    />
                                  </InputGroup>
                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )}
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between flex-col sm:flex-row gap-4">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={prevStep}
                        className="w-full sm:w-auto"
                      >
                        <HugeiconsIcon icon={ChevronLeft} strokeWidth={2} />
                        Voltar
                      </Button>
                      <Button
                        size="lg"
                        onClick={nextStep}
                        className="w-full sm:w-auto"
                      >
                        Continuar
                      </Button>
                    </CardFooter>
                  </Card>
                )}
                {/* Step 4: Review Order */}
                {currentStep === 4 && (
                  <Card className="flex flex-col gap-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={Check}
                          strokeWidth={2}
                          className="size-5"
                        />
                        Revisar pedido
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-6">
                      <Item variant={"muted"}>
                        <ItemContent>
                          <ItemDescription className="line-clamp-none">
                            O pedido será criado agora e o status será
                            atualizado automaticamente após a confirmação do
                            pagamento.
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                      {/* Shipping Address Review */}
                      <Item variant={"muted"}>
                        <ItemHeader>
                          <ItemTitle>Endereço de entrega</ItemTitle>
                        </ItemHeader>
                        <ItemContent>
                          <ItemDescription>
                            {watchedValues.firstName} {watchedValues.lastName}
                          </ItemDescription>
                          <ItemDescription>
                            {watchedValues.address}
                          </ItemDescription>
                          <ItemDescription>
                            {watchedValues.city}, {watchedValues.state}{" "}
                            {watchedValues.zipCode}
                          </ItemDescription>
                          <ItemDescription>
                            {watchedValues.email}
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                      <Item variant={"muted"}>
                        <ItemHeader>
                          <ItemTitle>Método de entrega</ItemTitle>
                        </ItemHeader>
                        <ItemContent>
                          <ItemDescription>
                            {calculateShipping.data?.find(
                              (method) =>
                                method.id === watchedValues.shippingMethod
                            )?.label || "-"}
                          </ItemDescription>
                          <ItemDescription>
                            {calculateShipping.data?.find(
                              (method) =>
                                method.id === watchedValues.shippingMethod
                            )?.deadline || "-"}
                          </ItemDescription>
                        </ItemContent>
                      </Item>
                      {/* Payment Method Review */}
                      <Item variant={"muted"}>
                        <ItemHeader>
                          <ItemTitle>Método de pagamento</ItemTitle>
                        </ItemHeader>
                        <ItemContent>
                          <div className="flex items-center gap-2">
                            <HugeiconsIcon
                              icon={
                                paymentMethods.find(
                                  (method) =>
                                    method.value === watchedValues.paymentType
                                )?.icon || Wallet
                              }
                              strokeWidth={2}
                              className={cn(
                                "size-4",
                                paymentMethods.find(
                                  (method) =>
                                    method.value === watchedValues.paymentType
                                )?.className
                              )}
                            />
                            <ItemDescription>
                              {paymentMethods.find(
                                (method) =>
                                  method.value === watchedValues.paymentType
                              )?.label || "Método de pagamento"}
                            </ItemDescription>
                          </div>
                        </ItemContent>
                      </Item>

                      {/* Terms and Conditions */}
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
                                >
                                  Termos de serviço
                                </Button>{" "}
                                e{" "}
                                <Button
                                  variant="link"
                                  className="p-0 h-auto text-sm"
                                >
                                  Política de privacidade
                                </Button>
                              </Label>
                            </div>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between flex-col sm:flex-row gap-4">
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={prevStep}
                        disabled={createOrder.isPending}
                        className="w-full sm:w-auto"
                      >
                        <HugeiconsIcon icon={ChevronLeft} strokeWidth={2} />
                        Voltar
                      </Button>
                      <Button
                        size="lg"
                        onClick={async () => {
                          const isValid = await validateStep(currentStep);
                          if (isValid) {
                            await onSubmit();
                          }
                        }}
                        disabled={createOrder.isPending}
                        className="w-full sm:w-auto"
                      >
                        {createOrder.isPending ? (
                          <Spinner />
                        ) : (
                          <>
                            <HugeiconsIcon icon={LockKeyhole} strokeWidth={2} />
                            Finalizar pedido{" "}
                            {summary.total.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>

              {/* Order Summary Sidebar */}
              <div className="flex flex-col gap-4">
                <OrderSummaryCard />

                {/* Security Badge */}
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
          )}
        </>
      )}
    </Fragment>
  );
}
