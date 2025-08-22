import type { AnalysisResult } from './schema';

export type AnalyzeInput = {
  sourcePath: string;  // Supabase storage path or URL
  kind: 'image' | 'video';
  mode: 'quick' | 'deep';
  userId: string;
  hint?: string;       // optional user prompt/context
};

export interface MediaProvider {
  analyze(input: AnalyzeInput): Promise<AnalysisResult>;
}

export function getProvider(): 'google'|'openai'|'mock' {
  const p = (process.env.MEDIA_PROVIDER || 'mock').toLowerCase();
  if (p === 'google' || p === 'openai') return p as any;
  return 'mock';
}