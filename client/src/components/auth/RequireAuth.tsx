import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/context/AuthContext';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { status, user } = useAuth();
  const [, navigate] = useLocation();

  // Always call hooks at the top level
  React.useEffect(() => {
    if (status === 'anon' || (!user && status !== 'loading')) {
      navigate('/login', { replace: true });
    }
  }, [status, user, navigate]);

  if (status === 'loading') {
    return <div className="p-6 text-sm opacity-70">Loading…</div>;
  }
  
  if (status === 'anon' || !user) {
    return null;
  }
  
  return <>{children}</>;
}