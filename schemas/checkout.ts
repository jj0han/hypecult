import * as z from "zod";

export const checkoutFormSchema = z
  .object({
    firstName: z.string().min(1, "Nome é obrigatório"),
    lastName: z.string().min(1, "Sobrenome é obrigatório"),
    email: z.email("E-mail inválido"),
    phone: z.string(),
    cpf: z.string().min(11, "CPF é obrigatório"),
    address: z.string().min(1, "Endereço é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().min(1, "Estado é obrigatório"),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    zipCode: z.string().min(1, "CEP é obrigatório"),
    complement: z.string().optional(),
    number: z.string().min(1, "Número é obrigatório"),
    shippingMethod: z.string({ error: "Método de entrega é obrigatório" }),
    paymentType: z.string(),
    cardNumber: z.string(),
    expiryMonth: z.string(),
    expiryYear: z.string(),
    cvv: z.string(),
    nameOnCard: z.string(),
    agreeToTerms: z.boolean(),
    appliedPromo: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.paymentType === "card") {
      if (!data.cardNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número do cartão é obrigatório",
          path: ["cardNumber"],
        });
      }
      if (!data.expiryMonth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Mês de expiração é obrigatório",
          path: ["expiryMonth"],
        });
      }
      if (!data.expiryYear) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ano de expiração é obrigatório",
          path: ["expiryYear"],
        });
      }
      if (!data.cvv) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CVV é obrigatório",
          path: ["cvv"],
        });
      }
      if (!data.nameOnCard) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Nome no cartão é obrigatório",
          path: ["nameOnCard"],
        });
      }
    }
  });

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;
