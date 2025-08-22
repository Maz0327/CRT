import type { Response } from "express";

type Extras = Record<string, unknown> | undefined;

export function problem(res: Response, status: number, title: string, details?: string, code?: string, extras?: Extras) {
  return res.status(status).json({
    error: title,
    code: code || statusToCode(status),
    details,
    ...extras,
  });
}

function statusToCode(status: number): string {
  switch (status) {
    case 400: return "BAD_REQUEST";
    case 401: return "UNAUTHORIZED";
    case 403: return "FORBIDDEN";
    case 404: return "NOT_FOUND";
    case 409: return "CONFLICT";
    case 422: return "UNPROCESSABLE";
    default: return "INTERNAL_ERROR";
  }
}