// TEMPORAL — no es comiteja. VERIFICACIO DELS RADIS, comparable a ull.
//
// Es captura la cantonada de DALT a l'ESQUERRA del selector i de la pastilla
// (que tenen l'exterior gris i el fons clar) a 12x, i al costat s'hi pinten
// corbes teoriques de radi 3, 5, 5.3 i 5.5 px amb el mateix zoom.
import { chromium } from '@playwright/test';
import { PNG } from 'pngjs';
import { readFileSync, writeFileSync } from 'node:fs';
const ESC = 12;
const Z = 2;            // les referencies, a 2x del mateix zoom
const MIDA = 26;        // px CSS de la captura de la cantonada
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
  const q = (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top }; };
  return {
    sel: q(sel), slider: q(slider),
    css: { sel: getComputedStyle(sel).borderRadius, slider: getComputedStyle(slider).borderRadius },
    dpr: window.devicePixelRatio,
  };
});
console.log('dpr', info.dpr, 'declarat', JSON.stringify(info.css));
await p.screenshot({ path: '_tmp-canto-sel.png', clip: { x: info.sel.x - 1, y: info.sel.y - 1, width: MIDA + 1, height: MIDA + 1 } });
await p.screenshot({ path: '_tmp-canto-past.png', clip: { x: info.slider.x - 1, y: info.slider.y - 1, width: MIDA + 1, height: MIDA + 1 } });
// Les referencies, en una pagina a 1:1
const p2 = await ctx.newPage();
await p2.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:#fff}</style></head><body>
<svg width="${MIDA * ESC}" height="${MIDA * ESC}" style="position:absolute;left:0;top:0">
  <defs>
    <mask id="m1"><rect width="100%" height="100%" fill="white"/><circle cx="${3 * ESC}" cy="${3 * ESC}" r="${3 * ESC}" fill="black"/></mask>
    <mask id="m2"><rect width="100%" height="100%" fill="white"/><circle cx="${5 * ESC}" cy="${5 * ESC}" r="${5 * ESC}" fill="black"/></mask>
    <mask id="m3"><rect width="100%" height="100%" fill="white"/><circle cx="${5.3 * ESC}" cy="${5.3 * ESC}" r="${5.3 * ESC}" fill="black"/></mask>
    <mask id="m4"><rect width="100%" height="100%" fill="white"/><circle cx="${5.5 * ESC}" cy="${5.5 * ESC}" r="${5.5 * ESC}" fill="black"/></mask>
  </defs>
  <rect width="100%" height="100%" fill="#9aa0a6" opacity="0.9" mask="url(#m1)"/>
</svg></body></html>`);
await p2.waitForTimeout(200);
const refs = {};
for (const [nom, r] of [['r3', 3], ['r5', 5], ['r53', 5.3], ['r55', 5.5]]) {
  await p2.evaluate((rr) => {
    document.querySelector('rect').setAttribute('mask', `url(#m${rr === 3 ? 1 : rr === 5 ? 2 : rr === 5.3 ? 3 : 4})`);
  }, r);
  await p2.waitForTimeout(80);
  await p2.screenshot({ path: `_tmp-ref-${nom}.png`, clip: { x: 0, y: 0, width: MIDA, height: MIDA } });
  refs[nom] = `_tmp-ref-${nom}.png`;
}
await ctx.close();
await b.close();

// --- Composicio: la cantonada real + les referencies, tot al mateix zoom ---
const W = MIDA * ESC;
const files = [['selector (5,3 declarat)', '_tmp-canto-sel.png'], ['pastilla (3 declarat)', '_tmp-canto-past.png'], ['ref 3 px', refs.r3], ['ref 5 px', refs.r5], ['ref 5,3 px', refs.r53], ['ref 5,5 px', refs.r55]];
const GAP = 30;
const out = new PNG({ width: files.length * W + (files.length + 1) * GAP, height: W + 2 * GAP });
out.data.fill(255);
files.forEach(([, f], i) => {
  const src = PNG.sync.read(readFileSync(f));
  const ox = GAP + i * (W + GAP);
  const oy = GAP;
  for (let y = 0; y < Math.min(W, src.height); y++) {
    for (let x = 0; x < Math.min(W, src.width); x++) {
      const si = (y * src.width + x) * 4;
      const di = ((oy + y) * out.width + (ox + x)) * 4;
      out.data[di] = src.data[si];
      out.data[di + 1] = src.data[si + 1];
      out.data[di + 2] = src.data[si + 2];
      out.data[di + 3] = 255;
    }
  }
});
writeFileSync('_tmp-radis-comparacio.png', PNG.sync.write(out));
console.log('desat _tmp-radis-comparacio.png (' + out.width + 'x' + out.height + '): ' + files.map(([n]) => n).join(' | '));
