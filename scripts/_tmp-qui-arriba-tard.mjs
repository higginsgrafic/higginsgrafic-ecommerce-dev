// TEMPORAL — no es comiteja. Quins valors canvien DESPRES del primer pintat?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
const files = [];
for (let k = 0; k < 60; k++) {
  const s = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    if (!v2) return null;
    const car = v2.querySelector('[data-carrusel="1"]');
    const retall = car ? car.firstElementChild : null;
    const tira = retall ? retall.firstElementChild : null;
    const tiles = tira ? [...tira.children].slice(0, 4) : [];
    const row = v2.querySelector('[data-p2-cercador-row]');
    const sel = v2.querySelector('[data-p2-color-selector] button[aria-label="Color"]');
    const franja = v2.querySelector('[data-stripe-visual-content="2"]');
    const r = (el) => { if (!el) return null; const rr = el.getBoundingClientRect(); return `${rr.left.toFixed(1)},${rr.top.toFixed(1)} ${rr.width.toFixed(1)}x${rr.height.toFixed(1)}`; };
    const rr = retall ? retall.getBoundingClientRect() : null;
    return {
      retall: r(retall),
      alçada: rr ? rr.height.toFixed(2) : null,
      t0: r(tiles[0]), t1: r(tiles[1]), t2: r(tiles[2]),
      filera: r(row), selector: r(sel), franja: r(franja),
    };
  }).catch(() => null);
  if (s) files.push(s);
  await p.waitForTimeout(16);
}
let previ = null;
for (const [i, f] of files.entries()) {
  const clau = JSON.stringify(f);
  if (clau !== previ) {
    console.log(`mostra ${i}`);
    for (const [k, v] of Object.entries(f)) if (k !== 'alçada' || true) console.log(`   ${k}: ${v}`);
    previ = clau;
  }
}
console.log('--- fi; estats', new Set(files.map((f) => JSON.stringify(f))).size);
await ctx.close();
await b.close();
