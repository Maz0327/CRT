import { Router } from "express";
import { registerProjectsRoutes } from "./projects";
import briefsRouter from "./briefs";
import googleExportsRouter from "./google-exports";
import { setupSettingsRoutes } from "./settings";
import { setupAnnotationsRoutes } from "./annotations";
import { setupAnalyticsRoutes } from "./analytics";
import { registerTruthRoutes } from "./truth";
import searchRouter from "./search";

export function buildApiRouter() {
  const router = Router();

  // Existing modules (keep these as-is)
  registerProjectsRoutes(router as any);
  router.use("/briefs", briefsRouter);
  router.use("/google", googleExportsRouter);

  // Lovable UI routes
  setupSettingsRoutes(router as any);
  setupAnnotationsRoutes(router as any);
  setupAnalyticsRoutes(router as any);
  registerTruthRoutes(router as any);
  router.use("/search", searchRouter);

  return router;
}