import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake');
vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');

const mockStripeConstruct = vi.fn();
vi.mock('stripe', () => ({
  default: function Stripe() {
    this.webhooks = { constructEvent: mockStripeConstruct };
  },
}));

const mockGelatoCreate = vi.fn();
const mockSendOrderEmail = vi.fn();

let _ordersSelectResult = { data: null, error: 'not found' };
let _ordersUpdateResult = { data: null, error: null };
let _eventsSelectResult = { data: null, error: 'not found' };
let _eventsInsertResult = { error: null };

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table) => {
      if (table === 'processed_stripe_events') {
        const chain = { eq: () => chain, single: () => Promise.resolve(_eventsSelectResult) };
        return {
          select: () => chain,
          insert: () => Promise.resolve(_eventsInsertResult),
        };
      }
      // orders table
      const ordersChain = {
        eq: () => ordersChain,
        single: () => Promise.resolve(_ordersSelectResult),
        select: () => ordersChain,
      };
      return {
        select: () => ordersChain,
        update: () => ({
          eq: () => ({
            select: () => ({ single: () => Promise.resolve(_ordersUpdateResult) }),
            then: (resolve) => resolve(_ordersUpdateResult),
          }),
        }),
      };
    },
  }),
}));

vi.mock('../../netlify/functions/_gelato.js', () => ({
  createGelatoOrderServer: mockGelatoCreate,
}));

vi.mock('../../netlify/functions/_email.js', () => ({
  sendOrderEmail: mockSendOrderEmail,
}));

const { handler } = await import('../../netlify/functions/stripe-webhook.js');

function makeWebhookEvent() {
  return {
    httpMethod: 'POST',
    headers: { 'stripe-signature': 'sig_test' },
    body: 'raw_body_data',
  };
}

function setOrdersSelect(data, error = null) {
  _ordersSelectResult = { data, error };
}
function setOrdersUpdate(data, error = null) {
  _ordersUpdateResult = { data, error };
}
function setEventsSelect(data, error = null) {
  _eventsSelectResult = { data, error };
}

describe('stripe-webhook — idempotency', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    _ordersSelectResult = { data: null, error: 'not found' };
    _ordersUpdateResult = { data: null, error: null };
    _eventsSelectResult = { data: null, error: 'not found' };
    _eventsInsertResult = { error: null };

    mockStripeConstruct.mockReturnValue({
      id: 'evt_001',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_123' } },
    });

    mockGelatoCreate.mockResolvedValue({ orderId: 'gelato-1', status: 'created' });
    mockSendOrderEmail.mockResolvedValue({ id: 'email-1' });
  });

  it('processes payment_intent.succeeded and sends confirmation email', async () => {
    // processed_stripe_events: not found (not duplicate)
    setEventsSelect(null, 'not found');
    // orders update with .select().single() returns order data
    setOrdersUpdate({ id: 'order-1', order_number: 'HG-001', email: 'test@test.com', items: '[]', gelato_order_id: null });

    const res = await handler(makeWebhookEvent());

    expect(res.statusCode).toBe(200);
    expect(mockSendOrderEmail).toHaveBeenCalledWith('order_confirmed', expect.objectContaining({
      id: 'order-1',
    }));
  });

  it('skips duplicate events (already processed)', async () => {
    setEventsSelect({ id: 'existing', result: { ok: true } });

    const res = await handler(makeWebhookEvent());

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.duplicate).toBe(true);
    expect(mockSendOrderEmail).not.toHaveBeenCalled();
  });

  it('marks order as cancel_lada on payment_intent.payment_failed', async () => {
    mockStripeConstruct.mockReturnValue({
      id: 'evt_002',
      type: 'payment_intent.payment_failed',
      data: { object: { id: 'pi_test_456' } },
    });

    // update succeeds (no error), then select returns order data
    setOrdersSelect({ id: 'order-2', email: 'test@test.com', items: '[]' });

    const res = await handler(makeWebhookEvent());

    expect(res.statusCode).toBe(200);
    expect(mockSendOrderEmail).toHaveBeenCalledWith('order_failed', expect.objectContaining({
      id: 'order-2',
    }));
  });

  it('returns 400 when signature is missing', async () => {
    const res = await handler({
      httpMethod: 'POST',
      headers: {},
      body: 'data',
    });
    expect(res.statusCode).toBe(400);
  });

  it('returns 400 when signature verification fails', async () => {
    mockStripeConstruct.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    const res = await handler(makeWebhookEvent());
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toContain('signature');
  });

  it('records processed event after handling', async () => {
    setOrdersUpdate({ id: 'order-1', order_number: 'HG-001', email: 'test@test.com', items: '[]', gelato_order_id: null });

    const res = await handler(makeWebhookEvent());
    expect(res.statusCode).toBe(200);
  });
});

describe('stripe-webhook — Gelato fulfillment retries', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    _ordersSelectResult = { data: null, error: 'not found' };
    _ordersUpdateResult = { data: null, error: null };
    _eventsSelectResult = { data: null, error: 'not found' };
    _eventsInsertResult = { error: null };

    mockStripeConstruct.mockReturnValue({
      id: 'evt_003',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_test_789' } },
    });

    mockSendOrderEmail.mockResolvedValue({ id: 'email-1' });
  });

  it('returns 500 when Gelato has server error (retry)', async () => {
    setOrdersUpdate({ id: 'order-3', order_number: 'HG-003', email: 'test@test.com', items: '[]', gelato_order_id: null });

    const gelatoErr = new Error('Gelato 500');
    gelatoErr.code = 'GELATO_SERVER_ERROR';
    mockGelatoCreate.mockRejectedValue(gelatoErr);

    const res = await handler(makeWebhookEvent());
    expect(res.statusCode).toBe(500);
  });

  it('returns 200 when Gelato has data error (skip, no retry)', async () => {
    setOrdersUpdate({ id: 'order-3', order_number: 'HG-003', email: 'test@test.com', items: '[]', gelato_order_id: null });

    const gelatoErr = new Error('Bad data');
    gelatoErr.code = 'GELATO_DATA_ERROR';
    mockGelatoCreate.mockRejectedValue(gelatoErr);

    const res = await handler(makeWebhookEvent());
    expect(res.statusCode).toBe(200);
  });

  it('skips Gelato fulfillment when gelato_order_id already exists', async () => {
    setOrdersUpdate({ id: 'order-3', gelato_order_id: 'gelato-existing', email: 'test@test.com', items: '[]' });

    await handler(makeWebhookEvent());
    expect(mockGelatoCreate).not.toHaveBeenCalled();
  });
});
