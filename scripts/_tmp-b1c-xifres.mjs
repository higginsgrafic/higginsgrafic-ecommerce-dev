// TEMPORAL — no es comiteja. B1c: xifres normalitzades de les dues pagines
// (la pagina 1 viu a -1905 quan el megaslide es a la 2: es corregeix).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const dx1 = -v1.getBoundingClientRect().left;
  const dx2 = -v2.getBoundingClientRect().left;
  const box = (el, dx) => {
    if (!el) return null;
    const q = el.getBoundingClientRect();
    return { x: +(q.left + dx).toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1), r: +(q.right + dx).toFixed(1), b: +q.bottom.toFixed(1) };
  };
  // --- P2: la referencia
  const carrusel = v2.querySelector('[data-carrusel="1"]');
  const retall = carrusel?.firstElementChild;
  const tira = retall?.firstElementChild;
  const peces = [...(tira?.querySelectorAll('button') || [])].map((x) => { const q = x.getBoundingClientRect(); return { x: +(q.left + dx2).toFixed(2), y: +q.top.toFixed(2), w: +q.width.toFixed(2), h: +q.height.toFixed(2), cy: +(q.top + q.height / 2).toFixed(2) }; });
  const files = {};
  peces.forEach((q) => { const k = q.y.toFixed(1); files[k] = (files[k] || []); files[k].push(q); });
  const resumFiles = Object.entries(files).map(([k, v]) => ({ y: +k, n: v.length, x0: v[0].x, pas: v.length > 1 ? +(v[1].x - v[0].x).toFixed(2) : null, cy: v[0].cy, w: v[0].w }));
  const sel2 = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const filesSel2 = [...(sel2?.querySelectorAll('button[aria-label]') || [])].map((x) => { const q = x.getBoundingClientRect(); return { nom: x.getAttribute('aria-label'), cy: +(q.top + q.height / 2).toFixed(2) }; });
  // --- P1: el que hi ha ara
  const malla1 = v1.querySelector('.grid.grid-cols-9');
  const fletxes1 = v1.querySelector('#stripe-guide-right-anchor');
  return {
    carril: { esq: 381, dreta: 1524, ample: 1143 },
    p2: {
      carrusel: box(carrusel, dx2),
      retall: box(retall, dx2),
      tira: box(tira, dx2),
      selector: box(sel2, dx2),
      filesSelector: filesSel2,
      filesDibuixos: resumFiles,
      franja: box(v2.querySelector('[data-stripe-visual-content="2"]'), dx2),
      columna: box(v2.querySelector('[data-colleccions-targeta]')?.parentElement, dx2),
    },
    p1: {
      malla: box(malla1, dx1),
      primeraCol: box(malla1?.firstElementChild, dx1),
      ultimaCol: box(malla1?.lastElementChild, dx1),
      selector: box(v1.querySelector('[data-stripe-buttonbar="bn"]'), dx1),
      fletxes: box(fletxes1, dx1),
      franja: box(v1.querySelector('[data-stripe-visual-content="1"]'), dx1),
    },
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
