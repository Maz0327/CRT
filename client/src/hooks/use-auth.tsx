import { useSupabaseAuth, SupabaseAuthProvider } from '../contexts/SupabaseAuthContext';
import { useQuery } from '@tanstack/react-query';

// Re-export AuthProvider for compatibility
export const AuthProvider = SupabaseAuthProvider;

// Compatibility layer for existing auth hook
export function useAuth() {
  const { user, loading, signOut } = useSupabaseAuth();

  // Fetch additional user data from our database
  const { data: userData, isLoading: userDataLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    enabled: !!user,
    retry: false,
  });

  return {
    user: (userData as any)?.user || (user ? {
      id: user.id,
      email: user.email || '',
      username: user.user_metadata?.username || user.email?.split('@')[0] || '',
      role: user.user_metadata?.role || 'user',
    } : null),
    isLoading: loading || userDataLoading,
    isAuthenticated: !!user,
    logout: signOut,
  };
}