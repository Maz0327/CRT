import React from 'react';
import { useCaptureShots, useCaptureCaptions, useSimilarCaptures, useCaptureTranscript } from '../../hooks/useCaptureAnalysis';
import { Skeleton } from '@/components/ui/skeleton';

export function ShotsPanel({ captureId }: { captureId: string }) {
  const { data, isLoading } = useCaptureShots(captureId);
  
  if (isLoading) return <Skeleton className="h-24 w-full" />;
  
  const shots = data?.data || [];
  
  return (
    <div className="frost-card p-3">
      <div className="text-sm opacity-80 mb-2">Shots</div>
      <div className="flex gap-2 flex-wrap">
        {shots.length === 0 ? (
          <div className="text-xs opacity-60">No shots analyzed yet</div>
        ) : (
          shots.map((s: any, i: number) => (
            <div key={s.id} className="text-xs px-2 py-1 rounded-md frost-subtle">
              #{i+1} {s.start_ms}–{s.end_ms}ms
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function CaptionsPanel({ captureId }: { captureId: string }) {
  const { data, isLoading } = useCaptureCaptions(captureId);
  
  if (isLoading) return <Skeleton className="h-24 w-full" />;
  
  const caps = data?.data || [];
  
  return (
    <div className="frost-card p-3">
      <div className="text-sm opacity-80 mb-2">Grounded Captions</div>
      {caps.length === 0 ? (
        <div className="text-xs opacity-60">No captions generated yet</div>
      ) : (
        <ul className="space-y-2">
          {caps.map((c: any) => (
            <li key={c.id} className="text-sm opacity-90">{c.summary}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SimilarPanel({ captureId }: { captureId: string }) {
  const { data, isLoading } = useSimilarCaptures(captureId, 6);
  
  if (isLoading) return <Skeleton className="h-24 w-full" />;
  
  const rows = data?.data || [];
  
  return (
    <div className="frost-card p-3">
      <div className="text-sm opacity-80 mb-2">Similar Captures</div>
      {rows.length === 0 ? (
        <div className="text-xs opacity-60">No similar captures found</div>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {rows.map((r: any) => (
            <div key={r.capture_id} className="text-xs opacity-90">
              <div className="font-medium truncate">{r.title || r.capture_id}</div>
              <div className="opacity-60">similarity {(r.score || 0).toFixed(3)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TranscriptPanel({ captureId }: { captureId: string }) {
  const { data, isLoading } = useCaptureTranscript(captureId);
  
  if (isLoading) return <Skeleton className="h-24 w-full" />;
  
  const transcript = data?.data || [];
  
  return (
    <div className="frost-card p-3">
      <div className="text-sm opacity-80 mb-2">Transcript</div>
      {transcript.length === 0 ? (
        <div className="text-xs opacity-60">No transcript available</div>
      ) : (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {transcript.map((t: any) => (
            <div key={t.id} className="text-xs opacity-90">
              {t.start_ms && <span className="opacity-60">[{Math.floor(t.start_ms/1000)}s] </span>}
              {t.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Admin trigger component for testing
export function AnalysisTrigger({ captureId }: { captureId: string }) {
  const [isRunning, setIsRunning] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const triggerAnalysis = async () => {
    setIsRunning(true);
    setMessage('');
    
    try {
      const response = await fetch(`/api/admin/captures/${captureId}/rebuild-readmodel`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        setMessage('Analysis pipeline completed successfully');
        // Refresh queries after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        const error = await response.json();
        setMessage(`Error: ${error.error || 'Failed to run analysis'}`);
      }
    } catch (error) {
      setMessage('Network error occurred');
    }
    
    setIsRunning(false);
  };

  return (
    <div className="frost-card p-3">
      <div className="text-sm opacity-80 mb-2">Analysis Pipeline</div>
      <button
        onClick={triggerAnalysis}
        disabled={isRunning}
        className="w-full px-3 py-2 text-xs bg-blue-500/20 hover:bg-blue-500/30 disabled:opacity-50 rounded-md transition-colors"
      >
        {isRunning ? 'Running Analysis...' : 'Trigger Analysis'}
      </button>
      {message && (
        <div className={`text-xs mt-2 ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </div>
      )}
    </div>
  );
}