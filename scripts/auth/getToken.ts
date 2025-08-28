import { createClient } from "@supabase/supabase-js";

export async function getSupabaseAccessToken({
  email,
  password,
  supabaseUrl = process.env.SUPABASE_URL!,
  supabaseAnonKey = process.env.SUPABASE_ANON_KEY!,
}: {
  email: string;
  password: string;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
}): Promise<string> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars");
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data?.session?.access_token) {
    throw new Error("Supabase login failed: " + (error?.message || "no session"));
  }
  return data.session.access_token;
}