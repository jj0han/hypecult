import assert from "node:assert/strict";
import test from "node:test";
import { checkoutFormSchema } from "@/schemas/checkout";
import { createOrderSchema } from "@/schemas/order";

const productId = "1ec6de18-d840-4d58-b615-f0079f632742";
const variantId = "3f892614-c5ee-40f6-b59a-f2f2d0e0dcd7";

const validOrder = {
  items: [{ productId, variantId, quantity: 1 }],
  address: {
    recipient: "Cliente Teste",
    zipCode: "01001000",
    street: "Praça da Sé",
    number: "100",
    complement: "Apto 1",
    neighborhood: "Sé",
    city: "São Paulo",
    state: "SP",
  },
  shipping: {
    id: "standard",
    label: "Entrega padrão",
    price: 19.9,
    deadline: "5 dias úteis",
  },
  cpf: "12345678901",
};

const validCheckoutForm = {
  firstName: "Cliente",
  lastName: "Teste",
  email: "cliente@example.com",
  phone: "11999999999",
  cpf: "12345678901",
  address: "Praça da Sé",
  city: "São Paulo",
  state: "SP",
  neighborhood: "Sé",
  zipCode: "01001000",
  complement: "",
  number: "100",
  shippingMethod: "standard",
  paymentType: "pix",
  cardNumber: "",
  expiryMonth: "",
  expiryYear: "",
  cvv: "",
  nameOnCard: "",
  agreeToTerms: true,
  appliedPromo: "",
};

test("createOrderSchema accepts a complete order payload", () => {
  assert.equal(createOrderSchema.safeParse(validOrder).success, true);
});

test("createOrderSchema rejects empty carts and invalid quantities", () => {
  assert.equal(
    createOrderSchema.safeParse({ ...validOrder, items: [] }).success,
    false
  );
  assert.equal(
    createOrderSchema.safeParse({
      ...validOrder,
      items: [{ productId, variantId, quantity: 0 }],
    }).success,
    false
  );
});

test("checkoutFormSchema requires card fields only for card payments", () => {
  assert.equal(checkoutFormSchema.safeParse(validCheckoutForm).success, true);

  const cardResult = checkoutFormSchema.safeParse({
    ...validCheckoutForm,
    paymentType: "card",
  });

  assert.equal(cardResult.success, false);
  if (!cardResult.success) {
    assert.deepEqual(
      cardResult.error.issues.map((issue) => issue.path.join(".")),
      ["cardNumber", "expiryMonth", "expiryYear", "cvv", "nameOnCard"]
    );
  }
});
