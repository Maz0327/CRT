import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = false, onClick }: GlassCardProps) {
  const Component = onClick ? motion.button : motion.div;
  
  return (
    <Component
      className={cn(
        'frost-card p-6 md:p-7 lg:p-8 transition-all duration-200 relative',  /* More generous padding */
        hover && 'frost-hover cursor-pointer',
        onClick && 'focus:outline-none focus:frost-ring',
        className
      )}
      onClick={onClick}
      whileHover={hover && window.innerWidth >= 768 ? { y: -2, scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}
    </Component>
  );
}