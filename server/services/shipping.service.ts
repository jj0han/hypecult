export const SHIPPING_OPTIONS = [
  {
    id: "pac",
    label: "PAC",
    price: 19.9,
    deadline: "5-8 dias úteis",
  },
  {
    id: "sedex",
    label: "Sedex",
    price: 34.9,
    deadline: "2-3 dias úteis",
  },
  {
    id: "jt",
    label: "J&T Express",
    price: 24.9,
    deadline: "3-5 dias úteis",
  },
] as const;

export function getShippingOptions() {
  return SHIPPING_OPTIONS;
}

export function getShippingOptionById(id: string) {
  return SHIPPING_OPTIONS.find((option) => option.id === id);
}

