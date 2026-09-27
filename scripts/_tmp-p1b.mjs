import { chromium } from '@playwright/test';
import { FRACCIO_COSSOS_FRANJA, FRACCIO_MARGE_ESQUERRE_FRANJA } from '../src/config/stripeCalibrations.js';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const bx = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [+b.left.toFixed(1), +b.top.toFixed(1), +b.right.toFixed(1), +b.bottom.toFixed(1)]; };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const f1 = v1 ? v1.querySelector('[data-stripe-visual-content="1"]') : null;
  const f2 = v2 ? v2.querySelector('[data-stripe-visual-content="2"]') : null;
  return {
    v1: bx(v1), v2: bx(v2),
    franja1: bx(f1), t1: f1 ? getComputedStyle(f1).transform : null,
    franja2: bx(f2), t2: f2 ? getComputedStyle(f2).transform : null,
    fletxa1: bx(v1 ? v1.querySelector('#stripe-guide-right-arrow') : null),
    fletxa2: bx(v2 ? v2.querySelector('#stripe-guide-right-arrow') : null),
    selector1: bx(v1 ? v1.querySelector('[data-stripe-buttonbar="bn"]') : null),
    carril: bx(document.querySelector('[data-capcalera-fila="1"]')),
    linies1: (() => { const c = v1 ? v1.querySelector('[data-carrusel="1"]') : null; if (!c) return null; const t = c.firstElementChild.firstElementChild; const cs = [...t.querySelectorAll('button')].map((x) => x.getBoundingClientRect()); return [...new Set(cs.map((x) => +x.top.toFixed(1)))].sort((a, bb) => a - bb); })(),
  };
});
console.log(JSON.stringify(r, null, 1));
for (const [nom, f] of [['p1', r.franja1], ['p2', r.franja2]]) {
  if (!f) continue;
  const w = f[2] - f[0];
  const esq = f[0] + w * FRACCIO_MARGE_ESQUERRE_FRANJA;
  const dret = esq + w * FRACCIO_COSSOS_FRANJA;
  console.log(nom, 'cintures', esq.toFixed(1), '..', dret.toFixed(1), '| carril', r.carril[0], '..', r.carril[2]);
}
await b.close();
