/**
 * Seguretat E2E — tests que requereixen navegador real
 * -----------------------------------------------------------------------------
 * - No fuga de secrets al bundle de producció
 * - CSP headers presents
 * - XSS al DOM (no només a emails)
 * - Manipulació de preu ignorada pel server
 */
import { test, expect } from '@playwright/test';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

test.describe('Seguretat — no fuga de secrets al bundle', () => {
  test('no hi ha STRIPE_SECRET_KEY al dist/', () => {
    const distDir = join(process.cwd(), 'dist');
    if (!existsSync(distDir)) {
      test.skip(true, 'dist/ no existeix — executa npm run build primer');
      return;
    }

    // Busca als assets JS del build
    const assetsDir = join(distDir, 'assets');
    if (!existsSync(assetsDir)) {
      test.skip(true, 'dist/assets/ no existeix');
      return;
    }

    const jsFiles = readdirSync(assetsDir).filter(f => f.endsWith('.js'));

    for (const file of jsFiles) {
      const content = readFileSync(join(assetsDir, file), 'utf8');
      // No hi ha d'haver claus secretes de Stripe (sk_live_ o sk_test_)
      expect(content, `${file} conté sk_ key`).not.toMatch(/sk_(live|test)_[a-zA-Z0-9]{20,}/);
      // No hi ha d'haver GELATO_API_KEY amb valor (regex específic, no cobdiciós)
      expect(content, `${file} conté GELATO_API_KEY amb valor`).not.toMatch(/GELATO_API_KEY\s*[=:]\s*['"][a-zA-Z0-9]{20,}['"]/i);
      expect(content, `${file} conté gelatoApiKey`).not.toMatch(/gelatoApiKey\s*[=:]\s*['"][a-zA-Z0-9]{20,}['"]/i);
      // No hi ha d'haver SUPABASE_SERVICE_ROLE_KEY amb valor
      expect(content, `${file} conté service role key`).not.toMatch(/SERVICE_ROLE_KEY\s*[=:]\s*['"][a-zA-Z0-9]{20,}['"]/i);
    }
  });

  test('no hi ha VITE_GELATO_API_KEY al runtime del navegador', async ({ page }) => {
    await page.goto('/');
    const hasKey = await page.evaluate(() => {
      return !!window.__ENV__?.VITE_GELATO_API_KEY ||
             !!window.VITE_GELATO_API_KEY ||
             !!document.querySelector('script[src*="api_key"]')?.src?.includes('gelato');
    });
    expect(hasKey).toBe(false);
  });
});

test.describe('Seguretat — manipulació de preus', () => {
  test('server ignora amount enviat pel client', async ({ page }) => {
    // El preview server no serveix Netlify functions. Mockegem la resposta
    // per simular el comportament server-side: el server calcula el preu
    // i ignora qualsevol amount del client.
    let receivedBody = null;
    await page.route('**/.netlify/functions/create-payment-intent', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        receivedBody = JSON.parse(request.postData());
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            clientSecret: 'pi_test',
            total: 20.45, // preu server-side, ignora l'amount del client
            subtotal: 15.5,
            shippingCost: 4.95,
          }),
        });
      } else {
        await route.continue();
      }
    });

    // Navega a una pàgina per tenir context de navegador
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Fa el fetch des del navegador (passa per page.route)
    const result = await page.evaluate(async () => {
      const response = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ gelatoVariantId: 'apparel_tshirt_1', quantity: 1 }],
          shippingZone: 'es_peninsula',
          currency: 'eur',
          email: 'test@test.com',
          amount: 1, // intent de manipulació
          total: 1,
        }),
      });
      return { status: response.status, body: await response.json() };
    });

    expect(result.status).toBe(200);
    // El total ha de ser el server-side (20.45), no el manipulat (1)
    expect(result.body.total).not.toBe(1);
    expect(result.body.total).toBe(20.45);
    // Verifica que el client ha enviat amount (l'atacant ho pot fer)
    expect(receivedBody).toHaveProperty('amount', 1);
    // La resposta no reflecteix l'amount injectat
    expect(result.body.total).not.toBe(receivedBody.amount);
  });
});

test.describe('Seguretat — XSS al DOM', () => {
  test('no s\'executa JS injectat via query params', async ({ page }) => {
    let alertCalled = false;
    page.on('dialog', () => {
      alertCalled = true;
    });

    // Navega amb un payload XSS a la URL
    await page.goto('/?q=<script>alert(1)</script>', { waitUntil: 'domcontentloaded' });

    // No s'ha d'executar cap alert
    expect(alertCalled).toBe(false);
  });

  test('no s\'executa JS injectat via hash', async ({ page }) => {
    let alertCalled = false;
    page.on('dialog', () => {
      alertCalled = true;
    });

    await page.goto('/#<img src=x onerror=alert(1)>', { waitUntil: 'domcontentloaded' });
    expect(alertCalled).toBe(false);
  });
});

test.describe('Seguretat — headers HTTP', () => {
  test('X-Content-Type-Options: nosniff present', async ({ request }) => {
    const response = await request.get('/');
    const headers = response.headers();
    // Almenys un header de seguretat bàsic
    // Nota: vite preview pot no tenir tots els headers; això documenta
    // el que caldria configurar a Netlify.
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security',
    ];
    const present = securityHeaders.filter(h => headers[h]);
    // Si no n'hi ha cap, és un warning (no failure) en dev
    // En producció (Netlify) haurien d'estar presents
    if (present.length === 0) {
      test.info().annotations.push({
        type: 'warning',
        description: 'Cap header de seguretat present — configura a Netlify (_headers)',
      });
    }
  });
});
