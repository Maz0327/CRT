import { api } from "../lib/api";

export type RisingPulse = {
  id: string;
  project_id: string;
  term: string;
  rationale: string | null;
  receipts: Array<{
    quote: string;
    url: string;
    source: string;
    timestamp: string;
  }>;
  confidence: number | null;
  surfaced_at: string;
};

export type CreateRisingPulseInput = {
  projectId: string;
  term: string;
  rationale?: string;
  receipts?: Array<{
    quote: string;
    url: string;
    source: string;
    timestamp: string;
  }>;
  confidence?: number;
};

export async function listRisingPulses(projectId: string): Promise<RisingPulse[]> {
  const searchParams = new URLSearchParams();
  searchParams.set('projectId', projectId);
  
  const pulses = await api.get<RisingPulse[]>(`/rising-pulses?${searchParams.toString()}`);
  
  // Client-side sorting by surfaced_at desc if server doesn't handle it
  return pulses.sort((a, b) => {
    const dateA = new Date(a.surfaced_at);
    const dateB = new Date(b.surfaced_at);
    return dateB.getTime() - dateA.getTime();
  });
}

export async function getRisingPulse(id: string): Promise<RisingPulse> {
  return api.get<RisingPulse>(`/rising-pulses/${id}`);
}

export async function createRisingPulse(input: CreateRisingPulseInput): Promise<RisingPulse> {
  return api.post<RisingPulse>('/rising-pulses', input);
}