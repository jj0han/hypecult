import {
  Banknote,
  Building2,
  Check,
  Clock,
  CreditCard,
  MapPin,
  QrCodeScanIcon,
  Smartphone,
  Truck,
  User,
  Wallet,
} from "@hugeicons/core-free-icons";

export const checkoutSteps = [
  { step: 0, label: "Identificação", icon: User },
  { step: 1, label: "Entrega", icon: MapPin },
  { step: 2, label: "Frete", icon: Truck },
  { step: 3, label: "Pagamento", icon: CreditCard },
  { step: 4, label: "Revisão", icon: Check },
] as const;

export const paymentMethods = [
  {
    value: "card",
    label: "Cartão de crédito/débito",
    description: "Visa, Mastercard, American Express",
    icon: CreditCard,
    className: "text-primary",
  },
  {
    value: "pix",
    label: "Pix",
    description: "QR Code para pagamento imediato",
    icon: QrCodeScanIcon,
    className: "text-blue-600",
  },
  {
    value: "boleto",
    label: "Boleto Bancário",
    description: "Transferência direta bancária",
    icon: Banknote,
    className: "text-yellow-600",
  },
] as const;

