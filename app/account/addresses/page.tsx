"use client";
import { Edit04Icon, MapPin, Plus, Trash, X } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/lib/trpc";
import { formatZipCode } from "@/utils/formatters";

type AddressFormValues = {
  recipient: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
};

const initialFormValues: AddressFormValues = {
  recipient: "",
  street: "",
  number: "",
  complement: "",
  district: "",
  city: "",
  state: "",
  zipCode: "",
};

export default function Page() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(trpc.address.list.queryOptions());
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [formValues, setFormValues] =
    useState<AddressFormValues>(initialFormValues);

  const refreshAddresses = async () => {
    await queryClient.invalidateQueries({
      queryKey: trpc.address.list.queryKey(),
    });
  };

  const create = useMutation(
    trpc.address.create.mutationOptions({
      onSuccess: async () => {
        toast.success("Endereco criado com sucesso");
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
        toast.success("Endereco atualizado com sucesso");
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
        toast.success("Endereco removido com sucesso");
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
    setFormValues(initialFormValues);
    setSelectedAddressId("");
  }

  function handleCreateClick() {
    setEditingAddressId(null);
    setFormValues(initialFormValues);
    setIsFormOpen(true);
    setSelectedAddressId("");
  }

  function handleEditClick(address: NonNullable<typeof data>[number]) {
    setEditingAddressId(address.id);
    setSelectedAddressId(address.id);
    setFormValues({
      recipient: address.recipient,
      street: address.street,
      number: address.number,
      complement: address.complement ?? "",
      district: address.district,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
    });
    setIsFormOpen(true);
  }

  async function handleSubmit() {
    if (
      !formValues.recipient.trim() ||
      !formValues.street.trim() ||
      !formValues.number.trim() ||
      !formValues.district.trim() ||
      !formValues.city.trim() ||
      !formValues.state.trim() ||
      !formValues.zipCode.trim()
    ) {
      toast.error("Preencha os campos obrigatorios");
      return;
    }

    const payload = {
      recipient: formValues.recipient.trim(),
      street: formValues.street.trim(),
      number: formValues.number.trim(),
      complement: formValues.complement.trim() || undefined,
      district: formValues.district.trim(),
      city: formValues.city.trim(),
      state: formValues.state.trim().toUpperCase(),
      zipCode: formValues.zipCode.replace(/\D/g, ""),
    };

    if (payload.state.length !== 2) {
      toast.error("Informe um estado valido com 2 letras");
      return;
    }

    if (payload.zipCode.length < 8) {
      toast.error("Informe um CEP valido");
      return;
    }

    if (editingAddressId) {
      await update.mutateAsync({
        id: editingAddressId,
        ...payload,
      });
      return;
    }

    await create.mutateAsync(payload);
  }

  if (isLoading) {
    return <p className="p-8">Carregando enderecos...</p>;
  }

  return (
    <main className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-base flex items-center gap-2">
            <HugeiconsIcon icon={MapPin} strokeWidth={2} className="size-5" />
            Meus endereços
          </CardTitle>
          <Button size="sm" onClick={handleCreateClick}>
            <HugeiconsIcon icon={Plus} strokeWidth={2} className="size-4" />
            Adicionar endereço
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {data?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Voce ainda nao cadastrou nenhum endereco.
            </p>
          )}

          {data && data.length > 0 && (
            <ItemGroup>
              <div className="flex flex-col gap-3">
                {data.map((address) => (
                  <Item
                    key={address.id}
                    variant={
                      selectedAddressId === address.id ? "outline" : "default"
                    }
                  >
                    <ItemContent>
                      <ItemTitle>{address.recipient}</ItemTitle>
                      <ItemDescription className="line-clamp-none">
                        {address.street}, {address.number} {address.complement}{" "}
                        {address.district} {address.city} {address.state}{" "}
                        {formatZipCode(address.zipCode)}
                      </ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleEditClick(address)}
                      >
                        <HugeiconsIcon icon={Edit04Icon} strokeWidth={2} />
                        Atualizar
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-xs"
                        onClick={() => remove.mutate({ id: address.id })}
                        disabled={remove.isPending}
                      >
                        {remove.isPending ? (
                          <Spinner />
                        ) : (
                          <HugeiconsIcon icon={Trash} strokeWidth={2} />
                        )}
                      </Button>
                    </ItemActions>
                  </Item>
                ))}
              </div>
            </ItemGroup>
          )}
        </CardContent>
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
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recipient">Destinatario *</Label>
                <Input
                  id="recipient"
                  value={formValues.recipient}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      recipient: event.target.value,
                    }))
                  }
                  placeholder="Joao da Silva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP *</Label>
                <Input
                  id="zipCode"
                  value={formValues.zipCode}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      zipCode: formatZipCode(event.target.value).slice(0, 9),
                    }))
                  }
                  placeholder="00000-000"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="street">Endereco *</Label>
                <Input
                  id="street"
                  value={formValues.street}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      street: event.target.value,
                    }))
                  }
                  placeholder="Rua das Flores"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number">Numero *</Label>
                <Input
                  id="number"
                  value={formValues.number}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      number: event.target.value,
                    }))
                  }
                  placeholder="123"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={formValues.complement}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      complement: event.target.value,
                    }))
                  }
                  placeholder="Apto 101"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">Bairro *</Label>
                <Input
                  id="district"
                  value={formValues.district}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      district: event.target.value,
                    }))
                  }
                  placeholder="Centro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  value={formValues.city}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      city: event.target.value,
                    }))
                  }
                  placeholder="Sao Paulo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado (UF) *</Label>
                <Input
                  id="state"
                  value={formValues.state}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      state: event.target.value.toUpperCase().slice(0, 2),
                    }))
                  }
                  placeholder="SP"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button size="lg" variant="outline" onClick={closeForm}>
                Cancelar
              </Button>
              <Button
                size="lg"
                onClick={handleSubmit}
                disabled={create.isPending || update.isPending}
              >
                {(create.isPending || update.isPending) && <Spinner />}
                {editingAddressId ? "Salvar alterações" : "Salvar endereço"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
