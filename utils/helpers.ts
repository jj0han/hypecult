import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";
import type {
  OrderStatus,
  ShirtSize,
} from "@/server/db/generated/prisma/enums";

export async function copyToClipboard(text: string) {
  await navigator.clipboard.writeText(text);
}

export function getStatusVariant(
  status: OrderStatus
): VariantProps<typeof badgeVariants>["variant"] {
  switch (status) {
    case "pending":
      return "secondary";
    case "paid":
      return "outline";
    case "production":
      return "outline";
    case "shipped":
      return "outline";
    case "delivered":
      return "default";
    case "cancelled":
      return "destructive";
    default:
      return "secondary";
  }
}

export function getStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "Pendente";
    case "paid":
      return "Pago";
    case "production":
      return "Produção";
    case "shipped":
      return "Enviado";
    case "delivered":
      return "Entregue";
    case "cancelled":
      return "Cancelado";
    default:
      return "Status desconhecido";
  }
}

export function getShirtSizeLabel(size: ShirtSize | string | undefined | null) {
  if (!size) return undefined;
  switch (size.toUpperCase()) {
    case "PP":
      return "xs";
    case "P":
      return "s";
    case "M":
      return "m";
    case "G":
      return "l";
    case "GG":
      return "xl";
  }
}

export function getColorLabel(color: string) {
  switch (color.toLowerCase()) {
    case "preto":
      return "black";
    case "branco":
      return "white";
    case "vermelho":
      return "red";
    case "azul":
      return "blue";
    case "verde":
      return "green";
    case "amarelo":
      return "yellow";
    case "roxo":
      return "purple";
    case "rosa":
      return "pink";
    case "marrom":
      return "brown";
    case "cinza":
      return "gray";
    case "laranja":
      return "orange";
  }
}
