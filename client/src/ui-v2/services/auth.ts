import { api } from '../lib/api';
import { User } from '../types/dto';

export const authService = {
  async me(): Promise<User | null> {
    try {
      return await api.get<User>('/auth/me');
    } catch (error) {
      if (error && typeof error === 'object' && 'status' in error && error.status === 401) {
        return null;
      }
      throw error;
    }
  },

  async signOut(): Promise<void> {
    await api.post('/auth/signout');
  },

  getGoogleSignInUrl(): string {
    return `${import.meta.env.VITE_API_BASE_URL || '/api'}/auth/google/start`;
  },
};