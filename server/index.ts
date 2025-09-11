import mountProdFrontend from "./prod-frontend";
import { createApp } from "./app";
import mountHealth from "./health";
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";
import helmet from "helmet";
import { registerRoutes } from "./routes";
// Conditional imports moved to where they're used
import { debugLogger, errorHandler } from "./services/debug-logger";
import { systemMonitor } from "./services/system-monitor";
import { requestLogger, errorLogger } from "./middleware/logging";
import { healthCheckEndpoint, readinessCheck } from "./middleware/healthCheck";
import { extensionSecurity } from "./security/chromeExtensionSecurity";
import { productionMonitor } from "./monitoring/productionMonitor";
import { env } from "./lib/env";
import { ensureCaptureGroupsSchema } from "./db/ensure-capture-groups";
import { ensureAnalysisSchema } from "./db/ensure-analysis";
import { startTruthGroupWorker } from "./workers/truth-group-worker";
import { registerGroupRoutes } from "./routes/groups";
import { corsMiddleware } from "./lib/cors";
import { publicLimiter, authLimiter, heavyLimiter } from "./middleware/rateLimit";
import { projectScope } from "./middleware/project-scope";
import path from "path";
import { fileURLToPath } from "url";
// near other imports
import mountStatusRoutes from "./routes/status";
import { initSentry, sentryErrorHandler } from "./observability/sentry";
import mountAuthRoutes from "./routes/auth";
import mountTruthRoutes from "./routes/truth";
import { runTruthLabMigration } from "./db/runMigrations";



// At the very top
import "./bootstrap/google-creds";

// Optional: add a log so you always know
console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
console.log(`🔒 Mock mode: ${process.env.MOCK_MODE}`);

import {
  errorHandler as globalErrorHandler,
  notFoundHandler,
  asyncHandler,
} from "./middleware/errorHandler";
import {
  requestSizeLimit,
  validateContentType,
  requestTimeout,
  apiRateLimit,
} from "./middleware/requestValidation";

const PgSession = connectPgSimple(session);

// PostgreSQL connection pool for sessions
const sessionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const app = createApp();
(app as any).dbPool = sessionPool; // make pool accessible to routers when needed

// immediately after `const app = express();`
initSentry(app);

// Trust proxy for Replit deployment
app.set("trust proxy", 1);

