"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  CancelCircleIcon,
  CopyIcon,
  Edit,
  MoreVertical,
  Plus,
  SearchIcon,
  SearchRemoveIcon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Route } from "next";
import Link from "next/link";
import { useDeferredValue } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
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
  ItemTitle,
} from "@/components/ui/item";
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
import { formatCurrency } from "@/utils/formatters";

const discountTypeLabel: Record<string, string> = {
  percentage: "Percentual",
  fixed: "Fixo",
};

const formSchema = z.object({
  search: z.string().optional(),
  status: z.enum(["all", "active", "inactive"]).optional(),
  discountType: z.enum(["all", "percentage", "fixed"]).optional(),
});

export default function Page() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
      status: "all",
      discountType: "all",
    },
  });

  const deferredSearch = useDeferredValue(form.getValues("search"));

  const list = useQuery(
    trpc.promotion.adminList.queryOptions(
      {
        search: deferredSearch?.trim() || "",
        status: form.getValues("status") ?? "all",
        discountType: form.getValues("discountType") ?? "all",
      },
      { placeholderData: keepPreviousData }
    )
  );

  const toggleActive = useMutation(
    trpc.promotion.adminUpdate.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: trpc.promotion.adminList.queryKey(),
        });
      },
      onError: (err) => {
        toast.error(err.message);
      },
    })
  );

  function onSubmit() {
    list.refetch();
  }

  function formatDiscount(
    type: string,
    amount: { toString(): string }
  ): string {
    const n = Number(amount);
    return type === "percentage" ? `${n}%` : formatCurrency(n);
  }

  function formatExpiry(date: Date | null | undefined): string {
    if (!date) return "—";
    return format(date, "P", { locale: ptBR });
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Código copiado para a área de transferência");
  }

  return (
    <div className="space-y-6">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Cupons de desconto</ItemTitle>
          <ItemDescription>
            Gerencie os cupons e promoções da loja.
          </ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            size="icon"
            render={<Link href={"/admin/promotions/new" as Route} />}
          >
            <HugeiconsIcon icon={Plus} strokeWidth={2} />
          </Button>
        </ItemActions>
      </Item>

      <Card size="sm">
        <CardContent>
          <form
            id="admin-promotions-form"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FieldGroup className="flex lg:flex-row gap-4 lg:items-end">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <Controller
                  name="search"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="col-span-1 lg:col-span-2"
                    >
                      <FieldLabel htmlFor={field.name}>Buscar</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
                        </InputGroupAddon>
                        <InputGroupInput
                          {...field}
                          id={field.name}
                          value={field.value}
                          onChange={field.onChange}
                          aria-invalid={fieldState.invalid}
                          placeholder="Código do cupom…"
                          autoComplete="off"
                        />
                        {field.value && (
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              variant="ghost"
                              size="icon-xs"
                              onClick={() =>
                                form.resetField("search", { defaultValue: "" })
                              }
                            >
                              <HugeiconsIcon
                                icon={CancelCircleIcon}
                                strokeWidth={2}
                              />
                            </InputGroupButton>
                          </InputGroupAddon>
                        )}
                      </InputGroup>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="status"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                      <Select
                        {...field}
                        id={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="active">Ativos</SelectItem>
                          <SelectItem value="inactive">Inativos</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  name="discountType"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Tipo de desconto
                      </FieldLabel>
                      <Select
                        {...field}
                        id={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="percentage">Percentual</SelectItem>
                          <SelectItem value="fixed">Fixo</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Field orientation="horizontal" className="lg:w-fit">
                <Button size="icon" type="submit" disabled={list.isFetching}>
                  {list.isFetching ? (
                    <Spinner />
                  ) : (
                    <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {list.isPending ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : list.isError ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>Erro!</EmptyTitle>
            <EmptyDescription>
              Não foi possível carregar os produtos. Tente novamente mais tarde.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (list.data?.length ?? 0) === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={SearchRemoveIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>Ops!</EmptyTitle>
            <EmptyDescription>
              Nenhum produto encontrado com esses filtros. Tente novamente com
              outros filtros.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <Card className="p-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Frete grátis</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(list.data ?? []).map((promo) => (
                  <ContextMenu key={promo.id}>
                    <ContextMenuTrigger render={<TableRow />}>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={<Button variant="ghost" size="icon-sm" />}
                          >
                            <HugeiconsIcon
                              icon={MoreVertical}
                              strokeWidth={2}
                            />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-56">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="truncate font-mono">
                                {promo.code}
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                render={
                                  <Link
                                    href={
                                      `/admin/promotions/${promo.id}` as Route
                                    }
                                  />
                                }
                              >
                                <HugeiconsIcon icon={Edit} strokeWidth={2} />
                                Editar
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuGroup>
                              <DropdownMenuLabel>Status</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <div className="flex items-center justify-between gap-x-2 w-full">
                                  <span>
                                    {promo.active ? "Ativo" : "Inativo"}
                                  </span>
                                  <Switch
                                    checked={promo.active}
                                    disabled={toggleActive.isPending}
                                    onCheckedChange={(checked) =>
                                      toggleActive.mutate({
                                        id: promo.id,
                                        active: checked,
                                      })
                                    }
                                  />
                                </div>
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      <TableCell className="font-mono font-medium">
                        <Button
                          variant="link"
                          size="icon-xs"
                          onClick={() => copyToClipboard(promo.code)}
                        >
                          <HugeiconsIcon icon={CopyIcon} strokeWidth={2} />
                        </Button>
                        <span>{promo.code}</span>
                      </TableCell>
                      <TableCell>
                        {discountTypeLabel[promo.discountType] ??
                          promo.discountType}
                      </TableCell>
                      <TableCell>
                        {formatDiscount(
                          promo.discountType,
                          promo.discountAmount
                        )}
                      </TableCell>
                      <TableCell>
                        {promo.freeShipping ? (
                          <HugeiconsIcon
                            icon={Tick01Icon}
                            strokeWidth={2}
                            className="text-green-600"
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {promo._count.orders}
                        {promo.limit ? ` / ${promo.limit}` : ""}
                      </TableCell>
                      <TableCell>{formatExpiry(promo.expiresAt)}</TableCell>
                      <TableCell>
                        {promo.active ? (
                          <Badge variant="secondary">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                      </TableCell>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-56">
                      <ContextMenuGroup>
                        <ContextMenuLabel className="truncate font-mono">
                          {promo.code}
                        </ContextMenuLabel>
                        <ContextMenuItem
                          render={
                            <Link
                              href={`/admin/promotions/${promo.id}` as Route}
                            />
                          }
                        >
                          <HugeiconsIcon icon={Edit} strokeWidth={2} />
                          Editar
                        </ContextMenuItem>
                      </ContextMenuGroup>
                      <ContextMenuGroup>
                        <ContextMenuLabel>Status</ContextMenuLabel>
                        <ContextMenuItem>
                          <div className="flex items-center justify-between gap-x-2 w-full">
                            <span>{promo.active ? "Ativo" : "Inativo"}</span>
                            <Switch
                              checked={promo.active}
                              disabled={toggleActive.isPending}
                              onCheckedChange={(checked) =>
                                toggleActive.mutate({
                                  id: promo.id,
                                  active: checked,
                                })
                              }
                            />
                          </div>
                        </ContextMenuItem>
                      </ContextMenuGroup>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
