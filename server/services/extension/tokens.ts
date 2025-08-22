import jwt from "jsonwebtoken";

const EXT_SECRET = process.env.EXTENSION_JWT_SECRET || "dev-secret-change";
const ACCESS_TTL = Number(process.env.EXTENSION_TOKEN_EXPIRES_SECONDS || 3600); // seconds
const REFRESH_TTL = Number(process.env.EXTENSION_REFRESH_TTL_SECONDS || 2592000); // seconds

export function signExtensionAccess(userId: string, deviceId: string) {
  const nowSec = Math.floor(Date.now()/1000);
  const payload = { sub: userId, deviceId, scope: "extension" as const, typ: "access" as const, iat: nowSec };
  return jwt.sign(payload, EXT_SECRET, { algorithm: "HS256", expiresIn: ACCESS_TTL });
}

export function signExtensionRefresh(userId: string, deviceId: string) {
  const nowSec = Math.floor(Date.now()/1000);
  const payload = { sub: userId, deviceId, scope: "extension", typ: "refresh", iat: nowSec };
  return jwt.sign(payload, EXT_SECRET, { algorithm: "HS256", expiresIn: REFRESH_TTL });
}

export function verifyExtensionToken(token: string) {
  return jwt.verify(token, EXT_SECRET) as { sub: string; deviceId: string; scope: string; typ: "access"|"refresh"; iat:number; exp:number };
}