// TEMPORAL — on arrenca i on acaba la tira de colors i el retall de la graella.
import { chromium } from '@playwright/test';
const w = Number(process.argv[2]), h = Number(process.argv[3]);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: w, height: h } });
const errors = [];
p.on('pageerror', (e) => errors.push(String(e.message).slice(0, 140)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 60000 });
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const m = (el) => {
    if (!el) return 'null';
    const x = el.getBoundingClientRect();
    return `${x.left.toFixed(1)} -> ${x.right.toFixed(1)}  (${x.width.toFixed(1)} ample, y ${x.top.toFixed(0)}->${x.bottom.toFixed(0)})`;
  };
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const q = (s) => v2.querySelector(s);
  const carrusel = q('[data-carrusel="1"]');
  const retall = carrusel ? [...carrusel.children].find((c) => getComputedStyle(c).overflow === 'hidden') : null;
  const grid = q('[data-p2-color-grid]');
  const barres = grid ? [...grid.querySelectorAll('[data-color-barra]')] : [];
  const filera = q('[data-p2-cercador-row]');
  const franja = q('[data-colleccions-franja="1"]');
  return {
    filera: m(filera),
    bcn: m(q('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')),
    carrusel: m(carrusel),
    retall: m(retall),
    retallMr: retall ? getComputedStyle(retall).marginRight : 'null',
    cela: m(q('[data-colleccions-franja-cella="1"]')),
    grid: m(grid),
    gridMr: grid ? getComputedStyle(grid).marginRight : 'null',
    barra1: m(barres[0]),
    barraN: m(barres[barres.length - 1]),
    franja: m(franja),
    stripe: m(q('[data-stripe-visual-content="2"]')),
  };
});
console.log(`${w}x${h}`);
for (const [k, v] of Object.entries(r)) console.log(`  ${k.padEnd(9)} ${v}`);
console.log('  errors=', errors.length);
await b.close();
