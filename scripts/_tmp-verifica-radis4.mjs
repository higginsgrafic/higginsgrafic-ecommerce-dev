// TEMPORAL — no es comiteja. VERIFICACIO NUMERICA DELS RADIS.
//
// A 8x, es mira la cantonada de dalt a l'esquerra del selector i de la pastilla
// i, fila per fila (en px CSS), es mesura quantes columnes falten fins que
// comenca la superficie pintada. El radi es el nombre de files amb corba, i es
// compara amb la corba teorica de 3 / 5 / 5,3 / 5,5 px.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const ESC = 8;
const MIDA = 24;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: ESC });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
const info = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const slider = [...sel.children].find((c) => c.tagName === 'SPAN');
  const col = v2.querySelector('[data-colleccions-targeta]').parentElement;
  const act = [...v2.querySelectorAll('[data-colleccions-targeta]')].find((x) => x.getAttribute('aria-current') === 'true');
  const q = (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top }; };
  return {
    sel: q(sel), slider: q(slider), col: q(col), act: q(act),
    css: { sel: getComputedStyle(sel).borderRadius, slider: getComputedStyle(slider).borderRadius, col: getComputedStyle(col).borderRadius, act: getComputedStyle(act).borderRadius },
  };
});
console.log('declarat:', JSON.stringify(info.css));
const captures = [
  ['selector (contenidor)', info.sel, 'sel'],
  ['pastilla blanca del selector', info.slider, 'past'],
  ['columna de colleccions', info.col, 'col'],
  ['pastilla blanca de la columna', info.act, 'act'],
];
for (const [, xy, nom] of captures) {
  await p.screenshot({ path: `_tmp-vc-${nom}.png`, clip: { x: xy.x, y: xy.y, width: MIDA, height: MIDA } });
}
await ctx.close();
await b.close();

// --- La corba, fila a fila ---
function perfil(fitxer) {
  const img = PNG.sync.read(readFileSync(fitxer));
  const { width, height, data } = img;
  // El fons de la captura es el de sota l'element (blanc o gris clar). La
  // superficie de l'element te un to diferent (gris #F3F4F6 o blanc amb vora).
  // Prenem com a "pintat" el primer pixel que NO es el fons de la cantonada
  // (el pixel 0,0 de la captura).
  const fons = [data[0], data[1], data[2]];
  const esFons = (x, y) => {
    const i = (y * width + x) * 4;
    return Math.abs(data[i] - fons[0]) <= 2 && Math.abs(data[i + 1] - fons[1]) <= 2 && Math.abs(data[i + 2] - fons[2]) <= 2;
  };
  const files = [];
  for (let yc = 0; yc < 12; yc += 1) {
    const y = yc * ESC + Math.floor(ESC / 2);
    let x = 0;
    while (x < width && esFons(x, y)) x += 1;
    files.push(+(x / ESC).toFixed(2));
  }
  return files;
}
const teoric = (R) => {
  const out = [];
  for (let yc = 0; yc < 12; yc += 1) {
    const y = yc + 0.5;
    const dy = R - y;
    out.push(dy <= 0 ? 0 : +(R - Math.sqrt(Math.max(0, R * R - dy * dy))).toFixed(2));
  }
  return out;
};
console.log('--- FILES AMB CORBA (px CSS que falten a cada fila) ---');
for (const [et, , nom] of captures) {
  console.log(et.padEnd(30), JSON.stringify(perfil(`_tmp-vc-${nom}.png`)));
}
console.log('--- TEORIC ---');
for (const R of [3, 5, 5.3, 5.5]) console.log(`radi ${R}`.padEnd(30), JSON.stringify(teoric(R)));
