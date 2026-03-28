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

export const formatCpf = (cpf: string) => {
  const digits = cpf.replace(/\D/g, "").slice(0, 11);
  const formatted = digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return formatted;
};
