import axios from "axios";
import { env } from "@/server/env";

const { origin } = new URL(env.GELATO_ECOMMERCE_API_URL);

export const gelatoEcommerceClient = axios.create({
  baseURL: origin,
  headers: {
    "Content-Type": "application/json",
    "X-API-KEY": env.GELATO_API_KEY,
  },
});
