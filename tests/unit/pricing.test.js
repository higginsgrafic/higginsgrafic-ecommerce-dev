import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake');

const mockStripeCreate = vi.fn();
vi.mock('stripe', () => ({
  default: function Stripe() {
    this.paymentIntents = { create: mockStripeCreate };
  },
}));

const mockFromSelect = vi.fn();
const mockFromInsert = vi.fn();
const mockFromUpdate = vi.fn();
const mockSingle = vi.fn();
const mockRpc = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table) => {
      if (table === 'orders') {
        return {
          insert: mockFromInsert,
          update: mockFromUpdate,
          select: mockFromSelect,
        };
      }
      if (table === 'product_variants') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: [
                { id: 'v1', gelato_variant_id: 'apparel_tshirt_1', price: '15.50' },
                { id: 'v2', gelato_variant_id: 'apparel_tshirt_2', price: '18.00' },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === 'shipping_config') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { cost: '4.95', free_threshold: '50.00' },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === 'rate_limit_log') {
        return { insert: vi.fn().mockResolvedValue({ error: null }) };
      }
      return { select: vi.fn(), insert: vi.fn(), update: vi.fn() };
    },
    rpc: mockRpc,
  }),
}));

const { handler } = await import('../../netlify/functions/create-payment-intent.js');

function makeEvent(body, method = 'POST') {
  return {
    httpMethod: method,
    headers: {},
    body: JSON.stringify(body),
  };
}

describe('create-payment-intent — server-side pricing', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockRpc.mockResolvedValue({ data: true, error: null });

    mockFromInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'order-1', order_number: 'HG-001' },
          error: null,
        }),
      }),
    });

    mockFromUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    mockStripeCreate.mockResolvedValue({
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret',
    });
  });

  it('rejects empty items', async () => {
    const res = await handler(makeEvent({ items: [] }, 'POST'));
    expect(res.statusCode).toBe(400);
  });

  it('rejects non-EUR currency', async () => {
    const res = await handler(makeEvent({
      items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
      currency: 'usd',
    }));
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toContain('EUR');
  });

  it('calculates price server-side and creates order + PI', async () => {
    const res = await handler(makeEvent({
      items: [
        { gelatoVariantId: 'apparel_tshirt_1', quantity: 2 },
        { gelatoVariantId: 'apparel_tshirt_2', quantity: 1 },
      ],
      shippingZone: 'es_peninsula',
      email: 'test@example.com',
    }));

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.clientSecret).toBe('pi_test_123_secret');
    expect(body.paymentIntentId).toBe('pi_test_123');
    expect(body.orderId).toBe('order-1');
    expect(body.trackingToken).toBeDefined();
    expect(body.trackingToken.length).toBe(64); // 32 bytes hex

    // subtotal = 15.50*2 + 18.00*1 = 49.00
    expect(body.subtotal).toBe(49.00);
    // shipping = 4.95 (subtotal < 50 threshold)
    expect(body.shippingCost).toBe(4.95);
    // iva = 49.00 * 0.21 = 10.29
    expect(body.iva).toBe(10.29);
    // total = (49.00 + 4.95 + 10.29) = 64.24
    expect(body.total).toBe(64.24);

    // Verify Stripe was called with server-calculated amount
    expect(mockStripeCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: Math.round((49.00 + 4.95 + 10.29) * 100),
        currency: 'eur',
      })
    );
  });

  it('applies free shipping when subtotal >= threshold', async () => {
    const res = await handler(makeEvent({
      items: [
        { gelatoVariantId: 'apparel_tshirt_1', quantity: 4 }, // 15.50 * 4 = 62.00
      ],
      shippingZone: 'es_peninsula',
    }));

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.subtotal).toBe(62.00);
    expect(body.shippingCost).toBe(0); // free shipping (>= 50)
  });

  it('rejects items without gelatoVariantId', async () => {
    const res = await handler(makeEvent({
      items: [{ quantity: 1 }],
    }));
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toContain('gelatoVariantId');
  });

  it('returns 429 when rate limited', async () => {
    mockRpc.mockResolvedValue({ data: false, error: null });
    const res = await handler(makeEvent({
      items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
    }));
    expect(res.statusCode).toBe(429);
  });

  it('returns 405 for GET', async () => {
    const res = await handler(makeEvent({}, 'GET'));
    expect(res.statusCode).toBe(405);
  });
});
