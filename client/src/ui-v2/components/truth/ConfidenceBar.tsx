import React from 'react';
import { cn } from '../../../lib/utils';

interface ConfidenceBarProps {
  confidence: number | null;
  className?: string;
  showLabel?: boolean;
}

export function ConfidenceBar({ confidence, className, showLabel = true }: ConfidenceBarProps) {
  const confidenceValue = confidence || 0;
  const percentage = Math.round(confidenceValue * 100);
  
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-500';
    if (conf >= 0.6) return 'bg-yellow-500';
    if (conf >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return 'High';
    if (conf >= 0.6) return 'Medium';
    if (conf >= 0.4) return 'Low';
    return 'Very Low';
  };

  return (
    <div className={cn("space-y-1", className)} data-testid="confidence-bar">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600 dark:text-gray-400">Confidence</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {percentage}% ({getConfidenceLabel(confidenceValue)})
          </span>
        </div>
      )}
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            getConfidenceColor(confidenceValue)
          )}
          style={{ width: `${percentage}%` }}
          data-testid="confidence-fill"
        />
      </div>
    </div>
  );
}