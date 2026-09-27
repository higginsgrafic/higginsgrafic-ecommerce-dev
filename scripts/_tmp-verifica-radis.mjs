// TEMPORAL — no es comiteja. VERIFICACIO DELS RADIS: es pinta el selector i la
// columna a 8x i es mesura el radi REAL de la cantonada (on arrenca i on acaba
// la corba), en px CSS, perque es pugui comparar amb la mesura de l'amo.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const ESC = 8;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: ESC });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
const d = await p.evaluate((ESC) => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const slider = [...sel.children].find((c) => c.tagName === 'SPAN');
  const col = v2.querySelector('[data-colleccions-targeta]').parentElement;
  const activa = [...v2.querySelectorAll('[data-colleccions-targeta]')].find((x) => x.getAttribute('aria-current') === 'true');
  const q = (e, marge = 2) => { const r = e.getBoundingClientRect(); return { x: Math.floor((r.left - marge) * ESC), y: Math.floor((r.top - marge) * ESC), w: Math.ceil((r.width + marge * 2) * ESC), h: Math.ceil((r.height + marge * 2) * ESC), left: r.left, top: r.top }; };
  return {
    sel: q(sel),
    slider: q(slider),
    col: q(col),
    activa: q(activa),
    declared: {
      sel: getComputedStyle(sel).borderRadius,
      slider: getComputedStyle(slider).borderRadius,
      col: getComputedStyle(col).borderRadius,
      activa: getComputedStyle(activa).borderRadius,
    },
  };
}, ESC);
console.log('declarat', JSON.stringify(d.declared));
console.log('caixes', JSON.stringify({ sel: [d.sel.left, d.sel.top], slider: [d.slider.left, d.slider.top], col: [d.col.left, d.col.top], activa: [d.activa.left, d.activa.top] }));
const captures = { selector: d.sel, pastilla: d.slider, columna: d.col };
for (const [nom, c] of Object.entries(captures)) {
  await p.screenshot({ path: `_tmp-canto-${nom}.png`, clip: { x: c.x / ESC, y: c.y / ESC, width: c.w / ESC, height: c.h / ESC } });
}
await ctx.close();
await b.close();

// --- Mesura de la corba a cada captura ---
// Una cantonada rodona de radi R: a la fila 0 de dalt, la superficie pintada
// comenca a x = R; a la primera columna, comenca a y = R. Amb l'escala ESC.
function mesuraCanto(fitxer, ampleCss, alcadaCss) {
  const img = PNG.sync.read(readFileSync(fitxer));
  const { width, height, data } = img;
  const pintat = (x, y) => {
    const i = (y * width + x) * 4;
    // El fons de la captura es blanc pur; el fons del selector es #F3F4F6 i el
    // de la pastilla #FFFFFF amb vora #D1D5DB. Comparem amb el blanc de fora.
    return !(data[i] > 250 && data[i + 1] > 250 && data[i + 2] > 250);
  };
  const marge = 2 * ESC;
  // Fila de dalt de la caixa pintada
  let files = null;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) { if (pintat(x, y)) { files = y; break; } }
    if (files !== null) break;
  }
  let col = null;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) { if (pintat(x, y)) { col = x; break; } }
    if (col !== null) break;
  }
  // A la fila de dalt, on comenca la superficie (respecte l'esquerra pintada)
  let iniciDalt = null;
  for (let x = col; x < width; x++) { if (pintat(x, files)) { iniciDalt = x; break; } }
  // A la columna esquerra, on comenca (respecte dalt pintat)
  let iniciEsq = null;
  for (let y = files; y < height; y++) { if (pintat(col, y)) { iniciEsq = y; break; } }
  const radiX = (iniciDalt - col) / ESC;
  const radiY = (iniciEsq - files) / ESC;
  // Tambe mesurem el "gruix" de la corba a la diagonal: quantes files passen
  // abans que la superficie arrenqui a la vora esquerra pintada.
  return { fitxer, ampleCss, alcadaCss, radiX: +radiX.toFixed(2), radiY: +radiY.toFixed(2) };
}
console.log('--- RADI MESURAT (px CSS) ---');
for (const [nom] of Object.entries(captures)) {
  const m = mesuraCanto(`_tmp-canto-${nom}.png`, 0, 0);
  console.log(nom.padEnd(10), JSON.stringify(m));
}
