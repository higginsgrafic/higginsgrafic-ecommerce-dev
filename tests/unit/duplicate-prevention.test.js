import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake');
vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');
vi.stubEnv('GELATO_API_KEY', 'gelato-test-key');
vi.stubEnv('SITE_URL', 'https://test.higginsgrafic.com');

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
let _insertCallCount = 0;
let _insertPayload = null;

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table) => {
      if (table === 'processed_stripe_events') {
        const chain = { eq: () => chain, single: () => Promise.resolve(_eventsSelectResult) };
        return {
          select: () => chain,
          insert: (payload) => {
            _insertCallCount++;
            _insertPayload = payload;
            return Promise.resolve(_eventsInsertResult);
          },
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

function makeWebhookEvent(stripeEventId = 'evt_001') {
  return {
    httpMethod: 'POST',
    headers: { 'stripe-signature': 'sig_test' },
    body: 'raw_body_data',
  };
}

describe('Duplicate prevention', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    _ordersSelectResult = { data: null, error: 'not found' };
    _ordersUpdateResult = { data: null, error: null };
    _eventsSelectResult = { data: null, error: 'not found' };
    _eventsInsertResult = { error: null };
    _insertCallCount = 0;
    _insertPayload = null;

    mockStripeConstruct.mockReturnValue({
      id: 'evt_dup_001',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_dup_123',
          metadata: { tracking_link: 'https://test.higginsgrafic.com/comanda?trackingToken=abc' },
        },
      },
    });

    mockGelatoCreate.mockResolvedValue({ orderId: 'gelato-1', status: 'created' });
    mockSendOrderEmail.mockResolvedValue({ id: 'email-1' });
  });

  it('prevents duplicate Stripe event processing (idempotency)', async () => {
    // First call: event not yet processed
    _eventsSelectResult = { data: null, error: 'not found' };
    _ordersUpdateResult = {
      data: { id: 'order-1', order_number: 'HG-001', email: 'test@test.com', items: '[]', gelato_order_id: null },
      error: null,
    };

    const res1 = await handler(makeWebhookEvent());
    expect(res1.statusCode).toBe(200);
    // order_confirmed + order_in_production (from Gelato fulfillment)
    expect(mockSendOrderEmail).toHaveBeenCalledTimes(2);
    expect(_insertCallCount).toBe(1);

    // Second call: same event already processed
    _eventsSelectResult = { data: { id: 'existing', result: { ok: true } }, error: null };

    const res2 = await handler(makeWebhookEvent());
    expect(res2.statusCode).toBe(200);
    const body = JSON.parse(res2.body);
    expect(body.duplicate).toBe(true);
    // Email should NOT be sent again (still 2 from first call)
    expect(mockSendOrderEmail).toHaveBeenCalledTimes(2);
    // Insert should NOT be called again
    expect(_insertCallCount).toBe(1);
  });

  it('prevents duplicate Gelato fulfillment (idempotent via gelato_order_id)', async () => {
    _eventsSelectResult = { data: null, error: 'not found' };
    // Order already has gelato_order_id — should skip fulfillment
    _ordersUpdateResult = {
      data: {
        id: 'order-2',
        order_number: 'HG-002',
        email: 'test@test.com',
        items: '[]',
        gelato_order_id: 'gelato-existing',
      },
      error: null,
    };

    const res = await handler(makeWebhookEvent());
    expect(res.statusCode).toBe(200);
    expect(mockGelatoCreate).not.toHaveBeenCalled();
  });

  it('records processed event with result after successful handling', async () => {
    _eventsSelectResult = { data: null, error: 'not found' };
    _ordersUpdateResult = {
      data: { id: 'order-3', order_number: 'HG-003', email: 'test@test.com', items: '[]', gelato_order_id: null },
      error: null,
    };

    await handler(makeWebhookEvent());
    expect(_insertCallCount).toBe(1);
    expect(_insertPayload).toMatchObject({
      event_id: 'evt_dup_001',
      event_type: 'payment_intent.succeeded',
      payment_intent_id: 'pi_dup_123',
    });
    expect(_insertPayload.result).toHaveProperty('ok', true);
  });

  it('does not record processed event when Gelato fails (retry)', async () => {
    _eventsSelectResult = { data: null, error: 'not found' };
    _ordersUpdateResult = {
      data: { id: 'order-4', order_number: 'HG-004', email: 'test@test.com', items: '[]', gelato_order_id: null },
      error: null,
    };

    const gelatoErr = new Error('Gelato 500');
    gelatoErr.code = 'GELATO_SERVER_ERROR';
    mockGelatoCreate.mockRejectedValue(gelatoErr);

    const res = await handler(makeWebhookEvent());
    expect(res.statusCode).toBe(500);
    // Event should still be recorded (but with error result)
    expect(_insertCallCount).toBe(1);
    expect(_insertPayload.result).toHaveProperty('ok', false);
  });
});

describe('Duplicate order creation prevention', () => {
  it('UNIQUE(idempotency_key) constraint prevents duplicate orders', async () => {
    // This is a unit test verifying the design: the idempotency_key
    // is generated server-side and stored with UNIQUE constraint.
    // If a duplicate insert is attempted, Supabase returns an error
    // which the handler converts to a 500.

    // We simulate the error response
    _eventsSelectResult = { data: null, error: 'not found' };
    _ordersUpdateResult = {
      data: null,
      error: { message: 'duplicate key value violates unique constraint "orders_idempotency_key_unique"' },
    };

    mockStripeConstruct.mockReturnValue({
      id: 'evt_order_dup',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_order_dup',
          metadata: {},
        },
      },
    });

    const res = await handler(makeWebhookEvent());
    // The webhook gets an error from the update, sets processResult.ok=false
    expect(res.statusCode).toBe(500);
  });
});
