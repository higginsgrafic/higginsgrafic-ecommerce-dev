import { chromium } from '@playwright/test';
const b = await chromium.launch();
const act = process.argv[2] || 'the_human_inside';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
const estats = new Set();
for (let k = 0; k < 200; k++) {
  const s = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v2?.querySelector('[data-stripe-visual-content="2"]');
    if (!franja) return null;
    const cases = [...franja.querySelectorAll('[data-stripe-tile]')].sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile')));
    if (!cases.length) return null;
    return cases.map((el) => {
      const img = el.querySelector('img');
      const op = img && img.parentElement ? Number(getComputedStyle(img.parentElement).opacity).toFixed(2) : '?';
      return `${(el.getAttribute('data-stripe-src') || '').split('/').pop().replace('-stripe.webp', '').slice(0, 8)}|${op}`;
    }).join(' ');
  });
  if (s) estats.add(s);
  await p.waitForTimeout(16);
}
console.log(`active=${act}: estats ${estats.size}`);
for (const e of estats) console.log('   ', e);
await ctx.close();
await b.close();
