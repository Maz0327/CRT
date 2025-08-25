import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface VerdictBadgeProps {
  verdict: string | null;
  className?: string;
}

export function VerdictBadge({ verdict, className }: VerdictBadgeProps) {
  const getVerdictConfig = (verdict: string | null) => {
    switch (verdict) {
      case 'likely_true':
        return {
          icon: CheckCircle,
          label: 'Likely True',
          className: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
        };
      case 'misleading':
        return {
          icon: AlertTriangle,
          label: 'Misleading',
          className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800'
        };
      case 'likely_false':
        return {
          icon: XCircle,
          label: 'Likely False',
          className: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
        };
      case 'unverified':
      default:
        return {
          icon: HelpCircle,
          label: 'Unverified',
          className: 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800'
        };
    }
  };

  const config = getVerdictConfig(verdict);
  const Icon = config.icon;

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
      data-testid={`verdict-badge-${verdict || 'unverified'}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </div>
  );
}