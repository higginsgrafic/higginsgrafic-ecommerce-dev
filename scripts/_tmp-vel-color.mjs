// TEMPORAL — no es comiteja. El vel amb una samarreta de COLOR (es veu la taca).
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const slug = process.argv[3] || 'black';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(1500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4000);
const bars = await p.evaluate(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-color-barra]')].map((el) => el.getAttribute('data-color-barra')));
console.log('barres (p2):', bars.join(','));
await p.click(`[data-mega-page-viewport="2"] [data-color-barra="${slug}"]`).catch((e) => console.log('clic fallit', e.message));
await p.waitForTimeout(2500);
const box = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  window.__f = franja;
  const r = franja.getBoundingClientRect();
  const cases = [...franja.querySelectorAll('[data-stripe-tile]')].map((el) => {
    const rr = el.getBoundingClientRect();
    return { i: Number(el.getAttribute('data-stripe-tile')), c: el.getAttribute('data-stripe-collection'), x: rr.left, y: rr.top, w: rr.width, h: rr.height };
  });
  const tint = [...franja.querySelectorAll('div')].find((el) => (getComputedStyle(el).mixBlendMode === 'multiply' && getComputedStyle(el).backgroundColor !== 'rgba(0, 0, 0, 0)'));
  return { x: r.left, y: r.top, w: r.width, h: r.height, cases, color: tint ? getComputedStyle(tint).backgroundColor : 'sense tint' };
});
const clip = { x: Math.max(0, Math.round(box.x) - 4), y: Math.max(0, Math.round(box.y) - 4), width: Math.round(box.w) + 8, height: Math.round(box.h) + 8 };
await p.screenshot({ path: `_tmp-vc-on-${act}-${slug}.png`, clip });
await p.evaluate(() => {
  for (const im of window.__f.querySelectorAll('img')) {
    const s = im.getAttribute('src') || '';
    if (s.startsWith('data:image/svg+xml') && /fill-opacity="0\.6"/.test(decodeURIComponent(s))) im.style.visibility = 'hidden';
  }
});
await p.waitForTimeout(300);
await p.screenshot({ path: `_tmp-vc-off-${act}-${slug}.png`, clip });
const on = PNG.sync.read(readFileSync(`_tmp-vc-on-${act}-${slug}.png`));
const off = PNG.sync.read(readFileSync(`_tmp-vc-off-${act}-${slug}.png`));
const out = new PNG({ width: on.width, height: on.height });
for (let i = 0; i < on.width * on.height; i++) {
  const k = i * 4;
  const d = Math.max(Math.abs(on.data[k] - off.data[k]), Math.abs(on.data[k + 1] - off.data[k + 1]), Math.abs(on.data[k + 2] - off.data[k + 2]));
  const v = Math.min(255, d * 4);
  out.data[k] = v; out.data[k + 1] = v; out.data[k + 2] = v; out.data[k + 3] = 255;
}
writeFileSync(`_tmp-vc-diff-${act}-${slug}.png`, PNG.sync.write(out));
console.log(`clip ${JSON.stringify(clip)} color=${box.color}`);
for (const c of box.cases.sort((a, b2) => a.i - b2.i)) {
  const x0 = Math.max(0, Math.round(c.x - clip.x)); const x1 = Math.min(on.width, Math.round(c.x + c.w - clip.x));
  const y0 = Math.max(0, Math.round(c.y - clip.y)); const y1 = Math.min(on.height, Math.round(c.y + c.h - clip.y));
  let suma = 0; let n = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const k = (y * on.width + x) * 4; suma += Math.max(Math.abs(on.data[k] - off.data[k]), Math.abs(on.data[k + 1] - off.data[k + 1])); n += 1; }
  console.log(`  casa ${String(c.i).padStart(2)} ${String(c.c).padEnd(16)} dif ${(suma / Math.max(1, n)).toFixed(2)}`);
}
await ctx.close();
await b.close();
