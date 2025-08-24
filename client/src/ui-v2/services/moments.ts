// client/src/ui-v2/services/moments.ts
import api from '@/lib/api';

export interface Moment {
  id: string;
  title?: string | null;
  summary?: string | null;
  tags?: string[];
  // add any fields used by the UI
}

export interface MomentsListParams {
  projectId?: string;
  tags?: string[];
  q?: string;
}

export async function listMoments(params: Record<string, string | number | boolean> = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => searchParams.set(k, String(v)));
  return api.get<Moment[]>(`/moments?${searchParams.toString()}`);
}

export async function getMoment(id: string) {
  return api.get<Moment>(`/moments/${id}`);
}

export async function updateMoment(id: string, data: Partial<Moment>) {
  return api.patch<Moment>(`/moments/${id}`, data);
}

// Legacy service object for backward compatibility
export const momentsService = {
  list: listMoments,
  get: getMoment,
  update: updateMoment,
};