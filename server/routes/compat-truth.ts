import { Router } from "express";

/**
 * Compat router mapping legacy `/api/truth_checks/*` calls
 * to the current `/api/truth/*` endpoints.
 *
 * Assumes your main truth routes are mounted under `/api/truth`.
 * We simply re-forward requests with identical method/body/query.
 */
export default function registerTruthCompat(app: import("express").Express) {
  const r = Router();

  // POST /api/truth_checks/run  →  POST /api/truth/run
  r.post("/truth_checks/run", (req, res, next) => {
    // rewrite URL and pass through same handler chain
    req.url = "/truth/run";
    next();
  });

  // GET /api/truth_checks/:id  →  GET /api/truth/:id
  r.get("/truth_checks/:id", (req, res, next) => {
    req.url = `/truth/${req.params.id}`;
    next();
  });

  // (Optional) GET /api/truth_checks → /api/truth
  r.get("/truth_checks", (req, res, next) => {
    req.url = "/truth";
    next();
  });

  // Mount under /api so the rewrites above resolve correctly
  app.use("/api", r);
}