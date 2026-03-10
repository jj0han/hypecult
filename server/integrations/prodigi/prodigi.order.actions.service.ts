import { prodigiClient } from "./prodigi.client";

export async function list(orderId: string) {
  const { data } = await prodigiClient.get(`/orders/${orderId}/actions`);
  return data;
}
