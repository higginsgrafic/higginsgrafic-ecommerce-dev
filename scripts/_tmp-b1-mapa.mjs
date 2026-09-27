// TEMPORAL — no es comiteja. B1: el MegaStripePanelP1 i el MegaslidePagina2,
// amb la cadena d'ancestres, les variables de carril i els transform de cadascun.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const resum = (el, etiqueta) => {
    if (!el) return { etiqueta, hi: false };
    const q = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      etiqueta,
      x: +q.left.toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1),
      transform: cs.transform,
      origin: cs.transformOrigin,
      pos: cs.position,
      z: cs.zIndex,
      overflow: cs.overflow,
      cqw: cs.containerType,
      megaW: cs.getPropertyValue('--hg-mega-w').trim(),
      megaX: cs.getPropertyValue('--hg-mega-x').trim(),
      escala: cs.getPropertyValue('--hg-escala-mega').trim(),
      fitScale: cs.getPropertyValue('--hgGridFitScale').trim(),
    };
  };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const p1 = document.querySelector('[data-mega-panel-surface="1"]');
  const p2 = document.querySelector('[data-mega-panel-surface="2"]');
  const arrelV1 = p1?.querySelector('div[style*="width"]') || v1;
  // La cadena d'ancestres del panell de la p1 des del viewport.
  const cadena = (el) => {
    const out = [];
    let x = el;
    while (x && x !== document.documentElement) {
      out.push(resum(x, `${x.tagName.toLowerCase()}${x.getAttribute('data-mega-page-viewport') ? `[vp${x.getAttribute('data-mega-page-viewport')}]` : ''}${x.getAttribute('data-mega-panel-surface') ? '[surface]' : ''}`));
      x = x.parentElement;
    }
    return out;
  };
  return {
    root: {
      megaW: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim(),
      megaX: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-x').trim(),
      escala: getComputedStyle(document.documentElement).getPropertyValue('--hg-escala-mega').trim(),
      ample: window.innerWidth,
    },
    p1: resum(p1, 'panell p1'),
    p2: resum(p2, 'panell p2'),
    // Peces de la p1
    graella1: resum(v1?.querySelector('.grid.grid-cols-9') || v1?.querySelector('[class*="grid-cols-9"]'), 'graella p1 (grid-cols-9)'),
    selector1: resum(v1?.querySelector('[data-stripe-buttonbar="bn"]'), 'selector p1'),
    fletxes1: resum(v1?.querySelector('#stripe-guide-right-anchor'), 'fletxes p1'),
    franja1: resum(v1?.querySelector('[data-stripe-visual-content="1"]'), 'franja p1'),
    // Peces de la p2 (referencia)
    carrusel2: resum(v2?.querySelector('[data-carrusel="1"]'), 'carrusel p2'),
    selector2: resum(v2?.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]'), 'selector p2'),
    fletxes2: resum(v2?.querySelector('#stripe-guide-right-anchor'), 'fletxes p2'),
    franja2: resum(v2?.querySelector('[data-stripe-visual-content="2"]'), 'franja p2'),
    filera2: resum(v2?.querySelector('[data-p2-cercador-row]'), 'filera p2'),
    columna2: resum(v2?.querySelector('[data-colleccions-targeta]')?.parentElement, 'columna colleccions p2'),
    colors2: resum(v2?.querySelector('[data-p2-color-grid]'), 'graella colors p2'),
    cadena1: cadena(p1),
    cadena2: cadena(p2),
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
