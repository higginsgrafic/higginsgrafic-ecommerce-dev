// LA PAGINA 2 A 1024: ANATOMIA I CARRILS (02/10/2026).
//
// En Marc: «Ara hem de fer la p2 de la 1024». Aquest guio mesura, amb la
// pagina 2 al davant i les segones guies enceses, tot el que hi ha:
//
//   - les DUES parelles de guies (el carril del megaslide i el de la pagina);
//   - el selector de color (BLANC/COLOR/NEGRE), la franja de colleccions i la
//     franja de samarretes, amb les seves amplades i els seus aires;
//   - el panell, per saber on comenca i on acaba.
import { chromium } from '@playwright/test';
import { FRACCIO_COSSOS_FRANJA, FRACCIO_MARGE_ESQUERRE_FRANJA } from '../src/config/stripeCalibrations.js';
const w = Number(process.argv[2] || 1024), h = Number(process.argv[3] || 768);
const b = await chromium.launch();
const c = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await c.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(e.message.slice(0, 140)));
p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact&carril=1', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const q = (sel, arrel = document) => {
    const el = arrel.querySelector(sel);
    if (!el) return null;
    const x = el.getBoundingClientRect();
    return {
      x: +x.left.toFixed(2), d: +x.right.toFixed(2), w: +x.width.toFixed(2),
      t: +x.top.toFixed(2), b: +x.bottom.toFixed(2), h: +x.height.toFixed(2),
    };
  };
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const guia = (s) => {
    const el = document.querySelector(s);
    return el ? +el.getBoundingClientRect().left.toFixed(2) : null;
  };
  return {
    guiaMega: { esq: guia('[data-guia-carril="esq"]'), dret: guia('[data-guia-carril="dret"]') },
    guiaPagina: { esq: guia('[data-guia-carril-pagina="esq"]'), dret: guia('[data-guia-carril-pagina="dret"]') },
    panell: q('[data-mega-panel-surface]'),
    bcn: q('[data-p2-color-selector] [data-stripe-buttonbar="bn"]', v2),
    banda: q('[data-colleccions-franja="1"]', v2),
    stripe: q('[data-stripe-visual-content="2"]', v2),
    enllacos: [...v2.querySelectorAll('[data-colleccions-targeta="1"]')].length,
  };
});
console.log(`${w}x${h}`);
console.log(JSON.stringify(r, null, 1));
const gp = r.guiaPagina;
if (gp.esq != null) {
  console.log('--- contra el SEGON carril (el de la pagina) ---');
  for (const [k, v] of Object.entries({ bcn: r.bcn, banda: r.banda, stripe: r.stripe })) {
    if (!v) continue;
    console.log(`  ${k.padEnd(6)} esq ${(v.x - gp.esq).toFixed(2)}  dreta ${(v.d - gp.dret).toFixed(2)}  ample ${(v.w - (gp.dret - gp.esq)).toFixed(2)}`);
  }
  if (r.stripe) {
    const marge = FRACCIO_MARGE_ESQUERRE_FRANJA * r.stripe.w;
    const ce = r.stripe.x + marge;
    const cd = ce + FRACCIO_COSSOS_FRANJA * r.stripe.w;
    console.log(`  CINTURES stripe: esq ${(ce - gp.esq).toFixed(2)}  dreta ${(cd - gp.dret).toFixed(2)}`);
  }
}
console.log('--- aires (y) ---');
if (r.panell && r.bcn && r.banda && r.stripe) {
  console.log(`  panell ${r.panell.t}..${r.panell.b}`);
  console.log(`  bcn ${r.bcn.t}..${r.bcn.b}   aire dalt ${(r.bcn.t - r.panell.t).toFixed(2)}`);
  console.log(`  banda ${r.banda.t}..${r.banda.b}   gap bcn->banda ${(r.banda.t - r.bcn.b).toFixed(2)}`);
  console.log(`  stripe ${r.stripe.t}..${r.stripe.b}   gap banda->stripe ${(r.stripe.t - r.banda.b).toFixed(2)}   aire baix ${(r.panell.b - r.stripe.b).toFixed(2)}`);
}
console.log('errors=', errs.length, errs.slice(0, 2));
await p.screenshot({ path: `_tmp-p2-1024.png`, clip: { x: 0, y: 0, width: w, height: Math.min(h, (r.panell?.b || h) + 30) } });
await c.close();
await b.close();
