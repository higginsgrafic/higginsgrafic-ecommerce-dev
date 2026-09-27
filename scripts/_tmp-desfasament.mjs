// TEMPORAL — no es comiteja. QUIN index de la tira ensenya la casa 0? Ho dedueixo
// del codi font de la tira, que puc importar.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const mostrades = [...v2.querySelectorAll('[data-stripe-tile] img')].map((i) => (i.currentSrc || '').split('/').pop().replace('-b-stripe.webp', ''));
  // Les 14 que el pintor te a la ma: stripeStrip (les 14 primeres de la tira).
  // Es llegeix el DOM: cada casa te la seva imatge.
  return { mostrades: mostrades.slice(0, 14) };
});
console.log('cases:', JSON.stringify(r.mostrades));
await b.close();
