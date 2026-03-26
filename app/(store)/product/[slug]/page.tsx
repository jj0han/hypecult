"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight01Icon,
  ChemistryIcon,
  ChevronDown,
  ChevronRight,
  Clock01Icon,
  Clothes,
  Fire03Icon,
  Info,
  PolicyIcon,
  RulerIcon,
  SearchIcon,
  Share08Icon,
  SlowWindsIcon,
  StarAward02Icon,
  Sun01Icon,
  Truck,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCart } from "@/context/cart-context";
import { useTRPC } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { formatZipCode } from "@/utils/formatters";

const formSchema = z.object({
  cep: z
    .string()
    .min(8, "CEP deve ter 9 dígitos")
    .max(8, "CEP deve ter 9 dígitos"),
});

const sizes = ["PP", "P", "M", "G", "GG", "XG", "XGG"];

const careItems = [
  {
    icon: Clock01Icon,
    title: "Lavar somente 24h após o primeiro uso.",
  },
  {
    icon: Fire03Icon,
    title: "Não lavar com água quente.",
  },
  {
    icon: ChemistryIcon,
    title: "Não usar alvejante à base de cloro.",
  },
  {
    icon: SlowWindsIcon,
    title: "Centrifugação reduzida.",
  },
  {
    icon: Sun01Icon,
    title: "Secar à sombra, pendurada sem torcer.",
  },
  {
    icon: Clothes,
    title: "Nunca passar o ferro na estampa.",
  },
];

