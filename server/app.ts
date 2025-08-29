import express from "express";
import helmet from "helmet";
import mountHealth from "./health";
import { registerRoutes } from "./routes";

// Optional middlewares (present in repo); keep imports stable to match existing code
import { corsMiddleware } from "./lib/cors";
import { projectScope } from "./middleware/project-scope";
import { requestLogger } from "./middleware/logging";
import { productionMonitor } from "./monitoring/productionMonitor";
import mountTruthRoutes from "./routes/truth";

// Express Request typing for test mode (keep it loose to avoid TS friction here)
type AnyReq = express.Request & { user?: any; projectId?: string };

/**
 * Build the Express app. In tests, use { testMode: true } to inject a stub user
 * and bypass external/session concerns. Production remains unchanged.
 */
export function createApp(opts?: { testMode?: boolean }) {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());

  // Logging / monitoring (same order as server/index.ts where possible)
  app.use(requestLogger);
  app.use(productionMonitor.trackApiRequest);

  // Body parsing and size limits (respect env if present)
  const JSON_LIMIT = process.env.JSON_LIMIT || "1mb";
  app.use(express.json({ limit: JSON_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: JSON_LIMIT }));

  if (opts?.testMode) {
    // Test-only auth shim: inject a stable user and allow project scoping via header
    app.use("/api", (req, _res, next) => {
      (req as AnyReq).user = {
        id: process.env.TEST_USER_ID || "00000000-0000-0000-0000-000000000001",
        email: "test@example.com",
      };
      const hdr = req.header("X-Project-ID");
      if (hdr) (req as AnyReq).projectId = String(hdr);
      next();
    });
  } else {
    // Production/dev API constraints
    app.use("/api", corsMiddleware);
    app.use("/api", projectScope);
  }

  // Health endpoints first
  mountHealth(app);

  // Mount truth routes (needed for API tests)
  mountTruthRoutes(app);

  // Main API & routes
  registerRoutes(app);

  return app;
}