import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');

const mockAuthGetUser = vi.fn();
const mockStaffSingle = vi.fn();
const mockRpc = vi.fn();

// Build a chainable mock for supabase.from(table)
function buildFromMock(opts = {}) {
  const {
    selectData = null,
    selectError = 'not found',
    insertData = null,
    insertError = null,
    updateData = null,
    updateError = null,
  } = opts;

  const singleFn = vi.fn().mockResolvedValue({ data: selectData, error: selectError });
  const orderFn = vi.fn().mockResolvedValue({ data: selectData, error: selectError });
  // eq must be chainable: .eq().eq().single() and .eq().order()
  const chain = { single: singleFn, order: orderFn };
  chain.eq = vi.fn().mockReturnValue(chain);
  const eqFn = chain.eq;
  const selectFn = vi.fn().mockReturnValue(chain);
  const updateEqFn = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ single: singleFn }),
      }),
    }),
  });

  return {
    select: selectFn,
    eq: eqFn,
    single: singleFn,
    insert: vi.fn().mockResolvedValue({ data: insertData, error: insertError }),
    update: vi.fn().mockReturnValue({ eq: updateEqFn() }),
  };
}

let currentFromMock = buildFromMock();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: { getUser: mockAuthGetUser },
    from: () => currentFromMock,
    rpc: mockRpc,
  }),
}));

vi.mock('../../netlify/functions/_email.js', () => ({
  sendOrderEmail: vi.fn().mockResolvedValue({ id: 'email-1' }),
}));

const { handler } = await import('../../netlify/functions/orders.js');

function makeEvent(method, opts = {}) {
  return {
    httpMethod: method,
    headers: opts.headers || {},
    body: opts.body ? JSON.stringify(opts.body) : '{}',
    queryStringParameters: opts.query || null,
  };
}

describe('orders.js — POST disabled', () => {
  it('returns 403 on POST (orders created via create-payment-intent only)', async () => {
    const res = await handler(makeEvent('POST', {
      body: { email: 'test@test.com', items: [{ id: '1' }] },
    }));
    expect(res.statusCode).toBe(403);
  });
});

describe('orders.js — GET authorization', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockRpc.mockResolvedValue({ data: true, error: null });
  });

  it('returns 401 when no auth and no tracking token', async () => {
    currentFromMock = buildFromMock();
    const res = await handler(makeEvent('GET', { query: {} }));
    expect(res.statusCode).toBe(401);
  });

  it('returns order by tracking token (guest access)', async () => {
    const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    currentFromMock = buildFromMock({
      selectData: {
        id: 'order-1',
        order_number: 'HG-001',
        status: 'confirmada',
        items: '[]',
        tracking_token: 'validtoken',
        tracking_token_expires_at: futureDate,
      },
      selectError: null,
    });

    const res = await handler(makeEvent('GET', {
      query: { trackingToken: 'validtoken' },
    }));

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.order.order_number).toBe('HG-001');
  });

  it('returns 403 when tracking token is expired', async () => {
    const pastDate = new Date(Date.now() - 1000).toISOString();
    currentFromMock = buildFromMock({
      selectData: {
        id: 'order-1',
        tracking_token: 'expiredtoken',
        tracking_token_expires_at: pastDate,
      },
      selectError: null,
    });

    const res = await handler(makeEvent('GET', {
      query: { trackingToken: 'expiredtoken' },
    }));

    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body).error).toContain('caducat');
  });

  it('returns 404 when tracking token not found', async () => {
    currentFromMock = buildFromMock({
      selectData: null,
      selectError: 'not found',
    });

    const res = await handler(makeEvent('GET', {
      query: { trackingToken: 'nonexistent' },
    }));

    expect(res.statusCode).toBe(404);
  });

  it('returns user orders when authenticated with valid JWT', async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'user@test.com' } },
      error: null,
    });

    currentFromMock = buildFromMock({
      selectData: [{ id: 'order-1', order_number: 'HG-001', status: 'confirmada', items: '[]' }],
      selectError: null,
    });

    const res = await handler(makeEvent('GET', {
      headers: { authorization: 'Bearer valid-jwt' },
      query: {},
    }));

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.orders).toHaveLength(1);
  });

  it('returns 429 when rate limited', async () => {
    mockRpc.mockResolvedValue({ data: false, error: null });
    currentFromMock = buildFromMock();

    const res = await handler(makeEvent('GET', { query: {} }));
    expect(res.statusCode).toBe(429);
  });
});

describe('orders.js — PATCH admin only', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 403 when no auth on PATCH', async () => {
    currentFromMock = buildFromMock();
    const res = await handler(makeEvent('PATCH', {
      body: { orderNumber: 'HG-001', status: 'confirmada' },
    }));
    expect(res.statusCode).toBe(403);
  });

  it('returns 403 when token invalid on PATCH', async () => {
    mockAuthGetUser.mockResolvedValue({ data: { user: null }, error: 'bad token' });
    currentFromMock = buildFromMock();

    const res = await handler(makeEvent('PATCH', {
      headers: { authorization: 'Bearer invalid' },
      body: { orderNumber: 'HG-001', status: 'confirmada' },
    }));
    expect(res.statusCode).toBe(403);
  });

  it('returns 403 when user is not admin on PATCH', async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'u1', email: 'user@test.com' } },
      error: null,
    });
    currentFromMock = buildFromMock({
      selectData: null,
      selectError: 'not staff',
    });

    const res = await handler(makeEvent('PATCH', {
      headers: { authorization: 'Bearer valid-but-not-admin' },
      body: { orderNumber: 'HG-001', status: 'confirmada' },
    }));
    expect(res.statusCode).toBe(403);
  });

  it('rejects invalid status on PATCH', async () => {
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: 'admin-1', email: 'admin@test.com' } },
      error: null,
    });
    currentFromMock = buildFromMock({
      selectData: { id: 's1', role: 'admin', is_active: true },
      selectError: null,
    });

    const res = await handler(makeEvent('PATCH', {
      headers: { authorization: 'Bearer admin-token' },
      body: { orderNumber: 'HG-001', status: 'invalid_status' },
    }));
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toContain('invàlid');
  });
});
