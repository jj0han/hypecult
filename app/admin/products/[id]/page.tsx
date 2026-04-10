"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Cloud,
  ExternalLink,
  Plus,
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
import { Controller, useForm } from "react-hook-form";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import type { ProductType } from "@/server/db/generated/prisma/enums";
import { formatCurrency } from "@/utils/formatters";

const productTypeLabel: Record<ProductType, string> = {
  tshirt: "Camiseta",
  hoodie: "Moletom",
  mug: "Caneca",
  sticker: "Adesivo",
  other: "Outro",
};

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string(),
  active: z.boolean(),
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
    },
  });

  useEffect(() => {
    if (!product.data) return;
    form.reset({
      name: product.data.name,
      description: product.data.description,
      active: product.data.active,
    });
  }, [product.data, form]);

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
          <Button render={<Link href={`/product/${p.id}`} />}>
            Ver na loja
            <HugeiconsIcon icon={ExternalLink} strokeWidth={2} />
          </Button>
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

      <form onSubmit={onSubmit}>
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
                    <FieldLabel htmlFor="product-description">
                      Descrição
                    </FieldLabel>
                    <Textarea id="product-description" rows={6} {...field} />
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
