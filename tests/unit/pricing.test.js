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

const mockFromSelect = vi.fn();
const mockFromInsert = vi.fn();
const mockFromUpdate = vi.fn();
const mockSingle = vi.fn();
const mockRpc = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: (table) => {
      if (table === 'orders') {
        return {
          insert: mockFromInsert,
          update: mockFromUpdate,
          select: mockFromSelect,
        };
      }
      if (table === 'products') {
        // Els articles del mega-slide arriben amb el slug del producte, no
        // amb el gelatoVariantId: el servidor ha de poder resoldre la variant.
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: [{ id: 'p1', slug: 'first-contact-ncc-1701' }],
              error: null,
            }),
          }),
        };
      }
      if (table === 'product_variants') {
        return {
          select: vi.fn().mockReturnValue({
            in: vi.fn().mockResolvedValue({
              data: [
                { id: 'v1', gelato_variant_id: 'apparel_tshirt_1', price: '15.50', product_id: 'p1', size: 'M', color: 'Black' },
                { id: 'v2', gelato_variant_id: 'apparel_tshirt_2', price: '18.00', product_id: 'p1', size: '2XL', color: 'Navy' },
              ],
              error: null,
            }),
          }),
        };
      }
      if (table === 'shipping_config') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { cost: '4.95', free_threshold: '50.00' },
                error: null,
              }),
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

