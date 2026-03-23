"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Edit04Icon,
  MapPin,
  Plus,
  Search,
  Tick02Icon,
  Trash,
  UnfoldMoreIcon,
  User,
  X,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import type { City } from "@/app/api/ibge/estados/municipios/[uf]/route";
import type { State } from "@/app/api/ibge/estados/route";
import type { ViaCEPResponse } from "@/app/api/viacep/[cep]/route";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
} from "@/components/ui/input-group";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
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
import { useTRPC } from "@/lib/trpc";
import { formatZipCode } from "@/utils/formatters";

const formSchema = z.object({
  recipient: z.string().min(1, "Destinatario é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(1, "Estado é obrigatório"),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  zipCode: z.string().min(9, "CEP é obrigatório"),
  complement: z.string().optional(),
  number: z.string().min(1, "Número é obrigatório"),
});

export default function Page() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data, isPending } = useQuery(trpc.address.list.queryOptions());
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

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
    onSuccess: async (data) => {
      if (!data) return;
      await citiesByState.mutateAsync(data.uf);
    },
  });

  const refreshAddresses = async () => {
    await queryClient.invalidateQueries({
      queryKey: trpc.address.list.queryKey(),
    });
  };

  const create = useMutation(
    trpc.address.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Endereço criado com sucesso");
        await refreshAddresses();
        closeForm();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const update = useMutation(
    trpc.address.update.mutationOptions({
      onSuccess: async () => {
        toast.success("Endereço atualizado com sucesso");
        await refreshAddresses();
        closeForm();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const remove = useMutation(
    trpc.address.remove.mutationOptions({
      onSuccess: async () => {
        toast.success("Endereço removido com sucesso");
        await refreshAddresses();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  function closeForm() {
    setIsFormOpen(false);
    setEditingAddressId(null);
    setSelectedAddressId("");
    form.reset({
      recipient: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    });
  }

  function handleCreateClick() {
    setEditingAddressId(null);
    setIsFormOpen(true);
    setSelectedAddressId("");
    form.reset({
      recipient: "",
      address: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    });
  }

  async function handleEditClick(address: NonNullable<typeof data>[number]) {
    setEditingAddressId(address.id);
    setSelectedAddressId(address.id);
    setIsFormOpen(true);
    await viacep.mutateAsync(address.zipCode);
    form.reset({
      recipient: address.recipient,
      address: address.street,
      number: address.number,
      complement: address.complement || "",
      neighborhood: address.district,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    });
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (editingAddressId) {
      await update.mutateAsync({
        id: editingAddressId,
        street: data.address,
        district: data.neighborhood,
        ...data,
      });
      return;
    }

    await create.mutateAsync({
      street: data.address,
      district: data.neighborhood,
      ...data,
    });
  }

  return (
    <main className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base flex items-center gap-2">
            <HugeiconsIcon icon={MapPin} strokeWidth={2} className="size-5" />
            Meus endereços
          </CardTitle>
          <Button size="xs" onClick={handleCreateClick}>
            <HugeiconsIcon icon={Plus} strokeWidth={2} className="size-4" />
            Adicionar endereço
          </Button>
        </CardHeader>
        {isPending ? (
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        ) : (
          <CardContent>
            {data?.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Voce ainda nao cadastrou nenhum endereço.
              </p>
            )}

            {data && data.length > 0 && (
              <ItemGroup>
                <div className="flex flex-col gap-3">
                  {data.map((address) => (
                    <AlertDialog key={address.id}>
                      <Item
                        key={address.id}
                        variant={
                          selectedAddressId === address.id
                            ? "outline"
                            : "default"
                        }
                      >
                        <ItemContent>
                          <ItemTitle>{address.recipient}</ItemTitle>
                          <ItemDescription className="line-clamp-none">
                            {address.street}, {address.number}{" "}
                            {address.complement} {address.district}{" "}
                            {address.city} {address.state}{" "}
                            {formatZipCode(address.zipCode)}
                          </ItemDescription>
                        </ItemContent>
                        <ItemActions>
                          <Button
                            variant="outline"
                            size="xs"
                            onClick={async () => await handleEditClick(address)}
                          >
                            <HugeiconsIcon icon={Edit04Icon} strokeWidth={2} />
                            Atualizar
                          </Button>
                          <AlertDialogTrigger
                            render={
                              <Button
                                variant="destructive"
                                size="icon-xs"
                                disabled={remove.isPending}
                              />
                            }
                          >
                            {remove.isPending ? (
                              <Spinner />
                            ) : (
                              <HugeiconsIcon icon={Trash} strokeWidth={2} />
                            )}
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Tem certeza que deseja remover este endereço?
                              </AlertDialogTitle>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel variant={"ghost"}>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction
                                variant={"destructive"}
                                onClick={async () =>
                                  await remove.mutateAsync({ id: address.id })
                                }
                              >
                                {remove.isPending ? (
                                  <Spinner />
                                ) : (
                                  <HugeiconsIcon icon={Trash} strokeWidth={2} />
                                )}
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </ItemActions>
                      </Item>
                    </AlertDialog>
                  ))}
                </div>
              </ItemGroup>
            )}
          </CardContent>
        )}
      </Card>

      {isFormOpen && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              {editingAddressId ? "Atualizar endereço" : "Novo endereço"}
            </CardTitle>
            <Button variant="ghost" size="icon-sm" onClick={closeForm}>
              <HugeiconsIcon icon={X} strokeWidth={2} className="size-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form
              id="address-form"
              className="space-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FieldGroup className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="recipient"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="recipient">
                        Destinatário *
                      </FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <HugeiconsIcon icon={User} strokeWidth={2} />
                        </InputGroupAddon>
                        <InputGroupInput
                          {...field}
                          id="recipient"
                          aria-invalid={fieldState.invalid}
                          placeholder="Joao da Silva"
                          autoComplete="off"
                        />
                      </InputGroup>
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
                      <FieldLabel htmlFor="zipCode">CEP *</FieldLabel>
                      <InputGroup>
                        <InputGroupAddon>
                          <HugeiconsIcon icon={Search} strokeWidth={2} />
                        </InputGroupAddon>
                        <InputGroupInput
                          {...field}
                          id="zipCode"
                          aria-invalid={fieldState.invalid}
                          placeholder="00000-000"
                          autoComplete="off"
                          value={formatZipCode(field.value)}
                          onChange={async (e) => {
                            if (e.target.value.length >= 9) return;
                            field.onChange(formatZipCode(e.target.value));
                            if (e.target.value.length < 8) return;
                            const response = await viacep.mutateAsync(
                              e.target.value
                            );
                            if (response) {
                              form.setValue(
                                "address",
                                response.logradouro || ""
                              );
                              form.setValue(
                                "neighborhood",
                                response.bairro || ""
                              );
                              form.setValue("city", response.localidade || "");
                              form.setValue("state", response.uf || "");
                            }
                          }}
                          maxLength={9}
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
                <Controller
                  name="address"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field
                      data-invalid={fieldState.invalid}
                      className="sm:col-span-2"
                    >
                      <FieldLabel htmlFor="address">Endereço *</FieldLabel>
                      <Input
                        {...field}
                        id="address"
                        aria-invalid={fieldState.invalid}
                        placeholder="Rua das Flores"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
                <Controller
                  name="number"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="number">Número *</FieldLabel>
                      <Input
                        {...field}
                        id="number"
                        aria-invalid={fieldState.invalid}
                        placeholder="123"
                        autoComplete="off"
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
                      <FieldLabel htmlFor="complement">Complemento</FieldLabel>
                      <Input
                        {...field}
                        id="complement"
                        aria-invalid={fieldState.invalid}
                        placeholder="Exemplo: Apto 101"
                        autoComplete="off"
                      />
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
                      <FieldLabel htmlFor={field.name}>Estado *</FieldLabel>
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
                          await citiesByState.mutateAsync(id.toString());
                        }}
                        disabled={listStates.isPending}
                      >
                        <SelectTrigger className={"w-full"}>
                          {listStates.isPending && <Spinner />}
                          <SelectValue placeholder="Selecione o estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {listStates.data?.map((state) => (
                            <SelectItem key={state.id} value={state.sigla}>
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
                <Controller
                  name="city"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Cidade *</FieldLabel>
                      <Button
                        variant="outline"
                        className={"justify-between"}
                        onClick={() => setOpen(true)}
                      >
                        <span className="text-sm font-normal">
                          {field.value || (
                            <span className="text-muted-foreground">
                              Selecione a cidade
                            </span>
                          )}
                        </span>
                        {citiesByState.isPending ? (
                          <Spinner />
                        ) : (
                          <HugeiconsIcon
                            icon={UnfoldMoreIcon}
                            strokeWidth={2}
                            className="text-muted-foreground size-4 pointer-events-none"
                          />
                        )}
                      </Button>
                      <CommandDialog open={open} onOpenChange={setOpen}>
                        <Command>
                          <CommandInput placeholder="Pesquisar cidade" />
                          <CommandList>
                            <CommandEmpty className="px-1">
                              Nenhuma cidade encontrada. Selecione um estado
                              para ver as cidades disponíveis.
                            </CommandEmpty>
                            {citiesByState.data && (
                              <CommandGroup heading="Cidades">
                                {citiesByState.data.map((city) => (
                                  <CommandItem
                                    key={city.id}
                                    value={city.nome}
                                    onSelect={(value) => {
                                      field.onChange(value);
                                      setOpen(false);
                                    }}
                                  >
                                    {city.nome}
                                    {field.value === city.nome ? (
                                      <HugeiconsIcon
                                        icon={Tick02Icon}
                                        strokeWidth={2}
                                        className="text-primary size-4 pointer-events-none"
                                      />
                                    ) : null}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </CommandDialog>
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
                      <FieldLabel htmlFor="neighborhood">Bairro *</FieldLabel>
                      <Input
                        {...field}
                        id="neighborhood"
                        aria-invalid={fieldState.invalid}
                        placeholder="Centro"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <CardFooter>
            <Field orientation="horizontal" className="justify-end">
              <Button size="lg" variant="outline" onClick={closeForm}>
                Cancelar
              </Button>
              <Button
                form="address-form"
                type="submit"
                size="lg"
                disabled={
                  create.isPending || update.isPending || viacep.isPending
                }
              >
                {(create.isPending || update.isPending) && <Spinner />}
                {editingAddressId ? "Salvar alterações" : "Salvar endereço"}
              </Button>
            </Field>
          </CardFooter>
        </Card>
      )}
    </main>
  );
}
