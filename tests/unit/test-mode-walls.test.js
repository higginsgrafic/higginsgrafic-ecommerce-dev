import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/**
 * Els murs del mode de proves, comprovats pel comportament de debò.
 *
 * La regla que es protegeix: una factura de prova no pot acabar mai a la
 * bústia d'un client, i no pot comptar als totals de les declaracions.
 */

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');

let factura = null;
let correuEnviat = null;

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: factura, error: null }) }) }),
    }),
  }),
}));

vi.mock('../../netlify/lib/auth.js', () => ({
  verifyAdmin: async () => ({ authorized: true }),
}));

vi.mock('../../netlify/lib/notify.js', () => ({
  sendOrderEmail: async (_template, payload) => { correuEnviats.push(payload); return { id: 'msg-1' }; },
}));

vi.mock('../../netlify/lib/site-url.js', () => ({
  getSiteBase: () => 'https://test.higginsgrafic.com',
}));

let correuEnviats = [];

const { handler } = await import('../../netlify/functions/admin-invoice-actions.js');

const event = (body) => ({
  httpMethod: 'POST',
  headers: { authorization: 'Bearer test' },
  body: JSON.stringify(body),
});

beforeEach(() => { factura = null; correuEnviats = []; });

describe('Reenviar una factura', () => {
  it('una factura de prova no s’envia al client', async () => {
    factura = {
      id: '11111111-1111-1111-1111-111111111111', is_test: true, access_token: 'tok-1',
      customer_email: 'client@example.com',
    };
    const resposta = await handler(event({ action: 'resend', id: '11111111-1111-1111-1111-111111111111' }));
    expect(resposta.statusCode).toBe(200);
    expect(correuEnviats).toHaveLength(1);
    // El que importa: el destinatari del correu no és el client.
    expect(correuEnviats[0].email).toBeNull();
    expect(correuEnviats[0].is_test).toBe(true);
  });

  it('una factura de debò sí que va al client', async () => {
    factura = {
      id: '22222222-2222-2222-2222-222222222222', is_test: false, access_token: 'tok-2',
      customer_email: 'client@example.com',
    };
    const resposta = await handler(event({ action: 'resend', id: '22222222-2222-2222-2222-222222222222' }));
    expect(resposta.statusCode).toBe(200);
    expect(correuEnviats).toHaveLength(1);
    expect(correuEnviats[0].email).toBe('client@example.com');
  });

  it('una factura de debò sense correu no s’envia i avisa', async () => {
    factura = { id: '33333333-3333-3333-3333-333333333333', is_test: false, access_token: 'tok-3', customer_email: null };
    const resposta = await handler(event({ action: 'resend', id: '33333333-3333-3333-3333-333333333333' }));
    expect(resposta.statusCode).toBe(400);
    expect(correuEnviats).toHaveLength(0);
  });
});

describe('El destinatari dels correus', () => {
  let adrecaDestinataria;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv('TEST_EMAIL', 'higginsgrafic@gmail.com');
    ({ adrecaDestinataria } = await import('../../netlify/lib/email.js'));
  });

  afterEach(() => { vi.unstubAllEnvs(); });

  it('un correu de prova va a TEST_EMAIL, no al client', () => {
    expect(adrecaDestinataria({ is_test: true, email: 'client@example.com' }))
      .toBe('higginsgrafic@gmail.com');
  });

  it('un correu de debò va al client', () => {
    expect(adrecaDestinataria({ email: 'client@example.com' })).toBe('client@example.com');
  });

  it('sense TEST_EMAIL, un correu de prova no s’envia enlloc', async () => {
    vi.resetModules();
    vi.stubEnv('TEST_EMAIL', '');
    const modul = await import('../../netlify/lib/email.js');
    expect(modul.adrecaDestinataria({ is_test: true, email: 'client@example.com' })).toBeNull();
  });
});

describe('Els totals de l’administració', () => {
  it('les factures de prova no compten als totals', async () => {
    const { totalsByPeriod } = await import('../../netlify/functions/admin-invoices.js');
    const totals = totalsByPeriod([
      { issued_at: '2026-03-10T10:00:00Z', total: 100, base_products: 80, base_shipping: 2.64, iva: 17.36, is_test: false },
      { issued_at: '2026-03-11T10:00:00Z', total: 999, base_products: 900, base_shipping: 0, iva: 99, is_test: true },
    ]);
    expect(totals.perAny).toHaveLength(1);
    expect(totals.perAny[0].count).toBe(1);
    expect(totals.perAny[0].total).toBe(100);
    expect(totals.perTrimestre[0].total).toBe(100);
    // I la prova es compta a part, perquè l'amo sàpiga que n'hi ha.
    expect(totals.proves).toBe(1);
  });

  it('una factura sense la marca (anterior a la columna) sí que compta', async () => {
    const { totalsByPeriod } = await import('../../netlify/functions/admin-invoices.js');
    const totals = totalsByPeriod([
      { issued_at: '2026-03-10T10:00:00Z', total: 50, base_products: 40, base_shipping: 1.32, iva: 8.68 },
    ]);
    expect(totals.perAny[0].count).toBe(1);
    expect(totals.perAny[0].total).toBe(50);
  });
});
