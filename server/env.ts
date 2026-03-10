import { loadEnvConfig } from "@next/env";
import z from "zod";

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const envSchema = z.object({
  DATABASE_URL: z.url(),
  PRODIGI_API_URL: z.url(),
  PRODIGI_API_URL_SANDBOX: z.url().optional(),
  PRODIGI_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
