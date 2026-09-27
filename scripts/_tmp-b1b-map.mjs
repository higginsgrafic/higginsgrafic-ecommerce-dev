// TEMPORAL — no es comiteja. B1b: la pantalla d'inici te una animacio d'entrada i
// el primer instant les caixes ballen. Aqui s'espera que pari i es mesura el que
// demana la recepta: `--hg-mega-w` a cada node, i rects/transform dels ancestres.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const d = (el, et) => {
    if (!el) return { et, hi: false };
    const q = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return {
      et,
      x: +q.left.toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1),
      offL: el.offsetLeft, offT: el.offsetTop, offW: el.offsetWidth, offH: el.offsetHeight,
      tr: cs.transform, origin: cs.transformOrigin, pos: cs.position,
      megaW: cs.getPropertyValue('--hg-mega-w').trim(),
      megaX: cs.getPropertyValue('--hg-mega-x').trim(),
      escala: cs.getPropertyValue('--hg-escala-mega').trim(),
      fit: cs.getPropertyValue('--hgGridFitScale').trim(),
    };
  };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cadena = (el) => {
    const out = [];
    let x = el;
    while (x && x !== document.body) {
      out.push(d(x, `${x.tagName.toLowerCase()}${x.className ? `.${String(x.className).split(' ').slice(0, 2).join('.')}` : ''}`));
      x = x.parentElement;
    }
    return out;
  };
  const v1cont = v1?.firstElementChild?.nextElementSibling || v1?.querySelector('div');
  return {
    root: { megaW: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim(), escala: getComputedStyle(document.documentElement).getPropertyValue('--hg-escala-mega').trim() },
    v1: d(v1, 'viewport1'),
    v2: d(v2, 'viewport2'),
    // La cadena des de la graella de la p1 cap a munt (on viu carrilPx).
    cadenaGraella1: cadena(v1?.querySelector('.grid.grid-cols-9')),
    // Peces p1
    graella1: d(v1?.querySelector('.grid.grid-cols-9'), 'graella1 (grid-cols-9)'),
    col1: d(v1?.querySelector('.grid.grid-cols-9 > div'), 'col1 de la malla'),
    selector1: d(v1?.querySelector('[data-stripe-buttonbar="bn"]'), 'selector1'),
    fletxes1: d(v1?.querySelector('#stripe-guide-right-anchor'), 'fletxes1'),
    franja1: d(v1?.querySelector('[data-stripe-visual-content="1"]'), 'franja1'),
    // Peces p2
    carrusel2: d(v2?.querySelector('[data-carrusel="1"]'), 'carrusel2'),
    retall2: d(v2?.querySelector('[data-carrusel="1"] > div'), 'retall2'),
    tira2: d(v2?.querySelector('[data-carrusel="1"] > div > div'), 'tira2'),
    selector2: d(v2?.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]'), 'selector2'),
    filera2: d(v2?.querySelector('[data-p2-cercador-row]'), 'filera2'),
    franja2: d(v2?.querySelector('[data-stripe-visual-content="2"]'), 'franja2'),
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
