export type TruthReceipt = { quote: string; source?: string; url?: string; timestamp?: string };

export type TruthChain = {
  fact: string;
  observation: string;
  insight: string;
  human_truth: string;
  cultural_moment: string;
};

export type TruthLabResult = {
  headline: string;
  summary: string;
  truth_chain: TruthChain;
  cohorts: string[];
  strategic_moves: string[];
  confidence: number; // 0..1
  receipts: TruthReceipt[];
  why_this_surfaced?: string;
  // Non-fatal fallback fields if AI returned raw/invalid
  error?: string;
  raw?: unknown;
};

export type TruthCheckRow = {
  id: string;
  group_id?: string | null;
  capture_id?: string | null;
  status: 'pending' | 'running' | 'complete' | 'error';
  result?: TruthLabResult | null;
  error?: string | null;
  created_at?: string;
  started_at?: string | null;
  completed_at?: string | null;
};