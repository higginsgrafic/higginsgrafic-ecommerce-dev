// TEMPORAL — llista les imatges de dins de la franja de la p2, amb z i caixa.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v.querySelector('[data-stripe-visual-content="2"]');
  return [...franja.querySelectorAll('img')].map((i) => ({
    src: (i.getAttribute('src') || '').slice(0, 90),
    z: getComputedStyle(i).zIndex,
    r: (() => { const x = i.getBoundingClientRect(); return [Math.round(x.left), Math.round(x.top), Math.round(x.width), Math.round(x.height)]; })(),
  }));
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
