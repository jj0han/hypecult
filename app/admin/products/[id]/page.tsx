"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Cloud,
  ExternalLink,
  Info,
  Plus,
  Share04Icon,
  Trash2,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { CloudinaryUploadWidgetResults } from "next-cloudinary";
import { CldImage, CldUploadWidget } from "next-cloudinary";
import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { ProductType } from "@/server/db/generated/prisma/enums";
import { computeFinalPrice } from "@/server/lib/pricing";
import { formatCurrency } from "@/utils/formatters";

const productTypeLabel: Record<ProductType, string> = {
  tshirt: "Camiseta",
  hoodie: "Moletom",
  mug: "Caneca",
  sticker: "Adesivo",
  other: "Outro",
};

const discountTypeLabel: Record<string, string> = {
  none: "Sem desconto",
  percentage: "Percentual (%)",
  fixed: "Fixo (R$)",
};

const variantSchema = z.object({
  id: z.string(),
  color: z.string(),
  size: z.string().nullable(),
  stock: z.number().int().min(0, "Estoque deve ser ≥ 0"),
  price: z.number().positive("Preço deve ser > 0").nullable(),
  discountType: z.enum(["percentage", "fixed"]).nullable(),
  discountAmount: z.number().min(0, "Desconto deve ser ≥ 0").nullable(),
  finalPrice: z.number().min(0, "Preço final deve ser ≥ 0").nullable(),
});

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string(),
  active: z.boolean(),
  price: z.number().positive("Preço deve ser > 0"),
  discountType: z.enum(["percentage", "fixed"]).nullable(),
  discountAmount: z.number().min(0, "Desconto deve ser ≥ 0").nullable(),
  finalPrice: z.number().min(0, "Preço final deve ser ≥ 0"),
  variants: z.array(variantSchema),
});

type FormValues = z.infer<typeof formSchema>;

