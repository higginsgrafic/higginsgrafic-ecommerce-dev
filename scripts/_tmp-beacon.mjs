// TEMPORAL — no es coiteja. La LLEI de la cantonada, verificada amb pixels.
//
// En una cantonada de radi R: el nombre de columnes/pixels que falten a la
// fila 0 respecte la vora es una mesura del radi, pero la manera FINA es
// mirar, per a cada fila y (0..R), quantes columnes falten: falta(y) =
// R - sqrt(R^2 - (R-y)^2). Aixo ho comparo amb el que hauria de donar cada
// radi i ho resolc pel radi que hi encaixa.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const ESC = 8;
const RADIS = [3, 5, 5.3, 5.5, 6];
// Taula teorica: per a cada radi, el perfil de la cantonada
const perfils = {};
for (const R of RADIS) {
  const p = [];
  for (let y = 0; y <= Math.ceil(R * 2); y += 1) {
    const dy = R - (y + 0.5);
    const dins = dy >= 0 ? R * R - dy * dy : R * R;
    const x = dy > 0 ? R - Math.sqrt(Math.max(0, dins)) : 0;
    p.push(+x.toFixed(3));
  }
  perfils[R] = p;
}
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: ESC });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
const info = await p.evaluate((ESC) => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const slider = [...sel.children].find((c) => c.tagName === 'SPAN');
  const col = v2.querySelector('[data-colleccions-targeta]').parentElement;
  const m = (e) => { const r = e.getBoundingClientRect(); return { x: +(r.left * ESC).toFixed(1), y: +(r.top * ESC).toFixed(1), w: +(r.width * ESC).toFixed(1), h: +(r.height * ESC).toFixed(1), css: { w: +r.width.toFixed(2), h: +r.height.toFixed(2) }, radius: getComputedStyle(e).borderRadius }; };
  return {
    devicePixelRatio: window.devicePixelRatio,
    sel: m(sel), slider: m(slider), col: m(col),
    declared: { sel: getComputedStyle(sel).borderRadius, slider: getComputedStyle(slider).borderRadius, col: getComputedStyle(col).borderRadius },
  };
}, ESC);
console.log('devicePixelRatio', info.devicePixelRatio);
console.log('selector  ', JSON.stringify(info.sel));
console.log('pastilla  ', JSON.stringify(info.slider));
console.log('columna   ', JSON.stringify(info.col));
console.log('declarat  ', JSON.stringify(info.declared));
console.log('--- perfils teorics (px que falten a cada fila, en px CSS) ---');
for (const R of RADIS) console.log(`R=${R}`.padEnd(6), perfils[R].slice(0, 14).join(' '));
await ctx.close();
await b.close();
