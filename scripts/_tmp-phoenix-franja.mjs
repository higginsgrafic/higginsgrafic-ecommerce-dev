// TEMPORAL — no es comiteja. The Phoenix a la franja: mida pintada, i la dels
// veins per comparar.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
const vist = new Map();
for (let i = 0; i <= 30; i++) {
  const v = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    return [...v2.querySelectorAll('[data-stripe-tile]')].map((t) => {
      const img = t.querySelector('img');
      if (!img) return null;
      const src = (img.currentSrc || '').split('/').pop();
      const ib = img.getBoundingClientRect();
      return { src, pintat: `${Math.round(ib.width)}x${Math.round(ib.height)}`, tf: getComputedStyle(img).transform.slice(0, 30) };
    }).filter(Boolean);
  });
  for (const x of v) vist.set(x.src, x);
  if (i < 30) { await p.mouse.move(q.x, q.y); await p.mouse.wheel(0, 120); await p.waitForTimeout(280); }
}
const volguts = ['nx-01-b-stripe.webp', 'ncc-1701-b-stripe.webp', 'ncc-1701-d-b-stripe.webp', 'the-phoenix-b-stripe.webp', 'vulcans-end-b-stripe.webp', 'plasma-escape-b-stripe.webp', 'wormhole-b-stripe.webp'];
for (const v of volguts) {
  const x = vist.get(v);
  console.log(`${v.padEnd(30)} ${x ? `pintat=${x.pintat.padEnd(9)} ${x.tf}` : 'NO VIST'}`);
}
await b.close();
