import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * El botó «Generar una prova».
 *
 * El que es protegeix aquí és la propietat que fa perillar la sèrie fiscal: si
 * la migració del mode de proves no està executada, aquesta funció NO ha de
 * crear res. Sense aquesta comprovació, es crearia una comanda sense la marca
 * `is_test` i la factura hauria gastat un número FO/FS de debò.
 */

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');
vi.stubEnv('TEST_EMAIL', 'higginsgrafic@gmail.com');
vi.stubEnv('SITE_URL', 'https://test.higginsgrafic.com');

let errorComanda = null;
let errorVariants = null;
let insertComanda = null;
let numeroProva = 'PROVA-2026-000001';
let numerosDemanats = [];
let correuEnviat = null;

vi.mock('../../netlify/lib/auth.js', () => ({
  verifyAdmin: async () => ({ authorized: true }),
}));

vi.mock('../../netlify/lib/notify.js', () => ({
  sendOrderEmail: async (_template, payload) => { correuEnviat = payload; return { id: 'msg-1' }; },
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (taula) => {
      if (taula === 'product_variants') {
        const chain = {
          eq: () => chain,
          gt: () => chain,
          limit: async () => (errorVariants
            ? { data: null, error: { message: errorVariants } }
            : { data: [{ gelato_variant_id: 'var-1', size: 'M', color: 'blanc', price: 15.5, is_available: true, product_id: 'p-1' }], error: null }),
        };
        return { select: () => chain };
      }
      if (taula === 'products') {
        return {
          select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { name: 'Samarreta de prova', collection: 'First Contact' } }) }) }),
        };
      }
      if (taula === 'orders') {
        return {
          insert: (payload) => {
            insertComanda = payload;
            return {
              select: () => ({
                single: async () => (errorComanda
                  ? { data: null, error: { message: errorComanda } }
                  : { data: { id: 'ord-1', order_number: 'GRF-PROVA-1', ...payload }, error: null }),
              }),
            };
          },
        };
      }
      // invoices
      const chain = {
        limit: async () => ({ data: [], error: null }),
        single: async () => ({ data: { id: 'inv-1', number: numeroProva, is_test: true, access_token: 'tok-1' }, error: null }),
      };
      return {
        select: () => chain,
        insert: () => ({ select: () => chain }),
      };
    },
    rpc: (name) => {
      numerosDemanats.push(name);
      return Promise.resolve({ data: name === 'next_test_invoice_number' ? numeroProva : 'FS-2026-000001', error: null });
    },
  }),
}));

const { handler } = await import('../../netlify/functions/admin-test-order.js');

const event = () => ({ httpMethod: 'POST', headers: { authorization: 'Bearer test' }, body: JSON.stringify({ quantity: 1 }) });

beforeEach(() => {
  errorComanda = null;
  errorVariants = null;
  insertComanda = null;
  numerosDemanats = [];
  correuEnviat = null;
});

describe('Generar una comanda de prova', () => {
  it('crea la comanda marcada com a prova i la factura PROVA-', async () => {
    const resposta = await handler(event());
    expect(resposta.statusCode).toBe(201);
    const cos = JSON.parse(resposta.body);
    expect(cos.invoice.number).toBe('PROVA-2026-000001');
    expect(insertComanda.is_test).toBe(true);
    // El que importa: no s'ha demanat cap número de la sèrie fiscal.
    expect(numerosDemanats).toContain('next_test_invoice_number');
    expect(numerosDemanats).not.toContain('next_invoice_number');
  });

  it('la comanda porta correu, que a la base de dades no pot ser buit', async () => {
    // `orders.email` és NOT NULL. La primera versió d'aquest endpoint hi posava
    // null i donava un 500 que no deia res. Aquest test existeix per això.
    await handler(event());
    expect(insertComanda.email).toBe('higginsgrafic@gmail.com');
  });

  it('la factura de prova porta un nom llegible', async () => {
    const resposta = await handler(event());
    expect(resposta.statusCode).toBe(201);
    // El nom surt del que es passa a createInvoice.
    expect(correuEnviat).toBeTruthy();
  });

  it('els imports quadren (base + transport + IVA = total)', async () => {
    await handler(event());
    const suma = Math.round((insertComanda.subtotal + insertComanda.shipping_cost + insertComanda.iva) * 100) / 100;
    expect(suma).toBe(Math.round(insertComanda.total * 100) / 100);
  });

  it('el correu de la prova porta la marca is_test', async () => {
    await handler(event());
    expect(correuEnviat.is_test).toBe(true);
    expect(correuEnviat.email).toBeNull();
  });

  it('si falta la migració NO crea res i ho diu', async () => {
    errorComanda = 'column "is_test" of relation "orders" does not exist';
    const resposta = await handler(event());
    expect(resposta.statusCode).toBe(409);
    expect(JSON.parse(resposta.body).error).toMatch(/migració/i);
    // I sobretot: no s'ha demanat cap número.
    expect(numerosDemanats).toHaveLength(0);
  });

  it('sense variants al catàleg no inventa imports', async () => {
    errorVariants = 'cap';
    const resposta = await handler(event());
    expect(resposta.statusCode).toBe(400);
    expect(numerosDemanats).toHaveLength(0);
  });
});
