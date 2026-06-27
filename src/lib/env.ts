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

  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
});

function validateEnv() {
  const serverResult = serverSchema.safeParse(process.env);
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
