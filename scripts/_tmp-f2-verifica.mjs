// TEMPORAL — la comprovacio de la FEINA 2: a la p1, la rodeta i les fletxes del
// BLOC mouen la graella; a la p2, les fletxes del carrusel mouen la FRANJA (que
// es el que feien) i la graella no te bloc.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(10000);
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(600);
const estatP1 = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const t = v1.querySelector('[data-carrusel="1"]').firstElementChild.firstElementChild;
  return {
    transform: getComputedStyle(t).transform,
    fletxes: [...v1.querySelectorAll('button[aria-label="Anterior"], button[aria-label="Següent"]')].length,
    fletxesBloc: v1.querySelectorAll('[data-fletxes-p1="1"] button').length,
    fletxesCarrusel: v1.querySelectorAll('[data-carrusel="1"] button[aria-label]').length,
  };
});
console.log('p1 abans', JSON.stringify(await estatP1()));
// (a) la rodeta sobre la graella
const caixa = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const r = v1.querySelector('[data-carrusel="1"]').getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
});
await p.mouse.move(caixa.x, caixa.y);
await p.mouse.wheel(0, 120);
await p.waitForTimeout(700);
console.log('p1 despres de la RODETA (120)', JSON.stringify(await estatP1()));
// (b) la fletxa del bloc, amb el ratoli de debo
const f = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const e = v1.querySelector('[data-fletxes-p1="1"] button[aria-label="Següent"]');
  const r = e.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
});
await p.mouse.click(f.x, f.y);
await p.waitForTimeout(700);
console.log('p1 despres de la FLETXA del bloc', JSON.stringify(await estatP1()));
await p.mouse.click(f.x, f.y);
await p.waitForTimeout(700);
console.log('p1 i un altre cop', JSON.stringify(await estatP1()));
// (c) la pagina 2: les fletxes del carrusel han de moure la FRANJA
const p2 = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
  const fletxes = [...v2.querySelectorAll('[data-carrusel="1"] button[aria-label]')];
  const e = fletxes.find((x) => x.getAttribute('aria-label') === 'Següent');
  const r = e ? e.getBoundingClientRect() : null;
  return { srcs: tiles.map((t) => t.getAttribute('data-stripe-src')), quants: fletxes.length, x: r ? Math.round(r.left + r.width / 2) : null, y: r ? Math.round(r.top + r.height / 2) : null };
});
console.log('p2 fletxes al carrusel:', p2.quants, 'primeres cases:', JSON.stringify(p2.srcs.slice(0, 4)));
await p.mouse.click(p2.x, p2.y);
await p.waitForTimeout(900);
const p2b = await p.evaluate(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-stripe-tile]')].map((t) => t.getAttribute('data-stripe-src')));
console.log('p2 despres:', JSON.stringify(p2b.slice(0, 4)));
await ctx.close();
await b.close();
