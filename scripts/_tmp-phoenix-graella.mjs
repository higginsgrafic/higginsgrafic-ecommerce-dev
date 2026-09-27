// TEMPORAL — no es comiteja. El dibuix de The Phoenix a la GRAELLA: quina part
// de la seva casella ocupa, comparat amb els veins? (la mida de TINTA)
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(async () => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')].slice(0, 7);
  const mesures = [];
  for (const x of bs) {
    const img = x.querySelector('img');
    const src = img.currentSrc || img.src;
    const dades = await new Promise((res) => {
      const i = new Image();
      i.onload = () => {
        const c = document.createElement('canvas');
        c.width = i.naturalWidth; c.height = i.naturalHeight;
        const ctx = c.getContext('2d');
        ctx.drawImage(i, 0, 0);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
        for (let y = 0; y < c.height; y++) {
          for (let xx = 0; xx < c.width; xx++) {
            const k = (y * c.width + xx) * 4;
            const A = d[k + 3], R = d[k], G = d[k + 1], B = d[k + 2];
            if (A > 40 && (R < 240 || G < 240 || B < 240)) {
              if (xx < x0) x0 = xx; if (xx > x1) x1 = xx;
              if (y < y0) y0 = y; if (y > y1) y1 = y;
            }
          }
        }
        res({ ample: c.width, alt: c.height, tinta: x1 >= 0 ? { w: x1 - x0 + 1, h: y1 - y0 + 1 } : null });
      };
      i.onerror = () => res({ error: true });
      i.src = src;
    });
    const ib = img.getBoundingClientRect();
    mesures.push({
      lab: x.getAttribute('aria-label'),
      casella: `${Math.round(ib.width)}x${Math.round(ib.height)}`,
      natural: `${dades.ample}x${dades.alt}`,
      tinta: dades.tinta ? `${dades.tinta.w}x${dades.tinta.h}` : '?',
      // Quina part de la casella ocupa la tinta (ample).
      ocupacio: dades.tinta ? `${Math.round((dades.tinta.w / dades.ample) * 100)}%` : '?',
    });
  }
  return mesures;
});
for (const x of r) console.log(`${String(x.lab).padEnd(14)} casella=${x.casella.padEnd(8)} natural=${x.natural.padEnd(9)} tinta=${x.tinta.padEnd(9)} ocupa=${x.ocupacio}`);
await b.close();
