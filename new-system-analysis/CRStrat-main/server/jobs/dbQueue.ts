import { storage } from "../storage";

export type JobStatus = "queued" | "running" | "done" | "failed";

export interface JobRecord {
  id: string;
  type: string;
  payload: any;
  status: JobStatus;
  result?: any;
  error?: string;
  attempts: number;
  max_attempts: number;
  created_at: string;
  started_at?: string;
  finished_at?: string;
  user_id?: string;
}

export const dbQueue = {
  async enqueue(type: string, payload: any, userId?: string): Promise<JobRecord> {
    const job = await storage.createJob({ type, payload, userId });
    return job;
  },

  async get(id: string): Promise<JobRecord | null> {
    return storage.getJobById(id);
  },

  async takeNext(): Promise<JobRecord | null> {
    // Advisory-lock style, but simplest approach: atomically mark one queued row as running
    return storage.takeNextQueuedJob();
  },

  async succeed(id: string, result: any) {
    await storage.completeJob(id, result);
  },

  async fail(id: string, error: string) {
    await storage.failJob(id, error);
  },

  async retryLater(id: string, error: string) {
    await storage.retryJob(id, error);
  },
};