import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { LogIn, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { GlassCard } from '../components/primitives/GlassCard';
import { api } from '../lib/api';

export default function AuthPage() {
  const { user, isAuthenticated, getSignInUrl, signOut, isSigningOut } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect authenticated users to dashboard immediately
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  // Handle OAuth callback token
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const errorParam = urlParams.get('error');
    
    if (token) {
      localStorage.setItem('sb-access-token', token);
      // Clean URL and redirect to dashboard
      window.history.replaceState({}, document.title, '/login');
      window.location.href = '/';
    } else if (errorParam) {
      setError('Authentication failed. Please try again.');
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return;
        }
        
        await api.post('/auth/register', {
          email: formData.email,
          password: formData.password
        });
        setSuccess('Registration successful! Please check your email to verify your account.');
        setMode('login');
      } else {
        const response = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password
        }) as { access_token?: string; user?: any };
        
        if (response.access_token) {
          localStorage.setItem('sb-access-token', response.access_token);
          // Force a page reload to trigger auth state update
          window.location.href = '/';
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen flex items-center justify-center app-bg p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className="max-w-md text-center">
            <div className="flex items-center justify-center w-16 h-16 frost-strong rounded-full mx-auto mb-4">
              <User className="w-8 h-8 text-ink" />
            </div>
            
            <h2 className="text-xl font-semibold mb-2">Welcome back!</h2>
            <p className="text-ink/70 mb-6">
              Signed in as {user.name || user.email}
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setLocation('/')}
                className="flex-1 px-4 py-2 frost-strong hover:frost-card rounded-lg transition-colors text-ink"
              >
                Continue to App
              </button>
              <button
                onClick={() => signOut()}
                disabled={isSigningOut}
                className="px-4 py-2 glass glass-hover rounded-lg transition-colors disabled:opacity-50"
              >
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center app-bg p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard className="max-w-md">
          <div className="flex items-center justify-center w-16 h-16 frost-card rounded-full mx-auto mb-6">
            <LogIn className="w-8 h-8 text-ink" />
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">Welcome to Content Radar</h1>
          <p className="text-ink/70 text-center mb-8">
            Transform your content captures into strategic insights and compelling briefs.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Tab Buttons */}
          <div className="flex mb-6 p-1 bg-app/50 rounded-lg">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                mode === 'login' ? 'frost-strong text-ink' : 'text-ink/60 hover:text-ink/80'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                mode === 'register' ? 'frost-strong text-ink' : 'text-ink/60 hover:text-ink/80'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/60" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-black placeholder-black/50"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/60" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-black placeholder-black/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/60 hover:text-black/80"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {mode === 'register' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-black placeholder-black/50"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 frost-strong hover:frost-card rounded-lg font-medium transition-colors text-ink disabled:opacity-50"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink/10" />
            </div>
            <div className="relative bg-app px-4 text-sm text-ink/60">or</div>
          </div>

          {/* Google Sign In */}
          <a
            href={getSignInUrl()}
            className="flex items-center justify-center gap-3 w-full px-6 py-3 frost-strong hover:frost-card rounded-lg font-medium transition-colors text-ink"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = getSignInUrl();
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </a>
          
          <p className="text-xs text-ink/50 text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}