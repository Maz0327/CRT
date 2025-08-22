import { Request, Response, NextFunction } from "express";
import { logger } from "../logger";

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const errorId = Date.now().toString();
  logger.error({ err, errorId, path: req.path, method: req.method }, "Unhandled error");
  if (!res.headersSent) {
    res.status(500).json({ error: "Internal server error", errorId });
  }
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: "Route not found" });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}