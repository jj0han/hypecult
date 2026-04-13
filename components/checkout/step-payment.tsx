/** biome-ignore-all lint/suspicious/noArrayIndexKey: we need to use the index as a key */
import {
  ChevronLeft,
  CreditCard,
  Lock,
  User,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { UseFormReturn } from "react-hook-form";
import { Controller } from "react-hook-form";
import { paymentMethods } from "@/app/checkout/constants";
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
import type { CheckoutFormData } from "@/schemas/checkout";

interface StepPaymentProps {
  form: UseFormReturn<CheckoutFormData>;
  paymentType: string;
  onNext: () => void;
  onPrev: () => void;
}

export function StepPayment({
  form,
  paymentType,
  onNext,
  onPrev,
}: StepPaymentProps) {
  return (
    <Card className="flex flex-col gap-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={CreditCard} strokeWidth={2} className="size-5" />
          Informações de pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Label className="font-medium">Escolha o método de pagamento</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Controller
              name="paymentType"
              control={form.control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-subgrid col-span-full gap-3"
                >
                  {paymentMethods.map(
                    ({ value, label, description, icon, className }) => (
                      <FieldLabel key={value} htmlFor={value}>
                        <Field orientation="horizontal">
                          <HugeiconsIcon
                            icon={icon}
                            strokeWidth={2}
                            className={className}
                          />
                          <FieldContent>
                            <FieldTitle>{label}</FieldTitle>
                            <FieldDescription>{description}</FieldDescription>
                          </FieldContent>
                          <RadioGroupItem value={value} id={value} />
                        </Field>
                      </FieldLabel>
                    )
                  )}
                </RadioGroup>
              )}
            />
          </div>
        </div>

        {paymentType === "card" && (
          <div className="flex flex-col gap-4">
            <Controller
              name="nameOnCard"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nome no cartão *</FieldLabel>
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
                      placeholder="João Silva"
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
              name="cardNumber"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Número do cartão *
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <HugeiconsIcon
                        icon={CreditCard}
                        strokeWidth={2}
                        className="size-4"
                      />
                    </InputGroupAddon>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      placeholder="0000 0000 0000 0000"
                      aria-invalid={fieldState.invalid}
                    />
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="grid grid-cols-3 gap-4">
              <Controller
                name="expiryMonth"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Mês *</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem
                            key={i + 1}
                            value={String(i + 1).padStart(2, "0")}
                          >
                            {String(i + 1).padStart(2, "0")}
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
                name="expiryYear"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Ano *</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 10 }, (_, i) => (
                          <SelectItem key={2024 + i} value={String(2024 + i)}>
                            {2024 + i}
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
                name="cvv"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>CVV *</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <HugeiconsIcon
                          icon={Lock}
                          strokeWidth={2}
                          className="size-4"
                        />
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        placeholder="000"
                        maxLength={4}
                        aria-invalid={fieldState.invalid}
                      />
                    </InputGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between flex-col sm:flex-row gap-4">
        <Button
          size="lg"
          variant="outline"
          onClick={onPrev}
          className="w-full sm:w-auto"
        >
          <HugeiconsIcon icon={ChevronLeft} strokeWidth={2} />
          Voltar
        </Button>
        <Button size="lg" onClick={onNext} className="w-full sm:w-auto">
          Continuar
        </Button>
      </CardFooter>
    </Card>
  );
}
