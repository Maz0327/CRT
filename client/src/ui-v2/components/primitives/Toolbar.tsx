import { motion } from 'framer-motion';
import { cn } from '../../../lib/utils';

interface ToolbarProps {
  children: React.ReactNode;
  className?: string;
}

export function Toolbar({ children, className }: ToolbarProps) {
  return (
    <motion.div
      className={cn(
        'glass rounded-lg md:rounded-xl p-1 md:p-2 flex items-center gap-1 md:gap-2 flex-shrink-0 shadow-sm',
        className
      )}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

interface ToolbarButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  title?: string;
}

export function ToolbarButton({ 
  children, 
  onClick, 
  active = false, 
  disabled = false,
  title 
}: ToolbarButtonProps) {
  return (
    <motion.button
      className={cn(
        'icon-center p-1 md:p-1.5 lg:p-2 rounded md:rounded-lg transition-all duration-200 touch-target flex-shrink-0',
        'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 focus:ring-offset-gray-900',
        active && 'bg-blue-500/20 text-blue-400',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={!disabled ? { scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
    >
      {children}
    </motion.button>
  );
}