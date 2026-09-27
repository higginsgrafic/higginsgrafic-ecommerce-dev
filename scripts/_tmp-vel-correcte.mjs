// TEMPORAL — no es comiteja. El vel, casa per casa, contra el que TOQUA (apaisat i vertical).
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const b = await chromium.launch();
const actives = ['miscellania', 'cube', 'first_contact', 'the_human_inside'];
const mides = [[1920, 946], [1366, 768], [768, 1024]];
for (const [w, h] of mides) {
  for (const act of actives) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
    await p.waitForTimeout(1500);
    await p.click('button:has(svg.lucide-search)').catch(() => {});
    await p.waitForTimeout(4500);
    const info = await p.evaluate(() => {
      const taula = document.querySelector('[data-taula-vertical="2"]');
      const arrel = taula || document.querySelector('[data-mega-page-viewport="2"]');
      const franja = arrel.querySelector('[data-stripe-visual-content="2"]');
      const r = franja.getBoundingClientRect();
      const cases = [...franja.querySelectorAll('[data-stripe-tile]')].map((el) => {
        const rr = el.getBoundingClientRect();
        return { i: Number(el.getAttribute('data-stripe-tile')), c: el.getAttribute('data-stripe-collection'), x: rr.left, y: rr.top, w: rr.width, h: rr.height };
      });
      window.__franja = franja;
      return { x: r.left, y: r.top, w: r.width, h: r.height, cases, taula: !!taula };
    });
    const clip = { x: Math.max(0, Math.round(info.x) - 4), y: Math.max(0, Math.round(info.y) - 4), width: Math.round(info.w) + 8, height: Math.round(info.h) + 8 };
    await p.screenshot({ path: '_tmp-cmp-on.png', clip });
    const amagats = await p.evaluate(() => {
      const franja = window.__franja;
      let n = 0;
      for (const im of franja.querySelectorAll('img')) {
        const s = im.getAttribute('src') || '';
        if (s.startsWith('data:image/svg+xml') && /fill-opacity="0\.6"/.test(decodeURIComponent(s))) { im.style.visibility = 'hidden'; n += 1; }
      }
      for (const x of franja.querySelectorAll('path[fill-opacity="0.6"]')) { x.style.visibility = 'hidden'; n += 1; }
      return n;
    });
    await p.waitForTimeout(250);
    await p.screenshot({ path: '_tmp-cmp-off.png', clip });
    const on = PNG.sync.read(readFileSync('_tmp-cmp-on.png'));
    const off = PNG.sync.read(readFileSync('_tmp-cmp-off.png'));
    const files = [];
    for (const c of info.cases.sort((a, b2) => a.i - b2.i)) {
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
      const te = m > 1.5;
      const toca = c.c && c.c !== act;
      if (te !== toca) files.push(`casa ${c.i}(${c.c}) ${te ? 'VEL' : 'sense vel'} pero tocava ${toca ? 'VEL' : 'sense vel'} (dif ${m.toFixed(2)})`);
    }
    console.log(`${String(w + 'x' + h).padEnd(9)} ${info.taula ? 'taula' : 'v2   '} active=${act.padEnd(16)} vel-amagats=${amagats} errades=${files.length}${files.length ? ' -> ' + files.join(' | ') : ''}`);
    await ctx.close();
  }
}
await b.close();
