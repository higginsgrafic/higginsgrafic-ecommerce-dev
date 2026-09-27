// TEMPORAL — no es comiteja. La TINTA de cada dibuix a la franja: quants pixels
// ocupa de debò, despres del calibratge.
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
for (let i = 0; i <= 20; i++) {
  const v = await p.evaluate(async () => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const out = [];
    for (const t of v2.querySelectorAll('[data-stripe-tile]')) {
      const img = t.querySelector('img');
      if (!img || !img.naturalWidth) continue;
      const src = (img.currentSrc || '').split('/').pop();
      const bb = img.getBoundingClientRect();
      out.push({ src, ample: +bb.width.toFixed(1), alt: +bb.height.toFixed(1), natural: `${img.naturalWidth}x${img.naturalHeight}` });
    }
    return out;
  });
  for (const x of v) vist.set(x.src, x);
  if (i < 20) { await p.mouse.move(q.x, q.y); await p.mouse.wheel(0, 120); await p.waitForTimeout(280); }
}
const ordenats = [...vist.values()].sort((a, b2) => (b2.ample * b2.alt) - (a.ample * a.alt));
for (const x of ordenats.slice(0, 16)) console.log(`${x.src.padEnd(32)} pintat=${(x.ample + 'x' + x.alt).padEnd(10)} natural=${x.natural}`);
await b.close();
