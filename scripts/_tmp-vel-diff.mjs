// TEMPORAL — no es comiteja. Diferencia de pixels amb el vel posat i tret, per casa.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const box = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  window.__velImg = [...franja.querySelectorAll('img')].find((im) => {
    const s = im.getAttribute('src') || '';
    return s.startsWith('data:image/svg+xml') && /fill-opacity="0\.6"/.test(decodeURIComponent(s));
  }) || null;
  const r = franja.getBoundingClientRect();
  const cases = [...franja.querySelectorAll('[data-stripe-tile]')].map((el) => ({ i: Number(el.getAttribute('data-stripe-tile')), c: el.getAttribute('data-stripe-collection') }));
  window.__cases = cases.sort((a, b2) => a.i - b2.i);
  return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
});
const clip = { x: Math.max(0, box.x), y: box.y, width: box.w, height: box.h };
await p.screenshot({ path: `_tmp-vel-on-${act}.png`, clip });
await p.evaluate(() => { if (window.__velImg) window.__velImg.style.visibility = 'hidden'; });
await p.waitForTimeout(300);
await p.screenshot({ path: `_tmp-vel-off-${act}.png`, clip });
const cases = await p.evaluate(() => window.__cases);
const on = PNG.sync.read(readFileSync(`_tmp-vel-on-${act}.png`));
const off = PNG.sync.read(readFileSync(`_tmp-vel-off-${act}.png`));
const n = cases.length;
const wCasa = on.width / n;
console.log(`active=${act} franja ${on.width}x${on.height} casa ${wCasa.toFixed(1)}px`);
for (const c of cases) {
  const x0 = Math.floor(c.i * wCasa);
  const x1 = Math.min(on.width, Math.floor((c.i + 1) * wCasa));
  let suma = 0; let npx = 0;
  for (let y = 0; y < on.height; y++) {
    for (let x = x0; x < x1; x++) {
      const k = (y * on.width + x) * 4;
      const d = Math.abs(on.data[k] - off.data[k]) + Math.abs(on.data[k + 1] - off.data[k + 1]) + Math.abs(on.data[k + 2] - off.data[k + 2]);
      suma += d; npx += 1;
    }
  }
  const mitjana = suma / Math.max(1, npx);
  console.log(`  casa ${String(c.i).padStart(2)} ${String(c.c).padEnd(16)} dif mitjana ${mitjana.toFixed(2)} ${mitjana > 2 ? 'VEL' : '   '}`);
}
await ctx.close();
await b.close();
