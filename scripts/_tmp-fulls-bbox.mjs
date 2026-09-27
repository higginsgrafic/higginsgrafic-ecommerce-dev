// TEMPORAL — les caixes de les siluetes de cada full, en unitats del viewBox
// (2866x307), per veure quin encaixa amb la imatge.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
const FITXERS = [
  ['cercador (el del vel)', 'public/placeholders/cercador/full-clic-area-5.svg'],
  ['v5 (el de la mascara vella)', 'public/placeholders/t-shirt_buttons/v5/full-clic-area-5.svg'],
];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 800, height: 600 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'domcontentloaded', timeout: 180000 });
for (const [nom, fitxer] of FITXERS) {
  const text = readFileSync(fitxer, 'utf8');
  const r = await p.evaluate((svgTxt) => {
    const doc = new DOMParser().parseFromString(svgTxt, 'image/svg+xml');
    const svg = doc.documentElement;
    document.body.appendChild(svg);
    svg.setAttribute('width', '2866');
    svg.setAttribute('height', '307');
    const paths = [...svg.querySelectorAll('path')];
    const res = paths.map((x, i) => {
      const bb = x.getBBox();
      return { i, x: +bb.x.toFixed(1), y: +bb.y.toFixed(1), w: +bb.width.toFixed(1), h: +bb.height.toFixed(1) };
    });
    svg.remove();
    return { vb: svg.getAttribute('viewBox'), quants: paths.length, res };
  }, text);
  console.log(`--- ${nom}  (viewBox ${r.vb}, ${r.quants} camins)`);
  for (const c of r.res) console.log(`   cami ${String(c.i).padStart(2)}: x ${c.x} .. ${(c.x + c.w).toFixed(1)}   y ${c.y} .. ${(c.y + c.h).toFixed(1)}   (${c.w} x ${c.h})`);
}
await ctx.close();
await b.close();
