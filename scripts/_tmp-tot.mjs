// TEMPORAL — no es coiteja. Comprovacio completa: rodeta, clics i samarretes.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
const colorTriat = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const m = [...v2.querySelectorAll('[data-p2-color-grid] button')].find((x) => getComputedStyle(x).outlineStyle === 'solid');
  return m ? m.getAttribute('data-color-barra') : null;
});
const tr = (n) => p.evaluate((vp) => {
  const v = document.querySelector(`[data-mega-page-viewport="${vp}"]`);
  const t = v.querySelector('[data-carrusel="1"]')?.firstElementChild?.firstElementChild;
  return t ? getComputedStyle(t).transform : null;
}, n);
const colActiva = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const a = v2.querySelector('[data-colleccions-targeta][aria-current="true"]');
  return a ? a.textContent.trim() : null;
});
const punt = (s) => p.evaluate((sel) => { const r = document.querySelector(sel).getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; }, s);
// 1. RODETA a la tira de colors
let c = await punt('[data-p2-color-grid]');
console.log('colors abans:', await colorTriat());
await p.mouse.move(c.x, c.y);
await p.mouse.wheel(0, -120); await p.waitForTimeout(700);
console.log('colors amb rodeta amunt:', await colorTriat());
// 2. RODETA a la graella intercalada de la p2
const gc = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tira = v2.querySelector('[data-carrusel="1"]').firstElementChild.firstElementChild;
  const b2 = [...tira.querySelectorAll('button')].find((x) => { const r = x.getBoundingClientRect(); return r.left > 400 && r.left < 1300; });
  const r = b2.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), label: b2.getAttribute('aria-label') };
});
console.log('graella p2 abans:', await tr(2));
await p.mouse.move(gc.x, gc.y);
await p.mouse.wheel(0, 120); await p.waitForTimeout(700);
console.log('graella p2 amb rodeta:', await tr(2));
// 3. CLIC en un dibuix d'una altra colleccio (ha de canviar la colleccio activa)
const dib = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tira = v2.querySelector('[data-carrusel="1"]').firstElementChild.firstElementChild;
  const b2 = [...tira.querySelectorAll('button')].find((x) => { const r = x.getBoundingClientRect(); const op = getComputedStyle(x).opacity; return r.left > 400 && r.left < 1300 && parseFloat(op) < 0.5; });
  if (!b2) return null;
  const r = b2.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), label: b2.getAttribute('aria-label') };
});
console.log('dibuix atenuat a clicar:', JSON.stringify(dib), '| colleccio abans:', await colActiva());
if (dib) { await p.mouse.click(dib.x, dib.y); await p.waitForTimeout(2500); console.log('colleccio despres:', await colActiva()); }
await ctx.close();
await b.close();
