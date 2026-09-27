// TEMPORAL — no es comita. La franja a cada mida, a la ruta de compara-vistes.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1024, 768], [1366, 768], [1440, 900], [1920, 946]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w <= 1366 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/?active=first_contact', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(4500);
  const r = await p.evaluate(() => {
    const e = document.querySelector('[data-stripe-visual-content="2"]');
    const fila = document.querySelector('#stripe-guide-stripe-row');
    const carr = document.querySelector('[data-carrusel="1"]');
    const bb = (x) => (x ? [+x.getBoundingClientRect().left.toFixed(1), +x.getBoundingClientRect().width.toFixed(1), +x.getBoundingClientRect().height.toFixed(1)] : null);
    return {
      contingut: bb(e), transform: e ? getComputedStyle(e).transform : null,
      fila: bb(fila), filaOffset: fila ? fila.offsetWidth : null,
      carrusel: bb(carr), carril: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim(),
      escala: getComputedStyle(document.documentElement).getPropertyValue('--megaStripeScale').trim(),
    };
  });
  console.log(`${w}x${h}`, JSON.stringify(r));
  await ctx.close();
}
await b.close();
