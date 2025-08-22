import React from 'react';
import { Calendar, ExternalLink, Image, FileText, Type } from 'lucide-react';
import { VerdictBadge } from './VerdictBadge';
import { ConfidenceBar } from './ConfidenceBar';
import { cn } from '@/lib/utils';

interface TruthResultCardProps {
  truthCheck: {
    id: string;
    kind: 'url' | 'text' | 'image';
    status: string;
    verdict?: string;
    confidence?: number;
    input_preview: string;
    created_at: string;
    error?: string;
  };
  onClick?: () => void;
  className?: string;
}

export function TruthResultCard({ truthCheck, onClick, className }: TruthResultCardProps) {
  const getKindIcon = (kind: string) => {
    switch (kind) {
      case 'url': return <ExternalLink className="w-4 h-4" />;
      case 'text': return <Type className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'text-green-600 dark:text-green-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'processing': return 'text-blue-600 dark:text-blue-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className={cn(
        "frost-card border hover:frost-strong transition-all cursor-pointer",
        className
      )}
      onClick={onClick}
      data-testid={`truth-result-${truthCheck.id}`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="frost-subtle p-1.5 rounded-lg text-gray-600 dark:text-gray-400">
              {getKindIcon(truthCheck.kind)}
            </div>
            <div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {truthCheck.kind}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("text-xs font-medium", getStatusColor(truthCheck.status))}>
                  {truthCheck.status}
                </span>
                {truthCheck.status === 'processing' && (
                  <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>
          </div>
          
          {truthCheck.status === 'done' && truthCheck.verdict && (
            <VerdictBadge verdict={truthCheck.verdict} />
          )}
        </div>

        {/* Content Preview */}
        <div className="mb-3">
          <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-2">
            {truthCheck.input_preview}
          </p>
        </div>

        {/* Confidence Bar (if available) */}
        {truthCheck.status === 'done' && truthCheck.confidence !== undefined && (
          <div className="mb-3">
            <ConfidenceBar confidence={truthCheck.confidence} />
          </div>
        )}

        {/* Error Message */}
        {truthCheck.status === 'error' && truthCheck.error && (
          <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">
              {truthCheck.error}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(truthCheck.created_at)}</span>
          </div>
          
          {truthCheck.status === 'done' && (
            <span className="text-blue-600 dark:text-blue-400 hover:underline">
              View Details →
            </span>
          )}
        </div>
      </div>
    </div>
  );
}