import { storage } from "../storage";

export type JobType = "ai.analyze" | "ai.truth" | "brief.generate";

export async function enqueueJob(type: JobType, payload: any) {
  // For now, return a mock job since storage methods don't exist yet
  return { id: Date.now().toString(), type, payload, status: 'queued' };
}

export async function markJobStatus(id: string, status: "queued"|"processing"|"done"|"failed", result?: any) {
  // For now, log the status change since storage methods don't exist yet
  console.log(`Job ${id} status: ${status}`, result ? `Result: ${JSON.stringify(result)}` : '');
  return { id, status, result };
}