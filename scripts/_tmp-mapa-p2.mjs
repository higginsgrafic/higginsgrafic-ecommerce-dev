// TEMPORAL — no es coiteja. Una captura de 1920x1080 de la PAGINA 2 amb les
// peces ETIQUETADES i numerades, i la taula de xifres al costat. Serveix per
// parlar de les peces pel seu nom i per xifra, sense endevinar res.
import { chromium } from '@playwright/test';
const AMPLE = 1920;
const ALT = 1080;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: AMPLE, height: ALT }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
const info = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const peces = [
    ['1 carril', document.querySelector('[data-capcalera-fila="1"]')],
    ['2 graella', v2.querySelector('[data-carrusel="1"]')],
    ['3 selector', v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')],
    ['4 colors', v2.querySelector('[data-p2-color-grid]')],
    ['5 columna', v2.querySelector('[data-colleccions-targeta]').parentElement],
    ['6 franja', v2.querySelector('[data-stripe-visual-content="2"]')],
  ];
  const capa = document.createElement('div');
  capa.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none';
  const taula = [];
  let html = '';
  peces.forEach(([et, el]) => {
    if (!el) return;
    const r = el.getBoundingClientRect();
    taula.push({ peça: et, x: +r.left.toFixed(1), y: +r.top.toFixed(1), ample: +r.width.toFixed(1), alt: +r.height.toFixed(1) });
    html += `<div style="position:absolute;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border:2px solid #e11d48;box-sizing:border-box"></div>`;
    html += `<div style="position:absolute;left:${r.left}px;top:${Math.max(0, r.top - 18)}px;font:bold 13px monospace;color:#e11d48;background:#fff">${et}</div>`;
  });
  // El quadrat de 100 px, per tenir la regla a la mateixa captura
  html += '<div style="position:absolute;left:40px;top:940px;width:100px;height:100px;background:rgba(0,0,0,0.45)"></div>';
  html += '<div style="position:absolute;left:40px;top:1044px;font:12px monospace;color:#000">quadrat de 100x100 px</div>';
  capa.innerHTML = html;
  document.body.appendChild(capa);
  return { taula };
});
await p.waitForTimeout(400);
await p.screenshot({ path: '_tmp-mapa-p2.png', clip: { x: 0, y: 0, width: AMPLE, height: ALT } });
console.table(info.taula);
console.log('desat _tmp-mapa-p2.png');
await ctx.close();
await b.close();
