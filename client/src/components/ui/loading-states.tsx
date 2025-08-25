import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Pulse Dots Loader
export const PulseDotsLoader = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Ripple Loader
export const RippleLoader = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative w-16 h-16", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 border-2 border-primary rounded-full"
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: [0, 2],
            opacity: [1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
};

// Morphing Loader
export const MorphingLoader = ({ className }: { className?: string }) => {
  return (
    <motion.div
      className={cn("w-12 h-12 bg-gradient-to-r from-primary to-blue-500", className)}
      animate={{
        borderRadius: ["20% 80% 70% 30% / 30% 30% 70% 70%", "60% 40% 30% 70% / 60% 30% 70% 40%", "20% 80% 70% 30% / 30% 30% 70% 70%"],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

// Skeleton Loader
export const SkeletonLoader = ({ 
  className, 
  variant = "text" 
}: { 
  className?: string;
  variant?: "text" | "card" | "avatar" | "button";
}) => {
  const baseClass = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]";
  
  const variants = {
    text: "h-4 rounded",
    card: "h-32 rounded-lg",
    avatar: "w-10 h-10 rounded-full",
    button: "h-10 w-24 rounded-md",
  };

  return (
    <div 
      className={cn(baseClass, variants[variant], className)}
      style={{
        animation: "shimmer 2s infinite linear",
      }}
    />
  );
};

// Content Placeholder
export const ContentPlaceholder = ({ lines = 3 }: { lines?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader
          key={i}
          variant="text"
          className={cn(
            i === lines - 1 && "w-3/4"
          )}
        />
      ))}
    </div>
  );
};

// Card Skeleton
export const CardSkeleton = () => {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-3">
        <SkeletonLoader variant="avatar" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" className="w-32" />
          <SkeletonLoader variant="text" className="w-20 h-3" />
        </div>
      </div>
      <ContentPlaceholder lines={2} />
      <div className="flex gap-2 pt-2">
        <SkeletonLoader variant="button" className="w-16 h-8" />
        <SkeletonLoader variant="button" className="w-16 h-8" />
      </div>
    </div>
  );
};

// Loading Overlay
export const LoadingOverlay = ({ 
  isLoading, 
  message = "Loading..." 
}: { 
  isLoading: boolean;
  message?: string;
}) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card p-6 rounded-lg shadow-lg flex flex-col items-center gap-4"
          >
            <RippleLoader />
            <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Progress Bar
export const ProgressBar = ({ 
  progress, 
  className 
}: { 
  progress: number;
  className?: string;
}) => {
  return (
    <div className={cn("w-full h-2 bg-muted rounded-full overflow-hidden", className)}>
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-blue-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
};

// Spinner
export const Spinner = ({ 
  size = "md", 
  className 
}: { 
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-muted border-t-primary",
        sizes[size],
        className
      )}
    />
  );
};

// Typing Indicator
export const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-muted rounded-lg w-fit">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-muted-foreground rounded-full"
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Stagger Children Animation
export const StaggerContainer = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem = ({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: "easeOut",
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
};