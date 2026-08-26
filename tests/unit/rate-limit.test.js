import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');

const mockRpc = vi.fn();
const mockInsert = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    rpc: mockRpc,
    from: () => ({
      insert: mockInsert,
    }),
  }),
}));

const { checkRateLimit } = await import('../../netlify/functions/_rate-limit.js');

describe('_rate-limit.js — checkRateLimit', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('allows request when under limit', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    mockInsert.mockResolvedValue({ error: null });

    const result = await checkRateLimit(
      { headers: { 'x-forwarded-for': '1.2.3.4' } },
      'payment_intent',
      { maxCount: 10, windowSeconds: 60 }
    );

    expect(result.allowed).toBe(true);
    expect(result.error).toBeNull();
    expect(mockRpc).toHaveBeenCalledWith('check_rate_limit', {
      p_bucket: 'payment_intent',
      p_identifier: '1.2.3.4',
      p_max_count: 10,
      p_window_seconds: 60,
    });
  });

  it('blocks request when over limit', async () => {
    mockRpc.mockResolvedValue({ data: false, error: null });
    mockInsert.mockResolvedValue({ error: null });

    const result = await checkRateLimit(
      { headers: { 'x-forwarded-for': '1.2.3.4' } },
      'contact_form',
      { maxCount: 5, windowSeconds: 300 }
    );

    expect(result.allowed).toBe(false);
  });

  it('uses custom identifier when provided', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    mockInsert.mockResolvedValue({ error: null });

    const result = await checkRateLimit(
      { headers: {} },
      'auth',
      { maxCount: 5, windowSeconds: 60, identifier: 'user-123' }
    );

    expect(result.allowed).toBe(true);
    expect(mockRpc).toHaveBeenCalledWith('check_rate_limit', {
      p_bucket: 'auth',
      p_identifier: 'user-123',
      p_max_count: 5,
      p_window_seconds: 60,
    });
  });
});
