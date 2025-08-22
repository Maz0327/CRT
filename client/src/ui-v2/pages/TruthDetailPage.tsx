import React, { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { ArrowLeft, ExternalLink, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { VerdictBadge } from '../components/truth/VerdictBadge';
import { ConfidenceBar } from '../components/truth/ConfidenceBar';
import { getTruthCheck, retryTruthCheck } from '../services/truth';
import { Link } from 'wouter';

export function TruthDetailPage() {
  const [, params] = useRoute('/truth-lab/:id');
  const id = params?.id;
  const [truthCheck, setTruthCheck] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Debug: Log the params to see what we're getting
  console.log('TruthDetailPage params:', params, 'id:', id);
  
  // Early return if no ID
  if (!id) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="glass rounded-xl p-8 text-center">
          <div className="text-ink-secondary">Loading truth check details...</div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (id) {
      loadTruthCheck();
    }
  }, [id]);

  const loadTruthCheck = async () => {
    if (!id) return;
    
    try {
      const result = await getTruthCheck(id);
      setTruthCheck(result);
    } catch (error) {
      console.error('Failed to load truth check:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!id) return;
    
    setIsRetrying(true);
    try {
      await retryTruthCheck(id);
      // Reload the truth check after retry
      await loadTruthCheck();
    } catch (error) {
      console.error('Failed to retry truth check:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen frost-subtle">
        <div className="max-w-4xl mx-auto p-6">
          <div className="frost-card p-8 animate-pulse">
            <div className="space-y-4">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!truthCheck) {
    return (
      <div className="min-h-screen frost-subtle">
        <div className="max-w-4xl mx-auto p-6">
          <div className="frost-card p-8 text-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Truth Check Not Found
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              The requested truth check could not be found.
            </p>
            <Link href="/truth-lab" className="text-blue-600 hover:text-blue-700 transition-colors">
              Return to Truth Lab
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen frost-subtle">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/truth-lab"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
                data-testid="back-to-truth-lab"
              >
                <ArrowLeft className="w-4 h-4" />
                Truth Lab
              </Link>
              <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
              <VerdictBadge verdict={truthCheck?.verdict || 'unverified'} />
            </div>
            
            {truthCheck?.status === 'error' && (
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="flex items-center gap-2 px-3 py-2 frost-card hover:frost-strong rounded-lg transition-all"
                data-testid="retry-button"
              >
                <RefreshCw className={`w-4 h-4 ${isRetrying ? 'animate-spin' : ''}`} />
                Retry Analysis
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Main Content */}
        <div className="frost-card p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {truthCheck?.kind ? (truthCheck.kind.charAt(0).toUpperCase() + truthCheck.kind.slice(1)) : 'Content'} Analysis
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Analyzed on {truthCheck?.created_at ? formatDate(truthCheck.created_at) : 'Unknown date'}
              </p>
            </div>
            
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              truthCheck?.status === 'done' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
              truthCheck?.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            }`}>
              {truthCheck?.status || 'unknown'}
            </span>
          </div>

          {/* Input Content */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
              Analyzed Content
            </h3>
            <div className="frost-subtle p-4 rounded-lg">
              {truthCheck.kind === 'url' && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                  <a 
                    href={truthCheck.input_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 transition-colors break-all"
                  >
                    {truthCheck.input_url}
                  </a>
                  <button
                    onClick={() => handleCopy(truthCheck.input_url)}
                    className="p-1 hover:frost-subtle rounded transition-colors"
                    data-testid="copy-url-button"
                  >
                    {copied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                  </button>
                </div>
              )}
              
              {truthCheck.kind === 'text' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Text Content</span>
                    <button
                      onClick={() => handleCopy(truthCheck.input_text)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      data-testid="copy-text-button"
                    >
                      {copied ? <CheckCircle className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      Copy
                    </button>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {truthCheck.input_text}
                  </p>
                </div>
              )}
              
              {truthCheck.kind === 'image' && truthCheck.input_file_key && (
                <div className="text-center">
                  <div className="inline-block frost-card p-3 rounded-lg">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Image file uploaded for analysis
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {truthCheck.status === 'done' && (
            <div className="space-y-6">
              {/* Confidence Score */}
              {truthCheck.confidence !== undefined && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Confidence Score
                  </h3>
                  <ConfidenceBar confidence={truthCheck.confidence} />
                </div>
              )}

              {/* Summary */}
              {truthCheck.summary && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Analysis Summary
                  </h3>
                  <div className="frost-subtle p-4 rounded-lg">
                    <p className="text-gray-900 dark:text-gray-100">
                      {typeof truthCheck.summary === 'string' ? truthCheck.summary : JSON.stringify(truthCheck.summary, null, 2)}
                    </p>
                  </div>
                </div>
              )}

              {/* Evidence */}
              {truthCheck.evidence && truthCheck.evidence.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-3">
                    Supporting Evidence ({truthCheck.evidence.length})
                  </h3>
                  <div className="space-y-3">
                    {truthCheck.evidence.map((evidence: any, index: number) => (
                      <div key={evidence.id || index} className="frost-subtle p-4 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">
                            {evidence.title}
                          </h4>
                          {evidence.source_url && (
                            <a
                              href={evidence.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        {evidence.snippet && (
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {evidence.snippet}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error State */}
          {truthCheck.status === 'error' && truthCheck.error && (
            <div className="frost-card border border-red-200 dark:border-red-800 p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
                Analysis Failed
              </h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                {truthCheck.error}
              </p>
            </div>
          )}

          {/* Processing State */}
          {truthCheck.status === 'processing' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 frost-card rounded-lg">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Analysis in progress...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}