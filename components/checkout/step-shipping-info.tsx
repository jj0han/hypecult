/** biome-ignore-all lint/suspicious/noArrayIndexKey: template */
import {
  Mail,
  MapPin,
  Phone,
  Search,
  Trash,
  User,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import type { City } from "@/app/api/ibge/estados/municipios/[uf]/route";
import type { State } from "@/app/api/ibge/estados/route";
import type { ViaCEPResponse } from "@/app/api/viacep/[cep]/route";
import type { CheckoutFormData } from "@/schemas/checkout";

type Address = {
  id: string;
  recipient: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  zipCode: string;
};

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { formatPhone, formatZipCode } from "@/utils/formatters";

interface StepShippingInfoProps {
  form: UseFormReturn<CheckoutFormData>;
  addresses: Address[] | undefined;
  addressesLoading: boolean;
  onAddressRemove: (id: string) => void;
  removeAddressPending: boolean;
  createAddressPending: boolean;
  states: State[] | undefined;
  statesLoading: boolean;
  cities: City[] | undefined;
  citiesLoading: boolean;
  onFetchCities: (stateId: string) => Promise<void>;
  onCepLookup: (cep: string) => Promise<ViaCEPResponse | undefined>;
  cepLoading: boolean;
  onNext: () => void;
}

export function StepShippingInfo({
  form,
  addresses,
  addressesLoading,
  onAddressRemove,
  removeAddressPending,
  createAddressPending,
  states,
  statesLoading,
  cities,
  citiesLoading,
  onFetchCities,
  onCepLookup,
  cepLoading,
  onNext,
}: StepShippingInfoProps) {
  const watchedValues = form.watch();

  return (
    <Card className="flex flex-col gap-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={MapPin} strokeWidth={2} className="size-5" />
          Informações de entrega
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Controller
            name="firstName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nome *</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <HugeiconsIcon
                      icon={User}
                      strokeWidth={2}
                      className="size-4"
                    />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    placeholder="João"
                    aria-invalid={fieldState.invalid}
                  />
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="lastName"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Sobrenome *</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Silva"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>E-mail *</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <HugeiconsIcon
                      icon={Mail}
                      strokeWidth={2}
                      className="size-4"
                    />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    type="email"
                    placeholder="joao@example.com"
                    aria-invalid={fieldState.invalid}
                  />
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="phone"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Telefone</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <HugeiconsIcon
                      icon={Phone}
                      strokeWidth={2}
                      className="size-4"
                    />
                  </InputGroupAddon>
                  <InputGroupInput
                    {...field}
                    id={field.name}
                    type="tel"
                    placeholder="(11) 99999-9999"
                    aria-invalid={fieldState.invalid}
                    value={formatPhone(field.value)}
                  />
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="cpf"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>CPF *</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="000.000.000-00"
                  aria-invalid={fieldState.invalid}
                  maxLength={14}
                  onChange={(e) => {
                    const digits = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 11);
                    const formatted = digits
                      .replace(/(\d{3})(\d)/, "$1.$2")
                      .replace(/(\d{3})(\d)/, "$1.$2")
                      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                    field.onChange(formatted);
                  }}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {addresses && addresses.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <Label>Endereço de entrega</Label>
              {/* <Button variant="outline" size="xs">
                <HugeiconsIcon icon={Plus} strokeWidth={2} />
                Adicionar endereço
              </Button> */}
            </div>
            <div className="flex flex-col gap-4">
              <RadioGroup
                value={
                  addresses.find(
                    (address) => address.zipCode === watchedValues.zipCode
                  )?.id
                }
                onValueChange={(value) => {
                  const address = addresses.find((a) => a.id === value);
                  if (address) {
                    form.setValue("address", address.street);
                    form.setValue("number", address.number);
                    form.setValue("complement", address.complement ?? "");
                    form.setValue("neighborhood", address.district);
                    form.setValue("city", address.city);
                    form.setValue("state", address.state);
                    form.setValue("zipCode", address.zipCode);
                  }
                }}
              >
                {addresses.map((address) => (
                  <FieldLabel key={address.id} htmlFor={address.id}>
                    <Field orientation="horizontal">
                      <RadioGroupItem value={address.id} id={address.id} />
                      <FieldContent>
                        <FieldTitle>{address.recipient}</FieldTitle>
                        <FieldDescription>
                          {address.street}, {address.number}{" "}
                          {address.complement} {address.district} {address.city}{" "}
                          {address.state} {address.zipCode}
                        </FieldDescription>
                      </FieldContent>
                      <FieldContent className="flex flex-col sm:flex-row justify-end items-end gap-2">
                        {/* <Button variant="outline" size="xs">
                          <HugeiconsIcon icon={Edit04Icon} strokeWidth={2} />
                          Atualizar
                        </Button> */}
                        <Button
                          variant="destructive"
                          size="icon-xs"
                          onClick={() => onAddressRemove(address.id)}
                          disabled={removeAddressPending}
                        >
                          {removeAddressPending ? (
                            <Spinner />
                          ) : (
                            <HugeiconsIcon icon={Trash} strokeWidth={2} />
                          )}
                        </Button>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
            </div>
            {form.formState.errors.address && (
              <FieldError errors={[form.formState.errors.address]} />
            )}
          </div>
        )}

        {addresses?.length === 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="address"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Endereço *</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Rua das Flores, 123"
                      aria-invalid={fieldState.invalid}
                    />
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
                    <FieldLabel htmlFor={field.name}>Bairro *</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Centro"
                      aria-invalid={fieldState.invalid}
                    />
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
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={statesLoading}
                    >
                      <SelectTrigger className={"w-full"}>
                        {citiesLoading && <Spinner />}
                        <SelectValue placeholder="Selecione a cidade" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities?.map((city) => (
                          <SelectItem key={city.id} value={city.nome}>
                            {city.nome}
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
                        const id = states?.find(
                          (state) => state.sigla === value
                        )?.id;
                        if (!id) return;
                        await onFetchCities(id.toString());
                      }}
                      disabled={statesLoading}
                    >
                      <SelectTrigger className={"w-full"}>
                        {statesLoading && <Spinner />}
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {states?.map((state) => (
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
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Controller
                name="number"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Número *</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="123"
                      aria-invalid={fieldState.invalid}
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
                    <FieldLabel htmlFor={field.name}>Complemento</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Apto 101"
                      aria-invalid={fieldState.invalid}
                    />
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
                    <FieldLabel htmlFor={field.name}>CEP *</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <HugeiconsIcon icon={Search} strokeWidth={2} />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        placeholder="00000-000"
                        aria-invalid={fieldState.invalid}
                        value={formatZipCode(field.value)}
                        onChange={async (e) => {
                          if (e.target.value.length >= 9) return;
                          field.onChange(formatZipCode(e.target.value));
                          if (e.target.value.length < 8) return;
                          const response = await onCepLookup(e.target.value);
                          if (response) {
                            form.setValue("address", response.logradouro);
                            form.setValue("neighborhood", response.bairro);
                            form.setValue("city", response.localidade);
                            form.setValue("state", response.uf);
                          }
                        }}
                      />
                      <InputGroupAddon align={"inline-end"}>
                        {cepLoading && <Spinner />}
                      </InputGroupAddon>
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </>
        )}

        {addressesLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={onNext}
          disabled={createAddressPending || statesLoading}
          size="lg"
          className="w-full sm:w-auto ml-auto"
        >
          {createAddressPending ? <Spinner /> : "Continuar"}
        </Button>
      </CardFooter>
    </Card>
  );
}
