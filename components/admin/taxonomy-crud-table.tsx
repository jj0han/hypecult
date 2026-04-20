"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircleIcon,
  CancelCircleIcon,
  Edit,
  MoreVertical,
  Plus,
  SearchIcon,
  SearchRemoveIcon,
  Trash2,
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
import { useDeferredValue, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTRPC } from "@/lib/trpc";

export type TaxonomyCrudKind = "category" | "subcategory";

const filterSchema = z.object({
  search: z.string().optional(),
});

const editSchema = z.object({
  name: z.string().min(1, "Informe o nome"),
  slug: z.string().optional(),
});

type TaxonomyCrudTableProps = {
  kind: TaxonomyCrudKind;
  title: string;
  description: string;
  newButtonLabel: string;
  dialogCreateTitle: string;
  dialogEditTitle: string;
  deleteConfirmTitle: string;
};

export function TaxonomyCrudTable({
  kind,
  title,
  description,
  newButtonLabel,
  dialogCreateTitle,
  dialogEditTitle,
  deleteConfirmTitle,
}: TaxonomyCrudTableProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const filterForm = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: "" },
  });

  const deferredSearch = useDeferredValue(
    filterForm.watch("search")?.trim() ?? ""
  );

  const listCategories = useQuery(
    trpc.taxonomy.adminListCategories.queryOptions(
      { search: deferredSearch },
      {
        placeholderData: keepPreviousData,
        enabled: kind === "category",
      }
    )
  );

  const listSubcategories = useQuery(
    trpc.taxonomy.adminListSubcategories.queryOptions(
      { search: deferredSearch },
      {
        placeholderData: keepPreviousData,
        enabled: kind === "subcategory",
      }
    )
  );

  const list = kind === "category" ? listCategories : listSubcategories;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: { name: "", slug: "" },
  });

  const invalidateAll = async () => {
    await queryClient.invalidateQueries({
      queryKey: trpc.taxonomy.adminListCategories.queryKey(),
    });
    await queryClient.invalidateQueries({
      queryKey: trpc.taxonomy.adminListSubcategories.queryKey(),
    });
    await queryClient.invalidateQueries({
      queryKey: trpc.taxonomy.adminSummary.queryKey(),
    });
    await queryClient.invalidateQueries({
      queryKey: trpc.product.listCategories.queryKey(),
    });
    await queryClient.invalidateQueries({
      queryKey: trpc.product.listSubcategories.queryKey(),
    });
  };

  const createCategory = useMutation(
    trpc.taxonomy.adminCreateCategory.mutationOptions({
      onSuccess: async () => {
        toast.success("Categoria criada");
        setDialogOpen(false);
        editForm.reset({ name: "", slug: "" });
        await invalidateAll();
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const updateCategory = useMutation(
    trpc.taxonomy.adminUpdateCategory.mutationOptions({
      onSuccess: async () => {
        toast.success("Categoria atualizada");
        setDialogOpen(false);
        setEditingId(null);
        await invalidateAll();
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const deleteCategory = useMutation(
    trpc.taxonomy.adminDeleteCategory.mutationOptions({
      onSuccess: async () => {
        toast.success("Categoria excluída");
        setDeleteTarget(null);
        await invalidateAll();
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const createSubcategory = useMutation(
    trpc.taxonomy.adminCreateSubcategory.mutationOptions({
      onSuccess: async () => {
        toast.success("Tema criado");
        setDialogOpen(false);
        editForm.reset({ name: "", slug: "" });
        await invalidateAll();
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const updateSubcategory = useMutation(
    trpc.taxonomy.adminUpdateSubcategory.mutationOptions({
      onSuccess: async () => {
        toast.success("Tema atualizado");
        setDialogOpen(false);
        setEditingId(null);
        await invalidateAll();
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const deleteSubcategory = useMutation(
    trpc.taxonomy.adminDeleteSubcategory.mutationOptions({
      onSuccess: async () => {
        toast.success("Tema excluído");
        setDeleteTarget(null);
        await invalidateAll();
      },
      onError: (err) => toast.error(err.message),
    })
  );

  const saving =
    createCategory.isPending ||
    updateCategory.isPending ||
    createSubcategory.isPending ||
    updateSubcategory.isPending;

  function openCreate() {
    setEditingId(null);
    editForm.reset({ name: "", slug: "" });
    setDialogOpen(true);
  }

  function openEdit(row: { id: string; name: string; slug: string | null }) {
    setEditingId(row.id);
    editForm.reset({
      name: row.name,
      slug: row.slug ?? "",
    });
    setDialogOpen(true);
  }

  function onSubmitFilter() {
    list.refetch();
  }

  function onSubmitDialog(values: z.infer<typeof editSchema>) {
    if (kind === "category") {
      if (editingId) {
        updateCategory.mutate({
          id: editingId,
          name: values.name,
          slug: values.slug,
        });
      } else {
        createCategory.mutate({
          name: values.name,
          slug: values.slug,
        });
      }
    } else if (editingId) {
      updateSubcategory.mutate({
        id: editingId,
        name: values.name,
        slug: values.slug,
      });
    } else {
      createSubcategory.mutate({
        name: values.name,
        slug: values.slug,
      });
    }
  }

  const rows = list.data ?? [];

  return (
    <div className="space-y-4">
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>{title}</ItemTitle>
          <ItemDescription>{description}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button size="icon" type="button" onClick={openCreate}>
            <HugeiconsIcon icon={Plus} strokeWidth={2} />
          </Button>
        </ItemActions>
      </Item>

      <Card size="sm">
        <CardContent>
          <form onSubmit={filterForm.handleSubmit(onSubmitFilter)}>
            <FieldGroup className="flex lg:flex-row gap-4 lg:items-end">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <Controller
                  name="search"
                  control={filterForm.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="col-span-1 md:col-span-2"
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
                          placeholder="Nome ou slug…"
                          autoComplete="off"
                        />
                        {field.value && (
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              variant="ghost"
                              size="icon-xs"
                              onClick={() =>
                                filterForm.resetField("search", {
                                  defaultValue: "",
                                })
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

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{deleteConfirmTitle}</AlertDialogTitle>
            {deleteTarget ? (
              <AlertDialogDescription>
                {deleteTarget.name}
              </AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="ghost">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteCategory.isPending || deleteSubcategory.isPending}
              onClick={() => {
                if (!deleteTarget) {
                  return;
                }
                if (kind === "category") {
                  deleteCategory.mutate({ id: deleteTarget.id });
                } else {
                  deleteSubcategory.mutate({ id: deleteTarget.id });
                }
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? dialogEditTitle : dialogCreateTitle}
            </DialogTitle>
          </DialogHeader>
          <form
            id="taxonomy-edit-form"
            onSubmit={editForm.handleSubmit(onSubmitDialog)}
            className="space-y-4"
          >
            <Controller
              name="name"
              control={editForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="slug"
              control={editForm.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Slug (opcional)</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    placeholder="ex.: camisetas-oversized"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </form>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" form="taxonomy-edit-form" disabled={saving}>
              {saving ? <Spinner /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              Não foi possível carregar os dados. Tente novamente mais tarde.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : rows.length === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HugeiconsIcon icon={SearchRemoveIcon} strokeWidth={2} />
            </EmptyMedia>
            <EmptyTitle>Nenhum registro</EmptyTitle>
            <EmptyDescription>
              {newButtonLabel} ou ajuste a busca.
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <ContextMenu key={row.id}>
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
                              <DropdownMenuLabel className="truncate">
                                {row.name}
                              </DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  openEdit({
                                    id: row.id,
                                    name: row.name,
                                    slug: row.slug,
                                  })
                                }
                              >
                                <HugeiconsIcon icon={Edit} strokeWidth={2} />
                                Editar
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                            <DropdownMenuGroup>
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() =>
                                  setDeleteTarget({
                                    id: row.id,
                                    name: row.name,
                                  })
                                }
                              >
                                <HugeiconsIcon icon={Trash2} strokeWidth={2} />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                      <TableCell className="font-medium">{row.name}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-sm">
                        {row.slug ?? "—"}
                      </TableCell>
                      <TableCell>{row._count.products}</TableCell>
                      <TableCell>
                        {format(row.createdAt, "P", { locale: ptBR })}
                      </TableCell>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-56">
                      <ContextMenuGroup>
                        <ContextMenuLabel className="truncate">
                          {row.name}
                        </ContextMenuLabel>
                        <ContextMenuItem
                          onClick={() =>
                            openEdit({
                              id: row.id,
                              name: row.name,
                              slug: row.slug,
                            })
                          }
                        >
                          <HugeiconsIcon icon={Edit} strokeWidth={2} />
                          Editar
                        </ContextMenuItem>
                      </ContextMenuGroup>
                      <ContextMenuGroup>
                        <ContextMenuItem
                          variant="destructive"
                          onClick={() =>
                            setDeleteTarget({
                              id: row.id,
                              name: row.name,
                            })
                          }
                        >
                          <HugeiconsIcon icon={Trash2} strokeWidth={2} />
                          Excluir
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
