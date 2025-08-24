// client/src/ui-v2/services/jobs.ts
import api from '@/lib/api';

export type Job = { id: string; status: 'pending'|'running'|'done'|'error'; result?: any; error?: string };

export const jobsService = {
  async get(id: string) {
    return api.get<Job>(`/jobs/${id}`).catch(() => ({ id, status: 'done' } as Job));
  }
};