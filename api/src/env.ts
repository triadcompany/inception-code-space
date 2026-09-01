import { config } from "dotenv";
import { z } from "zod";

config();

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  INTERNAL_TOKEN: z.string().min(8).default("dev-internal-token"),
  YOUTUBE_API_KEY: z.string().optional().default(""),
  UPLOAD_DIR: z.string().default("./uploads"),
  PORT: z.coerce.number().int().positive().default(8080),
  CORS_ORIGINS: z
    .string()
    .default("")
    .transform((s) =>
      s
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    ),
  ENABLE_CRON: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  NODE_ENV: z.string().default("development"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment configuration:");
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  cached = parsed.data;
  return cached;
}

export const env = loadEnv();
