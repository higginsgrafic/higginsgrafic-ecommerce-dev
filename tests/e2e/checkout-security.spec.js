import { test, expect } from '@playwright/test';

const MOCK_ORDER = {
  id: 'order-e2e-001',
  order_number: 'HG-E2E-001',
  status: 'pendent',
  items: JSON.stringify([
    { gelatoVariantId: 'apparel_test_001', quantity: 1, productName: 'Test Shirt', size: 'M', unitPrice: 15.5 },
  ]),
  subtotal: 15.5,
  shipping_cost: 4.95,
  iva: 3.26,
  total: 23.71,
  email: 'e2e@test.com',
  tracking_token_hash: 'mock_hash_value',
  tracking_token_expires_at: new Date(Date.now() + 90 * 86400000).toISOString(),
};

const MOCK_PI_RESPONSE = {
  clientSecret: 'pi_test_secret_e2e',
  paymentIntentId: 'pi_test_e2e_001',
  orderId: MOCK_ORDER.id,
  orderNumber: MOCK_ORDER.order_number,
  trackingToken: 'raw_e2e_tracking_token_1234567890abcdef',
  subtotal: 15.5,
  shippingCost: 4.95,
  iva: 3.26,
  total: 23.71,
  validatedItems: [
    { gelatoVariantId: 'apparel_test_001', quantity: 1, unitPrice: 15.5, productName: 'Test Shirt', size: 'M' },
  ],
};

function mockAllApiRoutes(page) {
  // Mock create-payment-intent
  page.route('**/.netlify/functions/create-payment-intent', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_PI_RESPONSE),
      });
    } else {
      await route.continue();
    }
  });

  // Mock orders function
  page.route('**/.netlify/functions/orders**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (method === 'GET' && url.includes('trackingToken=')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          order: {
            ...MOCK_ORDER,
            statusLabel: 'PENDENT',
            items: JSON.parse(MOCK_ORDER.items),
          },
        }),
      });
    } else if (method === 'GET') {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Cal autenticació o token de seguiment' }),
      });
    } else if (method === 'POST') {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'La creació de comandes es fa via create-payment-intent' }),
      });
    } else if (method === 'PATCH') {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'No autoritzat' }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock shipping-rates
  page.route('**/.netlify/functions/shipping-rates**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'No autoritzat' }),
      });
    } else {
      await route.continue();
    }
  });

  // Mock send-message
  page.route('**/.netlify/functions/send-message', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  // Mock Supabase auth
  page.route('**/auth/v1/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock_jwt_token',
        user: { id: 'mock-user-id', email: 'e2e@test.com' },
      }),
    });
  });

  // Mock Supabase REST API
  page.route('**/rest/v1/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  // Mock Stripe.js
  page.route('**/js.stripe.com/v3**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.Stripe = function() {
          return {
            elements: function() {
              return {
                create: function() {
                  return { mount: function() {}, destroy: function() {}, update: function() {} };
                },
                getElement: function() { return null; },
              };
            },
            confirmCardPayment: function() {
              return Promise.resolve({
                paymentIntent: { id: 'pi_test_e2e_001', status: 'succeeded' },
              });
            },
          };
        };
      `,
    });
  });
}

test.describe('Checkout security E2E', () => {
  test.beforeEach(async ({ page }) => {
    mockAllApiRoutes(page);
  });

  test('create-payment-intent returns tracking token and server-calculated total', async ({ page }) => {
    const response = await page.request.post('/.netlify/functions/create-payment-intent', {
      data: {
        items: [{ gelatoVariantId: 'apparel_test_001', quantity: 1 }],
        shippingZone: 'es_peninsula',
        currency: 'eur',
        email: 'e2e@test.com',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.trackingToken).toBeTruthy();
    expect(body.trackingToken).toMatch(/^[0-9a-f]{64}$/);
    expect(body.clientSecret).toBe('pi_test_secret_e2e');
    expect(body.total).toBe(23.71);
  });

  test('orders POST is disabled (403)', async ({ page }) => {
    const response = await page.request.post('/.netlify/functions/orders', {
      data: { orderNumber: 'HG-001', status: 'confirmada' },
    });

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toContain('create-payment-intent');
  });

  test('orders GET without auth or tracking token returns 401', async ({ page }) => {
    const response = await page.request.get('/.netlify/functions/orders');
    expect(response.status()).toBe(401);
  });

  test('orders GET with tracking token returns order', async ({ page }) => {
    const response = await page.request.get('/.netlify/functions/orders?trackingToken=raw_e2e_tracking_token_1234567890abcdef');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.order.order_number).toBe('HG-E2E-001');
  });

  test('orders PATCH without admin auth returns 403', async ({ page }) => {
    const response = await page.request.patch('/.netlify/functions/orders', {
      data: { orderNumber: 'HG-001', status: 'confirmada' },
    });
    expect(response.status()).toBe(403);
  });

  test('shipping-rates POST without admin auth returns 403', async ({ page }) => {
    const response = await page.request.post('/.netlify/functions/shipping-rates', {
      data: { zone: 'es_peninsula', cost: 4.95 },
    });
    expect(response.status()).toBe(403);
  });

  test('gelato client-side order creation throws error', async ({ page }) => {
    // Navigate to any page to load the bundle
    await page.goto('/');
    const error = await page.evaluate(async () => {
      try {
        const { createGelatoOrder } = await import('/src/api/gelato.js');
        await createGelatoOrder();
        return null;
      } catch (e) {
        return e.message;
      }
    });
    expect(error).toContain('server-side');
  });

  test('no VITE_GELATO_API_KEY in client bundle', async ({ page }) => {
    await page.goto('/');
    const hasKey = await page.evaluate(() => {
      return !!window.__ENV__?.VITE_GELATO_API_KEY ||
             !!document.querySelector('script[src*="gelato"]')?.src?.includes('api_key');
    });
    expect(hasKey).toBe(false);
  });

  test('checkout flow: create PI → confirm payment → tracking token returned', async ({ page }) => {
    // This test verifies the API flow without real Stripe UI
    const piResponse = await page.request.post('/.netlify/functions/create-payment-intent', {
      data: {
        items: [{ gelatoVariantId: 'apparel_test_001', quantity: 2, size: 'L' }],
        shippingZone: 'es_peninsula',
        currency: 'eur',
        email: 'checkout@test.com',
      },
    });

    expect(piResponse.status()).toBe(200);
    const piData = await piResponse.json();

    // Server-side pricing — client doesn't send amount
    expect(piData.total).toBeGreaterThan(0);
    expect(piData.validatedItems).toHaveLength(1);
    expect(piData.validatedItems[0].quantity).toBe(2);
    expect(piData.trackingToken).toMatch(/^[0-9a-f]{64}$/);

    // Verify tracking token works for guest access
    const orderResponse = await page.request.get(
      `/.netlify/functions/orders?trackingToken=${piData.trackingToken}`
    );
    expect(orderResponse.status()).toBe(200);
  });
});
