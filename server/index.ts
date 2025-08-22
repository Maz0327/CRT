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
import { corsMiddleware } from "./lib/cors";
import { publicLimiter, authLimiter, heavyLimiter } from "./middleware/rateLimit";
import { projectScope } from "./middleware/project-scope";
import path from "path";
import { fileURLToPath } from "url";



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

const app = express();

// Trust proxy for Replit deployment
app.set("trust proxy", 1);

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
        req,
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

  // Health and documentation endpoints (Block 10)
  const { healthzEndpoint, readyzEndpoint } = await import("./lib/health");
  const docsRouter = (await import("./routes/docs")).default;
  app.get("/healthz", healthzEndpoint);
  app.get("/readyz", readyzEndpoint);
  app.use("/api", docsRouter);

  const server = await registerRoutes(app);

  // Start Moments Aggregator Worker (Task Block 8A)
  const { startMomentsAggregator } = await import(
    "./workers/moments-aggregator"
  );
  startMomentsAggregator();

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "development") {
    const { setupVite } = await import("./vite");
    await setupVite(app, server);
  } else {
    // Serve static files directly without importing from vite.ts
    import("fs").then(fs => {
      const distPath = path.resolve(import.meta.dirname, "public");
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.use("*", (_req, res) => {
          res.sendFile(path.resolve(distPath, "index.html"));
        });
        console.log(`[server] serving static files from ${distPath}`);
      } else {
        console.log(`[server] static directory not found: ${distPath}`);
      }
    });
  }

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

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  
  app.listen(port, "0.0.0.0", () => {
    console.log(`[server] listening on ${port} (NODE_ENV=${process.env.NODE_ENV})`);
  });
})();

export default app;
