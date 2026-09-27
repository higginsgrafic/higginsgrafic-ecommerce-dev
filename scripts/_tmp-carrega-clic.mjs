// TEMPORAL — no es comiteja. El MATEIX comptador, pero obrint amb el CLIC de cerca.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
await ctx.addInitScript(() => {
  window.__m = [];
  const foto = () => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const panell = document.querySelector('[data-mega-panel-surface="1"]');
    if (v2 && panell) {
      const graella = v2.querySelector('[data-carrusel="1"] > div');
      const franja = v2.querySelector('[data-stripe-visual-content="2"]');
      const peces = graella ? [...graella.querySelectorAll('button')] : [];
      const op = Number.parseFloat(getComputedStyle(panell).opacity);
      window.__m.push({
        t: Math.round(performance.now()),
        op: +op.toFixed(2),
        textos: peces.filter((x) => x.querySelector('span')).length,
        imgs: peces.filter((x) => { const i = x.querySelector('img'); return i && i.naturalWidth > 0; }).length,
        franjaImg: franja && franja.querySelector('img') ? franja.querySelector('img').naturalWidth : 0,
      });
    }
    if (window.__m.length < 600) requestAnimationFrame(() => window.setTimeout(foto, 0));
  };
  requestAnimationFrame(() => window.setTimeout(foto, 0));
});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(1200);
await p.click('button:has(svg.lucide-search)');
await p.waitForTimeout(4000);
const m = await p.evaluate(() => window.__m);
const primera = m[0];
const visible = m.find((x) => x.op > 0);
console.log(`mostres ${m.length}`);
console.log(`  PRIMER   t=${primera?.t} op=${primera?.op} textos=${primera?.textos} imgs=${primera?.imgs}/128 franjaImg=${primera?.franjaImg}`);
console.log(`  VISIBLE  t=${visible?.t} op=${visible?.op} textos=${visible?.textos} imgs=${visible?.imgs}/128 franjaImg=${visible?.franjaImg}`);
await b.close();
