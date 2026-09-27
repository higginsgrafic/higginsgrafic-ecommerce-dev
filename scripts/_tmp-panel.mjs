import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4500);
const r = await p.evaluate(() => {
  const bx = (sel) => { const e = document.querySelector(sel); if (!e) return null; const b = e.getBoundingClientRect(); return [+b.left.toFixed(1), +b.top.toFixed(1), +b.right.toFixed(1), +b.bottom.toFixed(1)]; };
  const enllacos = document.querySelector('[data-p2-cercador-row]')?.parentElement?.querySelector('[data-colleccions-caixes]');
  const col = document.querySelector('[data-p2-cercador-row]');
  const darrera = col ? [...col.querySelectorAll('button')].filter((x) => x.textContent && /MISCEL/i.test(x.textContent)) : [];
  return {
    panell: bx('[data-mega-panel-surface="1"]'),
    guarda: bx('[data-stripe-bottom]'),
    vista2: bx('[data-mega-page-viewport="2"]'),
    vista1: bx('[data-mega-page-viewport="1"]'),
    franja2: bx('[data-stripe-visual-content="2"]'),
    filera: bx('[data-p2-cercador-row]'),
    colorGrid: bx('[data-p2-color-grid]'),
    capcalera: bx('[data-capcalera-fila="1"]'),
    darrera: darrera.length ? [+darrera[darrera.length - 1].getBoundingClientRect().top.toFixed(1), +darrera[darrera.length - 1].getBoundingClientRect().bottom.toFixed(1)] : null,
    enllacos: enllacos ? bx('[data-colleccions-caixes]') : null,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
