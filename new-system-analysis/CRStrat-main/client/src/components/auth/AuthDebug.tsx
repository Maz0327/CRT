// client/src/components/auth/AuthDebug.tsx
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export default function AuthDebug() {
  const { status, user } = useAuth();
  useEffect(() => {
    console.log('[AuthDebug] href', window.location.href);
    supabase.auth.getSession().then(r => console.log('[AuthDebug] getSession', !!r.data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((e, s) => {
      console.log('[AuthDebug] onAuthStateChange', e, !!s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return <div className="fixed bottom-2 right-2 text-[10px] opacity-40 bg-zinc-800 px-2 py-1 rounded text-zinc-300">
    {status} · {user?.email ?? 'anon'}
  </div>;
}