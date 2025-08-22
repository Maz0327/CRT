import type { Request, Response, NextFunction } from "express";

export function mockRequireAuth(req: Request, _res: Response, next: NextFunction) {
  (req as any).user = { id: "00000000-0000-0000-0000-000000000000", email: "test@example.com" };
  next();
}