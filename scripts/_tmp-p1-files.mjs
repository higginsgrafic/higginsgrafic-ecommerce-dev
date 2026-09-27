// TEMPORAL — no es comiteja. Les files i els blocs de les dues pagines, amb xifres.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const [w, h] = (process.argv[2] || '1920x946').split('x').map(Number);
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const linia = (el, etiqueta) => {
    if (!el) return `${etiqueta}: (no hi es)`;
    const r2 = el.getBoundingClientRect();
    return `${etiqueta}: x${r2.left.toFixed(1)} y${r2.top.toFixed(1)} ${r2.width.toFixed(1)}x${r2.height.toFixed(1)} | dreta ${r2.right.toFixed(1)} baix ${r2.bottom.toFixed(1)}`;
  };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const out = [];
  out.push(`caril ${getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w')} escala ${getComputedStyle(document.documentElement).getPropertyValue('--hg-escala-mega')}`);
  out.push('=== P1');
  out.push(linia(v1?.querySelector('.grid-cols-9'), 'graella 9 col'));
  const files1 = v1?.querySelectorAll('.grid-cols-9 > *');
  if (files1) files1.forEach((f, i) => out.push(linia(f, `  cella ${i}`)));
  out.push(linia(v1?.querySelector('button[aria-label="Color"]'), 'selector'));
  out.push(linia(v1?.querySelector('[data-stripe-buttonbar="bn"]'), 'pastilla'));
  out.push(linia(v1?.querySelector('#stripe-guide-right-anchor'), 'bloc fletxes'));
  out.push(linia(v1?.querySelector('#stripe-guide-right-arrow'), 'fletxa dreta'));
  out.push(linia(v1?.querySelector('[data-stripe-visual-content="1"]'), 'franja'));
  out.push('=== P2');
  out.push(linia(v2?.querySelector('[data-p2-color-selector]'), 'cont selector'));
  out.push(linia(v2?.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]'), 'pastilla'));
  const carr = v2?.querySelector('[data-carrusel="1"]');
  out.push(linia(carr, 'retall carrusel'));
  if (carr) {
    const peces = [...carr.querySelectorAll('button')].slice(0, 4);
    peces.forEach((f, i) => out.push(linia(f, `  peca ${i}`)));
  }
  const graella = carr?.firstElementChild;
  out.push(linia(graella, 'caixa retall'));
  out.push(linia(v2?.querySelector('#stripe-guide-right-anchor'), 'bloc fletxes'));
  out.push(linia(v2?.querySelector('#stripe-guide-right-arrow'), 'fletxa dreta'));
  out.push(linia(v2?.querySelector('[data-stripe-visual-content="2"]'), 'franja'));
  out.push(linia(v2?.querySelector('[data-p2-color-grid]'), 'tira colors'));
  out.push(linia(v2?.querySelector('[data-colleccions-linia]'), 'linia colleccions'));
  out.push(linia(v2?.querySelector('[data-p2-cercador-row]'), 'filera'));
  return out.join('\n');
});
console.log(r);
await ctx.close();
await b.close();
