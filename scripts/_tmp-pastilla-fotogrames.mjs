// TEMPORAL (28/09/2026): fotogrames del selector BLANC/COLOR/NEGRE just despres
// de clicar LOOKING FOR MY DARCY, per veure on es pinta la pastilla blanca a
// cada fotograma. Desa els retalls i un JSON amb la caixa del selector.
// Us: node scripts/_tmp-pastilla-fotogrames.mjs [etiqueta]
import { chromium } from '@playwright/test';

const etiqueta = process.argv[2] || 'dansa';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);

// El selector VISIBLE: el que te el centre de la seva caixa dins la pantalla.
const caixa = await p.evaluate(() => {
  const bars = [...document.querySelectorAll('[data-stripe-buttonbar]')];
  const dins = bars.map((bar, i) => {
    const r = bar.getBoundingClientRect();
    const dinsPantalla = r.left >= 0 && r.top >= 0 && r.right <= innerWidth && r.bottom <= innerHeight;
    return { i, r: { x: r.left, y: r.top, w: r.width, h: r.height }, dinsPantalla };
  }).filter((x) => x.dinsPantalla && x.r.w > 5);
  return { triat: dins[0] || null, tots: dins.map((d) => d.i) };
});
console.log('selectors dins la pantalla:', JSON.stringify(caixa.tots), 'triat:', caixa.triat ? caixa.triat.i : null);
if (!caixa.triat) { console.log('cap selector dins la pantalla'); await b.close(); process.exit(1); }

const clip = { x: Math.round(caixa.triat.r.x), y: Math.round(caixa.triat.r.y), width: Math.round(caixa.triat.r.w), height: Math.round(caixa.triat.r.h) };
const idx = await p.evaluate(() => [...document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')]
  .findIndex((x) => x.textContent.trim().toUpperCase().startsWith('LOOKING')));

// Un fotograma abans i una tongada just despres del clic.
await p.screenshot({ path: `_tmp-${etiqueta}-f00.png`, clip });
await p.evaluate((i) => document.querySelector('[data-colleccions-caixes="1"]').querySelectorAll('button')[i].click(), idx);
for (let k = 1; k <= 12; k += 1) {
  await p.screenshot({ path: `_tmp-${etiqueta}-f${String(k).padStart(2, '0')}.png`, clip });
}
await p.waitForTimeout(1500);
await p.screenshot({ path: `_tmp-${etiqueta}-f99.png`, clip });
console.log('desats 14 retalls', JSON.stringify(clip));
await b.close();
