import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useSupabaseUser() {
  const [user, setUser] = useState<Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUser(data.user ?? null);
        setIsLoading(false);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setUser(sess?.user ?? null);
      setIsLoading(false);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);
  
  return { user, isLoading };
}