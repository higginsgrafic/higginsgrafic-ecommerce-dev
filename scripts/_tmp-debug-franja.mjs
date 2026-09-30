// TEMPORAL — seguiment de la franja i el bloc durant l'obertura (1366x768).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1366, height: 768 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
p.on('pageerror', (e) => console.log('PAGEERROR', String(e.message).slice(0, 200)));
p.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
for (let i = 0; i < 14; i++) {
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const banda = v2.querySelector('[data-colleccions-franja="1"]');
    const stripe = v2.querySelector('[data-stripe-visual-content="2"]');
    const bcn = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const graella = v2.querySelector('[data-carrusel="1"]');
    const box = (el) => el ? [+el.getBoundingClientRect().top.toFixed(1), +el.getBoundingClientRect().bottom.toFixed(1)] : null;
    const inner = stripe ? stripe.querySelector('div') : null;
    return {
      banda: box(banda), stripe: box(stripe), bcn: box(bcn), graella: box(graella),
      tr: inner ? (inner.getAttribute('style') || '').slice(0, 220) : null,
    };
  });
  console.log(`t${i}: graella ${JSON.stringify(r.graella)} banda ${JSON.stringify(r.banda)} stripe ${JSON.stringify(r.stripe)} bcn ${JSON.stringify(r.bcn)}`);
  if (i === 0) console.log('   style:', r.tr);
  await p.waitForTimeout(700);
}
await ctx.close(); await b.close();
