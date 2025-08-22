export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  logLevel: process.env.LOG_LEVEL || "info",
  supabase: {
    url: process.env.SUPABASE_URL || "",
    anonKey: process.env.SUPABASE_ANON_KEY || "",
  },
};