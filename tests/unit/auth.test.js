import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');

const mockAuthGetUser = vi.fn();
const mockSingle = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getUser: mockAuthGetUser },
    from: () => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: mockSingle,
      insert: vi.fn(),
    }),
    rpc: vi.fn(),
  }),
}));

const { verifyAdmin, verifyUser } = await import('../../netlify/functions/_auth.js');

describe('_auth.js — verifyAdmin', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns unauthorized when no Bearer token', async () => {
    const result = await verifyAdmin({ headers: {} });
    expect(result.authorized).toBe(false);
    expect(result.error).toContain('Token');
  });

  it('returns unauthorized when token is empty', async () => {
    const result = await verifyAdmin({
      headers: { authorization: 'Bearer ' },
    });
    expect(result.authorized).toBe(false);
  });

  it('returns unauthorized when token is invalid', async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: null }, error: 'bad token' });
    const result = await verifyAdmin({
      headers: { authorization: 'Bearer invalid-token' },
    });
    expect(result.authorized).toBe(false);
    expect(result.error).toBe('Token invàlid');
  });

  it('returns unauthorized when user is not in staff table', async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'a@b.com' } },
      error: null,
    });
    mockSingle.mockResolvedValue({ data: null, error: 'not found' });

    const result = await verifyAdmin({
      headers: { authorization: 'Bearer valid-token' },
    });
    expect(result.authorized).toBe(false);
    expect(result.error).toBe('No és administrador');
  });

  it('returns authorized when user is in staff table', async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'admin@test.com' } },
      error: null,
    });
    mockSingle.mockResolvedValue({
      data: { id: 's1', role: 'admin', is_active: true },
      error: null,
    });

    const result = await verifyAdmin({
      headers: { authorization: 'Bearer valid-token' },
    });
    expect(result.authorized).toBe(true);
    expect(result.user.id).toBe('u1');
    expect(result.staff.role).toBe('admin');
  });
});

describe('_auth.js — verifyUser', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns null user when no Authorization header', async () => {
    const result = await verifyUser({ headers: {} });
    expect(result.user).toBeNull();
    expect(result.error).toContain('Token');
  });

  it('returns user when token is valid', async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'user@test.com' } },
      error: null,
    });
    const result = await verifyUser({
      headers: { authorization: 'Bearer valid-token' },
    });
    expect(result.user).not.toBeNull();
    expect(result.user.id).toBe('u1');
  });
});
