import { chromium } from '@playwright/test';
import { FRACCIO_COSSOS_FRANJA, FRACCIO_MARGE_ESQUERRE_FRANJA } from '../src/config/stripeCalibrations.js';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(3000);
const boto = await p.evaluateHandle(() => [...document.querySelectorAll('header button')].find((e) => /THE HUMAN INSIDE/i.test(e.textContent || '')));
await boto.asElement().click();
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const bx = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [+b.left.toFixed(1), +b.top.toFixed(1), +b.right.toFixed(1), +b.bottom.toFixed(1)]; };
  const out = {};
  document.querySelectorAll('[data-mega-page-viewport]').forEach((v) => {
    const n = v.getAttribute('data-mega-page-viewport');
    const bb = v.getBoundingClientRect();
    const f = v.querySelector('[data-stripe-visual-content]');
    out[n] = {
      vista: [+bb.left.toFixed(0), +bb.width.toFixed(0)],
      franja: bx(f), t: f ? getComputedStyle(f).transform : null,
      fletxa: bx(v.querySelector('#stripe-guide-right-arrow')),
      selector: bx(v.querySelector('[data-stripe-buttonbar="bn"]')),
      linies: (() => { const c = v.querySelector('[data-carrusel="1"]'); if (!c) return null; const t = c.firstElementChild.firstElementChild; const cs = [...t.querySelectorAll('button')].map((x) => x.getBoundingClientRect()); return [...new Set(cs.map((x) => +x.top.toFixed(1)))].sort((a, bb2) => a - bb2); })(),
    };
  });
  out.carril = bx(document.querySelector('[data-capcalera-fila="1"]'));
  return out;
});
console.log(JSON.stringify(r, null, 1));
for (const [n, v] of Object.entries(r)) {
  if (n === 'carril' || !v) continue;
  const f = v.franja;
  if (!f) continue;
  const w = f[2] - f[0];
  const esq = f[0] + w * FRACCIO_MARGE_ESQUERRE_FRANJA;
  const dret = esq + w * FRACCIO_COSSOS_FRANJA;
  console.log(n, 'cintures', esq.toFixed(1), '..', dret.toFixed(1), '| carril', r.carril[0], '..', r.carril[2], '| fletxa', v.fletxa ? v.fletxa[2] : null);
}
await p.screenshot({ path: '/tmp/p1-activa.png', clip: { x: 300, y: 60, width: 1300, height: 330 } });
await b.close();
