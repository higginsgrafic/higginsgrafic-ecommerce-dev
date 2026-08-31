/**
 * Resiliència E2E — UI es degrada amb gràcia quan les APIs fallen
 * -----------------------------------------------------------------------------
 * - Navegació amb API caigut → UI mostra error, no pantalla blanca
 * - Pàgines crítiques carregen sense JS errors
 */
import { test, expect } from '@playwright/test';

test.describe('Resiliència — UI amb APIs caigudes', () => {
  test('Home carrega sense errors amb APIs caigudes', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Mock totes les APIs amb 500
    await page.route('**/.netlify/functions/**', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Server down"}' });
    });
    await page.route('**/rest/v1/**', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"DB down"}' });
    });
    await page.route('**/auth/v1/**', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"Auth down"}' });
    });

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // La pàgina ha de carregar (no pantalla blanca)
    await expect(page.locator('body')).toBeVisible();
    // No hi ha d'haver errors de JS no controlats
    const criticalErrors = errors.filter(e =>
      !e.includes('Failed to fetch') && !e.includes('NetworkError') && !e.includes('500')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('Pàgina de contacte carrega amb API caiguda', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    await page.route('**/.netlify/functions/**', (route) => {
      route.fulfill({ status: 500, contentType: 'application/json', body: '{"error":"down"}' });
    });

    await page.goto('/contacte', { waitUntil: 'domcontentloaded' });

    // La pàgina ha de carregar
    await expect(page.locator('body')).toBeVisible();
    // No hi ha d'haver errors crítics
    const criticalErrors = errors.filter(e =>
      !e.includes('Failed to fetch') && !e.includes('NetworkError') && !e.includes('500')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Resiliència — pàgines crítiques sense JS errors', () => {
  const criticalPages = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contacte' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Shipping', path: '/shipping' },
  ];

  for (const pageData of criticalPages) {
    test(`${pageData.name} no té JS errors crítics`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', (err) => errors.push(err.message));

      await page.goto(pageData.path, { waitUntil: 'domcontentloaded' });

      // La pàgina ha de carregar
      await expect(page.locator('body')).toBeVisible();

      // Filtra errors de xarxa (esperats si no hi ha backend) vs errors de JS
      const criticalErrors = errors.filter(e =>
        !e.includes('Failed to fetch') &&
        !e.includes('NetworkError') &&
        !e.includes('net::ERR') &&
        !e.includes('500')
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }
});
