// TEMPORAL — no es comiteja. VERIFICACIO DELS RADIS amb fons magenta a sota de
// cada peça: aixi la corba es veu com un retall i es pot mesurar fila a fila.
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
  // Una capa magENTA DARRERE de cada peça (z-index negatiu dins el seu context)
  const pintaDarrere = (el) => {
    const pare = el.parentElement;
    const r = el.getBoundingClientRect();
    const pr = pare.getBoundingClientRect();
    const fons = document.createElement('div');
    fons.style.cssText = `position:absolute;left:${r.left - pr.left + pare.scrollLeft}px;top:${r.top - pr.top + pare.scrollTop}px;width:${r.width}px;height:${r.height}px;background:#f0f;z-index:0;pointer-events:none`;
    if (getComputedStyle(pare).position === 'static') pare.style.position = 'relative';
    pare.appendChild(fons);
    el.style.position = 'relative';
    el.style.zIndex = '1';
  };
  pintaDarrere(sel); pintaDarrere(col); pintaDarrere(act);
  const q = (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top }; };
  return { sel: q(sel), col: q(col), act: q(act), css: { sel: getComputedStyle(sel).borderRadius, col: getComputedStyle(col).borderRadius, act: getComputedStyle(act).borderRadius } };
});
console.log('declarat:', JSON.stringify(info.css));
await p.waitForTimeout(300);
const captures = [['selector', info.sel, 'sel'], ['columna', info.col, 'col'], ['pastilla de la columna', info.act, 'act']];
for (const [, xy, nom] of captures) {
  await p.screenshot({ path: `_tmp-vm-${nom}.png`, clip: { x: xy.x - 2, y: xy.y - 2, width: MIDA, height: MIDA } });
}
await ctx.close();
await b.close();

const esMagenta = (d, i) => d[i] > 200 && d[i + 1] < 80 && d[i + 2] > 200;
function perfil(fitxer) {
  const img = PNG.sync.read(readFileSync(fitxer));
  const { width, height, data } = img;
  // El magenta comenca a x=2px CSS (el marge de la captura). Miro, a cada fila,
  // on acaba el magenta (on comenca la peça).
  const inici = 2 * ESC;
  const files = [];
  for (let yc = 4; yc < 16; yc += 1) {
    const y = yc * ESC + Math.floor(ESC / 2);
    let x = inici;
    while (x < width && esMagenta(data, (y * width + x) * 4)) x += 1;
    files.push(+((x - inici) / ESC).toFixed(2));
  }
  return files;
}
const teoric = (R) => {
  const out = [];
  for (let yc = 4; yc < 16; yc += 1) {
    const y = (yc - 4) + 0.5;
    const dy = R - y;
    out.push(dy <= 0 ? 0 : +(R - Math.sqrt(Math.max(0, R * R - dy * dy))).toFixed(2));
  }
  return out;
};
console.log('--- ample de magenta per fila (px CSS; 0 = la peça hi arriba) ---');
for (const [et, , nom] of captures) console.log(et.padEnd(24), JSON.stringify(perfil(`_tmp-vm-${nom}.png`)));
console.log('--- teoric ---');
for (const R of [3, 5, 5.3, 5.5]) console.log(`radi ${R}`.padEnd(24), JSON.stringify(teoric(R)));
