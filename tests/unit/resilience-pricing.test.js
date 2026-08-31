/**
 * Resiliència — create-payment-intent.js
 * -----------------------------------------------------------------------------
 * Tests de comportament quan les dependències fallen (Supabase, Stripe).
 * L'objectiu és verificar que el handler degrada amb gràcia, no crash.
 */
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

// Mocks configurables per simular fallades
let _productVariantsResult = { data: [], error: null };
let _shippingConfigResult = { data: { cost: '4.95', free_threshold: '50.00' }, error: null };
let _ordersInsertResult = { data: { id: 'order-1', order_number: 'HG-001' }, error: null };
let _ordersUpdateResult = { error: null };
const mockRpc = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table) => {
      if (table === 'orders') {
        return {
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(_ordersInsertResult),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue(_ordersUpdateResult),
          }),
          select: vi.fn(),
        };
      }
      if (table === 'product_variants') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue(_productVariantsResult),
          }),
        };
      }
      if (table === 'shipping_config') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue(_shippingConfigResult),
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

describe('create-payment-intent — resiliència', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockRpc.mockResolvedValue({ data: true, error: null });
    mockStripeCreate.mockResolvedValue({
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret',
    });

    // Reset defaults
    _productVariantsResult = {
      data: [{ id: 'v1', gelato_variant_id: 'apparel_tshirt_1', price: '15.50' }],
      error: null,
    };
    _shippingConfigResult = { data: { cost: '4.95', free_threshold: '50.00' }, error: null };
    _ordersInsertResult = { data: { id: 'order-1', order_number: 'HG-001' }, error: null };
    _ordersUpdateResult = { error: null };
  });

  describe('Supabase caigut', () => {
    it('retorna 400 quan product_variants select falla (no 500 ni crash)', async () => {
      _productVariantsResult = { data: null, error: 'Connection refused' };

      const res = await handler(makeEvent({
        items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
      }));

      expect(res.statusCode).toBe(400);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('preus');
      // No s'ha de crear cap Payment Intent
      expect(mockStripeCreate).not.toHaveBeenCalled();
    });

    it('retorna 400 quan product_variants retorna error', async () => {
      _productVariantsResult = { data: null, error: { message: 'timeout' } };

      const res = await handler(makeEvent({
        items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
      }));

      expect(res.statusCode).toBe(400);
      expect(mockStripeCreate).not.toHaveBeenCalled();
    });

    it('retorna 500 quan order insert falla (no crash)', async () => {
      _ordersInsertResult = { data: null, error: { message: 'DB connection lost' } };

      const res = await handler(makeEvent({
        items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
      }));

      expect(res.statusCode).toBe(500);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('Error creant la comanda');
      // No s'ha de crear cap Payment Intent si l'order falla
      expect(mockStripeCreate).not.toHaveBeenCalled();
    });

    it('retorna 500 quan Supabase no està configurat', async () => {
      // Cal re-importar el mòdul perquè les constants SUPABASE_URL i
      // SUPABASE_SERVICE_KEY es capturen a l'import time.
      vi.resetModules();
      vi.stubEnv('SUPABASE_URL', '');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '');

      const { handler: freshHandler } = await import('../../netlify/functions/create-payment-intent.js');
      const res = await freshHandler(makeEvent({
        items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
      }));

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res.body).error).toContain('Supabase');

      // Restore
      vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
      vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
    });
  });

  describe('Stripe caigut', () => {
    it('retorna 500 quan Stripe paymentIntents.create reject', async () => {
      mockStripeCreate.mockRejectedValue(new Error('Stripe API timeout'));

      const res = await handler(makeEvent({
        items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
      }));

      expect(res.statusCode).toBe(500);
      const body = JSON.parse(res.body);
      expect(body.error).toContain('Error intern');
    });

    it('retorna 500 quan Stripe retorna error', async () => {
      const stripeErr = new Error('Invalid API key');
      stripeErr.type = 'StripeAuthenticationError';
      mockStripeCreate.mockRejectedValue(stripeErr);

      const res = await handler(makeEvent({
        items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
      }));

      expect(res.statusCode).toBe(500);
    });
  });

  describe('shipping_config no trobat', () => {
    it('fa fallback a 4.95 quan shipping_config no existeix', async () => {
      _shippingConfigResult = { data: null, error: 'not found' };

      const res = await handler(makeEvent({
        items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
        shippingZone: 'unknown_zone',
      }));

      expect(res.statusCode).toBe(200);
      const body = JSON.parse(res.body);
      // Fallback a 4.95
      expect(body.shippingCost).toBe(4.95);
    });
  });

  describe('error handling genèric', () => {
    it('retorna 500 genèric (no fuga stack trace) quan hi ha error no controlat', async () => {
      // Simulem un error no controlat fent que JSON.parse falli
      const res = await handler({
        httpMethod: 'POST',
        headers: {},
        body: 'invalid json{{',
      });

      expect(res.statusCode).toBe(500);
      const body = JSON.parse(res.body);
      // No ha de fugar el stack trace
      expect(body.error).not.toMatch(/at\s+\w+\s+\(/);
      expect(body.error).not.toContain('SyntaxError');
    });

    it('no retorna informació sensible a l\'error', async () => {
      _ordersInsertResult = {
        data: null,
        error: { message: 'duplicate key value violates unique constraint "orders_idempotency_key_unique"' },
      };

      const res = await handler(makeEvent({
        items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
      }));

      expect(res.statusCode).toBe(500);
      const body = JSON.parse(res.body);
      // L'error al client ha de ser genèric, no revelar detalls de DB
      expect(body.error).not.toContain('duplicate key');
      expect(body.error).not.toContain('constraint');
    });
  });
});
