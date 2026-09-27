// TEMPORAL — no es comiteja. Radiografia de la composicio de la pagina 1.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const R = (el) => {
    if (!el) return '(no hi es)';
    const r2 = el.getBoundingClientRect();
    return `x${Math.round(r2.left)}..${Math.round(r2.right)} y${Math.round(r2.top)}..${Math.round(r2.bottom)} ${Math.round(r2.width)}x${Math.round(r2.height)}`;
  };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const out = [];
  out.push('viewport1 ' + R(v1));
  const grid = v1?.querySelector('.grid-cols-9');
  out.push('grid-cols-9 ' + R(grid));
  if (grid) {
    out.push('grid style: ' + (grid.getAttribute('style') || ''));
    [...grid.children].forEach((c, i) => {
      out.push(`  col${i} ${R(c)} data-mega-item=${c.querySelector('[data-mega-item]')?.getAttribute('data-mega-item') || '-'}`);
    });
  }
  const bn = v1?.querySelector('[data-stripe-buttonbar="bn"]');
  out.push('bn container ' + R(bn));
  out.push('bn parent ' + R(bn?.parentElement));
  out.push('bn grandparent ' + R(bn?.parentElement?.parentElement));
  const anchor = v1?.querySelector('#stripe-guide-right-anchor');
  out.push('arrows anchor ' + R(anchor));
  out.push('arrows anchor parent ' + R(anchor?.parentElement));
  out.push('arrows anchor grandparent ' + R(anchor?.parentElement?.parentElement));
  out.push('arrow btn ' + R(v1?.querySelector('#stripe-guide-right-arrow')));
  const fr = v1?.querySelector('[data-stripe-visual-content="1"]');
  out.push('franja ' + R(fr));
  const fila = document.querySelector('#stripe-guide-stripe-row-p1');
  out.push('fila franja ' + R(fila));
  const page = v1?.parentElement;
  out.push('page root ' + R(page));
  out.push('CSS --hg-mega-w=' + getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'));
  out.push('CSS --hgGridFitScale=' + getComputedStyle(document.documentElement).getPropertyValue('--hgGridFitScale'));
  return out.join('\n');
});
console.log(r);
await ctx.close();
await b.close();
