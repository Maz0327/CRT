import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
  variant?: 'default' | 'card' | 'list';
}

export function LoadingSkeleton({ count = 5, className = "h-16", variant = 'default' }: LoadingSkeletonProps) {
  const getSkeletonClass = () => {
    switch (variant) {
      case 'card':
        return 'h-48 rounded-xl';
      case 'list':
        return 'h-16 rounded-lg';
      default:
        return className;
    }
  };

  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div 
          key={i} 
          className={`w-full glass rounded-lg ${getSkeletonClass()}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <div className="w-full h-full frost-subtle animate-pulse rounded-lg" />
        </motion.div>
      ))}
    </div>
  );
}

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={`glass rounded-xl p-4 space-y-3 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 frost-card animate-pulse rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="h-4 frost-card rounded animate-pulse" />
          <div className="h-3 frost-subtle rounded animate-pulse w-3/4" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 w-16 frost-subtle rounded animate-pulse" />
        <div className="h-6 w-20 frost-subtle rounded animate-pulse" />
      </div>
    </div>
  );
}

interface SkeletonListProps {
  count?: number;
}

export function SkeletonList({ count = 5 }: SkeletonListProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="glass rounded-lg p-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.03 }}
        >
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 frost-card rounded animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 frost-card rounded animate-pulse" />
              <div className="h-3 frost-subtle rounded animate-pulse w-2/3" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-12 frost-subtle rounded animate-pulse" />
              <div className="h-6 w-16 frost-subtle rounded animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}