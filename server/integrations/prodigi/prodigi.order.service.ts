import { prodigiClient } from "./prodigi.client";
import type {
  ProdigiCreateOrderRequest,
  ProdigiCreateOrderResponse,
  ProdigiGetOrderResponse,
} from "./prodigi.types";

export async function create(
  order: ProdigiCreateOrderRequest
): Promise<ProdigiCreateOrderResponse> {
  const { data } = await prodigiClient.post<ProdigiCreateOrderResponse>(
    "/orders",
    order
  );
  return data;
}

// TODO: Implement filters
export async function list(): Promise<ProdigiGetOrderResponse[]> {
  const { data } =
    await prodigiClient.get<ProdigiGetOrderResponse[]>("/orders");
  return data;
}

export async function byId(id: string): Promise<ProdigiGetOrderResponse> {
  const { data } = await prodigiClient.get<ProdigiGetOrderResponse>(
    `/orders/${id}`
  );
  return data;
}