export default function AdminProductEditPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const product = useQuery(trpc.product.byId.queryOptions({ id }));

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      active: true,
      price: 0,
      discountType: null,
      discountAmount: null,
      finalPrice: 0,
      variants: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "variants",
    keyName: "_key",
  });

  useEffect(() => {
    if (!product.data) return;
    const p = product.data;
    form.reset({
      name: p.name,
      description: p.description,
      active: p.active,
      price: Number(p.price),
      discountType: p.discountType ?? null,
      discountAmount: p.discountAmount ? Number(p.discountAmount) : null,
      finalPrice: Number(p.finalPrice ?? p.price),
      variants: p.variants.map((v) => ({
        id: v.id,
        color: v.color,
        size: v.size ?? null,
        stock: v.stock,
        price: v.price ? Number(v.price) : null,
        discountType: v.discountType ?? null,
        discountAmount: v.discountAmount ? Number(v.discountAmount) : null,
        finalPrice: v.finalPrice ? Number(v.finalPrice) : null,
      })),
    });
  }, [product.data, form]);

  // Auto-compute product-level finalPrice when price or discount fields change
  const watchedPrice = form.watch("price");
  const watchedDiscountType = form.watch("discountType");
  const watchedDiscountAmount = form.watch("discountAmount");

  useEffect(() => {
    const computed = computeFinalPrice(
      watchedPrice ?? 0,
      watchedDiscountType,
      watchedDiscountAmount
    );
    form.setValue("finalPrice", computed, { shouldValidate: false });
  }, [watchedPrice, watchedDiscountType, watchedDiscountAmount, form]);

  const recomputeVariantFinalPrice = (index: number) => {
    const variant = form.getValues(`variants.${index}`);
    const basePrice = variant.price ?? form.getValues("price") ?? 0;
    const computed = computeFinalPrice(
      basePrice,
      variant.discountType,
      variant.discountAmount
    );
    form.setValue(`variants.${index}.finalPrice`, computed, {
      shouldValidate: false,
    });
  };

  const update = useMutation(
    trpc.product.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Produto atualizado");
        await queryClient.invalidateQueries({
          queryKey: trpc.product.adminList.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.product.byId.queryKey({ id }),
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const addImage = useMutation(
    trpc.product.addImage.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.product.byId.queryKey({ id }),
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const removeImage = useMutation(
    trpc.product.removeImage.mutationOptions({
      onSuccess: async () => {
        toast.success("Imagem removida");
        await queryClient.invalidateQueries({
          queryKey: trpc.product.byId.queryKey({ id }),
        });
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const handleUploadSuccess = (results: CloudinaryUploadWidgetResults) => {
    if (results.event !== "success" || !results.info) return;
    const info = results.info as {
      public_id: string;
      secure_url: string;
      original_filename?: string;
    };
    addImage.mutate({
      productId: id,
      publicId: info.public_id,
      url: info.secure_url,
      alt: info.original_filename,
    });
  };

  const onSubmit = form.handleSubmit((values) => {
    update.mutate({
      id,
      name: values.name,
      description: values.description,
      active: values.active,
      price: values.price,
      discountType: values.discountType,
      discountAmount: values.discountAmount,
      finalPrice: values.finalPrice,
      variants: values.variants.map((v) => ({
        id: v.id,
        stock: v.stock,
        price: v.price,
        discountType: v.discountType,
        discountAmount: v.discountAmount,
        finalPrice: v.finalPrice,
      })),
    });
  });

  const onChangeImageOrder = (imageId: string, order: number) => {
    const images = p.images
      .filter((image) => image.id !== imageId)
      .map((image, index) => ({
        id: image.id,
        order: index,
      }));
    if (order < 0 || order > images.length) return;
    images.splice(order, 0, { id: imageId, order });
    update.mutate({
      id,
      images: images.map((image, index) => ({
        id: image.id,
        order: index,
      })),
    });
  };

  const applyDiscountToAllVariants = () => {
    const { discountType, discountAmount, price } = form.getValues();
    const variants = form.getValues("variants");
    variants.forEach((variant, index) => {
      const basePrice = variant.price ?? price ?? 0;
      const computed = computeFinalPrice(
        basePrice,
        discountType,
        discountAmount
      );
      form.setValue(`variants.${index}.discountType`, discountType, {
        shouldDirty: true,
      });
      form.setValue(`variants.${index}.discountAmount`, discountAmount, {
        shouldDirty: true,
      });
      form.setValue(`variants.${index}.finalPrice`, computed, {
        shouldDirty: true,
      });
    });
    toast("Desconto aplicado a todas as variantes", {
      description: "Salve antes de sair da página",
      icon: (
        <HugeiconsIcon
          icon={Info}
          strokeWidth={2}
          className="size-4 text-primary"
        />
      ),
    });
  };

  if (product.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (product.isError || !product.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Produto não encontrado</CardTitle>
          <CardDescription>
            Produto não encontrado ou sem permissão para visualização.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const p = product.data;
  const displayPrice = Number(p.finalPrice ?? p.price);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex md:flex-row flex-col md:justify-between md:items-center">
          <div className="space-y-2">
            <CardTitle>Dados da Gelato</CardTitle>
            <CardDescription>
              Somente leitura (definidos na sincronização).
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <ButtonGroup>
              <Button render={<Link href={"https://dashboard.gelato.com/home/dashboard"} target="_blank" />} variant="ghost">
                Gelato
                <HugeiconsIcon icon={Share04Icon} strokeWidth={2} />
              </Button>
              <Button render={<Link href={`/product/${p.id}`} />} variant="link">
                Ver na loja
                <HugeiconsIcon icon={ExternalLink} strokeWidth={2} />
              </Button>
            </ButtonGroup>
          </div>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">SKU</span>
            <span className="font-mono">{p.sku}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Tipo</span>
            <span>{productTypeLabel[p.type]}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Preço (vitrine)</span>
            <span>{formatCurrency(displayPrice)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">ID Gelato</span>
            <span className="font-mono text-xs truncate max-w-[60%] text-right">
              {p.gelatoProductId ?? "—"}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:Cards-center md:justify-between">
          <div className="space-y-2">
            <CardTitle>Imagens</CardTitle>
            <CardDescription>
              Adicione ou remova imagens do produto.
            </CardDescription>
          </div>
          <CldUploadWidget
            options={{
              sources: ["local", "url", "google_drive"],
              multiple: true,
              maxFiles: 6 - (p.images.length ?? 0),
              language: "pt-BR",
            }}
            uploadPreset="hypecult"
            onSuccess={handleUploadSuccess}
            onQueuesEnd={(_result, { widget }) => {
              widget.close();
            }}
          >
            {({ open }) => (
              <Button
                onClick={() => open()}
                disabled={p.images.length >= 6 || addImage.isPending}
              >
                Adicionar
                {addImage.isPending ? (
                  <Spinner />
                ) : (
                  <HugeiconsIcon icon={Plus} strokeWidth={2} />
                )}
              </Button>
            )}
          </CldUploadWidget>
        </CardHeader>
        <CardContent>
          {p.images.length === 0 ? (
            <CldUploadWidget
              options={{
                sources: ["local", "url", "google_drive"],
                multiple: true,
                maxFiles: 6 - (p.images.length ?? 0),
                language: "pt-BR",
              }}
              uploadPreset="hypecult"
              onSuccess={handleUploadSuccess}
              onQueuesEnd={(_result, { widget }) => {
                widget.close();
              }}
            >
              {({ open }) => (
                <Empty className="border border-dashed" onClick={() => open()}>
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <HugeiconsIcon icon={Cloud} strokeWidth={2} />
                    </EmptyMedia>
                    <EmptyTitle>Cloudinary</EmptyTitle>
                    <EmptyDescription>
                      Faça o upload de imagens para o seu armazenamento em nuvem
                      para acessá-las em qualquer lugar.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button variant="outline" size="sm">
                      Fazer upload
                    </Button>
                  </EmptyContent>
                </Empty>
              )}
            </CldUploadWidget>
          ) : (
            <Carousel>
              <CarouselContent>
                {p.images.map((image) => (
                  <CarouselItem
                    key={image.id}
                    className="basis-full md:basis-1/3"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden border group">
                      <CldImage
                        src={image.publicId ?? image.url}
                        alt={image.alt ?? ""}
                        fill
                        crop="fill"
                        gravity="auto"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                      <ButtonGroup className="absolute top-1.5 left-1.5 z-10">
                        <Button
                          disabled={image.order === 0 || update.isPending}
                          type="button"
                          size="icon-xs"
                          variant="secondary"
                          onClick={() =>
                            onChangeImageOrder(image.id, image.order - 1)
                          }
                        >
                          <HugeiconsIcon icon={ChevronLeft} strokeWidth={2} />
                        </Button>
                        <Button
                          disabled={
                            image.order === p.images.length - 1 ||
                            update.isPending
                          }
                          type="button"
                          size="icon-xs"
                          variant="secondary"
                          onClick={() =>
                            onChangeImageOrder(image.id, image.order + 1)
                          }
                        >
                          <HugeiconsIcon icon={ChevronRight} strokeWidth={2} />
                        </Button>
                      </ButtonGroup>
                      <Button
                        type="button"
                        aria-label="Remover imagem"
                        onClick={() =>
                          removeImage.mutate({ imageId: image.id })
                        }
                        disabled={removeImage.isPending}
                        size="icon-xs"
                        variant={"destructive"}
                        className="absolute top-1.5 right-1.5 z-10"
                      >
                        <HugeiconsIcon icon={Trash2} strokeWidth={2} />
                      </Button>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className={"left-4"} />
              <CarouselNext className={"right-4"} />
            </Carousel>
          )}
        </CardContent>
      </Card>

      <form onSubmit={onSubmit} className="space-y-6">
        {/* Storefront content */}
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo da vitrine</CardTitle>
            <CardDescription>
              Estes campos são exibidos na loja e podem ser editados sem nova
              sincronização.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="product-name">Nome</FieldLabel>
                    <Input id="product-name" {...field} autoComplete="off" />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="description"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Descrição</FieldLabel>
                    <RichTextEditor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      placeholder="Descreva o produto…"
                      disabled={field.disabled}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="active"
                control={form.control}
                render={({ field }) => (
                  <Field className="flex flex-row Cards-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FieldLabel htmlFor="product-active">
                        Ativo na loja
                      </FieldLabel>
                      <p className="text-sm text-muted-foreground">
                        Desative para ocultar o produto sem apagar o registro.
                      </p>
                    </div>
                    <Switch
                      id="product-active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Product-level pricing */}
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <CardTitle>Preços do produto</CardTitle>
              <CardDescription>
                Defina o preço base, desconto e preço final. O preço final é
                calculado automaticamente mas pode ser editado manualmente.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applyDiscountToAllVariants}
              disabled={fields.length === 0}
            >
              Aplicar a todas as variantes
            </Button>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Controller
                  name="price"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-price">
                        Preço base
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <InputGroupText>R$</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          id="product-price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                        />
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="discountType"
                  control={form.control}
                  render={({ field }) => (
                    <Field>
                      <FieldLabel>Tipo de desconto</FieldLabel>
                      <Select
                        value={field.value ?? "none"}
                        onValueChange={(val) =>
                          field.onChange(val === "none" ? null : val)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue>
                            {discountTypeLabel[field.value ?? "none"]}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sem desconto</SelectItem>
                          <SelectItem value="percentage">
                            Percentual (%)
                          </SelectItem>
                          <SelectItem value="fixed">Fixo (R$)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  )}
                />

                <Controller
                  name="discountAmount"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-discount-amount">
                        Valor do desconto
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <InputGroupText>
                            {form.watch("discountType") === "percentage"
                              ? "%"
                              : form.watch("discountType") === "fixed"
                                ? "R$"
                                : ""}
                          </InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          id="product-discount-amount"
                          type="number"
                          step="0.01"
                          min="0"
                          disabled={!watchedDiscountType}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? null
                                : Number(e.target.value)
                            )
                          }
                        />
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="finalPrice"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="product-final-price">
                        Preço final
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <InputGroupText>R$</InputGroupText>
                        </InputGroupAddon>
                        <InputGroupInput
                          id="product-final-price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ? 0 : Number(e.target.value)
                            )
                          }
                        />
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Per-variant editing */}
        {fields.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Variantes</CardTitle>
              <CardDescription>
                Edite estoque, preço e desconto por variante. O preço final é
                calculado automaticamente. Deixe o preço vazio para herdar o
                preço do produto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cor</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Preço (R$)</TableHead>
                    <TableHead>Tipo desconto</TableHead>
                    <TableHead>Valor desconto</TableHead>
                    <TableHead>Preço final (R$)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field._key}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {field.color}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {field.size ?? "—"}
                      </TableCell>

                      {/* Stock */}
                      <TableCell>
                        <Controller
                          name={`variants.${index}.stock`}
                          control={form.control}
                          render={({ field: f, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <Input
                                type="number"
                                step="1"
                                min="0"
                                className="w-24"
                                aria-label="Estoque"
                                value={f.value ?? ""}
                                onChange={(e) =>
                                  f.onChange(
                                    e.target.value === ""
                                      ? 0
                                      : Math.floor(Number(e.target.value))
                                  )
                                }
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                      </TableCell>

                      {/* Price */}
                      <TableCell>
                        <Controller
                          name={`variants.${index}.price`}
                          control={form.control}
                          render={({ field: f, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-28"
                                aria-label="Preço"
                                placeholder={String(
                                  form.getValues("price") ?? ""
                                )}
                                value={f.value ?? ""}
                                onChange={(e) => {
                                  f.onChange(
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value)
                                  );
                                  recomputeVariantFinalPrice(index);
                                }}
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                      </TableCell>

                      {/* Discount type */}
                      <TableCell>
                        <Controller
                          name={`variants.${index}.discountType`}
                          control={form.control}
                          render={({ field: f }) => (
                            <Select
                              value={f.value ?? "none"}
                              onValueChange={(val) => {
                                f.onChange(val === "none" ? null : val);
                                recomputeVariantFinalPrice(index);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue>
                                  {discountTypeLabel[f.value ?? "none"]}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">
                                  Sem desconto
                                </SelectItem>
                                <SelectItem value="percentage">
                                  Percentual (%)
                                </SelectItem>
                                <SelectItem value="fixed">Fixo (R$)</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </TableCell>

                      {/* Discount amount */}
                      <TableCell>
                        <Controller
                          name={`variants.${index}.discountAmount`}
                          control={form.control}
                          render={({ field: f, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-28"
                                aria-label="Valor do desconto"
                                disabled={
                                  !form.watch(`variants.${index}.discountType`)
                                }
                                value={f.value ?? ""}
                                onChange={(e) => {
                                  f.onChange(
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value)
                                  );
                                  recomputeVariantFinalPrice(index);
                                }}
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                      </TableCell>

                      {/* Final price */}
                      <TableCell>
                        <Controller
                          name={`variants.${index}.finalPrice`}
                          control={form.control}
                          render={({ field: f, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-28"
                                aria-label="Preço final"
                                value={f.value ?? ""}
                                onChange={(e) =>
                                  f.onChange(
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value)
                                  )
                                }
                              />
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardFooter className="flex flex-wrap gap-2 justify-between">
            <Link
              href={"/admin/products" as Route}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              <HugeiconsIcon icon={ArrowLeft} strokeWidth={2} />
              Voltar
            </Link>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? "Salvando…" : "Salvar alterações"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
