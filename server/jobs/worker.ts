import { dbQueue } from "./dbQueue";
import { AIAnalyzer } from "../services/aiAnalyzer";
import { TruthAnalysisFramework } from "../services/truthAnalysisFramework";
import { logger } from "../logger";

const ai = new AIAnalyzer();
const truth = new TruthAnalysisFramework();

export function startDbWorker() {
  const intervalMs = Number(process.env.JOB_WORKER_INTERVAL_MS || 1500);
  let running = false;

  async function tick() {
    if (running) return;
    running = true;
    try {
      const job = await dbQueue.takeNext();
      if (!job) return; // nothing to do

      logger.info({ jobId: job.id, type: job.type }, "Worker picked job");

      try {
        let result: any = null;

        if (job.type === "ai.analyze") {
          const { title, content, platform = "web" } = job.payload || {};
          result = await ai.analyzeContent(title || "Analysis", content || "", platform);
          await dbQueue.succeed(job.id, result);
        } else if (job.type === "truth.analyze") {
          const { content, platform = "web", metadata = {} } = job.payload || {};
          result = await truth.analyzeContent(content || "", platform, metadata);
          await dbQueue.succeed(job.id, result);
        } else {
          await dbQueue.fail(job.id, `Unknown job type: ${job.type}`);
        }
      } catch (err: any) {
        logger.error({ jobId: job.id, err: err?.message }, "Job failed");
        // retry if possible
        await dbQueue.retryLater(job.id, err?.message || "Error");
      }
    } catch (e) {
      logger.error({ err: (e as Error).message }, "Worker loop error");
    } finally {
      running = false;
    }
  }

  // simple polling loop
  setInterval(tick, intervalMs);
  logger.info({ intervalMs }, "DB worker started");
}