import z from "zod";

const envSchema = z.object({
  dimona: z.object({
    apiUrl: z.url(),
    apiKey: z.string(),
    apiKeyHeader: z.string(),
    createOrderPath: z.string(),
    orderStatusPathTemplate: z.string(),
    timeoutMs: z.number().int().positive(),
  }),
  stripe: z.object({
    webhookSecret: z.string(),
    internalRetrySecret: z.string(),
  }),
});

export const env = envSchema.parse(process.env);

