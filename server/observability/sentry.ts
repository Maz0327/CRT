import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import type { Express } from "express";

export function initSentry(app: Express) {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn || process.env.NODE_ENV !== "production") return;

  try {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
      integrations: [nodeProfilingIntegration()],
    });

    // Use the handlers if they exist
    if ((Sentry as any).requestHandler) {
      app.use((Sentry as any).requestHandler());
    }
    if ((Sentry as any).tracingHandler) {
      app.use((Sentry as any).tracingHandler());
    }
  } catch (error) {
    console.warn("Sentry initialization failed:", error);
  }
}

export function sentryErrorHandler() {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn || process.env.NODE_ENV !== "production") return (req:any,res:any,next:any)=>next();
  try {
    if ((Sentry as any).errorHandler) {
      return (Sentry as any).errorHandler();
    }
  } catch (error) {
    console.warn("Sentry error handler setup failed:", error);
  }
  return (req:any,res:any,next:any)=>next();
}