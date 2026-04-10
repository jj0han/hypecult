"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  CancelCircleIcon,
  CopyIcon,
  Edit,
  ExternalLink,
  MoreVertical,
  SearchIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { useDeferredValue } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { productTypeEnum } from "@/schemas/product";
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
  search: z.string().optional(),
  status: z.enum(["all", "active", "inactive"]).optional(),
  type: productTypeEnum.or(z.literal("all")).optional(),
  gelato: z.enum(["all", "synced", "not_synced"]).optional(),
});

export default function Page() {
  const trpc = useTRPC();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      search: "",
      status: "all",
      type: "all",
      gelato: "all",
    },
  });

  const deferredSearch = useDeferredValue(form.getValues("search"));

  const list = useQuery(
    trpc.product.adminList.queryOptions(
      {
        search: deferredSearch?.trim() || "",
        status: form.getValues("status"),
        type:
          form.getValues("type") === "all"
            ? undefined
            : (form.getValues("type") as ProductType),
        gelato: form.getValues("gelato"),
      },
      {
        placeholderData: keepPreviousData,
      }
    )
  );

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("SKU copiado para a área de transferência");
  }

  function onSubmit() {
    list.refetch();
  }

  return (
    <div className="space-y-6">
      <Card size="sm">
        <CardContent>
          <form id="admin-product-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="flex lg:flex-row gap-4 lg:items-end">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 w-full">
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
                          placeholder="Nome ou SKU…"
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
                  name="type"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Tipo</FieldLabel>
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
                          <SelectItem value="tshirt">Camiseta</SelectItem>
                          <SelectItem value="hoodie">Moletom</SelectItem>
                          <SelectItem value="mug">Caneca</SelectItem>
                          <SelectItem value="sticker">Adesivo</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="gelato"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Gelato</FieldLabel>
                      <Select
                        {...field}
                        id={field.name}
                        value={field.value}
                        onValueChange={field.onChange}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Gelato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="synced">Sincronizados</SelectItem>
                          <SelectItem value="not_synced">
                            Não sincronizados
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Field orientation={"horizontal"} className="lg:w-fit">
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
        <Alert variant="destructive">
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Não foi possível carregar os produtos. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      ) : (list.data?.length ?? 0) === 0 ? (
        <Alert>
          <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} />
          <AlertTitle>Ops!</AlertTitle>
          <AlertDescription>
            Nenhum produto encontrado com esses filtros. Tente novamente com
            outros filtros.
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="p-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead />
                  <TableHead className="w-14" />
                  <TableHead>Nome</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(list.data ?? []).map((p) => {
                  const thumb = p.images?.[0];
                  return (
                    <ContextMenu key={p.id}>
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
                                <DropdownMenuLabel className={"truncate"}>
                                  {p.name}
                                </DropdownMenuLabel>
                                <DropdownMenuItem
                                  render={
                                    <Link
                                      href={`/admin/products/${p.id}` as Route}
                                    />
                                  }
                                >
                                  <HugeiconsIcon icon={Edit} strokeWidth={2} />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  render={<Link href={`/product/${p.id}`} />}
                                >
                                  <HugeiconsIcon
                                    icon={ExternalLink}
                                    strokeWidth={2}
                                  />
                                  Ver na loja
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuGroup>
                                <DropdownMenuLabel>Status</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <div className="flex items-center justify-between gap-x-2 w-full">
                                    <span>
                                      {p.active ? "Ativo" : "Inativo"}
                                    </span>
                                    <Switch
                                      checked={p.active}
                                      onCheckedChange={() => {}}
                                    />
                                  </div>
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                        <TableCell>
                          <div className="relative size-10 overflow-hidden rounded-md bg-muted">
                            <CldImage
                              src={
                                thumb?.publicId ?? thumb?.url ?? "placeholder"
                              }
                              alt={thumb?.alt ?? ""}
                              fill
                              crop="fill"
                              gravity="auto"
                              sizes="(max-width: 768px) 100vw, 33vw"
                              style={{ objectFit: "cover" }}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="font-medium max-w-[220px] truncate">
                          {p.name}
                        </TableCell>
                        <TableCell className="max-w-52">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="link"
                              size="icon-xs"
                              onClick={() => copyToClipboard(p.sku)}
                            >
                              <HugeiconsIcon icon={CopyIcon} strokeWidth={2} />
                            </Button>
                            <span className="font-mono truncate text-xs">
                              {p.sku}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{productTypeLabel[p.type]}</TableCell>
                        <TableCell>
                          {formatCurrency(Number(p.finalPrice ?? p.price))}
                        </TableCell>
                        <TableCell>
                          {p.active ? (
                            <Badge variant="secondary">Ativo</Badge>
                          ) : (
                            <Badge variant="outline">Inativo</Badge>
                          )}
                        </TableCell>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-56">
                        <ContextMenuGroup>
                          <ContextMenuLabel className={"truncate"}>
                            {p.name}
                          </ContextMenuLabel>
                          <ContextMenuItem
                            render={
                              <Link href={`/admin/products/${p.id}` as Route} />
                            }
                          >
                            <HugeiconsIcon icon={Edit} strokeWidth={2} />
                            Editar
                          </ContextMenuItem>
                          <ContextMenuItem
                            render={<Link href={`/product/${p.id}`} />}
                          >
                            <HugeiconsIcon
                              icon={ExternalLink}
                              strokeWidth={2}
                            />
                            Ver na loja
                          </ContextMenuItem>
                        </ContextMenuGroup>
                        <ContextMenuGroup>
                          <ContextMenuLabel>Status</ContextMenuLabel>
                          <ContextMenuItem>
                            <div className="flex items-center justify-between gap-x-2 w-full">
                              <span>{p.active ? "Ativo" : "Inativo"}</span>
                              <Switch
                                checked={p.active}
                                onCheckedChange={() => {}}
                              />
                            </div>
                          </ContextMenuItem>
                        </ContextMenuGroup>
                      </ContextMenuContent>
                    </ContextMenu>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
