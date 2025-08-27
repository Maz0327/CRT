import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client using SERVICE ROLE key (do not expose to client)
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_JWT_SECRET!, // This is the service role key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);