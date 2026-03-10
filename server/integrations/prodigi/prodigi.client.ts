import axios from "axios";
import { env } from "@/server/env";

export const prodigiClient = axios.create({
  baseURL: env.PRODIGI_API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": env.PRODIGI_API_KEY,
  },
});
