import { gelatoClient } from "./gelato.client";
import type {
  GelatoCreateOrderRequest,
  GelatoOrderListResponse,
  GelatoOrderResponse,
} from "./gelato.types";

export async function create(
  order: GelatoCreateOrderRequest
): Promise<GelatoOrderResponse> {
  const { data } = await gelatoClient.post<GelatoOrderResponse>(
    "v4/orders",
    order
  );
  return data;
}

export async function list(): Promise<GelatoOrderListResponse> {
  const { data } = await gelatoClient.get<GelatoOrderListResponse>("v4/orders");
  return data;
}

export async function byId(id: string): Promise<GelatoOrderResponse> {
  const { data } = await gelatoClient.get<GelatoOrderResponse>(
    `v4/orders/${id}`
  );
  return data;
}
