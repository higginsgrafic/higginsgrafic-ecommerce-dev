import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');
vi.stubEnv('ADMIN_EMAILS', 'admin@test.com');

let autoritzat = true;
let files = [];
let errorConsulta = null;
let orRebuda = null;
let filtres = [];

vi.mock('../../netlify/lib/auth.js', () => ({
  verifyAdmin: async () => ({ authorized: autoritzat, error: autoritzat ? null : 'No autoritzat' }),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => {
      const chain = {
        order: () => chain,
        limit: () => chain,
        gte: (...a) => { filtres.push(['gte', ...a]); return chain; },
        lt: (...a) => { filtres.push(['lt', ...a]); return chain; },
        eq: (...a) => { filtres.push(['eq', ...a]); return chain; },
        or: (text) => { orRebuda = text; return chain; },
        then: (resolve) => resolve({ data: files, error: errorConsulta }),
      };
      return { select: () => chain };
    },
  }),
}));

const { handler, sanitizeSearch, parseYear, parseType, totalsByPeriod } =
  await import('../../netlify/functions/admin-invoices.js');

const ev = (query = {}, method = 'GET') => ({ httpMethod: method, queryStringParameters: query, headers: {} });

describe('Llistat de factures de l’administració', () => {
  beforeEach(() => { autoritzat = true; files = []; errorConsulta = null; orRebuda = null; filtres = []; });

  it(' rebutja qui no és administrador', async () => {
    autoritzat = false;
    const res = await handler(ev());
    expect(res.statusCode).toBe(401);
  });

  it('retorna les factures i el recompte', async () => {
    files = [{ number: '2026-000001', issued_at: '2026-09-19T10:00:00Z', total: 15.5, base_products: 9.26, base_shipping: 3.55, iva: 2.69 }];
    const res = await handler(ev());
    const cos = JSON.parse(res.body);
    expect(res.statusCode).toBe(200);
    expect(cos.count).toBe(1);
    expect(cos.invoices[0].number).toBe('2026-000001');
  });

  it('neteja el text de cerca perquè no alteri la consulta', () => {
    expect(sanitizeSearch('Joan')).toBe('Joan');
    expect(sanitizeSearch('B12345678')).toBe('B12345678');
    expect(sanitizeSearch('a,b)or(x')).toBe('aborx');
    expect(sanitizeSearch('  ')).toBe('');
    expect(sanitizeSearch(undefined)).toBe('');
    expect(sanitizeSearch('x'.repeat(200)).length).toBe(60);
  });

  it('accepta només anys i tipus vàlids', () => {
    expect(parseYear('2026')).toBe(2026);
    expect(parseYear('abcd')).toBeNull();
    expect(parseYear('1800')).toBeNull();
    expect(parseYear('99999')).toBeNull();
    expect(parseType('full')).toBe('full');
    expect(parseType('simplified')).toBe('simplified');
    expect(parseType('el-que-sigui')).toBeNull();
  });

  it('aplica els filtres d’any i tipus', async () => {
    await handler(ev({ year: '2026', type: 'full' }));
    expect(filtres.some((f) => f[0] === 'gte' && f[2] === '2026-01-01T00:00:00.000Z')).toBe(true);
    expect(filtres.some((f) => f[0] === 'eq' && f[1] === 'invoice_type' && f[2] === 'full')).toBe(true);
  });

  it('la cerca mira número, client, CIF i comanda', async () => {
    await handler(ev({ q: 'Joan' }));
    expect(orRebuda).toContain('number.ilike.%Joan%');
    expect(orRebuda).toContain('customer_tax_id.ilike.%Joan%');
    expect(orRebuda).toContain('order_number.ilike.%Joan%');
  });

  it('retorna 500 si falla la consulta', async () => {
    errorConsulta = { message: 'boom' };
    const res = await handler(ev());
    expect(res.statusCode).toBe(500);
  });

  it('calcula els totals per any i per trimestre', () => {
    const t = totalsByPeriod([
      { issued_at: '2026-01-15T10:00:00Z', total: 15.5, base_products: 9.26, base_shipping: 3.55, iva: 2.69 },
      { issued_at: '2026-02-15T10:00:00Z', total: 15.5, base_products: 9.26, base_shipping: 3.55, iva: 2.69 },
      { issued_at: '2026-11-15T10:00:00Z', total: 46.5, base_products: 32.58, base_shipping: 5.85, iva: 8.07 },
    ]);
    expect(t.perAny).toHaveLength(1);
    expect(t.perAny[0].count).toBe(3);
    expect(t.perAny[0].total).toBe(77.5);
    expect(t.perTrimestre.map((x) => x.period)).toEqual(['2026-T4', '2026-T1']);
    const t1 = t.perTrimestre.find((x) => x.period === '2026-T1');
    expect(t1.total).toBe(31);
    expect(t1.iva).toBe(5.38);
  });
});
