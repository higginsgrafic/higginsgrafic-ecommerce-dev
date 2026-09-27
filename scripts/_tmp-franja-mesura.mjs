// TEMPORAL — no es comiteja. Mesura la capa de dibuixos de la franja: finestres,
// mides i transformades, i comenca a mirar si el retall es pot moure.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4000);

const r = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v.querySelector('[data-stripe-visual-content="2"]');
  const ple = cont.getBoundingClientRect();
  const tiles = [...cont.querySelectorAll('div')].filter((d) => {
    const s = d.style;
    return s.position === 'absolute' && s.overflow === 'hidden' && s.width && s.width.endsWith('%') && d.querySelector(':scope > img');
  });
  return {
    contenidor: [+ple.left.toFixed(1), +ple.top.toFixed(1), +ple.width.toFixed(1), +ple.height.toFixed(1)],
    mascara: getComputedStyle(cont.querySelector('div[style*="clip-path"]') || cont).clipPath,
    nTiles: tiles.length,
    tiles: tiles.map((d, i) => {
      const b = d.getBoundingClientRect();
      const img = d.querySelector(':scope > img');
      const ib = img.getBoundingClientRect();
      return {
        i,
        finestra: [+b.left.toFixed(2), +b.width.toFixed(2), +(b.left - ple.left).toFixed(2)],
        img: (img.currentSrc || img.src || '').split('/').slice(-1)[0],
        imgBox: [+ib.left.toFixed(2), +ib.width.toFixed(2)],
        transform: getComputedStyle(img).transform,
      };
    }),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
