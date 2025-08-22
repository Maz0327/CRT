import { v4 as uuid } from "uuid";

type JobStatus = "queued" | "processing" | "done" | "failed";

export type JobRecord = {
  id: string;
  type: string;
  payload: any;
  status: JobStatus;
  result?: any;
  error?: string;
  createdAt: number;
  updatedAt: number;
};

const queue: JobRecord[] = [];

export function enqueue(type: string, payload: any): JobRecord {
  const job: JobRecord = {
    id: uuid(),
    type,
    payload,
    status: "queued",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  queue.push(job);
  return job;
}

export function takeNextQueued(): JobRecord | null {
  const idx = queue.findIndex((j) => j.status === "queued");
  if (idx === -1) return null;
  queue[idx].status = "processing";
  queue[idx].updatedAt = Date.now();
  return queue[idx];
}

export function markDone(id: string, result: any) {
  const job = queue.find((j) => j.id === id);
  if (job) {
    job.status = "done";
    job.result = result;
    job.updatedAt = Date.now();
  }
}

export function markFailed(id: string, error: string) {
  const job = queue.find((j) => j.id === id);
  if (job) {
    job.status = "failed";
    job.error = error;
    job.updatedAt = Date.now();
  }
}

export function getJob(id: string): JobRecord | undefined {
  return queue.find((j) => j.id === id);
}