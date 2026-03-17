import { gelatoClient } from "./gelato.client";
import type {
  GelatoCreateQuoteRequest,
  GelatoCreateQuoteResponse,
} from "./gelato.types";

export async function create(
  quote: GelatoCreateQuoteRequest
): Promise<GelatoCreateQuoteResponse> {
  const { data } = await gelatoClient.post<GelatoCreateQuoteResponse>(
    "v4/orders:quote",
    quote
  );
  return data;
}
