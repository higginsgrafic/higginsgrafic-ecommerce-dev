import crypto from 'node:crypto';

const TOKEN_BYTES = 32;
const DEFAULT_EXPIRY_DAYS = 90;

export function generateTrackingToken() {
  return crypto.randomBytes(TOKEN_BYTES).toString('hex');
}

export function hashToken(rawToken) {
  // Guard: crypto.update() throws TypeError si rep null/undefined.
  // Convertim a string per evitar crash; el hash resultant no coincidirà
  // amb cap token vàlid, per tant la consulta retornarà 404 (no 500).
  const input = rawToken == null ? '' : String(rawToken);
  return crypto.createHash('sha256').update(input).digest('hex');
}

export function getTokenExpiry(days = DEFAULT_EXPIRY_DAYS) {
  const d = parseInt(days, 10);
  const expiryDays = Number.isFinite(d) && d > 0 ? d : DEFAULT_EXPIRY_DAYS;
  return new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString();
}

export function isTokenExpired(expiresAt) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export function buildTrackingLink(siteUrl, rawToken) {
  const base = siteUrl || process.env.SITE_URL || 'https://higginsgrafic.com';
  return `${base}/comanda?trackingToken=${rawToken}`;
}
