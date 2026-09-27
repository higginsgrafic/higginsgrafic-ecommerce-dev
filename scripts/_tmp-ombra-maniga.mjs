// TEMPORAL — l'ombra de la maniga (A3): on es, a quin z, i si es veu.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 4 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const info = await p.evaluate(() => {
  const ombra = document.querySelector('[data-maniga-ombra="1"]');
  const franja = document.querySelector('[data-stripe-visual-content="2"]');
  const col = document.querySelector('[data-colleccions-targeta]')?.parentElement;
  const q = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [+r.left.toFixed(1), +r.top.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; };
  // la cadena de z de l'ombra cap amunt
  const cami = [];
  let e = ombra;
  while (e && e !== document.body) {
    const cs = getComputedStyle(e);
    cami.push(`${e.tagName}.${String(e.className || '').slice(0, 16)}[z=${cs.zIndex} pos=${cs.position}]`);
    e = e.parentElement;
  }
  const csOmbra = ombra ? getComputedStyle(ombra) : null;
  return {
    ombra: q(ombra),
    ombraCS: csOmbra ? { z: csOmbra.zIndex, bg: csOmbra.backgroundImage.slice(0, 80), width: csOmbra.width, transform: csOmbra.transform } : null,
    franja: q(franja),
    columna: q(col),
    cami,
    // qui es a sobre de la costura
    qui: [1403, 300, 1408, 300, 1411, 300].map((x) => {
      const el = document.elementFromPoint(x, 300);
      return `${x}:${el ? el.tagName + '.' + String(el.className || '').slice(0, 18) + '[z=' + getComputedStyle(el).zIndex + ']' : '?'}`;
    }),
  };
});
console.log(JSON.stringify(info, null, 1));
const clip = { x: 1380, y: 240, width: 60, height: 120 };
const buf = await p.screenshot({ clip });
const png = PNG.sync.read(buf);
const px = (x, y) => { const i = (y * png.width + x) * 4; return [png.data[i], png.data[i + 1], png.data[i + 2]]; };
let linia = '';
for (let x = 1390; x <= 1416; x++) linia += `${x}:${JSON.stringify(px(Math.round((x - clip.x) * 4), Math.round((300 - clip.y) * 4)))} `;
console.log('y=300 (4x):', linia);
let linia2 = '';
for (let x = 1390; x <= 1416; x++) linia2 += `${x}:${JSON.stringify(px(Math.round((x - clip.x) * 4), Math.round((260 - clip.y) * 4)))} `;
console.log('y=260 (4x):', linia2);
await p.screenshot({ path: '_tmp-ombra-maniga.png', clip });
console.log('desat _tmp-ombra-maniga.png');
await ctx.close();
await b.close();
