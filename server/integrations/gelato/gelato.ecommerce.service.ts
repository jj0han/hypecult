import { env } from "@/server/env";
import { gelatoEcommerceClient } from "./gelato.ecommerce.client";
import type {
  GelatoStoreProduct,
  GelatoStoreProductListResponse,
} from "./gelato.ecommerce.types";

const storeBase = () => `v1/stores/${env.GELATO_ECOMMERCE_STORE_ID}`;

export async function listProducts(): Promise<GelatoStoreProduct[]> {
  const all: GelatoStoreProduct[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const { data } =
      await gelatoEcommerceClient.get<GelatoStoreProductListResponse>(
        `${storeBase()}/products`,
        { params: { offset, limit, order: "asc", orderBy: "createdAt" } }
      );

    all.push(...data.products);

    if (data.products.length < limit) break;
    offset += limit;
  }

  return all;
}

export async function getProduct(
  productId: string
): Promise<GelatoStoreProduct> {
  const { data } = await gelatoEcommerceClient.get<GelatoStoreProduct>(
    `${storeBase()}/products/${productId}`
  );
  return data;
}
