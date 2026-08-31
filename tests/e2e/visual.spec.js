import { test, expect } from '@playwright/test';

const disableAnimations = async (page) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition-duration: 0s !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        scroll-behavior: auto !important;
      }
    `,
  });
};

const snapshotElement = async (page, locator, name) => {
  await disableAnimations(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState('domcontentloaded');
  await expect(locator).toBeVisible({ timeout: 30_000 });
  await expect(locator).toHaveScreenshot(name, {
    maxDiffPixelRatio: 0.02,
  });
};

const snapshot = async (page, name) => {
  await disableAnimations(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState('domcontentloaded');
  await expect(page).toHaveScreenshot(name, {
    maxDiffPixelRatio: 0.02,
  });
};

const snapshotCollectionHeader = async (page, name) => {
  await disableAnimations(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState('domcontentloaded');

  const header = page.locator('.bg-gradient-to-br').first();
  await expect(header).toBeVisible({ timeout: 30_000 });
  await expect(header).toHaveScreenshot(name, {
    maxDiffPixelRatio: 0.02,
  });
};

test.describe('Visual regression - core layouts', () => {
  test('Home', async ({ page }) => {
    await page.goto('/');
    await snapshotElement(page, page.locator('header').first(), 'home-header.png');
  });

  test('Outcasted collection', async ({ page }) => {
    await page.goto('/outcasted');
    await snapshotElement(page, page.locator('header').first(), 'outcasted-header.png');
  });

  test('First Contact collection', async ({ page }) => {
    await page.goto('/first-contact');
    await snapshotElement(page, page.locator('header').first(), 'first-contact-header.png');
  });
});

test.describe('Visual regression - pàgines informatives', () => {
  test('About', async ({ page }) => {
    await page.goto('/about');
    await snapshotElement(page, page.locator('main, [role="main"], #root').first(), 'about-content.png');
  });

  test('Contact', async ({ page }) => {
    await page.goto('/contacte');
    await snapshotElement(page, page.locator('main, [role="main"], #root').first(), 'contact-content.png');
  });

  test('FAQ', async ({ page }) => {
    await page.goto('/faq');
    await snapshotElement(page, page.locator('main, [role="main"], #root').first(), 'faq-content.png');
  });

  test('Shipping', async ({ page }) => {
    await page.goto('/shipping');
    await snapshotElement(page, page.locator('main, [role="main"], #root').first(), 'shipping-content.png');
  });
});

test.describe('Visual regression - col·leccions addicionals', () => {
  // Les col·leccions depenen de dades de Supabase que no estan disponibles
  // al preview server. Fem snapshot del header (estable) en lloc del contingut.
  test('The Human Inside collection', async ({ page }) => {
    await page.goto('/the-human-inside');
    await snapshotElement(page, page.locator('header').first(), 'human-inside-header.png');
  });

  test('Austen collection', async ({ page }) => {
    await page.goto('/austen');
    await snapshotElement(page, page.locator('header').first(), 'austen-header.png');
  });

  test('Cube collection', async ({ page }) => {
    await page.goto('/cube');
    await snapshotElement(page, page.locator('header').first(), 'cube-header.png');
  });

  test('Miscellania collection', async ({ page }) => {
    await page.goto('/miscellania');
    await snapshotElement(page, page.locator('header').first(), 'miscellania-header.png');
  });
});

test.describe('Visual regression - pàgines legals', () => {
  test('Privacy', async ({ page }) => {
    await page.goto('/privacy');
    await snapshotElement(page, page.locator('main, [role="main"], #root').first(), 'privacy-content.png');
  });

  test('Terms', async ({ page }) => {
    await page.goto('/terms');
    await snapshotElement(page, page.locator('main, [role="main"], #root').first(), 'terms-content.png');
  });

  test('Legal Notice', async ({ page }) => {
    await page.goto('/legal-notice');
    await snapshotElement(page, page.locator('main, [role="main"], #root').first(), 'legal-notice-content.png');
  });
});
