import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_fake');
vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');
vi.stubEnv('GELATO_API_KEY', 'gelato-test-key');
vi.stubEnv('SITE_URL', 'https://test.higginsgrafic.com');

vi.mock('stripe', () => ({ default: function Stripe() { this.webhooks = { constructEvent: vi.fn() }; } }));

// Estat que controla cada test.
let taulaExisteix = true;
let numeroSeguent = '2026-000001';
let insertPayload = null;
let rpcCrides = 0;

function clientFals() {
  return {
    from: () => {
      if (!taulaExisteix) {
        const chain = { limit: () => Promise.resolve({ data: null, error: { code: 'PGRST205', message: 'table not found' } }) };
        return { select: () => chain };
      }
      const chain = {
        limit: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: { id: 'inv-1', ...insertPayload }, error: null }),
      };
      return {
        select: () => chain,
        insert: (payload) => { insertPayload = payload; return { select: () => chain }; },
      };
    },
    rpc: () => { rpcCrides++; return Promise.resolve({ data: numeroSeguent, error: null }); },
  };
}

const { createInvoice } = await import('../../netlify/functions/stripe-webhook.js');

function comanda(extra = {}) {
  return {
    id: 'ord-1', order_number: 'GRF-2026-000042', user_id: 'u-1', email: 'client@example.com',
    first_name: 'Joan', last_name: 'Puig', address: 'Carrer X, 12', address2: null,
    city: 'Barcelona', postal_code: '08032', country: 'Espanya',
    subtotal: 9.26, shipping_cost: 3.55, iva: 2.69, total: 15.5,
    items: JSON.stringify([{ product: 'The Phoenix', size: 'M', quantity: 1, price: 15.5 }]),
    ...extra,
  };
}

describe('Generació de factures', () => {
  beforeEach(() => { taulaExisteix = true; numeroSeguent = '2026-000001'; insertPayload = null; rpcCrides = 0; });

  it('crea la factura amb el número correlatiu i les dades del client', async () => {
    const inv = await createInvoice(clientFals(), comanda());
    expect(rpcCrides).toBe(1);
    expect(inv.id).toBe('inv-1');
    expect(insertPayload.number).toBe('2026-000001');
    expect(insertPayload.customer_name).toBe('Joan Puig');
    expect(insertPayload.customer_city).toBe('Barcelona');
    expect(insertPayload.base_products).toBe(9.26);
    expect(insertPayload.base_shipping).toBe(3.55);
    expect(insertPayload.iva).toBe(2.69);
    expect(insertPayload.total).toBe(15.5);
    expect(Array.isArray(insertPayload.items)).toBe(true);
  });

  it('sense CIF la factura és simplificada', async () => {
    await createInvoice(clientFals(), comanda());
    expect(insertPayload.invoice_type).toBe('simplified');
  });

  it('amb CIF la factura és normal i el CIF queda desat', async () => {
    await createInvoice(clientFals(), comanda({ invoice_tax_id: 'B12345678', invoice_company: 'Empresa SL' }));
    expect(insertPayload.invoice_type).toBe('full');
    expect(insertPayload.customer_tax_id).toBe('B12345678');
    expect(insertPayload.customer_company).toBe('Empresa SL');
  });

  it('els items en text es desen com a llista', async () => {
    await createInvoice(clientFals(), comanda());
    expect(insertPayload.items[0].product).toBe('The Phoenix');
  });

  it('si la taula encara no existeix NO es crema cap número', async () => {
    taulaExisteix = false;
    const inv = await createInvoice(clientFals(), comanda());
    expect(inv).toBeNull();
    expect(rpcCrides).toBe(0);   // el número no s'ha demanat: la sèrie queda neta
  });
});
