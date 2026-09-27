// TEMPORAL — no es comiteja. A la FRANJA, quina mida te el dibuix d'un marc i el
// d'un solid? (la franja amb AUSTEN)
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=austen', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2) };
});
const mides = new Map();
for (let i = 0; i <= 40; i++) {
  const v = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    return [...v2.querySelectorAll('[data-stripe-tile]')].map((t) => {
      const img = t.querySelector('img');
      if (!img) return null;
      const src = (img.currentSrc || '').split('/').pop();
      if (!/solid|frame/.test(src)) return null;
      const ib = img.getBoundingClientRect();
      const tf = getComputedStyle(img).transform;
      return { src, mida: `${Math.round(ib.width)}x${Math.round(ib.height)}`, tf: tf === 'none' ? '-' : tf.slice(0, 46) };
    }).filter(Boolean);
  });
  for (const x of v) mides.set(x.src, x);
  if (i < 40) { await p.mouse.move(q.x, q.y); await p.mouse.wheel(0, 120); await p.waitForTimeout(300); }
}
for (const [src, x] of [...mides.entries()].sort()) console.log(`${src.padEnd(36)} pintat=${x.mida.padEnd(11)} transform=${x.tf}`);
await b.close();
