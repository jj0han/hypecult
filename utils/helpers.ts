import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "@/components/ui/badge";
import type { OrderStatus } from "@/server/db/generated/prisma/enums";

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
