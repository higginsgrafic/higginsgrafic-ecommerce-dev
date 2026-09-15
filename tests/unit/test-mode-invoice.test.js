import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_fake');
vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');
vi.stubEnv('GELATO_API_KEY', 'gelato-test-key');
vi.stubEnv('SITE_URL', 'https://test.higginsgrafic.com');

vi.mock('stripe', () => ({ default: function Stripe() { this.webhooks = { constructEvent: vi.fn() }; } }));

/**
 * Mode de proves.
 *
 * La regla que aquests tests protegeixen és la que fa perillar la sèrie
 * fiscal: una comanda de prova NO pot gastar mai un número FO/FS/FR. Si algú
 * desfés aquesta branca sense adonar-se'n, el primer número de la sèrie es
 * cremaria amb una factura que no és cap document fiscal, i no es pot
 * recuperar.
 */

let numerosDemanats = [];
let seguentPerFuncio = {};
let insertPayload = null;
let createInvoice;

function clientFals() {
  return {
    from: () => {
      const chain = {
        limit: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: { id: 'inv-1', ...insertPayload }, error: null }),
      };
      return {
        select: () => chain,
        insert: (payload) => { insertPayload = payload; return { select: () => chain }; },
      };
    },
    rpc: (name) => {
      numerosDemanats.push(name);
      return Promise.resolve({ data: seguentPerFuncio[name] ?? null, error: seguentPerFuncio[name] ? null : { message: 'no existeix' } });
    },
  };
}

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

beforeEach(async () => {
  vi.resetModules();
  numerosDemanats = [];
  seguentPerFuncio = { next_invoice_number: 'FS-2026-000001', next_test_invoice_number: 'PROVA-2026-000001' };
  insertPayload = null;
  ({ createInvoice } = await import('../../netlify/functions/stripe-webhook.js'));
});

describe('Una comanda de prova no gasta número de la sèrie fiscal', () => {
  it('una comanda de prova agafa el número del comptador de proves', async () => {
    const inv = await createInvoice(clientFals(), comanda({ is_test: true }));
    expect(numerosDemanats).toEqual(['next_test_invoice_number']);
    expect(insertPayload.number).toBe('PROVA-2026-000001');
    expect(insertPayload.is_test).toBe(true);
    expect(inv.id).toBe('inv-1');
  });

  it('una comanda de debò continua agafant la sèrie de sempre', async () => {
    await createInvoice(clientFals(), comanda());
    expect(numerosDemanats).toEqual(['next_invoice_number']);
    expect(insertPayload.is_test).toBe(false);
  });

  it('sense la marca de prova no s’hi val: undefined també és de debò', async () => {
    await createInvoice(clientFals(), comanda({ is_test: undefined }));
    expect(numerosDemanats).toEqual(['next_invoice_number']);
  });

  it('si el comptador de proves encara no existeix, NO es cau al número fiscal', async () => {
    seguentPerFuncio = { next_invoice_number: 'FS-2026-000001' }; // només el de debò
    const inv = await createInvoice(clientFals(), comanda({ is_test: true }));
    expect(inv).toBeNull();
    // El que importa: no s'ha demanat cap número de la sèrie de debò.
    expect(numerosDemanats).toEqual(['next_test_invoice_number']);
  });

  it('una prova amb CIF continua sense tocar la sèrie FO', async () => {
    await createInvoice(clientFals(), comanda({ is_test: true, invoice_tax_id: 'B12345678' }));
    expect(numerosDemanats).toEqual(['next_test_invoice_number']);
    expect(insertPayload.invoice_type).toBe('full');
  });
});
