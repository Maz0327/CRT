import type { Request } from "express";

export function getUserId(req: Request): string {
  const id = (req as any).user?.id || (req as any).user?.sub;
  if (!id) throw Object.assign(new Error("not_authenticated"), { status: 401 });
  return String(id);
}