export const formatZipCode = (zipCode: string) => {
  return zipCode.replace(/\D/g, "").replace(/(\d{5})(\d{3})/, "$1-$2");
};

export const formatPhone = (phone: string) => {
  return phone
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};
