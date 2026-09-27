import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4000);
const foto = () => p.evaluate(() => {
  const bx = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return [+b.top.toFixed(1), +b.left.toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)]; };
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  return {
    panell: bx('[data-mega-panel-surface="1"]'),
    selector: bx('[data-p2-color-selector] [data-stripe-buttonbar="bn"]'),
    fletxes: bx('#stripe-guide-right-arrow'),
    filera: bx('[data-p2-cercador-row]'),
    colors: bx('[data-p2-color-grid]'),
    franja: bx('[data-stripe-visual-content="2"]'),
    fletxaEsq: bx('#stripe-guide-right-arrow'),
    peces: v ? v.querySelectorAll('[data-carrusel="1"] button').length : 0,
    transform: v ? getComputedStyle(v.querySelector('[data-carrusel="1"] > div > div')).transform : null,
  };
});
const a = await foto();
console.log('montat', JSON.stringify(a));
const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-colleccions-targeta]')].find((e) => /CUBE/i.test(e.textContent || '')));
await card.asElement().click();
await p.waitForTimeout(250); console.log('250ms ', JSON.stringify((await foto()).transform));
await p.waitForTimeout(1000); console.log('1,3s  ', JSON.stringify((await foto()).transform));
await p.waitForTimeout(2500);
const c = await foto();
console.log('despres', JSON.stringify(c));
for (const k of Object.keys(a)) {
  if (k === 'peces' || k === 'transform') continue;
  const x = a[k]; const y = c[k];
  if (!x || !y) continue;
  const d = y.map((v, i) => +(v - x[i]).toFixed(1));
  if (d.some((v) => Math.abs(v) > 0.5)) console.log(`MOGA ${k}: ${JSON.stringify(x)} -> ${JSON.stringify(y)}  (d ${JSON.stringify(d)})`);
}
await b.close();
