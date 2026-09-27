// TEMPORAL — la p2 amb els dos selectors etiquetats i les seves xifres.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const info = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const peces = [
    ['A selector B/C/N', v.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')],
    ['B columna colleccions', v.querySelector('[data-colleccions-targeta]')?.parentElement],
    ['graella dibuixos', v.querySelector('[data-carrusel="1"]')],
    ['tira de colors', v.querySelector('[data-p2-color-grid]')],
    ['franja', v.querySelector('[data-stripe-visual-content="2"]')],
  ];
  const taula = [];
  const capa = document.createElement('div');
  capa.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none';
  let html = '';
  peces.forEach(([et, el]) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    taula.push({ peça: et, x: +r.left.toFixed(1), y: +r.top.toFixed(1), ample: +r.width.toFixed(1), alt: +r.height.toFixed(1), baix: +(r.top + r.height).toFixed(1) });
    const color = et.startsWith('A') ? '#e11d48' : (et.startsWith('B') ? '#2563eb' : '#111827');
    html += `<div style="position:absolute;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border:2px solid ${color};box-sizing:border-box"></div>`;
    html += `<div style="position:absolute;left:${r.left}px;top:${Math.max(2, r.top - 16)}px;font:bold 11px monospace;color:${color};background:#fff">${et} ${Math.round(r.height)}px</div>`;
  });
  capa.innerHTML = html;
  document.body.appendChild(capa);
  return taula;
});
console.table(info);
await p.waitForTimeout(300);
await p.screenshot({ path: '_tmp-quin-selector.png', clip: { x: 340, y: 80, width: 1220, height: 300 } });
console.log('desat _tmp-quin-selector.png');
await ctx.close(); await b.close();