const infoItems = [
  {
    icon: StarAward02Icon,
    title: "Qualidade garantida",
    description: "Malha penteada, 100% algodão.",
  },
];

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  const { add } = useCart();
  const trpc = useTRPC();
  const { data, isPending } = useQuery(
    trpc.product.byId.queryOptions({ id: slug })
  );
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cep: "",
    },
  });

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/product/${slug}`
      );
      toast.success("Link copiado para a área de transferência");
    } catch {
      toast.error("Erro ao copiar link");
    }
  }

  const createQuote = useMutation(trpc.gelatoQuote.create.mutationOptions());

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const normalizedCep = values.cep.replace(/\D/g, "");
    if (normalizedCep.length < 8) return;

    const variant = data?.variants.find((v) => v.id === selectedVariant);
    if (!variant?.productUid) return;

    // Lookup address from CEP so we can send a complete recipient to Gelato
    let city = "São Paulo";
    let addressLine1 = "Rua Exemplo";
    try {
      const res = await fetch(`/api/viacep/${normalizedCep}`);
      const viacepData = await res.json();
      if (viacepData?.localidade) city = viacepData.localidade;
      if (viacepData?.logradouro) addressLine1 = viacepData.logradouro;
    } catch {
      // fall through with defaults
    }

    createQuote.mutate({
      orderReferenceId: crypto.randomUUID(),
      customerReferenceId: "guest",
      currency: "BRL",
      allowMultipleQuotes: false,
      recipient: {
        country: "BR",
        firstName: "Cliente",
        lastName: "HypeCult",
        addressLine1,
        city,
        postCode: normalizedCep,
        email: "noreply@hypecult.com",
      },
      products: [
        {
          itemReferenceId: variant.id,
          productUid: variant.productUid,
          quantity: 1,
        },
      ],
    });
  }

  return (
    <div className="px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
          <Breadcrumb className="col-span-full">
            <BreadcrumbList>
              <BreadcrumbItem>
                <Link href="/">Home</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <Link href="/">Produtos</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </BreadcrumbSeparator>
              <BreadcrumbPage className="truncate">
                {isPending ? <Skeleton className="h-4 w-36" /> : data?.name}
              </BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="grid grid-cols-2 gap-4 md:col-span-2 h-fit">
            <Dialog>
              {isPending ? (
                <ProductImageSkeleton />
              ) : (
                data?.images.map((image) => (
                  <DialogTrigger key={image.id}>
                    <div
                      key={image.id}
                      className="relative aspect-square border rounded-lg overflow-hidden size-full!"
                    >
                      <Image
                        key={image.id}
                        src={image.url}
                        alt={data.name}
                        fill
                        objectFit="cover"
                      />
                    </div>
                  </DialogTrigger>
                ))
              )}
              <DialogContent className={"sm:max-w-4xl p-0 overflow-hidden"}>
                <Carousel>
                  <CarouselContent>
                    {data?.images.map((image) => (
                      <CarouselItem
                        key={image.id}
                        className="aspect-square size-full relative"
                      >
                        <Image
                          src={image.url}
                          alt={data.name}
                          fill
                          objectFit="cover"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className={"left-4"} />
                  <CarouselNext className={"right-4"} />
                </Carousel>
              </DialogContent>
            </Dialog>
          </div>
          {isPending ? (
            <ProductSkeleton />
          ) : (
            data && (
              <div className="space-y-6">
                {(() => {
                  const selectedVariantData = data.variants.find(
                    (v) => v.id === selectedVariant
                  );

                  // Effective original (undiscounted) price:
                  // variant.price > product.price (priority order)
                  const originalPrice = Number(
                    selectedVariantData?.price ?? data.price
                  );

                  // Effective final (post-discount) price:
                  // variant.finalPrice > product.finalPrice > original price (fallback when no discount)
                  const effectiveFinalPrice = Number(
                    selectedVariantData?.finalPrice ??
                      data.finalPrice ??
                      originalPrice
                  );

                  const hasDiscount =
                    Number(
                      selectedVariantData?.discountAmount ??
                        data.discountAmount ??
                        0
                    ) > 0;

                  return (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="space-y-4">
                          <h1 className="text-3xl font-bold">{data.name}</h1>
                          <div
                            // biome-ignore lint/security/noDangerouslySetInnerHtml: we need to use dangerouslySetInnerHTML here to render the HTML content
                            dangerouslySetInnerHTML={{
                              __html: data.description,
                            }}
                            className="text-base text-muted-foreground space-y-2"
                          />
                        </div>
                        <Button
                          variant={"link"}
                          size={"icon-lg"}
                          onClick={handleShare}
                        >
                          <HugeiconsIcon
                            icon={Share08Icon}
                            strokeWidth={2}
                            className="size-6"
                          />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold">
                          {effectiveFinalPrice.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                        {hasDiscount && (
                          <p className="text-xl text-muted-foreground line-through">
                            {originalPrice.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base">Tamanho</Label>
                        <RadioGroup
                          className={"flex gap-2"}
                          value={selectedVariant}
                          onValueChange={setSelectedVariant}
                        >
                          {sizes.map((size) => {
                            const variant = data?.variants.find(
                              (v) => v.size === size
                            );
                            return (
                              <FieldLabel
                                key={size}
                                htmlFor={variant?.id}
                                className="aspect-square size-full! max-w-14 flex items-center justify-center relative"
                              >
                                <Field
                                  orientation="horizontal"
                                  className="size-fit! p-0!"
                                >
                                  <RadioGroupItem
                                    value={variant?.id}
                                    id={variant?.id}
                                    disabled={!variant}
                                    className="sr-only absolute"
                                  />
                                  <FieldContent>
                                    <FieldTitle
                                      className={cn(
                                        variant?.id === selectedVariant &&
                                          "text-primary",
                                        !variant &&
                                          "text-muted-foreground line-through"
                                      )}
                                    >
                                      {size}
                                    </FieldTitle>
                                  </FieldContent>
                                </Field>
                              </FieldLabel>
                            );
                          })}
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Button
                          size={"lg"}
                          className="w-full"
                          disabled={!selectedVariant}
                          onClick={() => {
                            if (!selectedVariant) return;
                            const variant = data.variants.find(
                              (v) => v.id === selectedVariant
                            );
                            const itemOriginalPrice = Number(
                              variant?.price ?? data.price
                            );
                            const itemFinalPrice = Number(
                              variant?.finalPrice ??
                                data.finalPrice ??
                                itemOriginalPrice
                            );
                            add({
                              image: data.images[0].url,
                              name: data.name,
                              sku: variant?.productUid ?? data.sku,
                              color: variant?.color ?? "",
                              price: itemFinalPrice,
                              originalPrice:
                                itemFinalPrice < itemOriginalPrice
                                  ? itemOriginalPrice
                                  : undefined,
                              discountType: (variant?.discountType ??
                                data.discountType) as
                                | "percentage"
                                | "fixed"
                                | undefined,
                              discountAmount: variant?.discountAmount
                                ? Number(variant.discountAmount)
                                : data.discountAmount
                                  ? Number(data.discountAmount)
                                  : undefined,
                              quantity: 1,
                              variantId: selectedVariant,
                              productId: data.id,
                              size: variant?.size ?? undefined,
                            });
                          }}
                        >
                          Adicionar ao carrinho
                        </Button>
                        <Button
                          variant={"outline"}
                          size={"lg"}
                          className="w-full"
                        >
                          Salvar como favorito
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-base">Calcular frete</Label>
                            <Link
                              href={
                                "https://buscacepinter.correios.com.br/app/endereco/index.php"
                              }
                              target="_blank"
                              className="text-sm text-muted-foreground"
                            >
                              Não sei meu CEP
                            </Link>
                          </div>
                          <form onSubmit={form.handleSubmit(onSubmit)}>
                            <Controller
                              name="cep"
                              control={form.control}
                              render={({ field, fieldState }) => (
                                <Field data-invalid={fieldState.invalid}>
                                  <InputGroup>
                                    <InputGroupInput
                                      {...field}
                                      aria-invalid={fieldState.invalid}
                                      maxLength={9}
                                      type="text"
                                      placeholder="CEP"
                                      disabled={
                                        createQuote.isPending ||
                                        !selectedVariant
                                      }
                                      value={formatZipCode(field.value)}
                                      onChange={(e) => {
                                        field.onChange(
                                          e.target.value.replace(/\D/g, "")
                                        );
                                      }}
                                    />
                                    <InputGroupAddon align="inline-end">
                                      <InputGroupButton
                                        variant={"destructive"}
                                        size={"xs"}
                                        disabled={
                                          createQuote.isPending ||
                                          !selectedVariant
                                        }
                                        type="submit"
                                      >
                                        {createQuote.isPending ? (
                                          <Spinner strokeWidth={2} />
                                        ) : (
                                          <>
                                            <HugeiconsIcon
                                              icon={SearchIcon}
                                              strokeWidth={2}
                                            />
                                            <span>Calcular</span>
                                          </>
                                        )}
                                      </InputGroupButton>
                                    </InputGroupAddon>
                                  </InputGroup>
                                  {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                  )}
                                </Field>
                              )}
                            />
                          </form>
                          <Link
                            href="https://www.correios.com.br/a-correios/precisa-de-ajuda/politica-de-frete-e-entrega"
                            target="_blank"
                            className="text-sm text-muted-foreground"
                          >
                            Política de Frete e Entrega
                          </Link>
                        </div>
                        {createQuote.data && (
                          <ItemGroup>
                            {createQuote.data.quotes
                              .flatMap((q) => q.shipmentMethods)
                              .map((method) => (
                                <Item
                                  key={method.shipmentMethodUid}
                                  variant="muted"
                                >
                                  <ItemMedia>
                                    <HugeiconsIcon
                                      icon={Truck}
                                      strokeWidth={2}
                                    />
                                  </ItemMedia>
                                  <ItemContent className="gap-1">
                                    <ItemTitle>{method.name}</ItemTitle>
                                    <ItemDescription>
                                      {method.minDeliveryDays}–
                                      {method.maxDeliveryDays} dias úteis -{" "}
                                      {method.price.toLocaleString("pt-BR", {
                                        style: "currency",
                                        currency: method.currency,
                                      })}
                                    </ItemDescription>
                                  </ItemContent>
                                </Item>
                              ))}
                          </ItemGroup>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base">
                          Informações do produto
                        </Label>
                        <ItemGroup>
                          {infoItems.map((item) => (
                            <Item key={item.title} variant="outline">
                              <ItemMedia>
                                <HugeiconsIcon
                                  icon={item.icon}
                                  strokeWidth={2}
                                />
                              </ItemMedia>
                              <ItemContent className="gap-1">
                                <ItemTitle>{item.title}</ItemTitle>
                                <ItemDescription>
                                  {item.description}
                                </ItemDescription>
                              </ItemContent>
                            </Item>
                          ))}
                          <Collapsible className="space-y-2">
                            <Item variant="outline">
                              <ItemMedia>
                                <HugeiconsIcon
                                  icon={RulerIcon}
                                  strokeWidth={2}
                                />
                              </ItemMedia>
                              <ItemContent>
                                <ItemTitle>Tabela de medidas</ItemTitle>
                              </ItemContent>
                              <ItemActions>
                                <CollapsibleTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 group"
                                    >
                                      <HugeiconsIcon
                                        icon={ChevronRight}
                                        strokeWidth={2}
                                        className="group-aria-expanded:hidden"
                                      />
                                      <HugeiconsIcon
                                        icon={ChevronDown}
                                        strokeWidth={2}
                                        className="group-aria-[expanded=false]:hidden"
                                      />
                                      <span className="sr-only">
                                        Toggle details
                                      </span>
                                    </Button>
                                  }
                                />
                              </ItemActions>
                            </Item>
                            <CollapsibleContent className="space-y-2">
                              <Item variant="muted">
                                <ItemContent className="w-full">
                                  <ScrollArea>
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead />
                                          <TableHead>PP</TableHead>
                                          <TableHead>P</TableHead>
                                          <TableHead>M</TableHead>
                                          <TableHead>G</TableHead>
                                          <TableHead>GG</TableHead>
                                          <TableHead>XG</TableHead>
                                          <TableHead>XGG</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        <TableRow>
                                          <TableCell className="font-medium">
                                            Largura (cm)
                                          </TableCell>
                                          <TableCell>81</TableCell>
                                          <TableCell>91</TableCell>
                                          <TableCell>101</TableCell>
                                          <TableCell>112</TableCell>
                                          <TableCell>122</TableCell>
                                          <TableCell>132</TableCell>
                                          <TableCell>142</TableCell>
                                        </TableRow>
                                        <TableRow>
                                          <TableCell className="font-medium">
                                            Comprimento (cm)
                                          </TableCell>
                                          <TableCell>68</TableCell>
                                          <TableCell>71</TableCell>
                                          <TableCell>74</TableCell>
                                          <TableCell>76</TableCell>
                                          <TableCell>78</TableCell>
                                          <TableCell>81</TableCell>
                                          <TableCell>86</TableCell>
                                        </TableRow>
                                      </TableBody>
                                      <TableCaption className="text-left">
                                        Percentual de encolhimento pós lavagem:
                                        Comprimento: 10%, Largura: 5%
                                      </TableCaption>
                                    </Table>
                                    <ScrollBar orientation="horizontal" />
                                  </ScrollArea>
                                </ItemContent>
                              </Item>
                            </CollapsibleContent>
                          </Collapsible>
                          <Collapsible className="space-y-2">
                            <Item variant="outline">
                              <ItemMedia>
                                <HugeiconsIcon icon={Info} strokeWidth={2} />
                              </ItemMedia>
                              <ItemContent>
                                <ItemTitle>Cuidados com o produto</ItemTitle>
                              </ItemContent>
                              <ItemActions>
                                <CollapsibleTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 group"
                                    >
                                      <HugeiconsIcon
                                        icon={ChevronRight}
                                        strokeWidth={2}
                                        className="group-aria-expanded:hidden"
                                      />
                                      <HugeiconsIcon
                                        icon={ChevronDown}
                                        strokeWidth={2}
                                        className="group-aria-[expanded=false]:hidden"
                                      />
                                      <span className="sr-only">
                                        Toggle details
                                      </span>
                                    </Button>
                                  }
                                />
                              </ItemActions>
                            </Item>

                            <CollapsibleContent className="space-y-2">
                              {careItems.map((item) => (
                                <Item variant="muted" key={item.title}>
                                  <ItemMedia>
                                    <HugeiconsIcon
                                      icon={item.icon}
                                      strokeWidth={2}
                                    />
                                  </ItemMedia>
                                  <ItemContent>
                                    <ItemTitle>{item.title}</ItemTitle>
                                  </ItemContent>
                                </Item>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                          <Collapsible className="space-y-2">
                            <Item variant="outline">
                              <ItemMedia>
                                <HugeiconsIcon
                                  icon={PolicyIcon}
                                  strokeWidth={2}
                                />
                              </ItemMedia>
                              <ItemContent>
                                <ItemTitle>Devoluções e garantia</ItemTitle>
                              </ItemContent>
                              <ItemActions>
                                <CollapsibleTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 group"
                                    >
                                      <HugeiconsIcon
                                        icon={ChevronRight}
                                        strokeWidth={2}
                                        className="group-aria-expanded:hidden"
                                      />
                                      <HugeiconsIcon
                                        icon={ChevronDown}
                                        strokeWidth={2}
                                        className="group-aria-[expanded=false]:hidden"
                                      />
                                      <span className="sr-only">
                                        Alternar detalhes da política
                                      </span>
                                    </Button>
                                  }
                                />
                              </ItemActions>
                            </Item>
                            <CollapsibleContent className="space-y-2">
                              <Item variant="muted">
                                <ItemContent className="gap-3">
                                  <ItemDescription className="text-foreground space-y-3 text-sm leading-relaxed line-clamp-none">
                                    <p>
                                      <strong className="font-medium text-foreground">
                                        Fonte da política:
                                      </strong>{" "}
                                      Os pedidos são produzidos e enviados via{" "}
                                      <strong className="font-medium text-foreground">
                                        Gelato
                                      </strong>{" "}
                                      (print-on-demand). As regras abaixo
                                      espelham a{" "}
                                      <a
                                        href="https://support.gelato.com/en/articles/8996072-what-is-your-return-policy-and-quality-guarantee"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline underline-offset-2 hover:text-foreground"
                                      >
                                        política oficial de devoluções e
                                        garantia de qualidade da Gelato
                                      </a>
                                      , que é a base operacional desta loja.
                                    </p>
                                    <p>
                                      <strong className="font-medium text-foreground">
                                        Sem devoluções de produto cumprido:
                                      </strong>{" "}
                                      A Gelato não fornece endereço de devolução
                                      nem aceita devolução de itens já
                                      produzidos sob encomenda.{" "}
                                      <strong className="font-medium text-foreground">
                                        Esta loja não aceita devoluções
                                      </strong>{" "}
                                      por troca de ideia, tamanho ou preferência
                                      após o pedido ter sido fabricado. Novo
                                      pedido, se aplicável, é tratado como
                                      compra nova (custos conforme caso).
                                    </p>
                                    <p>
                                      <strong className="font-medium text-foreground">
                                        Garantia de qualidade (Gelato):
                                      </strong>{" "}
                                      Defeito de fabricação, dano no transporte
                                      ou quantidade incorreta — quando não
                                      decorrentes de arquivo ou conteúdo enviado
                                      pelo cliente — devem ser reportados{" "}
                                      <strong className="font-medium text-foreground">
                                        em até 30 dias
                                      </strong>{" "}
                                      após o recebimento, com evidência (ex.{" "}
                                      fotos). Se a análise da Gelato validar a
                                      reclamação, a resolução segue o fluxo do
                                      parceiro:{" "}
                                      <strong className="font-medium text-foreground">
                                        reposição
                                      </strong>{" "}
                                      ou, se inviável,{" "}
                                      <strong className="font-medium text-foreground">
                                        reembolso
                                      </strong>
                                      . Variações de cor dentro da tolerância do
                                      processo de impressão não são cobertas.
                                      Extravio, devolução ao remetente e casos
                                      de endereço/recusa/retirada seguem as
                                      regras da transportadora e da documentação
                                      da Gelato.
                                    </p>
                                    <p className="border-border text-muted-foreground border-l-2 pl-3 text-xs leading-relaxed">
                                      <strong className="text-foreground">
                                        Orientação Gelato para donos de loja
                                        (print-on-demand):
                                      </strong>{" "}
                                      A Gelato informa que, como parceira POD,
                                      não fornece endereço de devolução nem
                                      aceita devolução de pedidos já cumpridos;
                                      cabe à loja definir a política exibida ao
                                      cliente, podendo espelhar a da Gelato ou
                                      adaptar conforme a operação.{" "}
                                      <strong className="text-foreground">
                                        A Hypecult® adota o mesmo recorte da
                                        Gelato: sem devoluções de itens já
                                        produzidos, com garantia de qualidade
                                        conforme descrito acima e na
                                        documentação do parceiro.
                                      </strong>{" "}
                                      <a
                                        href="https://www.gelato.com"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline underline-offset-2 hover:text-foreground"
                                      >
                                        gelato.com
                                      </a>
                                      .
                                    </p>
                                  </ItemDescription>
                                </ItemContent>
                              </Item>
                            </CollapsibleContent>
                          </Collapsible>
                        </ItemGroup>
                      </div>
                    </>
                  );
                })()}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2 w-full">
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-5 w-2/3" />
        </div>
        <Skeleton className="size-10" />
      </div>
      <Skeleton className="h-8 w-1/2" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/6" />
        <div className="flex gap-2">
          <Skeleton className="size-12" />
          <Skeleton className="size-12" />
          <Skeleton className="size-12" />
          <Skeleton className="size-12" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

function ProductImageSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 col-span-full md:col-span-2 h-fit">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton
          key={`skeleton-${
            // biome-ignore lint/suspicious/noArrayIndexKey: we need to use the index as a key
            index
          }`}
          className="aspect-square rounded-lg size-full"
        />
      ))}
    </div>
  );
}
