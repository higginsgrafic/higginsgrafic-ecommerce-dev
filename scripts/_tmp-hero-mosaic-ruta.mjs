// TEMPORAL: el mosaic amb la ruta de l'inici NOU.
import { chromium } from '@playwright/test';
import { writeFileSync } from 'node:fs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/browser-overlay.html?ruta=/nova/inici', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(15000);
const d = await p.evaluate(() => [...document.querySelectorAll('iframe')].map((f, i) => {
  const out = { i, src: f.getAttribute('src') };
  try {
    const doc = f.contentDocument; const win = doc?.defaultView;
    const c = doc?.querySelector('[data-hero-caixa="1"]');
    const r = c?.getBoundingClientRect(); const vh = win?.innerHeight;
    out.heroNou = !!c;
    out.vh = vh;
    out.hero = r ? `${+r.top.toFixed(1)}..${+r.bottom.toFixed(1)}` : null;
    out.baix = r && vh ? +(vh - r.bottom).toFixed(1) : null;
  } catch (e) { out.error = e.message; }
  return out;
}));
console.table(d);
writeFileSync('_tmp-mosaic-inici-nou.png', await p.screenshot());
console.log('captura: _tmp-mosaic-inici-nou.png');
await ctx.close();
await b.close();
