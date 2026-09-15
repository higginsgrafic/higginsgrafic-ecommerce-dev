import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * La separació de pantalles, comprovada al servidor.
 *
 * La base de dades ja impedeix emetre una factura de debò des d'un esborrany de
 * prova (`invoice_drafts_coherencia`). Això comprova la barrera de davant: que
 * l'endpoint no accepti una operació sobre un esborrany de l'altre tipus, i que
 * ho expliqui en comptes de deixar sortir un error de motor.
 */

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-key');

let esborrany = { id: 'd-1', is_test: false, status: 'draft' };
let rpcCridat = null;

vi.mock('../../netlify/lib/auth.js', () => ({
  verifyAdmin: async () => ({ authorized: true }),
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => {
        const chain = {
          eq: () => chain,
          or: () => chain,
          order: () => chain,
          limit: () => chain,
          maybeSingle: async () => ({ data: esborrany, error: null }),
          then: (resolve) => resolve({ data: [], error: null }),
        };
        return chain;
      },
    }),
    rpc: async (nom, args) => {
      rpcCridat = { nom, args };
      return { data: { id: 'inv-1', number: 'PROVA-2026-000001', is_test: true }, error: null };
    },
  }),
}));

const { handler } = await import('../../netlify/functions/admin-invoice-drafts.js');

const event = (query, method, body) => ({
  httpMethod: method,
  queryStringParameters: query,
  headers: {},
  body: body ? JSON.stringify(body) : undefined,
});

const ID = '11111111-1111-4111-8111-111111111111';

beforeEach(() => { esborrany = { id: ID, is_test: false, status: 'draft' }; rpcCridat = null; });

describe('Emetre un esborrany des de la pantalla que toca', () => {
  it('una prova no s’emet des de la pantalla de factures', async () => {
    esborrany = { id: ID, is_test: true, status: 'draft' };
    const resposta = await handler(event({}, 'POST', { action: 'issue', id: ID }));
    expect(resposta.statusCode).toBe(409);
    expect(JSON.parse(resposta.body).error).toMatch(/pantalla de proves/);
    // I sobretot: no s'ha cridat la funció d'emetre.
    expect(rpcCridat).toBeNull();
  });

  it('una factura de debò no s’emet des de la pantalla de proves', async () => {
    esborrany = { id: ID, is_test: false, status: 'draft' };
    const resposta = await handler(event({ mode: 'test' }, 'POST', { action: 'issue', id: ID }));
    expect(resposta.statusCode).toBe(409);
    expect(JSON.parse(resposta.body).error).toMatch(/pantalla de factures/);
    expect(rpcCridat).toBeNull();
  });

  it('una prova s’emet des de la pantalla de proves', async () => {
    esborrany = { id: ID, is_test: true, status: 'draft' };
    const resposta = await handler(event({ mode: 'test' }, 'POST', { action: 'issue', id: ID }));
    expect(resposta.statusCode).toBe(200);
    expect(rpcCridat?.nom).toBe('issue_invoice_draft');
  });

  it('una factura de debò s’emet des de la pantalla de factures', async () => {
    esborrany = { id: ID, is_test: false, status: 'draft' };
    const resposta = await handler(event({}, 'POST', { action: 'issue', id: ID }));
    expect(resposta.statusCode).toBe(200);
    expect(rpcCridat?.nom).toBe('issue_invoice_draft');
  });

  it('un esborrany antic sense la marca compta com de debò', async () => {
    esborrany = { id: ID, is_test: null, status: 'draft' };
    const resposta = await handler(event({}, 'POST', { action: 'issue', id: ID }));
    expect(resposta.statusCode).toBe(200);
  });
});

describe('Editar un esborrany des de la pantalla que toca', () => {
  it('una prova no s’edita des de la pantalla de factures', async () => {
    esborrany = { id: ID, is_test: true, status: 'draft' };
    const resposta = await handler(event({ id: ID }, 'PATCH', { customer_name: 'X', items: [] }));
    expect(resposta.statusCode).toBe(409);
  });

  it('una factura de debò no s’edita des de la pantalla de proves', async () => {
    esborrany = { id: ID, is_test: false, status: 'draft' };
    const resposta = await handler(event({ id: ID, mode: 'test' }, 'PATCH', { customer_name: 'X', items: [] }));
    expect(resposta.statusCode).toBe(409);
  });
});
