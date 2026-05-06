/**
 * Cross-browser layout smoke tests
 * -----------------------------------------------------------------------------
 * Valida que les CSS vars publicades pel helper layoutMetrics i pels
 * useLayoutEffect del mega-slide i del checkout són coherents a Chromium,
 * WebKit i Firefox, i que no hi ha overflow horitzontal a les rutes crítiques.
 *
 * No fa screenshot diff: només assertions numèriques i de coherència. Fes
 * `npm run test:e2e -- cross-browser-layout` per executar-lo als 3 motors.
 */

import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: '1024', width: 1024, height: 800 },
  { name: '1280', width: 1280, height: 900 },
  { name: '1440', width: 1440, height: 900 },
];

const readCssVarsAtRoot = (page, names) =>
  page.evaluate((vars) => {
    const cs = getComputedStyle(document.documentElement);
    const out = {};
    for (const v of vars) out[v] = cs.getPropertyValue(v).trim();
    return out;
  }, names);

const getMaxScrollWidth = (page) =>
  page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));

const parsePx = (raw) => {
  if (!raw) return NaN;
  const m = String(raw).trim().match(/^(-?\d+(?:\.\d+)?)px$/);
  return m ? parseFloat(m[1]) : NaN;
};

test.describe('Cross-browser: mega-slide layout vars', () => {
  for (const vp of VIEWPORTS) {
    test(`mega-slide @ ${vp.name}px`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/full-wide-slide');
      await page.waitForLoadState('domcontentloaded');

      // Esperem que la var es publiqui (useLayoutEffect del header)
      await expect
        .poll(
          async () => {
            const vars = await readCssVarsAtRoot(page, ['--hg-mega-w']);
            return parsePx(vars['--hg-mega-w']);
          },
          { timeout: 10_000 }
        )
        .toBeGreaterThan(0);

      const vars = await readCssVarsAtRoot(page, ['--hg-mega-w', '--hg-mega-x']);
      const w = parsePx(vars['--hg-mega-w']);
      const x = parsePx(vars['--hg-mega-x']);

      // Coherència bàsica
      expect(w).toBeGreaterThan(320);
      expect(w).toBeLessThanOrEqual(1400 + 1);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x + w).toBeLessThanOrEqual(vp.width + 1);

      // Cap overflow horitzontal
      const widths = await getMaxScrollWidth(page);
      expect(widths.scrollWidth).toBeLessThanOrEqual(vp.width + 1);
      expect(widths.bodyScrollWidth).toBeLessThanOrEqual(vp.width + 1);
    });
  }
});

test.describe('Cross-browser: checkout layout vars', () => {
  for (const vp of VIEWPORTS) {
    test(`checkout @ ${vp.name}px`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/checkout');
      await page.waitForLoadState('domcontentloaded');

      await expect
        .poll(
          async () => {
            const vars = await readCssVarsAtRoot(page, ['--hg-checkout-xR']);
            return parsePx(vars['--hg-checkout-xR']);
          },
          { timeout: 10_000 }
        )
        .toBeGreaterThan(0);

      const vars = await readCssVarsAtRoot(page, [
        '--hg-checkout-xL',
        '--hg-checkout-xR',
        '--hg-checkout-yT',
        '--hg-checkout-yB',
      ]);
      const xL = parsePx(vars['--hg-checkout-xL']);
      const xR = parsePx(vars['--hg-checkout-xR']);
      const yT = parsePx(vars['--hg-checkout-yT']);
      const yB = parsePx(vars['--hg-checkout-yB']);

      expect(Number.isFinite(xL)).toBe(true);
      expect(Number.isFinite(xR)).toBe(true);
      expect(Number.isFinite(yT)).toBe(true);
      expect(Number.isFinite(yB)).toBe(true);

      // X coherent amb el viewport
      expect(xR).toBeGreaterThan(xL);
      expect(xL).toBeGreaterThanOrEqual(0);
      expect(xR).toBeLessThanOrEqual(vp.width + 1);
      expect(xR - xL).toBeGreaterThan(320);

      // Y desacoblat del mega-slide: yT estable a 0, yB ≈ viewport height
      expect(yT).toBe(0);
      expect(yB).toBeGreaterThan(200);
      expect(yB).toBeLessThanOrEqual(vp.height + 1);

      // Cap overflow horitzontal
      const widths = await getMaxScrollWidth(page);
      expect(widths.scrollWidth).toBeLessThanOrEqual(vp.width + 1);
    });
  }
});

test.describe('Cross-browser: belt2 reset cross-route', () => {
  test('--belt2-yT/yB es netegen en canviar de ruta amb belt2 actiu', async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // Seed: simulem que en una sessió anterior al mega-slide es van mesurar
    // anchors verticals (yCarouselTop / yFinalizeBottom) i es van persistir.
    await context.addInitScript(() => {
      try {
        window.localStorage.setItem('HG_BELT2_GUIDES_ENABLED_V1', '1');
        window.localStorage.setItem(
          'HG_BELT2_GLOBAL_V1',
          JSON.stringify({ xL: 200, xR: 1240, yCarouselTop: 500, yFinalizeBottom: 1200 })
        );
      } catch {
        // ignore
      }
    });

    // En carregar /about, el BeltReferenceOverlay s'inicialitza des de
    // localStorage. El useEffect[pathname] ha d'esborrar les Y immediatament.
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');

    await expect
      .poll(async () => {
        const v = await readCssVarsAtRoot(page, [
          '--belt2-yT',
          '--belt2-yB',
          '--belt2-xL',
          '--belt2-xR',
        ]);
        return {
          yT: v['--belt2-yT'],
          yB: v['--belt2-yB'],
          // X poden estar publicades si el header mesura abans, però com a
          // mínim no han de venir corruptes del seed (200/1240): el read
          // efectiu les sobreescriurà amb mesures reals d'aquesta ruta.
          xLPresent: v['--belt2-xL'] !== '',
          xRPresent: v['--belt2-xR'] !== '',
        };
      }, { timeout: 5_000 })
      .toEqual({
        yT: '',
        yB: '',
        xLPresent: expect.any(Boolean),
        xRPresent: expect.any(Boolean),
      });
  });
});

test.describe('Cross-browser: route isolation', () => {
  test('checkout no és contaminat per visitar abans /full-wide-slide', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Visita mega-slide → publica --hg-mega-* i potencialment --belt2-*
    await page.goto('/full-wide-slide');
    await page.waitForLoadState('domcontentloaded');
    await expect
      .poll(async () => {
        const v = await readCssVarsAtRoot(page, ['--hg-mega-w']);
        return parsePx(v['--hg-mega-w']);
      })
      .toBeGreaterThan(0);

    // 2. Visita checkout → ha de tenir les seves pròpies vars publicades
    await page.goto('/checkout');
    await page.waitForLoadState('domcontentloaded');
    await expect
      .poll(async () => {
        const v = await readCssVarsAtRoot(page, ['--hg-checkout-yB']);
        return parsePx(v['--hg-checkout-yB']);
      })
      .toBeGreaterThan(0);

    const vars = await readCssVarsAtRoot(page, [
      '--hg-checkout-yT',
      '--hg-checkout-yB',
    ]);
    expect(parsePx(vars['--hg-checkout-yT'])).toBe(0);
    expect(parsePx(vars['--hg-checkout-yB'])).toBeGreaterThan(200);
  });
});
