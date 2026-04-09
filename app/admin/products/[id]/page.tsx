"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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

  const onSubmit = form.handleSubmit((values) => {
    update.mutate({
      id,
      name: values.name,
      description: values.description,
      active: values.active,
    });
  });

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
      <div>
        <h2 className="text-lg font-semibold">Editar produto</h2>
        <p className="text-sm text-muted-foreground">
          Ajuste nome, descrição e visibilidade na loja. Preço e variantes vêm
          da sincronização Gelato.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da Gelato</CardTitle>
          <CardDescription>
            Somente leitura (definidos na sincronização).
          </CardDescription>
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

      <form onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conteúdo da vitrine</CardTitle>
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
                  <Field className="flex flex-row items-center justify-between rounded-lg border p-4">
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
              Cancelar
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
