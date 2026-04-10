"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CalendarIcon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useTRPC } from "@/lib/trpc";

const formSchema = z.object({
  code: z.string().min(1, "Código é obrigatório"),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountAmount: z.number().nonnegative("Informe um valor válido"),
  freeShipping: z.boolean(),
  freeShippingMaxAmount: z.number().positive().nullish(),
  allowOnDiscountedItems: z.boolean(),
  limit: z.number().int().positive().nullish(),
  userLimit: z.number().int().positive().nullish(),
  minOrderAmount: z.number().positive().nullish(),
  maxOrderAmount: z.number().positive().nullish(),
  expiresAt: z.string().optional(),
  active: z.boolean(),
});

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export default function AdminPromotionEditPage() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();

  const promotion = useQuery(trpc.promotion.adminById.queryOptions(id));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      description: "",
      discountType: "percentage",
      discountAmount: 0,
      freeShipping: false,
      freeShippingMaxAmount: undefined,
      allowOnDiscountedItems: true,
      limit: undefined,
      userLimit: undefined,
      minOrderAmount: undefined,
      maxOrderAmount: undefined,
      expiresAt: "",
      active: true,
    },
  });

  useEffect(() => {
    if (!promotion.data) return;
    const p = promotion.data;
    form.reset({
      code: p.code,
      description: p.description ?? "",
      discountType: p.discountType as "percentage" | "fixed",
      discountAmount: Number(p.discountAmount),
      freeShipping: p.freeShipping,
      freeShippingMaxAmount: p.freeShippingMaxAmount
        ? Number(p.freeShippingMaxAmount)
        : undefined,
      allowOnDiscountedItems: p.allowOnDiscountedItems,
      limit: p.limit ?? undefined,
      userLimit: p.userLimit ?? undefined,
      minOrderAmount: p.minOrderAmount ? Number(p.minOrderAmount) : undefined,
      maxOrderAmount: p.maxOrderAmount ? Number(p.maxOrderAmount) : undefined,
      expiresAt: toDateInputValue(p.expiresAt),
      active: p.active,
    });
  }, [promotion.data, form]);

  const update = useMutation(
    trpc.promotion.adminUpdate.mutationOptions({
      onSuccess: async () => {
        toast.success("Cupom atualizado");
        await queryClient.invalidateQueries({
          queryKey: trpc.promotion.adminList.queryKey(),
        });
        await queryClient.invalidateQueries({
          queryKey: trpc.promotion.adminById.queryKey(id),
        });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  const onSubmit = form.handleSubmit((values) => {
    update.mutate({
      id,
      code: values.code,
      description: values.description || null,
      discountType: values.discountType,
      discountAmount: values.discountAmount,
      freeShipping: values.freeShipping,
      freeShippingMaxAmount: values.freeShippingMaxAmount ?? null,
      allowOnDiscountedItems: values.allowOnDiscountedItems,
      limit: values.limit ?? null,
      userLimit: values.userLimit ?? null,
      minOrderAmount: values.minOrderAmount ?? null,
      maxOrderAmount: values.maxOrderAmount ?? null,
      expiresAt: values.expiresAt ? new Date(values.expiresAt) : null,
      active: values.active,
    });
  });

  if (promotion.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (promotion.isError || !promotion.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cupom não encontrado</CardTitle>
          <CardDescription>
            Cupom não encontrado ou sem permissão para visualização.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit}>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Identificação</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="code"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="promo-code">Código</FieldLabel>
                        <Input
                          id="promo-code"
                          {...field}
                          autoComplete="off"
                          className="font-mono uppercase"
                          onChange={(e) =>
                            field.onChange(e.target.value.toUpperCase())
                          }
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
                      <Field className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FieldLabel htmlFor="promo-active">
                            Ativo na loja
                          </FieldLabel>
                          <p className="text-sm text-muted-foreground">
                            Desative para suspender o cupom.
                          </p>
                        </div>
                        <Switch
                          id="promo-active"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  name="description"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="promo-description">
                        Descrição
                      </FieldLabel>
                      <Textarea id="promo-description" rows={2} {...field} />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Desconto</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="discountType"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="promo-discount-type">
                          Tipo de desconto
                        </FieldLabel>
                        <Select
                          {...field}
                          id="promo-discount-type"
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">
                              Percentual (%)
                            </SelectItem>
                            <SelectItem value="fixed">Fixo (R$)</SelectItem>
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name="discountAmount"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="promo-discount-amount">
                          Valor do desconto
                        </FieldLabel>
                        <Input
                          id="promo-discount-amount"
                          type="number"
                          step="0.01"
                          min="0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                <Controller
                  name="allowOnDiscountedItems"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FieldLabel htmlFor="promo-allow-discounted">
                          Aplicar em itens com desconto
                        </FieldLabel>
                        <p className="text-sm text-muted-foreground">
                          Se desativado, o cupom não se aplica a produtos que já
                          possuem desconto.
                        </p>
                      </div>
                      <Switch
                        id="promo-allow-discounted"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Frete grátis</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Controller
                  name="freeShipping"
                  control={form.control}
                  render={({ field }) => (
                    <Field className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FieldLabel htmlFor="promo-free-shipping">
                          Frete grátis
                        </FieldLabel>
                        <p className="text-sm text-muted-foreground">
                          Concede frete grátis ao usar este cupom.
                        </p>
                      </div>
                      <Switch
                        id="promo-free-shipping"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  )}
                />

                <Controller
                  name="freeShippingMaxAmount"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="promo-free-shipping-max">
                        Valor máximo coberto pelo frete grátis (R$)
                      </FieldLabel>
                      <Input
                        id="promo-free-shipping-max"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Deixe em branco para frete totalmente grátis"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
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
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Limites e validade</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="limit"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="promo-limit">
                          Limite global de usos
                        </FieldLabel>
                        <Input
                          id="promo-limit"
                          type="number"
                          step="1"
                          min="1"
                          placeholder="Ilimitado"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
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

                  <Controller
                    name="userLimit"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="promo-user-limit">
                          Limite por usuário
                        </FieldLabel>
                        <Input
                          id="promo-user-limit"
                          type="number"
                          step="1"
                          min="1"
                          placeholder="Ilimitado"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
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

                  <Controller
                    name="minOrderAmount"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="promo-min-order">
                          Pedido mínimo (R$)
                        </FieldLabel>
                        <Input
                          id="promo-min-order"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Sem mínimo"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
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

                  <Controller
                    name="maxOrderAmount"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="promo-max-order">
                          Pedido máximo (R$)
                        </FieldLabel>
                        <Input
                          id="promo-max-order"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Sem máximo"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
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

                  <Controller
                    name="expiresAt"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="promo-expires-at">
                          Data de expiração
                        </FieldLabel>
                        <Popover>
                          <PopoverTrigger
                            render={
                              <InputGroup>
                                <InputGroupAddon>
                                  <HugeiconsIcon
                                    icon={CalendarIcon}
                                    strokeWidth={2}
                                  />
                                </InputGroupAddon>
                                <Button
                                  variant="ghost"
                                  id="date-picker-simple"
                                  className="justify-start font-normal flex-1"
                                >
                                  {field.value ? (
                                    format(new Date(field.value), "P", {
                                      locale: ptBR,
                                    })
                                  ) : (
                                    <span className="text-muted-foreground">
                                      Selecione uma data
                                    </span>
                                  )}
                                </Button>
                                {field.value && (
                                  <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                      variant={"ghost"}
                                      size="icon-xs"
                                      onClick={() => field.onChange("")}
                                    >
                                      <HugeiconsIcon
                                        icon={CancelCircleIcon}
                                        strokeWidth={2}
                                      />
                                    </InputGroupButton>
                                  </InputGroupAddon>
                                )}
                              </InputGroup>
                            }
                          />
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              id="promo-expires-at"
                              mode="single"
                              selected={
                                field.value
                                  ? parse(field.value, "yyyy-MM-dd", new Date())
                                  : undefined
                              }
                              onSelect={(date) => {
                                if (date) {
                                  field.onChange(
                                    format(date, "yyyy-MM-dd", { locale: ptBR })
                                  );
                                }
                              }}
                              defaultMonth={
                                field.value
                                  ? parse(field.value, "yyyy-MM-dd", new Date())
                                  : undefined
                              }
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
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

          <Card>
            <CardFooter className="flex flex-wrap gap-2 justify-between">
              <Button
                variant="outline"
                render={<Link href={"/admin/promotions" as Route} />}
              >
                <HugeiconsIcon icon={ArrowLeft} strokeWidth={2} />
                Voltar
              </Button>
              <Button type="submit" disabled={update.isPending}>
                {update.isPending ? "Salvando…" : "Salvar alterações"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
}
