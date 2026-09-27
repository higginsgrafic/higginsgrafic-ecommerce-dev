// TEMPORAL — no es coiteja. Que hi ha a la vora dreta del carril a la p2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
console.log(JSON.stringify(await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cap = document.querySelector('[data-capcalera-fila="1"]');
  const col = v2.querySelector('[data-colleccions-targeta]').parentElement;
  const act = [...v2.querySelectorAll('[data-colleccions-targeta]')].find((x) => x.getAttribute('aria-current') === 'true');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const carr = v2.querySelector('[data-carrusel="1"]');
  const q = (e, et) => { if (!e) return { et, hi: false }; const r = e.getBoundingClientRect(); return { et, x: +r.left.toFixed(1), r: +r.right.toFixed(1), y: +r.top.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; };
  return {
    carril: q(cap, 'fila capcalera'),
    columna: q(col, 'columna'),
    caixaActiva: q(act, 'caixa blanca activa'),
    franja: q(franja, 'franja'),
    carrusel: q(carr, 'carrusel'),
    cardEstil: { marge: getComputedStyle(act).margin, radi: getComputedStyle(act).borderRadius, fons: getComputedStyle(act).backgroundColor, pes: getComputedStyle(act.querySelector('span')).fontWeight, mida: getComputedStyle(act.querySelector('span')).fontSize },
  };
}), null, 1));
await ctx.close();
await b.close();
