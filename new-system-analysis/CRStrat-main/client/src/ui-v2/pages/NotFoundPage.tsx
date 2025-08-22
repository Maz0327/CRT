import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Home, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../components/primitives/GlassCard';

export default function NotFoundPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex items-center justify-center app-bg p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <GlassCard className="max-w-md text-center">
          <div className="w-20 h-20 frost-subtle rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl font-bold text-ink">404</span>
          </div>
          
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-ink/70 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2 glass glass-hover rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
            <button
              onClick={() => setLocation('/')}
              className="flex items-center gap-2 px-4 py-2 frost-strong glass-hover rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}