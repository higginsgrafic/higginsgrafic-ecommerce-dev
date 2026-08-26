import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('SITE_URL', 'https://test.higginsgrafic.com');
vi.stubEnv('TRACKING_TOKEN_EXPIRY_DAYS', '90');

const { generateTrackingToken, hashToken, getTokenExpiry, isTokenExpired, buildTrackingLink } =
  await import('../../netlify/functions/_token.js');

describe('_token.js — tracking token utilities', () => {
  describe('generateTrackingToken', () => {
    it('generates a 64-char hex string (32 bytes)', () => {
      const token = generateTrackingToken();
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it('generates unique tokens', () => {
      const t1 = generateTrackingToken();
      const t2 = generateTrackingToken();
      expect(t1).not.toBe(t2);
    });
  });

  describe('hashToken', () => {
    it('produces a SHA-256 hash (64 chars hex)', () => {
      const raw = 'abc123';
      const hash = hashToken(raw);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('is deterministic — same input → same hash', () => {
      const raw = 'testtoken123';
      expect(hashToken(raw)).toBe(hashToken(raw));
    });

    it('different inputs → different hashes', () => {
      expect(hashToken('a')).not.toBe(hashToken('b'));
    });

    it('does not reveal the raw token (one-way)', () => {
      const raw = generateTrackingToken();
      const hash = hashToken(raw);
      expect(hash).not.toContain(raw);
      expect(raw).not.toContain(hash);
    });
  });

  describe('getTokenExpiry', () => {
    it('returns an ISO date ~90 days in the future by default', () => {
      const expiry = getTokenExpiry();
      const d = new Date(expiry);
      const now = new Date();
      const diffDays = (d - now) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(89);
      expect(diffDays).toBeLessThan(91);
    });

    it('respects custom expiry days', () => {
      const expiry = getTokenExpiry(30);
      const d = new Date(expiry);
      const now = new Date();
      const diffDays = (d - now) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(29);
      expect(diffDays).toBeLessThan(31);
    });

    it('falls back to 90 days for invalid input', () => {
      const expiry = getTokenExpiry('notanumber');
      const d = new Date(expiry);
      const now = new Date();
      const diffDays = (d - now) / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(89);
    });
  });

  describe('isTokenExpired', () => {
    it('returns false for a future date', () => {
      const future = new Date(Date.now() + 86400000).toISOString();
      expect(isTokenExpired(future)).toBe(false);
    });

    it('returns true for a past date', () => {
      const past = new Date(Date.now() - 86400000).toISOString();
      expect(isTokenExpired(past)).toBe(true);
    });

    it('returns false for null/undefined (no expiry set)', () => {
      expect(isTokenExpired(null)).toBe(false);
      expect(isTokenExpired(undefined)).toBe(false);
    });
  });

  describe('buildTrackingLink', () => {
    it('builds a URL with the raw token as query param', () => {
      const link = buildTrackingLink('https://example.com', 'rawtoken123');
      expect(link).toBe('https://example.com/comanda?trackingToken=rawtoken123');
    });

    it('uses SITE_URL env var when siteUrl is not provided', () => {
      const link = buildTrackingLink(undefined, 'mytoken');
      expect(link).toContain('trackingToken=mytoken');
      expect(link).toContain('test.higginsgrafic.com');
    });

    it('falls back to default domain when no siteUrl or env', () => {
      vi.stubEnv('SITE_URL', '');
      const link = buildTrackingLink(undefined, 'tok');
      expect(link).toContain('higginsgrafic.com');
      expect(link).toContain('trackingToken=tok');
      vi.stubEnv('SITE_URL', 'https://test.higginsgrafic.com');
    });
  });
});
