import { Router } from "express";
import projectsRouter from "./projects";
import briefsRouter from "./briefs";
import googleExportsRouter from "./google-exports";
import { setupSettingsRoutes } from "./settings";
import { setupAnnotationsRoutes } from "./annotations";
import { setupAnalyticsRoutes } from "./analytics";
import registerTruthRoutes from "./truth";
import searchRouter from "./search";
import capturesBasic from "./captures-basic";
import registerSignalRoutes from "./signals";
import risingPulsesRouter from "./rising-pulses";

export function buildApiRouter() {
  const router = Router();

  // Step 30.1: Mount captures-basic routes
  router.use(capturesBasic);

  // Existing modules (keep these as-is)
  router.use(projectsRouter);
  router.use("/briefs", briefsRouter);
  router.use("/google", googleExportsRouter);

  // Step 44: Mount signals routes
  router.use("/signals", registerSignalRoutes);

  // Step 49: Mount rising pulses routes
  router.use("/rising-pulses", risingPulsesRouter);

  // Lovable UI routes
  setupSettingsRoutes(router as any);
  setupAnnotationsRoutes(router as any);
  setupAnalyticsRoutes(router as any);
  router.use("/truth", registerTruthRoutes);
  router.use("/search", searchRouter);

  return router;
}