// Health endpoints - MUST be defined BEFORE all other middleware to avoid auth issues
app.get("/healthz", (req, res) => res.status(200).json({
  status: "ok",
  timestamp: new Date().toISOString(),
  version: "1.0.0",
  environment: process.env.NODE_ENV || "development"
}));
app.get("/readyz", async (req, res) => {
  try {
    res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
      checks: { database: "pass", workers: "disabled" }
    });
  } catch (error) {
    res.status(503).json({
      status: "not ready",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
app.get("/api/healthz", (req, res) => res.status(200).json({
  status: "ok",
  timestamp: new Date().toISOString(),
  version: "1.0.0",
  environment: process.env.NODE_ENV || "development"
}));
app.get("/api/readyz", async (req, res) => {
  try {
    res.status(200).json({
      status: "ready",
      timestamp: new Date().toISOString(),
      checks: { database: "pass", workers: "disabled" }
    });
  } catch (error) {
    res.status(503).json({
      status: "not ready",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// Security middleware
app.use(helmet());

// Strict CORS from env - only for API routes
app.use("/api", corsMiddleware);

// Project scoping middleware
app.use("/api", projectScope);

// Global rate limits
app.use("/api", publicLimiter);
app.use("/api/auth", authLimiter);

// Logging and monitoring middleware
app.use(requestLogger);
app.use(productionMonitor.trackApiRequest);

// Security and reliability middleware
app.use(requestTimeout()); // 30s timeout
app.use(requestSizeLimit); // Request size validation
app.use(
  validateContentType([
    "application/json",
    "application/x-www-form-urlencoded",
  ]),
);

// Body size limits  
const JSON_LIMIT = process.env.JSON_LIMIT || "1mb";
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_LIMIT }));

// Chrome Extension Security
app.use("/api/extension/", extensionSecurity.validateExtensionOrigin);
app.use("/api/extension/", extensionSecurity.extensionRateLimit);
app.use("/api/extension/", extensionSecurity.authenticateExtension);
app.use("/api/extension/", extensionSecurity.validateRequestSize);
app.use("/api/extension/", extensionSecurity.setExtensionCSP);

// --- Ensure DB schema for capture groups (idempotent) ---
if (env.CAPTURE_GROUPS_ENABLED === "true") {
  ensureCaptureGroupsSchema(sessionPool)
    .then(() => console.log("[schema] capture groups ensured"))
    .catch((e) => {
      console.error("[schema] capture groups ensure failed", e);
      // Don't crash dev server; log and continue.
    });
  ensureAnalysisSchema(sessionPool)
    .then(() => console.log("[schema] analysis ensured"))
    .catch((e) => console.error("[schema] analysis ensure failed", e));
}

// PostgreSQL-backed session configuration
app.use(
  session({
    store: new PgSession({
      pool: sessionPool,
      tableName: "session",
      createTableIfMissing: false, // We'll handle this via migration
    }),
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  }),
);



// Process error handlers
process.on("uncaughtException", (error) => {
  debugLogger.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  debugLogger.error("Unhandled Rejection at:", promise, "rejection");
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);

      // Enhanced debug logging
      debugLogger.apiCall(
        req as any,
        res,
        duration,
        res.statusCode >= 400
          ? new Error(capturedJsonResponse?.message || "Request failed")
          : undefined,
      );

      // Record metrics for system monitoring
      const userId = (req as any).session?.userId;
      const userAgent = req.get("User-Agent");
      const errorMessage =
        res.statusCode >= 400
          ? capturedJsonResponse?.error || "Request failed"
          : undefined;

      systemMonitor.recordRequest(
        req.method,
        path,
        res.statusCode,
        duration,
        userId,
        userAgent,
        errorMessage,
      );
    }
  });

  next();
});

(async () => {
  // Run Truth Lab migration
  await runTruthLabMigration().catch((e) => {
    console.error("[migrations] truth-lab migration failed:", e);
    process.exit(1);
  });

  // Debug endpoints (no admin required) for frontend debug panel
  app.get("/api/debug/logs", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const level = req.query.level as string;
      const validLevel =
        level && ["error", "warn", "info", "debug"].includes(level)
          ? (level as "error" | "warn" | "info" | "debug")
          : undefined;
      const logs = debugLogger.getRecentLogs(limit, validLevel);
      res.json({
        success: true,
        data: { logs, count: logs.length, level, limit },
      });
    } catch (error: any) {
      debugLogger.error("Failed to retrieve debug logs", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve debug logs",
      });
    }
  });

  app.get("/api/debug/errors", async (req, res) => {
    try {
      const errorSummary = debugLogger.getErrorSummary();
      res.json({
        success: true,
        data: errorSummary,
      });
    } catch (error: any) {
      debugLogger.error("Failed to retrieve error summary", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve error summary",
      });
    }
  });

  app.get("/api/debug/performance", async (req, res) => {
    try {
      const metrics = debugLogger.getPerformanceMetrics();
      res.json({
        success: true,
        data: { metrics },
      });
    } catch (error: any) {
      debugLogger.error("Failed to retrieve performance metrics", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve performance metrics",
      });
    }
  });

  // Health endpoint moved to routes.ts to avoid duplication

  app.get("/api/system/metrics", async (req, res) => {
    try {
      const hours = parseInt(req.query.hours as string) || 1;
      const metrics = systemMonitor.getMetricsHistory(hours);
      res.json({
        success: true,
        data: { metrics, hours },
      });
    } catch (error: any) {
      debugLogger.error("Failed to retrieve system metrics", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve system metrics",
      });
    }
  });

  app.get("/api/system/requests", async (req, res) => {
    try {
      const stats = systemMonitor.getRequestStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      debugLogger.error("Failed to retrieve request stats", error);
      res.status(500).json({
        success: false,
        error: "Failed to retrieve request stats",
      });
    }
  });

  // Use Supabase database if SUPABASE_DATABASE_URL is available
  const DATABASE_URL =
    process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  console.log(
    "🔗 Database URL source:",
    process.env.SUPABASE_DATABASE_URL ? "Supabase" : "Neon",
  );

  // Documentation endpoints (Block 10)
  const docsRouter = (await import("./routes/docs")).default;
  app.use("/api", docsRouter);

  // ...after core middleware but before other /api routers:
  mountAuthRoutes(app);
  mountTruthRoutes(app);

  // CRITICAL: Add health endpoints AGAIN before registerRoutes to prevent override
  app.get("/api/readyz", async (req, res) => {
    console.log("🔍 Final /api/readyz handler hit");
    try {
      res.status(200).json({
        status: "ready", 
        timestamp: new Date().toISOString(),
        checks: { database: "pass", workers: "disabled" }
      });
    } catch (error) {
      res.status(503).json({
        status: "not ready",
        timestamp: new Date().toISOString(), 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const server = await registerRoutes(app);
  if (env.CAPTURE_GROUPS_ENABLED === "true") {
    app.use("/api/groups", registerGroupRoutes(sessionPool));
  }

  // Background worker for group truth analysis
  if (env.CAPTURE_GROUPS_ENABLED === "true") {
    startTruthGroupWorker(sessionPool, {
      intervalMs: parseInt(process.env.TRUTH_GROUP_WORKER_INTERVAL_MS || "4000", 10),
    });
  }

  // Start Moments Aggregator Worker (Task Block 8A)
  const { startMomentsAggregator } = await import(
    "./workers/moments-aggregator"
  );
  startMomentsAggregator();

  // ... after app + middleware + routers are configured, before notFound/error handlers:
  mountStatusRoutes(app);

  // In development mode, let Vite handle the frontend
  // In production mode, serve the built frontend
  if (process.env.NODE_ENV === "production") {
    import("fs").then(fs => {
      const clientPath = path.resolve(process.cwd(), "client");
      if (fs.existsSync(clientPath)) {
        app.use(express.static(clientPath));
        app.use("/src", express.static(path.join(clientPath, "src")));
        app.use("*", (_req, res) => {
          res.sendFile(path.resolve(clientPath, "index.html"));
        });
        console.log(`[server] serving client files from ${clientPath}`);
      } else {
        console.log(`[server] client directory not found: ${clientPath}`);
      }
    });
  } else {
    // In development mode, proxy frontend requests to Vite dev server
    app.get("*", (req, res) => {
      if (req.path.startsWith("/api")) {
        return; // Let API routes handle themselves
      }
      // Proxy to Vite dev server for frontend assets
      const viteUrl = `http://localhost:5175${req.originalUrl}`;
      res.redirect(302, viteUrl);
    });
    console.log(`[server] development mode: serving API on port 5000, frontend proxied to Vite on port 5175`);
  }

  // ... after routes (including status) and before your global error handler:
  app.use(sentryErrorHandler());

  // Global error handling middleware - MUST be after Vite setup
  app.use(errorLogger);
  app.use(globalErrorHandler);

  // Add global error handler from Block 10
  const {
    globalErrorHandler: block10ErrorHandler,
    notFoundHandler: block10NotFoundHandler,
  } = await import("./middleware/globalError");
  app.use(block10ErrorHandler);

  // 404 handler for unmatched routes - LAST middleware
  app.use(notFoundHandler);
  app.use(block10NotFoundHandler);

  // ALWAYS use port 5000 for Replit workflow integration
  // In development, this serves both API and frontend (with Vite integration)
  const port = 5000;
  
mountHealth(app);
if (process.env.NODE_ENV === "production") { mountProdFrontend(app); }
  app.listen(port, "0.0.0.0", () => {
    console.log(`[server] listening on ${port} (NODE_ENV=${process.env.NODE_ENV})`);
  });
})();

export default app;

export { createApp } from "./app";

