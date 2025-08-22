import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

type Cleanup = () => void;

export default function OAuthBridge() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const cleanUrl = () => {
      const clean = window.location.pathname + window.location.search;
      window.history.replaceState(null, "", clean);
    };

    const handle = async () => {
      // If we already have a session, nothing to do
      const initial = await supabase.auth.getSession();
      if (initial?.data?.session) return;

      // If URL hash contains tokens, set the session by hand
      const hash = window.location.hash?.startsWith("#") ? window.location.hash.slice(1) : "";
      const params = new URLSearchParams(hash);
      const error = params.get("error");
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (error) {
        console.error("OAuth error:", error, {
          error_code: params.get("error_code"),
          error_description: params.get("error_description"),
        });
        cleanUrl();
        return;
      }

      if (access_token && refresh_token) {
        try {
          const { error: setErr } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (setErr) {
            console.error("setSession error:", setErr);
          } else {
            // Success: clean the hash
            cleanUrl();
          }
        } catch (e) {
          console.error("setSession exception:", e);
          cleanUrl();
        }
        return;
      }

      // As a fallback, listen briefly for Supabase to hydrate automatically
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          cleanUrl();
        }
      });

      setTimeout(async () => {
        sub.subscription.unsubscribe();
        const again = await supabase.auth.getSession();
        if (again?.data?.session) {
          cleanUrl();
        }
      }, 1500);
    };

    handle();
  }, []);

  // This component renders nothing; it just runs once on app boot.
  return null;
}