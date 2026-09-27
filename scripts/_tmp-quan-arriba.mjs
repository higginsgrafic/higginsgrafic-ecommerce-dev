// TEMPORAL — no es comiteja. Amb quina opacitat del panell arriba la correccio de la graella?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
const files = [];
for (let k = 0; k < 50; k++) {
  const s = await p.evaluate(() => {
    const panell = document.querySelector('[data-mega-panel-surface="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const car = v2 ? v2.querySelector('[data-carrusel="1"]') : null;
    const retall = car ? car.firstElementChild : null;
    const tira = retall ? retall.firstElementChild : null;
    const tiles = tira ? [...tira.children].slice(0, 2) : [];
    const top = (el) => (el ? el.getBoundingClientRect().top : null);
    return {
      op: panell ? Number(getComputedStyle(panell).opacity).toFixed(2) : '?',
      d01: tiles.length === 2 ? +(top(tiles[1]) - top(tiles[0])).toFixed(2) : null,
    };
  }).catch(() => null);
  if (s) files.push(s);
  await p.waitForTimeout(8);
}
let previ = null;
for (const [i, f] of files.entries()) {
  if (f.d01 !== previ) { console.log(`mostra ${String(i).padStart(2)} (${i * 8}ms) opacitat ${f.op} desnivell ${f.d01}`); previ = f.d01; }
}
console.log('mostres', files.length);
await ctx.close();
await b.close();
