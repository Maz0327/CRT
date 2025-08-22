import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { debugLogger, errorHandler } from "./services/debug-logger";

// Set Reddit API credentials
process.env.REDDIT_CLIENT_ID = "xarhGzkT7yuAVMqaoc_Bdg";
process.env.REDDIT_CLIENT_SECRET = "7cdXuM0mpCy3n3wYBS6TpQvPTmoZEw";

// Set Twitter API credentials
process.env.TWITTER_BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAJgE3AEAAAAAZdOJQZdr1BLIFpmXMamKArS4nw8%3Dr4JmJwLhm3clkDhn4u4pV3vO27cxRjo5ufkV4feWv7N0O0zccb";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add process error handlers
process.on('uncaughtException', (error) => {
  debugLogger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  debugLogger.error('Unhandled Rejection at:', reason);
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

      log(logLine);
      
      // Enhanced debug logging
      debugLogger.apiCall(req, res, duration, res.statusCode >= 400 ? new Error(capturedJsonResponse?.message || 'Request failed') : undefined);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Enhanced error handling with debug logging
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log error details
    debugLogger.error(`Server error: ${message}`, err, req);
    
    res.status(status).json({ 
      message,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method
    });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
