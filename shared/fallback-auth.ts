// Fallback authentication system when Supabase is not available
export interface FallbackUser {
  id: string;
  email: string;
  username?: string;
  role?: string;
}

export class FallbackAuthService {
  private currentUser: FallbackUser | null = null;
  private listeners: ((user: FallbackUser | null) => void)[] = [];

  constructor() {
    // Load user from localStorage if available
    const stored = localStorage.getItem('fallback-user');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem('fallback-user');
      }
    }
  }

  getCurrentUser(): FallbackUser | null {
    return this.currentUser;
  }

  signInWithEmail(email: string, password: string): Promise<{ user: FallbackUser | null; error: string | null }> {
    return new Promise((resolve) => {
      // For demo purposes, allow any email/password combination
      if (email && password) {
        const user: FallbackUser = {
          id: 'demo-user-' + Date.now(),
          email,
          username: email.split('@')[0],
          role: 'user'
        };
        
        this.currentUser = user;
        localStorage.setItem('fallback-user', JSON.stringify(user));
        this.notifyListeners();
        
        resolve({ user, error: null });
      } else {
        resolve({ user: null, error: 'Invalid credentials' });
      }
    });
  }

  signOut(): Promise<{ error: string | null }> {
    return new Promise((resolve) => {
      this.currentUser = null;
      localStorage.removeItem('fallback-user');
      this.notifyListeners();
      resolve({ error: null });
    });
  }

  onAuthStateChange(callback: (user: FallbackUser | null) => void): () => void {
    this.listeners.push(callback);
    
    // Call immediately with current state
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }
}

export const fallbackAuth = new FallbackAuthService();