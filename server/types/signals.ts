export type SignalStatus = "unreviewed" | "confirmed" | "needs_edit";

export type TruthChain = {
  fact?: string;
  observation?: string;
  insight?: string;
  human_truth?: string;
  cultural_moment?: string;
};

export type SignalRecord = {
  id: string;
  project_id: string;
  created_by: string;
  source_capture_ids: string[];
  truth_check_id?: string;
  title: string;
  summary: string;
  truth_fact?: string;
  truth_observation?: string;
  truth_insight?: string;
  truth_human_truth?: string;
  truth_cultural_moment?: string;
  strategic_moves?: string[];
  cohorts?: string[];
  receipts: Array<{
    quote: string;
    url: string;
    timestamp: string;
    source: string;
  }>;
  receipts_count?: number;
  confidence?: number;
  why_surfaced?: string;
  status: SignalStatus;
  origin: string;
  source_tag?: string;
  created_at: string;
  updated_at: string;
};

export type SignalCreateInput = {
  projectId: string;
  title: string;
  summary: string;
  truth_chain?: TruthChain;
  strategic_moves?: string[];
  cohorts?: string[];
  receipts?: Array<{
    quote: string;
    url: string;
    timestamp: string;
    source: string;
  }>;
  confidence?: number;
  why_surfaced?: string;
  origin?: string;
  source_tag?: string;
  source_capture_ids?: string[];
  truth_check_id?: string;
};