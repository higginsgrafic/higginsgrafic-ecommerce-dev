// TEMPORAL — no es comiteja. Els desnivells de les dues files son els finals des del primer pintat?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
const estats = new Set();
const mostres = [];
for (let k = 0; k < 60; k++) {
  const s = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    if (!v2) return null;
    const car = v2.querySelector('[data-carrusel="1"]');
    const retall = car ? car.firstElementChild : null;
    const tira = retall ? retall.firstElementChild : null;
    const tiles = tira ? [...tira.children].slice(0, 3) : [];
    const top = (el) => (el ? el.getBoundingClientRect().top : null);
    const rr = retall ? retall.getBoundingClientRect() : null;
    return { retallTop: rr ? +rr.top.toFixed(2) : null, retallH: rr ? +rr.height.toFixed(2) : null, d01: +(top(tiles[1]) - top(tiles[0])).toFixed(2), d02: +(top(tiles[2]) - top(tiles[0])).toFixed(2), ample: tiles[0] ? +tiles[0].getBoundingClientRect().width.toFixed(2) : null };
  }).catch(() => null);
  if (s) { estats.add(JSON.stringify({ d01: s.d01, d02: s.d02, ample: s.ample, retallH: s.retallH })); mostres.push(s); }
  await p.waitForTimeout(16);
}
console.log('estats diferents (desnivells, amplada de peça, alcada del retall):', estats.size);
for (const e of estats) console.log('   ', e);
console.log('primeres mostres:', JSON.stringify(mostres.slice(0, 3)));
console.log('ultimes mostres:', JSON.stringify(mostres.slice(-2)));
await ctx.close();
await b.close();
