// TEMPORAL — no es comiteja. CARREGAR amb ?active= : el contingut es veu ABANS d'estar a punt?
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
      const vt = getComputedStyle(panell).transform;
      window.__m.push({
        t: Math.round(performance.now()),
        op: +op.toFixed(2),
        vt,
        textos: peces.filter((x) => x.querySelector('span')).length,
        imgs: peces.filter((x) => { const i = x.querySelector('img'); return i && i.naturalWidth > 0; }).length,
        franja: franja ? Math.round(franja.getBoundingClientRect().width) : null,
        franjaImg: franja && franja.querySelector('img') ? franja.querySelector('img').naturalWidth : 0,
      });
    }
    if (window.__m.length < 600) requestAnimationFrame(() => window.setTimeout(foto, 0));
  };
  requestAnimationFrame(() => window.setTimeout(foto, 0));
});
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const m = (await p.evaluate(() => window.__m)).filter((x) => x.franja != null);
console.log(`mostres ${m.length}; primera t=${m[0]?.t}`);
let previ = null;
for (const x of m) {
  const clau = `${x.op}|${x.vt}|${x.textos}|${x.imgs}|${x.franja}|${x.franjaImg}`;
  if (clau !== previ) console.log(`  t=${String(x.t).padStart(5)} opacitat=${x.op} transform=${x.vt} | textos=${x.textos} imgs=${x.imgs}/128 | franja=${x.franja} franjaImg=${x.franjaImg}`);
  previ = clau;
}
await b.close();
