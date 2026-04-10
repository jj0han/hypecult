import { loadEnvConfig } from "@next/env";
import z from "zod";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const envSchema = z.object({
  DATABASE_URL: z.url(),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.url(),
  GELATO_ORDER_API_URL: z.url(),
  GELATO_ECOMMERCE_API_URL: z.url(),
  GELATO_ECOMMERCE_STORE_ID: z.string(),
  GELATO_API_KEY: z.string(),
  GELATO_SYNC_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string(),
  NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
