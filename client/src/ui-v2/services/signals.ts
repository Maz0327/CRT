import { api } from "../lib/api";

export type Signal = {
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
  strategic_moves: string[];
  cohorts: string[];
  receipts: Array<{
    quote: string;
    url: string;
    timestamp: string;
    source: string;
  }>;
  receipts_count?: number;
  confidence?: number;
  why_surfaced?: string;
  status: "unreviewed" | "confirmed" | "needs_edit";
  origin: string;
  source_tag?: string;
  created_at?: string;
  updated_at?: string;
};

export type CreateSignalInput = {
  projectId: string;
  title: string;
  summary: string;
  truth_chain?: {
    fact: string;
    observation: string;
    insight: string;
    human_truth: string;
    cultural_moment: string;
  };
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

export async function listSignals(params: {
  projectId?: string;
  status?: 'unreviewed' | 'confirmed' | 'needs_edit';
}): Promise<Signal[]> {
  const searchParams = new URLSearchParams();
  if (params.projectId) searchParams.set('projectId', params.projectId);
  if (params.status) searchParams.set('status', params.status);
  
  return api.get(`/signals?${searchParams.toString()}`);
}

export async function createSignal(payload: any) {
  return api.post("/signals", payload);
}

export async function confirmSignal(id: string) {
  return api.post(`/signals/${id}/confirm`, {});
}

export async function needsEditSignal(id: string, notes?: string) {
  return api.post(`/signals/${id}/needs-edit`, { notes });
}