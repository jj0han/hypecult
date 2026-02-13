"use client";
import {
  ArrowRight01Icon,
  ChemistryIcon,
  ChevronDown,
  ChevronRight,
  Clock01Icon,
  Clothes,
  Fire03Icon,
  Info,
  RulerIcon,
  SearchIcon,
  Share08Icon,
  SlowWindsIcon,
  StarAward02Icon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Field,
  FieldContent,
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
import { Skeleton } from "@/components/ui/skeleton";
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

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  const { add } = useCart();
  const trpc = useTRPC();
  const { data, isPending } = useQuery(
    trpc.product.byId.queryOptions({ id: slug })
  );
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

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
      description:
        "Malha penteada fio 26.1, 100% algodão, acabamento lixado, gramatura 180g/m².",
    },
  ];

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
                <Link href="/product">Produtos</Link>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </BreadcrumbSeparator>
              <BreadcrumbPage>
                {isPending ? <Skeleton className="h-4 w-36" /> : data?.name}
              </BreadcrumbPage>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="grid grid-cols-2 gap-4 md:col-span-2 h-fit">
            {isPending ? (
              <ProductImageSkeleton />
            ) : (
              data?.images.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square border rounded-lg size-full!"
                >
                  <Image
                    key={image.id}
                    src={image.url}
                    alt={data.name}
                    fill
                    className="object-contain"
                  />
                </div>
              ))
            )}
          </div>
          {isPending ? (
            <ProductSkeleton />
          ) : (
            data && (
              <div className="space-y-6">
                {(() => {
                  const productPrice = Number(data.price);
                  return (
                    <>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h1 className="text-3xl font-bold">{data.name}</h1>
                          <p className="text-base text-muted-foreground">
                            {data.description}
                          </p>
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
                          {productPrice.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                        {/* <p className="text-xl text-muted-foreground line-through">
                          {productPrice.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p> */}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-base">Tamanho</Label>
                        <RadioGroup
                          className={"flex gap-2"}
                          value={selectedVariant}
                          onValueChange={setSelectedVariant}
                        >
                          {data.variants.map((variant) => (
                            <FieldLabel
                              key={variant.id}
                              htmlFor={variant.id}
                              className="aspect-square size-12! flex items-center justify-center relative"
                            >
                              <Field
                                orientation="horizontal"
                                className="size-fit! p-0!"
                              >
                                <RadioGroupItem
                                  value={variant.id}
                                  id={variant.id}
                                  className="sr-only absolute"
                                />
                                <FieldContent>
                                  <FieldTitle>{variant.size}</FieldTitle>
                                </FieldContent>
                              </Field>
                            </FieldLabel>
                          ))}
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
                            add({
                              image: data.images[0].url,
                              name: data.name,
                              price: productPrice,
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
                        <InputGroup>
                          <InputGroupInput type="text" placeholder="CEP" />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              variant={"destructive"}
                              size={"xs"}
                            >
                              <HugeiconsIcon
                                icon={SearchIcon}
                                strokeWidth={2}
                              />
                              Calcular
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                        <Link
                          href="https://www.correios.com.br/a-correios/precisa-de-ajuda/politica-de-frete-e-entrega"
                          target="_blank"
                          className="text-sm text-muted-foreground"
                        >
                          Política de Frete e Entrega
                        </Link>
                      </div>

                      <ItemGroup>
                        {infoItems.map((item) => (
                          <Item key={item.title} variant="outline">
                            <ItemMedia>
                              <HugeiconsIcon icon={item.icon} strokeWidth={2} />
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
                              <HugeiconsIcon icon={RulerIcon} strokeWidth={2} />
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
                              <ItemContent>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead />
                                      <TableHead>P</TableHead>
                                      <TableHead>M</TableHead>
                                      <TableHead>G</TableHead>
                                      <TableHead>GG</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell className="font-medium">
                                        Larg. (cm)
                                      </TableCell>
                                      <TableCell>46-50</TableCell>
                                      <TableCell>48-52</TableCell>
                                      <TableCell>56-60</TableCell>
                                      <TableCell>59-63</TableCell>
                                    </TableRow>
                                    <TableRow>
                                      <TableCell className="font-medium">
                                        Compr. (cm)
                                      </TableCell>
                                      <TableCell>65-69</TableCell>
                                      <TableCell>67-71</TableCell>
                                      <TableCell>72-76</TableCell>
                                      <TableCell>73-77</TableCell>
                                    </TableRow>
                                  </TableBody>
                                  <TableCaption className="text-left">
                                    Percentual de encolhimento pós lavagem:
                                    Comprimento: 10%, Largura: 5%
                                  </TableCaption>
                                </Table>
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
                      </ItemGroup>
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
    <div className="grid grid-cols-2 gap-4 md:col-span-2 h-fit">
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
