// TEMPORAL — l'aire de la p2: del bottom del header al top del contingut i del
// bottom del contingut al final del megaslide.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const q = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return { y: +x.top.toFixed(1), baix: +(x.top + x.height).toFixed(1), h: +x.height.toFixed(1), x: +x.left.toFixed(1), dreta: +(x.left + x.width).toFixed(1) }; };
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const panel = v.closest('[data-mega-panel-surface="2"]') || document.querySelector('[data-mega-panel-surface="2"]');
  const cap = document.querySelector('[data-capcalera-fila="1"]');
  const capHeader = document.querySelector('header');
  const graella = v.querySelector('[data-carrusel="1"]');
  const retall = graella ? graella.firstElementChild : null;
  const franja = v.querySelector('[data-stripe-visual-content="2"]');
  const col = v.querySelector('[data-colleccions-targeta]')?.parentElement;
  const sel = v.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const colors = v.querySelector('[data-p2-color-grid]');
  return {
    header: q(capHeader),
    capcalera: q(cap),
    panel: q(panel),
    graella: q(graella),
    retall: q(retall),
    franja: q(franja),
    columna: q(col),
    selector: q(sel),
    colors: q(colors),
  };
});
console.log(JSON.stringify(r, null, 1));
const top = Math.min(...Object.values(r).filter(Boolean).map((o) => o.y));
const baix = Math.max(...Object.values(r).filter(Boolean).map((o) => o.baix));
console.log('contingut: top', top, 'baix', baix);
console.log('aire de dalt (panel.top -> contingut.top):', r.panel ? (top - r.panel.y).toFixed(1) : '?');
console.log('aire de baix (contingut.baix -> panel.baix):', r.panel ? (r.panel.baix - baix).toFixed(1) : '?');
await ctx.close(); await b.close();
