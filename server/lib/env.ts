import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development","test","production"]).default("development"),

  // URLs / Origins
  VITE_SITE_URL: z.string().url().optional(),
  ALLOWED_ORIGINS: z.string().optional(), // comma-separated
  CHROME_EXTENSION_ID: z.string().optional(),

  // Supabase / Auth
  VITE_SUPABASE_URL: z.string().url().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().min(10, "SUPABASE_JWT_SECRET required in production").optional(),

  // Feature flags
  MOCK_AUTH: z.enum(["0","1"]).default("0"),
  CAPTURE_GROUPS_ENABLED: z.enum(["true","false"]).default("true"),

  // Security / Limits
  RATE_LIMIT_WINDOW_MS: z.string().optional(),
  RATE_LIMIT_MAX: z.string().optional(),

  // Providers (optional here; each module can validate deeper)
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);

// Guardrails for production
if (env.NODE_ENV === "production") {
  // In development environments (like Replit), allow fallbacks
  const isDevEnvironment = process.env.REPL_ID || process.env.REPLIT_DEV_DOMAIN;
  
  if (!isDevEnvironment) {
    if (!env.SUPABASE_JWT_SECRET) throw new Error("SUPABASE_JWT_SECRET is required in production");
    if (!env.ALLOWED_ORIGINS) throw new Error("ALLOWED_ORIGINS is required in production");
    if (!env.VITE_SITE_URL) throw new Error("VITE_SITE_URL is required in production");
  } else {
    console.log("🔧 Running in development environment with relaxed production constraints");
  }
}