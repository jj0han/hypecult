export type GelatoStoreProductStatus =
  | "created"
  | "publishing"
  | "publishing_error"
  | "active"
  | string;

export type GelatoVariantConnectionStatus =
  | "connected"
  | "not_connected"
  | "ignored"
  | string;

export interface GelatoStoreVariant {
  id: string;
  clientId?: string;
  productId: string;
  title: string; // e.g. "White - S - DTG (Direct-to-garment)" — format: "Color - Size - Technology"
  externalId: string | null;
  connectionStatus: GelatoVariantConnectionStatus;
  isHidden?: boolean;
  productUid: string;
}

export interface GelatoProductVariantOption {
  name: string; // "Color" | "Size"
  values: string[];
}

export interface GelatoProductImage {
  id: string;
  fileUrl: string;
  storeId: string;
  productId: string;
  isPrimary: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  skipPublishing: boolean;
  productVariantIds: string[];
}

export interface GelatoStoreProduct {
  id: string;
  storeId: string;
  externalId: string | null;
  title: string;
  description: string;
  previewUrl: string | null;
  externalPreviewUrl: string | null | ""; // Gelato returns "" (empty string) when not set
  externalThumbnailUrl: string | null | "";
  publishingErrorCode: string | null;
  status: GelatoStoreProductStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  variants: GelatoStoreVariant[];
  productVariantOptions: GelatoProductVariantOption[];
  productImages: GelatoProductImage[]; // permanent hosted images added via the dashboard
}

export interface GelatoStoreProductListResponse {
  products: GelatoStoreProduct[];
}
