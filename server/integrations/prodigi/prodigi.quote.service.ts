import { prodigiClient } from "./prodigi.client";
import type { ProdigiCreateQuoteRequest, ProdigiQuotes } from "./prodigi.types";

export async function create(
  quote: ProdigiCreateQuoteRequest
): Promise<ProdigiQuotes> {
  const { data } = await prodigiClient.post<ProdigiQuotes>("/quotes", quote);
  return data;
}
