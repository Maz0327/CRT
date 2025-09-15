import { Router } from "express";
import crypto from "crypto";
import { z } from "zod";
import { signExtensionAccess, signExtensionRefresh, verifyExtensionToken } from "../services/extension/tokens";
import { requireAuth } from "../middleware/auth"; // unified middleware
import { storage } from "../storage";

const r = Router();

/** Helper to generate code like PAIR-AB12CD */
function makeCode(): string {
  const a = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6 hex => 12 chars
  return `PAIR-${a.slice(0,2)}${a.slice(2,4)}${a.slice(4,6)}`;
}

/** Auth'd user creates a pairing code */
r.post("/pairing-codes", requireAuth, async (req: any, res, next) => {
  try {
    const schema = z.object({
      projectId: z.string().uuid().nullable().optional(),
      label: z.string().min(0).max(80).nullable().optional(),
      ttlSeconds: z.number().int().positive().max(3600).optional(),
    });
    const { projectId = null, label = null, ttlSeconds } = schema.parse(req.body);
    const ttl = ttlSeconds ?? Number(process.env.EXTENSION_PAIR_CODE_TTL_SECONDS || 600);
    const code = makeCode();
    const expires = new Date(Date.now() + ttl*1000);
    const userId = req.user.id;

    await storage.createPairingCode({
      code,
      userId,
      projectId,
      deviceLabel: label,
      expiresAt: expires
    });

    res.json({ code, expiresAt: expires.toISOString() });
  } catch (e) { next(e); }
});

/** Extension exchanges code for token pair */
r.post("/token", async (req, res, next) => {
  try {
    const schema = z.object({ code: z.string().min(6).max(32) });
    const { code } = schema.parse(req.body);
    const row = await storage.validatePairingCode(code);
    
    if (!row) return res.status(400).json({ error: "invalid_or_expired_code" });

    // create device
    const device = await storage.createExtensionDevice({
      userId: row.user_id,
      projectId: row.project_id,
      label: row.device_label,
      lastSeenAt: new Date()
    });

    await storage.markPairingCodeUsed(code, device.id);

    const access = signExtensionAccess(row.user_id, device.id);
    const refresh = signExtensionRefresh(row.user_id, device.id);
    res.json({ token: access, refreshToken: refresh, expiresInMs: Number(process.env.EXTENSION_TOKEN_EXPIRES_SECONDS || 3600)*1000 });
  } catch (e) { next(e); }
});

/** Extension refreshes token */
r.post("/refresh", async (req, res, next) => {
  try {
    const schema = z.object({ refreshToken: z.string().min(20) });
    const { refreshToken } = schema.parse(req.body);
    const decoded = verifyExtensionToken(refreshToken);
    if (decoded.scope !== "extension" || decoded.typ !== "refresh") return res.status(401).json({ error: "invalid_scope" });

    // Optional: verify device not revoked
    const device = await storage.getExtensionDevice(decoded.deviceId);
    if (!device || device.revoked_at) return res.status(401).json({ error: "device_revoked" });

    const access = signExtensionAccess(decoded.sub, decoded.deviceId);
    res.json({ token: access, expiresInMs: Number(process.env.EXTENSION_TOKEN_EXPIRES_SECONDS || 3600)*1000 });
  } catch (e) { next(e); }
});

/** Extension heartbeat (updates last_seen_at) */
r.post("/heartbeat", async (req, res, next) => {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const decoded = verifyExtensionToken(token);
    if (decoded.typ !== "access") return res.status(401).json({ error: "invalid_token" });
    await storage.updateDeviceHeartbeat(decoded.deviceId);
    res.status(204).end();
  } catch (e) { next(e); }
});

/** Auth'd user device list/manage */
r.get("/devices", requireAuth, async (req: any, res, next) => {
  try {
    const userId = req.user.id;
    const devices = await storage.listExtensionDevices(userId);
    res.json({ data: devices });
  } catch (e) { next(e); }
});

r.patch("/devices/:id", requireAuth, async (req: any, res, next) => {
  try {
    const schema = z.object({ label: z.string().min(0).max(80).nullable().optional(), revoke: z.boolean().optional() });
    const { label, revoke } = schema.parse(req.body);
    const deviceId = req.params.id;
    const userId = req.user.id;
    
    const device = await storage.getExtensionDevice(deviceId);
    if (!device || device.user_id !== userId) return res.status(404).json({ error: "not_found" });
    
    if (label !== undefined && label !== null) await storage.updateDeviceLabel(deviceId, label);
    if (revoke) await storage.revokeDevice(deviceId);
    res.status(204).end();
  } catch (e) { next(e); }
});

export default r;