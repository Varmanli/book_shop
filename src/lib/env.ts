import { z } from "zod";

const serverSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine((url) => url.startsWith("postgres"), {
      message: "DATABASE_URL must be a PostgreSQL connection string",
    }),

  AUTH_SECRET: z.string().min(32, {
    message: "AUTH_SECRET must be at least 32 characters. Generate with: openssl rand -base64 32",
  }),

  UPLOADTHING_TOKEN: z.string().min(1).optional(),

  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_BASE_URL: z.string().url().optional(),

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

function validateEnv() {
  const validationEnvironment =
    process.env.ENV_VALIDATION_CONTEXT === "build"
      ? { ...process.env, DATABASE_URL: process.env.BUILD_DATABASE_URL }
      : process.env;
  const serverResult = serverSchema.safeParse(validationEnvironment);
  const clientResult = clientSchema.safeParse(process.env);

  if (!serverResult.success) {
    console.error("❌ Invalid server environment variables:");
    console.error(serverResult.error.flatten().fieldErrors);
    throw new Error("Invalid server environment variables. Check the console output.");
  }

  if (!clientResult.success) {
    console.error("❌ Invalid client environment variables:");
    console.error(clientResult.error.flatten().fieldErrors);
    throw new Error("Invalid client environment variables. Check the console output.");
  }

  return {
    ...serverResult.data,
    ...clientResult.data,
  };
}

export const env = validateEnv();
