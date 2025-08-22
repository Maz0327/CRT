// client/src/components/auth/AuthGuard.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'wouter';

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setAuthed(!!data.session);
      setReady(true);
      if (!data.session) setLocation('/login');
    };

    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setAuthed(!!session);
      if (!session) setLocation('/login');
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [setLocation]);

  if (!ready) return <div className="p-8 text-zinc-300">Checking session…</div>;
  if (!authed) return null;
  return <>{children}</>;
};