import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');

let resultat = { data: null, error: null };
let filtre = null;

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => {
      const chain = {
        eq: (col, valor) => { filtre = { col, valor }; return chain; },
        maybeSingle: () => Promise.resolve(resultat),
      };
      return { select: () => chain };
    },
  }),
}));

const { handler, isValidAccessToken } = await import('../../netlify/functions/get-invoice.js');

const TOKEN = '3f2a91c4-5b6d-4e8a-9c1f-7d2b8e4a6f01';

function event(query = {}) {
  return { httpMethod: 'GET', queryStringParameters: query, headers: {} };
}

describe('Consulta de factura pel testimoni', () => {
  beforeEach(() => { resultat = { data: null, error: null }; filtre = null; });

  it('accepta un testimoni amb forma d’UUID', () => {
    expect(isValidAccessToken(TOKEN)).toBe(true);
    expect(isValidAccessToken('   ' + TOKEN + ' ')).toBe(true);
  });

  it('rebutja qualsevol altra cosa', () => {
    expect(isValidAccessToken(undefined)).toBe(false);
    expect(isValidAccessToken('')).toBe(false);
    expect(isValidAccessToken('123')).toBe(false);
    expect(isValidAccessToken("' OR 1=1 --")).toBe(false);
  });

  it('retorna 400 si no hi ha testimoni', async () => {
    const res = await handler(event({}));
    expect(res.statusCode).toBe(400);
  });

  it('retorna 400 si el testimoni no és un UUID', async () => {
    const res = await handler(event({ token: 'no-soc-un-uuid' }));
    expect(res.statusCode).toBe(400);
  });

  it('retorna la factura quan el testimoni és correcte', async () => {
    resultat = { data: { id: 'inv-1', number: '2026-000001', total: 46.5 }, error: null };
    const res = await handler(event({ token: TOKEN }));
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).invoice.number).toBe('2026-000001');
    expect(filtre).toEqual({ col: 'access_token', valor: TOKEN });
  });

  it('retorna 404 si el testimoni no correspon a cap factura', async () => {
    resultat = { data: null, error: null };
    const res = await handler(event({ token: TOKEN }));
    expect(res.statusCode).toBe(404);
  });

  it('retorna 500 si la consulta falla', async () => {
    resultat = { data: null, error: { message: 'boom' } };
    const res = await handler(event({ token: TOKEN }));
    expect(res.statusCode).toBe(500);
  });
});
