// TEMPORAL — no es comiteja. Zoom al canton esquerre de la franja vertical, amb vel i sense.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 3 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const box = await p.evaluate(() => {
  const taula = document.querySelector('[data-taula-vertical="2"]');
  const franja = taula.querySelector('[data-stripe-visual-content="2"]');
  const r = franja.getBoundingClientRect();
  const cases = [...franja.querySelectorAll('[data-stripe-tile]')].map((el) => {
    const rr = el.getBoundingClientRect();
    return { i: Number(el.getAttribute('data-stripe-tile')), c: el.getAttribute('data-stripe-collection'), x: rr.left, y: rr.top, w: rr.width, h: rr.height };
  });
  window.__cases = cases;
  window.__franja = franja;
  return { x: r.left, y: r.top, w: r.width, h: r.height };
});
const cases = await p.evaluate(() => window.__cases);
const casa0 = cases.find((c) => c.i === 0);
const casa7 = cases.find((c) => c.i === 7);
const clip = { x: Math.max(0, Math.round(box.x - 15)), y: Math.max(0, Math.round(box.y - 15)), width: Math.round(casa0.w * 3 + 30), height: Math.round(box.h + 30) };
await p.screenshot({ path: `_tmp-tvz-on-${act}.png`, clip });
const n = await p.evaluate(() => {
  const franja = window.__franja;
  let k = 0;
  for (const x of franja.querySelectorAll('path[fill-opacity]')) { x.style.visibility = 'hidden'; k += 1; }
  return k;
});
await p.waitForTimeout(300);
await p.screenshot({ path: `_tmp-tvz-off-${act}.png`, clip });
console.log(`clip ${JSON.stringify(clip)} | casa0 ${JSON.stringify(casa0)} casa7 ${JSON.stringify(casa7)} | paths amagats ${n}`);
await ctx.close();
await b.close();
