import { prodigiClient } from "./prodigi.client";
import type { ProdigiProductDetails } from "./prodigi.types";

export async function bySku(sku: string): Promise<ProdigiProductDetails> {
  const { data } = await prodigiClient.get(`/products/${sku}`);
  return data;
}
