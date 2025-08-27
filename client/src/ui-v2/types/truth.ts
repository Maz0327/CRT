export type TruthChain = {
  fact?: string;
  observation?: string;
  insight?: string;
  human_truth?: string;
  cultural_moment?: string;
};

export type EvidenceRow = {
  id: string;
  quote: string | null;
  url: string | null;
  source: string | null;
  event_timestamp: string | null;
};

export type TruthCheckRecord = {
  id: string;
  title: string | null;
  input_text?: string | null;
  input_urls?: string[] | null;
  input_images?: string[] | null;
  result: {
    truth_chain?: TruthChain;
    cohorts?: string[];
    strategic_moves?: string[];
    why_this_surfaced?: string;
    confidence?: number;
    evidence?: Array<{
      quote?: string;
      url?: string;
      source?: string;
      timestamp?: string;
    }>;
  };
  confidence: number | null;
  status: string;
  created_at: string;
};

export type TruthCheckPayload = {
  check: TruthCheckRecord;
  evidence: EvidenceRow[];
};