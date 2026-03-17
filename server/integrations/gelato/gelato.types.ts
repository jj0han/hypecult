// ─── Shared ───────────────────────────────────────────────────────────────────

export type GelatoFileType =
  | "default"
  | "front"
  | "back"
  | "neck-inner"
  | "neck-outer"
  | "sleeve-left"
  | "sleeve-right"
  | "inside"
  | "chest-left-embroidery"
  | "chest-center-embroidery"
  | "chest-large-embroidery"
  | "sleeve-left-embroidery"
  | "sleeve-right-embroidery"
  | "wrist-left-embroidery"
  | "wrist-right-embroidery"
  | string;

export interface GelatoFile {
  id?: string;
  type: GelatoFileType;
  url?: string;
  threadColors?: string[];
  isVisible?: boolean;
}

export interface GelatoAddress {
  country: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postCode: string;
  state?: string;
  email: string;
  phone?: string;
  isBusiness?: boolean;
  federalTaxId?: string;
  stateTaxId?: string;
  registrationStateCode?: string;
}

export interface GelatoMetadata {
  key: string;
  value: string;
}

// ─── Quote ────────────────────────────────────────────────────────────────────

export interface GelatoQuoteProduct {
  itemReferenceId: string;
  productUid: string;
  pageCount?: number;
  files?: GelatoFile[];
  quantity: number;
}

export interface GelatoCreateQuoteRequest {
  orderReferenceId: string;
  customerReferenceId: string;
  currency: string;
  allowMultipleQuotes?: boolean;
  recipient: GelatoAddress;
  products: GelatoQuoteProduct[];
}

export interface GelatoShipmentMethod {
  name: string;
  shipmentMethodUid: string;
  price: number;
  currency: string;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  minDeliveryDate: string;
  maxDeliveryDate: string;
  type: "normal" | "standard" | "express" | "pick_up" | "pallet" | string;
  isPrivate: boolean;
  isBusiness: boolean;
  totalWeight: number;
  numberOfParcels: number;
  incoTerms?: string;
}

export interface GelatoQuoteProductResult {
  itemReferenceId: string;
  productUid: string;
  quantity: number;
  price: number;
  currency: string;
}

export interface GelatoQuote {
  id: string;
  itemReferenceIds: string[];
  fulfillmentCountry: string;
  shipmentMethods: GelatoShipmentMethod[];
  products: GelatoQuoteProductResult[];
}

export interface GelatoCreateQuoteResponse {
  orderReferenceId: string;
  quotes: GelatoQuote[];
}

// ─── Order ────────────────────────────────────────────────────────────────────

export interface GelatoOrderItem {
  itemReferenceId: string;
  productUid: string;
  pageCount?: number;
  files?: GelatoFile[];
  quantity: number;
  adjustProductUidByFileTypes?: boolean;
}

export interface GelatoReturnAddress {
  companyName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postCode?: string;
  state?: string;
  country?: string;
  email?: string;
  phone?: string;
}

export interface GelatoCreateOrderRequest {
  orderType?: "order" | "draft";
  orderReferenceId: string;
  customerReferenceId: string;
  currency: string;
  items: GelatoOrderItem[];
  shipmentMethodUid?: string;
  shippingAddress: GelatoAddress;
  returnAddress?: GelatoReturnAddress;
  metadata?: GelatoMetadata[];
}

// ─── Order Response ───────────────────────────────────────────────────────────

export type GelatoFulfillmentStatus =
  | "created"
  | "uploading"
  | "passed"
  | "in_production"
  | "printed"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "canceled"
  | string;

export type GelatoFinancialStatus =
  | "draft"
  | "pending"
  | "invoiced"
  | "paid"
  | "canceled"
  | string;

export interface GelatoOrderItemPreview {
  type: string;
  url: string;
}

export interface GelatoOrderItemResult {
  id: string;
  itemReferenceId: string;
  productUid: string;
  files: GelatoFile[];
  processedFileUrl?: string;
  quantity: number;
  fulfillmentStatus: GelatoFulfillmentStatus;
  previews?: GelatoOrderItemPreview[];
}

export interface GelatoShipmentPackage {
  id: string;
  orderItemIds: string[];
  trackingCode?: string;
  trackingUrl?: string;
}

export interface GelatoOrderShipment {
  id: string;
  shipmentMethodName: string;
  shipmentMethodUid: string;
  minDeliveryDays: number;
  maxDeliveryDays: number;
  minDeliveryDate: string;
  maxDeliveryDate: string;
  totalWeight: number;
  fulfillmentCountry: string;
  packagesCount: number;
  packages: GelatoShipmentPackage[];
}

export interface GelatoReceiptItem {
  id: string;
  receiptId: string;
  referenceId: string;
  type: "product" | "shipment" | "packaging" | string;
  title: string;
  currency: string;
  priceBase: number;
  amount: number;
  priceInitial: number;
  discount: number;
  price: number;
  vat: number;
  priceInclVat: number;
  createdAt: string;
  updatedAt: string;
}

export interface GelatoReceipt {
  id: string;
  orderId: string;
  transactionType: string;
  currency: string;
  items: GelatoReceiptItem[];
  productsPriceInitial: number;
  productsPriceDiscount: number;
  productsPrice: number;
  productsPriceVat: number;
  productsPriceInclVat: number;
  packagingPriceInitial: number;
  packagingPriceDiscount: number;
  packagingPrice: number;
  packagingPriceVat: number;
  packagingPriceInclVat: number;
  shippingPriceInitial: number;
  shippingPriceDiscount: number;
  shippingPrice: number;
  shippingPriceVat: number;
  shippingPriceInclVat: number;
  discount: number;
  discountVat: number;
  discountInclVat: number;
  totalInitial: number;
  total: number;
  totalVat: number;
  totalInclVat: number;
}

export interface GelatoOrderResponse {
  id: string;
  orderType: "order" | "draft" | string;
  orderReferenceId: string;
  customerReferenceId: string;
  fulfillmentStatus: GelatoFulfillmentStatus;
  financialStatus: GelatoFinancialStatus;
  currency: string;
  channel: string;
  createdAt: string;
  updatedAt: string;
  orderedAt?: string;
  items: GelatoOrderItemResult[];
  metadata?: GelatoMetadata[];
  shipment?: GelatoOrderShipment;
  shippingAddress: GelatoAddress & { id: string; orderId: string };
  returnAddress?: GelatoAddress & { id: string; orderId: string };
  receipts?: GelatoReceipt[];
}

export interface GelatoOrderListResponse {
  orders: GelatoOrderResponse[];
  total: number;
}
