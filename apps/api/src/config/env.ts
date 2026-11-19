import { z } from "zod";

/**
 * Contrato das variáveis de ambiente da API.
 * Validar na inicialização evita que o servidor suba "meio configurado"
 * e só falhe em runtime (ex.: no primeiro login).
 */
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  HOST: z.string().min(1).default("0.0.0.0"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),

  MONGODB_URI: z
    .string()
    .regex(
      /^mongodb(\+srv)?:\/\//,
      "Deve começar com mongodb:// ou mongodb+srv://",
    ),

  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.email(),
  FIREBASE_PRIVATE_KEY: z
    .string()
    .min(1)
    .transform((value) =>
      value
        .trim()
        .replace(/^["']|["']$/g, "")
        .replace(/\\n/g, "\n"),
    ),

  GOOGLE_BOOKS_API_KEY: z
    .string()
    .optional()
    .transform((value) =>
      value === undefined || value.trim() === "" ? undefined : value.trim(),
    ),

  CORS_ORIGIN: z
    .string()
    .optional()
    .transform((value) =>
      value === undefined || value.trim() === ""
        ? undefined
        : value
            .split(",")
            .map((origin) => origin.trim().replace(/\/+$/, ""))
            .filter(Boolean),
    ),

  IMPORT_REQUIRES_AUTH: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),

  REVIEW_REQUIRES_AUTH: z
    .enum(["true", "false"])
    .default("true")
    .transform((value) => value === "true"),

  ADMIN_EMAILS: z
    .string()
    .optional()
    .transform((value) =>
      value === undefined || value.trim() === ""
        ? []
        : value
            .split(",")
            .map((email) => email.trim().toLowerCase())
            .filter(Boolean),
    ),
}).refine(
  (config) => !(config.NODE_ENV === "production" && (!config.IMPORT_REQUIRES_AUTH || !config.REVIEW_REQUIRES_AUTH)),
  {
    path: ["REVIEW_REQUIRES_AUTH"],
    message: "Flags de autenticação não podem ser false em produção",
  },
);

export type Env = z.infer<typeof EnvSchema>;

function loadEnv(source: NodeJS.ProcessEnv): Env {
  const result = EnvSchema.safeParse(source);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Variáveis de ambiente inválidas ou ausentes:\n${details}`);
  }

  return result.data;
}

export const env: Env = loadEnv(process.env);
