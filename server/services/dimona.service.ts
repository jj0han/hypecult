import { env } from "@/server/env";

export class DimonaSyncError extends Error {
  retryable: boolean;

  constructor(message: string, retryable = true) {
    super(message);
    this.name = "DimonaSyncError";
    this.retryable = retryable;
  }
}

export type DimonaOrderItem = {
  sku?: string;
  productId?: string;
  variantId?: string;
  quantity: number;
  metadata?: Record<string, string>;
};

export type DimonaOrderPayload = {
  externalId: string;
  recipient: {
    name: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  shipping: {
    method: string;
    price: number;
  };
  items: DimonaOrderItem[];
  metadata?: Record<string, string>;
};

export type DimonaCreateOrderResponse = {
  id?: string;
  orderId?: string;
  status?: string;
  [key: string]: unknown;
};

function buildHeaders() {
  if (!env.dimona.apiKey) {
    throw new DimonaSyncError("DIMONA_API_KEY is not configured", false);
  }

  return {
    "content-type": "application/json",
    [env.dimona.apiKeyHeader]: env.dimona.apiKey,
  };
}

function withTimeout(timeoutMs: number): AbortSignal {
  return AbortSignal.timeout(timeoutMs);
}

export async function createDimonaOrder(payload: DimonaOrderPayload) {
  const url = new URL(env.dimona.createOrderPath, env.dimona.apiUrl);

  const response = await fetch(url, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
    signal: withTimeout(env.dimona.timeoutMs),
  }).catch((error) => {
    throw new DimonaSyncError(`DIMONA_NETWORK_ERROR: ${String(error)}`, true);
  });

  const text = await response.text();
  const json = text ? (JSON.parse(text) as DimonaCreateOrderResponse) : {};

  if (!response.ok) {
    const retryable = response.status >= 500 || response.status === 429;
    throw new DimonaSyncError(
      `DIMONA_CREATE_FAILED (${response.status}): ${text.slice(0, 500)}`,
      retryable
    );
  }

  return json;
}

export async function fetchDimonaOrderStatus(orderId: string) {
  const path = env.dimona.orderStatusPathTemplate.replace("{id}", orderId);
  const url = new URL(path, env.dimona.apiUrl);

  const response = await fetch(url, {
    method: "GET",
    headers: buildHeaders(),
    signal: withTimeout(env.dimona.timeoutMs),
  }).catch((error) => {
    throw new DimonaSyncError(`DIMONA_NETWORK_ERROR: ${String(error)}`, true);
  });

  const text = await response.text();
  const json = (text ? JSON.parse(text) : {}) as Record<string, unknown>;

  if (!response.ok) {
    const retryable = response.status >= 500 || response.status === 429;
    throw new DimonaSyncError(
      `DIMONA_STATUS_FAILED (${response.status}): ${text.slice(0, 500)}`,
      retryable
    );
  }

  return json;
}

