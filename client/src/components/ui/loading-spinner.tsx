import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({ message = "Loading...", className }: LoadingOverlayProps) {
  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 flex items-center justify-center z-50",
      className
    )}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex flex-col items-center space-y-4 min-w-[200px]">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn(
      "border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse",
      className
    )}>
      <div className="space-y-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        <div className="h-20 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="flex space-x-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
}