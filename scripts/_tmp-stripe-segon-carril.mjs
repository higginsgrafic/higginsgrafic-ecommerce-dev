// LA STRIPE I EL SEGON CARRIL (02/10/2026).
//
// En Marc: «Acaba d'alinear la stripe a la mida del segon carril». Aquest
// script encen les guies (?carril=1) i mesura, a cada mida:
//
//   - les DUES guies del carril de la pagina (les verdes);
//   - la stripe de la p1 i la de la p2 (`data-stripe-visual-content`);
//   - el bloc de la dreta de la p1.
//
// Tot en coordenades de finestra, que son les que fan servir les guies fixes.
import { chromium } from '@playwright/test';
const w = Number(process.argv[2] || 1024), h = Number(process.argv[3] || 768);
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact&carril=1', { waitUntil: 'load', timeout: 180000 });
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const q = (el) => {
    if (!el) return null;
    const x = el.getBoundingClientRect();
    return { x: +x.left.toFixed(2), d: +x.right.toFixed(2), w: +x.width.toFixed(2) };
  };
  const guia = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const x = el.getBoundingClientRect();
    return +x.left.toFixed(2);
  };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  return {
    guiaPaginaEsq: guia('[data-guia-carril-pagina="esq"]'),
    guiaPaginaDret: guia('[data-guia-carril-pagina="dret"]'),
    guiaMegaEsq: guia('[data-guia-carril="esq"]'),
    guiaMegaDret: guia('[data-guia-carril="dret"]'),
    stripeP1: q(v1.querySelector('[data-stripe-visual-content="1"]')),
    stripeP2: q(v2 ? v2.querySelector('[data-stripe-visual-content="2"]') : null),
    blocP1: q(v1.querySelector('[data-bloc-dreta-p1]')),
    pecesP1: [...(v1.querySelector('[data-bloc-dreta-p1]')?.children[1]?.children || [])].map(q),
  };
});
console.log(`${w}x${h}`);
console.log(JSON.stringify(r, null, 1));
const c = r.guiaPaginaEsq, d = r.guiaPaginaDret;
if (c != null && d != null) {
  for (const [k, v] of [['stripeP1', r.stripeP1], ['stripeP2', r.stripeP2], ['blocP1', r.blocP1]]) {
    if (!v) continue;
    console.log(`${k}: esq ${(v.x - c).toFixed(2)}  dreta ${(v.d - d).toFixed(2)}  ample ${(v.w - (d - c)).toFixed(2)}`);
  }
}
await ctx.close();
await b.close();
