import axios from "axios";
import { env } from "@/server/env";

// Use just the origin so that relative paths like "v4/orders" and "v4/orders:quote"
// resolve correctly via axios's combineURLs logic.
const { origin } = new URL(env.GELATO_ORDER_API_URL);

export const gelatoClient = axios.create({
  baseURL: origin,
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": env.GELATO_API_KEY,
  },
});
