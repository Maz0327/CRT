import { z, ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid body", details: result.error.errors });
    }
    // @ts-expect-error augment for downstream handlers
    req.validated = { ...(req as any).validated, body: result.data };
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid query", details: result.error.errors });
    }
    // @ts-expect-error augment for downstream handlers
    req.validated = { ...(req as any).validated, query: result.data };
    next();
  };
}

// Optional: types you can use in handlers
export type ValidatedRequest<TBody = unknown, TQuery = unknown> = Request & {
  validated?: { body?: TBody; query?: TQuery };
};