describe('create-payment-intent — server-side pricing', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    mockRpc.mockResolvedValue({ data: true, error: null });

    mockFromInsert.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'order-1', order_number: 'HG-001' },
          error: null,
        }),
      }),
    });

    mockFromUpdate.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    mockStripeCreate.mockResolvedValue({
      id: 'pi_test_123',
      client_secret: 'pi_test_123_secret',
    });
  });

  it('rejects empty items', async () => {
    const res = await handler(makeEvent({ items: [] }, 'POST'));
    expect(res.statusCode).toBe(400);
  });

  it('rejects non-EUR currency', async () => {
    const res = await handler(makeEvent({
      items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
      currency: 'usd',
    }));
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toContain('EUR');
  });

  it('calculates price server-side and creates order + PI', async () => {
    const res = await handler(makeEvent({
      items: [
        { gelatoVariantId: 'apparel_tshirt_1', quantity: 2 },
        { gelatoVariantId: 'apparel_tshirt_2', quantity: 1 },
      ],
      shippingZone: 'es_peninsula',
      email: 'test@example.com',
    }));

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.clientSecret).toBe('pi_test_123_secret');
    expect(body.paymentIntentId).toBe('pi_test_123');
    expect(body.orderId).toBe('order-1');
    expect(body.trackingToken).toBeDefined();
    expect(body.trackingToken.length).toBe(64); // 32 bytes hex

    // subtotal PVP = 15.50*2 + 18.00*1 = 49.00
    expect(body.subtotal).toBe(49.00);
    // shipping PVP = 4.29 + 2*1.39 = 7.07 (3 articles, Espanya).
    // Ha de coincidir EXACTAMENT amb el que mostra el client
    // (src/hooks/useShippingCosts.js). Abans el servidor aplicava un 4.95
    // pla perquè la zona del formulari no coincidia amb cap fila de
    // shipping_config: el comprador veia un import i se li'n cobrava un altre.
    expect(body.shippingCost).toBe(7.07);
    // base imposable = (49.00 + 7.07) / 1.21 = 46.34
    expect(body.baseImponible).toBe(46.34);
    // iva 21% desglossat = 56.07 - 46.34 = 9.73
    expect(body.iva).toBe(9.73);
    // total = (49.00 + 7.07) = 56.07 EUR
    expect(body.total).toBe(56.07);

    // Verify Stripe was called with exact PVP total in cents
    expect(mockStripeCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 5607,
        currency: 'eur',
      })
    );
  });

  it('desa les dades d\'enviament a la comanda (imprescindibles per a Gelato)', async () => {
    const res = await handler(makeEvent({
      items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
      shippingZone: 'Espanya',
      email: 'test@example.com',
      shipping: {
        firstName: 'Maria',
        lastName: 'Puig',
        address: 'Carrer Major 1',
        address2: '2n 1a',
        city: 'Barcelona',
        postalCode: '08001',
        country: 'Espanya',
        phone: '600123456',
      },
    }));

    expect(res.statusCode).toBe(200);
    expect(mockFromInsert).toHaveBeenCalledTimes(1);

    // Regressió: abans l'adreça no s'enviava mai al servidor, així que la
    // comanda es desava sense dades d'enviament i Gelato no la podia produir.
    const insertArg = mockFromInsert.mock.calls[0][0];
    expect(insertArg.first_name).toBe('Maria');
    expect(insertArg.last_name).toBe('Puig');
    expect(insertArg.address).toBe('Carrer Major 1');
    expect(insertArg.address2).toBe('2n 1a');
    expect(insertArg.city).toBe('Barcelona');
    expect(insertArg.postal_code).toBe('08001');
    expect(insertArg.country).toBe('Espanya');
    expect(insertArg.phone).toBe('600123456');
  });

  it('no falla si no arriben dades d\'enviament', async () => {
    const res = await handler(makeEvent({
      items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
      email: 'test@example.com',
    }));

    expect(res.statusCode).toBe(200);
    const insertArg = mockFromInsert.mock.calls[0][0];
    expect(insertArg.first_name).toBeNull();
    expect(insertArg.city).toBeNull();
    expect(insertArg.country).toBe('Espanya'); // valor per defecte
  });

  it('desa les dades de facturació a les metadades del pagament', async () => {
    // El formulari demanava empresa i CIF quan el client marcava
    // "Necessites factura?" i s'acabaven llençant.
    const res = await handler(makeEvent({
      items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
      shippingZone: 'Espanya',
      invoice: { company: 'Empresa SL', taxId: 'B12345678' },
    }));

    expect(res.statusCode).toBe(200);
    const meta = mockStripeCreate.mock.calls[0][0].metadata;
    expect(meta.invoice_company).toBe('Empresa SL');
    expect(meta.invoice_tax_id).toBe('B12345678');
  });

  it('no afegeix metadades de facturació si no n\'hi ha', async () => {
    const res = await handler(makeEvent({
      items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
      shippingZone: 'Espanya',
    }));

    expect(res.statusCode).toBe(200);
    const meta = mockStripeCreate.mock.calls[0][0].metadata;
    expect(meta.invoice_company).toBeUndefined();
    expect(meta.invoice_tax_id).toBeUndefined();
  });

  it('applies free shipping when subtotal >= threshold', async () => {
    const res = await handler(makeEvent({
      items: [
        { gelatoVariantId: 'apparel_tshirt_1', quantity: 4 }, // 15.50 * 4 = 62.00
      ],
      shippingZone: 'es_peninsula',
    }));

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.subtotal).toBe(62.00);
    expect(body.shippingCost).toBe(0); // free shipping (>= 50)
  });

  it('rejects items without any variant information', async () => {
    // Sense gelatoVariantId ni productSlug no hi ha manera de saber què
    // s'ha de fabricar, així que s'ha de rebutjar.
    const res = await handler(makeEvent({
      items: [{ quantity: 1 }],
    }));
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).error).toContain('variant');
  });

  it('resol la variant pel slug del producte quan no arriba gelatoVariantId', async () => {
    // És el cas real del cistell del mega-slide: només hi ha la ruta del
    // disseny, la talla i el color. Sense aquesta resolució, el checkout
    // responia sempre 400 i la botiga no podia vendre.
    const res = await handler(makeEvent({
      items: [{
        productSlug: 'first-contact-ncc-1701',
        size: 'M',
        color: 'black',
        quantity: 1,
        productName: 'First Contact',
      }],
      shippingZone: 'Espanya',
    }));

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.validatedItems[0].gelatoVariantId).toBe('apparel_tshirt_1');
    expect(body.validatedItems[0].unitPrice).toBe(15.5);
    expect(body.validatedItems[0].name).toBe('First Contact');
  });

  it('resol la talla XXL del formulari cap a 2XL de la base de dades', async () => {
    const res = await handler(makeEvent({
      items: [{
        productSlug: 'first-contact-ncc-1701',
        size: 'XXL',
        color: 'navy',
        quantity: 1,
      }],
      shippingZone: 'Espanya',
    }));

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.validatedItems[0].gelatoVariantId).toBe('apparel_tshirt_2');
  });

  it('returns 429 when rate limited', async () => {
    mockRpc.mockResolvedValue({ data: false, error: null });
    const res = await handler(makeEvent({
      items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
    }));
    expect(res.statusCode).toBe(429);
  });

  it('returns 405 for GET', async () => {
    const res = await handler(makeEvent({}, 'GET'));
    expect(res.statusCode).toBe(405);
  });
});
