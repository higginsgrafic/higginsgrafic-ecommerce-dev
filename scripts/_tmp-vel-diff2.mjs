// TEMPORAL — no es comiteja. El vel, casa per casa, amb la caixa de cada casa (apaisat i vertical).
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const mides = [[1920, 946], [1366, 768], [768, 1024]];
for (const [w, h] of mides) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(5000);
  const info = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v2.querySelector('[data-stripe-visual-content="2"]');
    const r = franja.getBoundingClientRect();
    window.__cases = [...franja.querySelectorAll('[data-stripe-tile]')].map((el) => {
      const rr = el.getBoundingClientRect();
      return { i: Number(el.getAttribute('data-stripe-tile')), c: el.getAttribute('data-stripe-collection'), x: rr.left, y: rr.top, w: rr.width, h: rr.height };
    });
    window.__amagaVel = () => {
      let n = 0;
      for (const im of franja.querySelectorAll('img')) {
        const s = im.getAttribute('src') || '';
        if (s.startsWith('data:image/svg+xml') && /fill-opacity="0\.6"/.test(decodeURIComponent(s))) { im.style.visibility = 'hidden'; n += 1; }
      }
      for (const pa of franja.querySelectorAll('path[fill-opacity="0.6"]')) { pa.style.visibility = 'hidden'; n += 1; }
      return n;
    };
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  });
  const clip = { x: Math.max(0, Math.round(info.x)), y: Math.max(0, Math.round(info.y)), width: Math.round(info.w), height: Math.round(info.h) };
  await p.screenshot({ path: `_tmp-von-${act}.png`, clip });
  const amagats = await p.evaluate(() => window.__amagaVel());
  await p.waitForTimeout(300);
  await p.screenshot({ path: `_tmp-voff-${act}.png`, clip });
  const cases = await p.evaluate(() => window.__cases);
  const on = PNG.sync.read(readFileSync(`_tmp-von-${act}.png`));
  const off = PNG.sync.read(readFileSync(`_tmp-voff-${act}.png`));
  console.log(`\n=== ${w}x${h} active=${act} cases=${cases.length} elements de vel amagats=${amagats}`);
  for (const c of cases.sort((a, b2) => a.i - b2.i)) {
    const x0 = Math.max(0, Math.round(c.x - clip.x));
    const x1 = Math.min(on.width, Math.round(c.x + c.w - clip.x));
    const y0 = Math.max(0, Math.round(c.y - clip.y));
    const y1 = Math.min(on.height, Math.round(c.y + c.h - clip.y));
    let suma = 0; let npx = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const k = (y * on.width + x) * 4;
        suma += Math.abs(on.data[k] - off.data[k]) + Math.abs(on.data[k + 1] - off.data[k + 1]) + Math.abs(on.data[k + 2] - off.data[k + 2]);
        npx += 1;
      }
    }
    const m = suma / Math.max(1, npx);
    console.log(`  casa ${String(c.i).padStart(2)} ${String(c.c).padEnd(16)} dif ${m.toFixed(2)} ${m > 2 ? 'VEL' : '   '}`);
  }
  await ctx.close();
}
await b.close();
