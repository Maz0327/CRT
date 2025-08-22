import { motion } from 'framer-motion';

interface PageProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-none',
};

export function Page({ 
  children, 
  title, 
  breadcrumbs, 
  className = '',
  maxWidth = 'full'
}: PageProps) {
  return (
    <div className="min-h-screen glass-canvas">
      
      <motion.main
        className={`mx-auto px-4 md:px-6 py-4 md:py-8 ${maxWidthClasses[maxWidth]} ${className}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {children}
      </motion.main>
    </div>
  );
}