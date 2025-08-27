import { Router } from "express";

const router = Router();

// GET /api/me  -> { id, email } or 401
router.get("/me", (req, res) => {
  // req.user is set by our auth middleware
  if (!req.user) return res.status(401).json({ error: "unauthorized" });
  const { id, email } = req.user;
  return res.json({ id, email });
});

export default router;