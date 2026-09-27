// TEMPORAL — no es comiteja. El megaslide s'obre COMPLET? (textos vs imatges)
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
await p.evaluate(() => {
  window.__m = [];
  const foto = () => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    if (v2) {
      const graella = v2.querySelector('[data-carrusel="1"] > div');
      const franja = v2.querySelector('[data-stripe-visual-content="2"]');
      const peces = graella ? [...graella.querySelectorAll('button')] : [];
      const textos = peces.filter((x) => x.querySelector('span')).length;
      const imgs = peces.filter((x) => { const i = x.querySelector('img'); return i && i.naturalWidth > 0; }).length;
      const imgFranja = franja ? franja.querySelector('img') : null;
      window.__m.push({
        t: Math.round(performance.now()),
        peces: peces.length,
        textos,
        imgs,
        franja: franja ? +franja.getBoundingClientRect().width.toFixed(1) : null,
        franjaImg: imgFranja ? imgFranja.naturalWidth : 0,
        tiles: v2.querySelectorAll('[data-stripe-tile]').length,
      });
    }
    if (window.__m.length < 900) requestAnimationFrame(() => window.setTimeout(foto, 0));
  };
  requestAnimationFrame(() => window.setTimeout(foto, 0));
});
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(3000);
const cru = await p.evaluate(() => window.__m);
const m = cru.filter((x) => x.peces);
console.log('mostres crues:', cru.length, 'amb peces:', m.length, 'visibilitat:', await p.evaluate(() => { const e = document.querySelector('[data-mega-panel-surface="1"]'); return e ? getComputedStyle(e.firstElementChild).visibility : null; }));
console.log(`mostres ${m.length}; primera t=${m[0]?.t}`);
let previ = null;
for (const x of m) {
  const clau = `${x.peces}|${x.textos}|${x.imgs}|${x.franja}|${x.franjaImg}|${x.tiles}`;
  if (clau !== previ) console.log(`  t=${String(x.t).padStart(5)} peces=${x.peces} amb_TEXT=${String(x.textos).padStart(3)} amb_IMG=${String(x.imgs).padStart(3)} franja=${x.franja} franjaImg=${x.franjaImg} tiles=${x.tiles}`);
  previ = clau;
}
await b.close();
