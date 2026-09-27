// TEMPORAL — no es comiteja. La composicio de la pagina 1 i de la 2, amb xifres.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const carril = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w')) || null;
  const cr = document.querySelector('[data-capcalera-fila="1"]')?.getBoundingClientRect() || null;
  const info = (el, etiqueta) => {
    if (!el) return `${etiqueta}: (no hi es)`;
    const r2 = el.getBoundingClientRect();
    return `${etiqueta}: x${Math.round(r2.left)} y${Math.round(r2.top)} ${Math.round(r2.width)}x${Math.round(r2.height)}`;
  };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const sel1 = v1?.querySelector('button[aria-label="Color"]') || null;
  const sel2 = v2?.querySelector('[data-p2-color-selector] button[aria-label="Color"]') || null;
  const grid1 = v1?.querySelector('[data-columna-dreta], .grid-cols-8, .grid-cols-9') || null;
  const grid2 = v2?.querySelector('[data-carrusel="1"]') || null;
  const fletxes1 = v1?.querySelector('#stripe-guide-right-arrow') || document.querySelector('#stripe-guide-right-arrow');
  const fletxes2 = v2?.querySelector('#stripe-guide-right-arrow') || null;
  const fr1 = v1?.querySelector('[data-stripe-visual-content="1"]') || null;
  const fr2 = v2?.querySelector('[data-stripe-visual-content="2"]') || null;
  return [
    `carril ${carril} | capcalera x${cr ? Math.round(cr.left) : '?'}..${cr ? Math.round(cr.right) : '?'}`,
    '--- PAGINA 1',
    info(sel1, 'selector '),
    info(grid1?.classList?.contains('grid-cols-8') ? grid1.parentElement?.querySelector('.grid-cols-8') : grid1, 'graella  '),
    info(v1?.querySelector('[data-stripe-buttonbar="bn"]'), 'pastilla '),
    info(v1?.querySelector('[data-columna-dreta]'), 'col dreta'),
    info(fletxes1, 'fletxes  '),
    info(fr1, 'franja   '),
    '--- PAGINA 2',
    info(sel2, 'selector '),
    info(grid2, 'graella  '),
    info(fletxes2, 'fletxes  '),
    info(fr2, 'franja   '),
  ].join('\n');
});
console.log(r);
await ctx.close();
await b.close();
