// CAPTURA DE LA STRIPE DE LA P1 AMB LES SEGONES GUIES (02/10/2026).
// En Marc: «Acaba d'alinear la stripe p1 a la mida del segon carril».
import { chromium } from '@playwright/test';
const w = Number(process.argv[2] || 1024), h = Number(process.argv[3] || 768);
const etiqueta = process.argv[4] || 'carril';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact&carril=1', { waitUntil: 'load', timeout: 180000 });
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const s = v1.querySelector('[data-stripe-visual-content="1"]').getBoundingClientRect();
  const g1 = document.querySelector('[data-guia-carril-pagina="esq"]').getBoundingClientRect().left;
  const g2 = document.querySelector('[data-guia-carril-pagina="dret"]').getBoundingClientRect().left;
  return { stripe: { x: +s.left.toFixed(2), d: +s.right.toFixed(2), y: +s.top.toFixed(2), b: +s.bottom.toFixed(2) }, guiaEsq: +g1.toFixed(2), guiaDret: +g2.toFixed(2) };
});
console.log(`${w}x${h}`, JSON.stringify(r));
// La zona de la vora esquerra de la stripe i la guia verda.
await p.screenshot({ path: `_tmp-stripe-carril-esq-${etiqueta}-${w}.png`, clip: { x: 0, y: Math.max(0, r.stripe.y - 20), width: 160, height: 150 } });
await p.screenshot({ path: `_tmp-stripe-carril-dret-${etiqueta}-${w}.png`, clip: { x: w - 160, y: Math.max(0, r.stripe.y - 20), width: 160, height: 150 } });
await p.screenshot({ path: `_tmp-stripe-carril-${etiqueta}-${w}.png`, clip: { x: 0, y: 0, width: w, height: Math.min(h, r.stripe.b + 20) } });
console.log('captures fetes');
await ctx.close();
await b.close();
