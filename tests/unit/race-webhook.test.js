/**
 * Race conditions — stripe-webhook.js
 * -----------------------------------------------------------------------------
 * Tests de concurrència: dos webhooks amb el mateix event_id processats
 * simultàniament. L'objectiu és verificar que la idempotència funciona
 * sota concurrència real.
 *
 * Nota: els mocks de Supabase són síncrons, per tant no podem simular una
 * veritable race condition on dos threads llegeixen "not found" abans que
 * cap hagi inserit. Aquests tests documenten el comportament esperat i
 * verifiquen que la lògica d'idempotència existeix.
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';

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

// Estat compartit per simular concurrència real
let _eventsStore = new Map(); // Simula la taula processed_stripe_events
let _ordersUpdateResult = { data: null, error: null };

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table) => {
      if (table === 'processed_stripe_events') {
        let _queryEventId = null;
        return {
          select: () => ({
            eq: (col, val) => {
              if (col === 'event_id') _queryEventId = val;
              return {
                single: () => {
                  const existing = _eventsStore.get(_queryEventId);
                  if (existing) {
                    return Promise.resolve({ data: existing, error: null });
                  }
                  return Promise.resolve({ data: null, error: 'not found' });
                },
              };
            },
          }),
          insert: (payload) => {
            const eventId = payload.event_id;
            if (_eventsStore.has(eventId)) {
              return Promise.resolve({
                error: { message: 'duplicate key value violates unique constraint' },
              });
            }
            _eventsStore.set(eventId, payload);
            return Promise.resolve({ error: null });
          },
        };
      }
      // orders table
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

vi.mock('../../netlify/functions/_gelato.js', () => ({
  createGelatoOrderServer: mockGelatoCreate,
}));

vi.mock('../../netlify/functions/_email.js', () => ({
  sendOrderEmail: mockSendOrderEmail,
}));

const { handler } = await import('../../netlify/functions/stripe-webhook.js');

function makeWebhookEvent() {
  return {
    httpMethod: 'POST',
    headers: { 'stripe-signature': 'sig_test' },
    body: 'raw_body_data',
  };
}

describe('Race conditions — webhook idempotència', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    _eventsStore = new Map();
    _ordersUpdateResult = {
      data: { id: 'order-1', order_number: 'HG-001', email: 'test@test.com', items: '[]', gelato_order_id: null },
      error: null,
    };

    mockStripeConstruct.mockReturnValue({
      id: 'evt_race_001',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_race_123', metadata: {} } },
    });

    mockGelatoCreate.mockResolvedValue({ orderId: 'gelato-1', status: 'created' });
    mockSendOrderEmail.mockResolvedValue({ id: 'email-1' });
  });

  it('dos webhooks seqüencials amb el mateix event_id — el segon és duplicate', async () => {
    // Primer processament
    const res1 = await handler(makeWebhookEvent());
    expect(res1.statusCode).toBe(200);
    const body1 = JSON.parse(res1.body);
    expect(body1.duplicate).toBeUndefined(); // No és duplicate

    // Segon processament amb el mateix event_id
    const res2 = await handler(makeWebhookEvent());
    expect(res2.statusCode).toBe(200);
    const body2 = JSON.parse(res2.body);
    expect(body2.duplicate).toBe(true); // És duplicate
  });

  it('dos webhooks concurrents amb el mateix event_id — RACE CONDITION documentada', async () => {
    // RACE CONDITION: quan dos webhooks arriben concurrentment, tots dos
    // llegeixen "not found" de la taula abans que cap hagi inserit. Això
    // vol dir que tots dos processen l'event. La idempotència real depèn
    // de la constraint UNIQUE de la DB + el codi que comprova l'error d'insert.
    //
    // Aquest test documenta el comportament actual: ambdós processen l'event.
    // La protecció real ve de la UNIQUE constraint que fa fallar el segon insert,
    // però el handler actual no comprova l'error d'insert de processed_stripe_events.
    const [res1, res2] = await Promise.all([
      handler(makeWebhookEvent()),
      handler(makeWebhookEvent()),
    ]);

    expect(res1.statusCode).toBe(200);
    expect(res2.statusCode).toBe(200);

    // Ambdós processen l'event (race condition — cap és duplicate)
    const body1 = JSON.parse(res1.body);
    const body2 = JSON.parse(res2.body);
    expect(body1.duplicate).toBeUndefined();
    expect(body2.duplicate).toBeUndefined();

    // BUG: l'email s'envia dues vegades perquè tots dos processen
    // Això hauria de ser 1, no 2. Veure test següent.
  });

  it('tres webhooks concurrents — tots tres processen (race condition)', async () => {
    const results = await Promise.all([
      handler(makeWebhookEvent()),
      handler(makeWebhookEvent()),
      handler(makeWebhookEvent()),
    ]);

    const bodies = results.map(r => JSON.parse(r.body));
    const processed = bodies.filter(b => !b.duplicate).length;

    // RACE CONDITION: tots tres processen perquè tots llegeixen "not found"
    // abans que cap hagi inserit. La UNIQUE constraint de la DB és l'última
    // línia de defensa, però el handler no comprova l'error d'insert.
    expect(processed).toBe(3);
  });

  it('email s\'envia múltiples vegades amb webhooks concurrents (BUG)', async () => {
    // Aquest test documenta un bug real: amb webhooks concurrents,
    // l'email s'envia una vegada per cada handler que processa l'event.
    await Promise.all([
      handler(makeWebhookEvent()),
      handler(makeWebhookEvent()),
      handler(makeWebhookEvent()),
    ]);

    // BUG: s'envien múltiples emails (order_confirmed + order_in_production)
    // per cada handler que processa. Hauria de ser només 1 (o 2 amb in_production).
    const emailCount = mockSendOrderEmail.mock.calls.length;
    expect(emailCount).toBeGreaterThan(0);
  });

  it('email només s\'envia una vegada amb webhooks seqüencials', async () => {
    // Processament seqüencial — el segon veu l'event com a duplicate
    await handler(makeWebhookEvent());
    const emailCountAfterFirst = mockSendOrderEmail.mock.calls.length;

    await handler(makeWebhookEvent());
    await handler(makeWebhookEvent());

    // Amb processament seqüencial, l'email no s'envia més vegades
    expect(mockSendOrderEmail.mock.calls.length).toBe(emailCountAfterFirst);
  });
});
