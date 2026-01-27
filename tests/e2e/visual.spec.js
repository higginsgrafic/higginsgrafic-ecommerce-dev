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
    await snapshotCollectionHeader(page, 'outcasted-header.png');
  });

  test('First Contact collection', async ({ page }) => {
    await page.goto('/first-contact');
    await snapshotCollectionHeader(page, 'first-contact-header.png');
  });
});
