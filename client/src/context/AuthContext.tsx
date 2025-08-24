// client/src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

type User = { id: string; email?: string | null } | null;

type AuthContextValue = {
  user: User;
  isLoading: boolean;
  signIn: (email?: string, password?: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Try to fetch current session/user from API; fall back to test user in dev
        const res = await fetch('/api/auth/session', { credentials: 'include' });
        if (!cancelled && res.ok) {
          const data = await res.json().catch(() => ({}));
          setUser(data?.user ?? null);
        } else if (!cancelled && import.meta.env.DEV) {
          setUser({ id: 'test-user', email: 'test@example.com' });
        }
      } catch {
        if (!cancelled && import.meta.env.DEV) setUser({ id: 'test-user', email: 'test@example.com' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function signIn(_email?: string, _password?: string) {
    // Stub; wire up when real auth is ready
    setUser({ id: 'test-user', email: _email ?? 'test@example.com' });
  }

  async function signOut() {
    try { await fetch('/api/auth/signout', { method: 'POST', credentials: 'include' }); } catch {}
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading: isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}