// TEMPORAL — no es comiteja. Mapa de diferencia del vel (on - off), ampliat.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const [w, h] = (process.argv[3] || '1920x946').split('x').map(Number);
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const box = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  window.__imgs = [...franja.querySelectorAll('img')];
  const r = franja.getBoundingClientRect();
  return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
});
const clip = { x: Math.max(0, box.x - 20), y: Math.max(0, box.y - 10), width: Math.min(box.w + 40, 1920 - Math.max(0, box.x - 20)), height: Math.min(box.h + 20, 1200) };
await p.screenshot({ path: `_tmp-m-on-${act}.png`, clip });
await p.evaluate(() => {
  for (const im of window.__imgs) {
    const s = im.getAttribute('src') || '';
    if (s.startsWith('data:image/svg+xml') && /fill-opacity="0\.6"/.test(decodeURIComponent(s))) im.style.visibility = 'hidden';
  }
  for (const pa of document.querySelectorAll('[data-mega-page-viewport="2"] path[fill-opacity="0.6"]')) pa.style.visibility = 'hidden';
});
await p.waitForTimeout(300);
await p.screenshot({ path: `_tmp-m-off-${act}.png`, clip });
const on = PNG.sync.read(readFileSync(`_tmp-m-on-${act}.png`));
const off = PNG.sync.read(readFileSync(`_tmp-m-off-${act}.png`));
const out = new PNG({ width: on.width, height: on.height });
for (let i = 0; i < on.width * on.height; i++) {
  const k = i * 4;
  const d = Math.max(Math.abs(on.data[k] - off.data[k]), Math.abs(on.data[k + 1] - off.data[k + 1]), Math.abs(on.data[k + 2] - off.data[k + 2]));
  const v = Math.min(255, d * 6);
  out.data[k] = v; out.data[k + 1] = v; out.data[k + 2] = v; out.data[k + 3] = 255;
}
writeFileSync(`_tmp-m-diff-${act}.png`, PNG.sync.write(out));
console.log(`desat _tmp-m-diff-${act}.png (${on.width}x${on.height}) clip ${JSON.stringify(clip)}`);
await ctx.close();
await b.close();
