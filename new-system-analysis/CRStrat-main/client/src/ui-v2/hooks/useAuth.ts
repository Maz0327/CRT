import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api, IS_MOCK_MODE } from "../lib/api";

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isSigningOut: boolean;
  getSignInUrl: () => string;
  signIn: () => void;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

function token() {
  try { return localStorage.getItem("sb-access-token"); } catch { return null; }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // For development, check if we have a token or default to authenticated for testing
    const currentToken = token();
    return currentToken !== null ? !!currentToken : true; // Default to authenticated if no token for dev
  });

  const signIn = useCallback(() => {
    if (IS_MOCK_MODE) {
      localStorage.setItem("sb-access-token", "mock-token");
      setIsAuthenticated(true);
      return;
    }
    // For Google OAuth, redirect to server endpoint that handles Supabase auth
    window.location.href = "/api/auth/google/start";
  }, []);

  const getSignInUrl = useCallback(() => {
    if (IS_MOCK_MODE) return "/auth/mock-login";
    return "/api/auth/google/start"; 
  }, []);

  const signOut = useCallback(async () => {
    setIsSigningOut(true);
    try {
      try { await api.post("/api/auth/logout"); } catch { /* ignore logout API call failures */ }
      localStorage.removeItem("sb-access-token");
      setIsAuthenticated(false); // Update state immediately
      location.assign("/"); // force reload to clear state
    } finally {
      setIsSigningOut(false);
    }
  }, []);

  const user: AuthUser | null = isAuthenticated 
    ? { id: "user_1", email: "admin@contentradار.com", name: "Content Radar Admin", avatar_url: undefined }
    : null;

  const value = useMemo<AuthCtx>(() => ({
    user, loading: false, isAuthenticated, isSigningOut, getSignInUrl, signIn, signOut
  }), [user, isAuthenticated, isSigningOut, getSignInUrl, signIn, signOut]);

  return React.createElement(Ctx.Provider, { value }, children);
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}