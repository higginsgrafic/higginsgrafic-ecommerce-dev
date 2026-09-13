import { describe, expect, it, vi, beforeEach } from 'vitest';

// PROVA DE SEGURETAT: amb claus de proves de Stripe NO s'ha d'enviar mai res a
// Gelato.
//
// El parany: es fa una compra de prova amb una targeta de prova, Stripe
// considera el pagament correcte i dispara aquest webhook... i si el webhook
// envia la comanda a Gelato, es crea una comanda de PRODUCCIÓ real. És a dir:
// una prova innocent acaba imprimint i enviant producte de debò, amb el cost
// que això té.
//
// Aquest test fixa que amb una clau sk_test_ la comanda es confirma i s'envia
// el correu (que és el que volem poder provar), però NO surt cap crida a
// Gelato.

vi.stubEnv('SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-key');
vi.stubEnv('STRIPE_SECRET_KEY', 'sk_test_fake');
vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test');

const mockStripeConstruct = vi.fn();
vi.mock('stripe', () => ({
  default: function Stripe() {
    this.webhooks = { constructEvent: mockStripeConstruct };
  },
}));

const mockGelatoCreate = vi.fn();
const mockSendOrderEmail = vi.fn();

let _ordersUpdateResult = { data: null, error: null };
let _eventsSelectResult = { data: null, error: 'not found' };

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table) => {
      if (table === 'processed_stripe_events') {
        const chain = { eq: () => chain, single: () => Promise.resolve(_eventsSelectResult) };
        return {
          select: () => chain,
          insert: () => Promise.resolve({ error: null }),
        };
      }
      const ordersChain = {
        eq: () => ordersChain,
        single: () => Promise.resolve({ data: null, error: 'not found' }),
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

vi.mock('../../netlify/lib/gelato.js', () => ({
  createGelatoOrderServer: mockGelatoCreate,
}));

vi.mock('../../netlify/lib/email.js', () => ({
  sendOrderEmail: mockSendOrderEmail,
}));

const { handler } = await import('../../netlify/functions/stripe-webhook.js');

beforeEach(() => {
  vi.resetAllMocks();
  _eventsSelectResult = { data: null, error: 'not found' };
  _ordersUpdateResult = {
    data: { id: 'order-1', order_number: 'HG-001', email: 'client@example.com', items: '[]', gelato_order_id: null },
    error: null,
  };

  mockStripeConstruct.mockReturnValue({
    id: 'evt_test_001',
    type: 'payment_intent.succeeded',
    data: { object: { id: 'pi_test_123' } },
  });
  mockSendOrderEmail.mockResolvedValue({ id: 'email-1' });
  mockGelatoCreate.mockResolvedValue({ orderId: 'gelato-1', status: 'created' });
});

describe('stripe-webhook — mode de proves', () => {
  it('confirma la comanda i envia el correu de confirmació', async () => {
    const res = await handler({
      httpMethod: 'POST',
      headers: { 'stripe-signature': 'sig_test' },
      body: 'raw_body_data',
    });

    expect(res.statusCode).toBe(200);
    expect(mockSendOrderEmail).toHaveBeenCalledWith('order_confirmed', expect.objectContaining({ id: 'order-1' }));
  });

  it('NO envia la comanda a Gelato (es crearia una comanda real de producció)', async () => {
    await handler({
      httpMethod: 'POST',
      headers: { 'stripe-signature': 'sig_test' },
      body: 'raw_body_data',
    });

    expect(mockGelatoCreate).not.toHaveBeenCalled();
  });

  it('la resposta no demana cap reintent a Stripe', async () => {
    const res = await handler({
      httpMethod: 'POST',
      headers: { 'stripe-signature': 'sig_test' },
      body: 'raw_body_data',
    });

    // Si demanéssim un reintent, Stripe tornaria a enviar l'avís una i una
    // altra vegada i no s'acabaria mai.
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body).received).toBe(true);
  });
});
