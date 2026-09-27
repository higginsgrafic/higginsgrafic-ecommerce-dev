// TEMPORAL — no es comiteja. Amb la navegacio bloquejada, es veu si el clic a una
// samarreta atenuada activa la seva colleccio i deixa la graella centrada.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 150)));
// Bloquegem la navegacio de la PDP perque el megaslide no es tanqui i es pugui
// veure el centratge, que es el que es vol comprovar.
await p.route('**/the-human-inside/**', (route) => {
  if (route.request().resourceType() === 'document') return route.abort();
  return route.continue();
});

const estat = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const retall = v2?.querySelector('[data-carrusel="1"] > div');
  if (!retall) return null;
  const tira = retall.firstElementChild;
  const rb = retall.getBoundingClientRect();
  const centre = rb.left + rb.width / 2;
  const totes = [...tira.querySelectorAll('button')];
  const n = totes.length / 2;
  const peces = totes.slice(0, n).filter((x) => Number(getComputedStyle(x).opacity) > 0.9);
  if (!peces.length) return { actius: 0 };
  const caixes = peces.map((x) => x.getBoundingClientRect()).sort((a, b) => a.left - b.left);
  const capa = v2.querySelector('[data-stripe-drawing-layer]');
  return {
    actius: peces.length,
    desviament: +(((caixes[0].left + caixes[caixes.length - 1].right) / 2) - centre).toFixed(1),
    franja: capa ? [...capa.querySelectorAll('[data-stripe-tile]')].map((t) => getComputedStyle(t).opacity).join('/') : null,
  };
});

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
console.log('ABANS  ', JSON.stringify(await estat()));

const r = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: bb.left + bb.width / 2, y: bb.top + bb.height / 2, dibuix: (t.querySelector('img').currentSrc || '').split('/').pop() };
});
console.log('cliquem la casella 7:', r.dibuix, '(atenuada, de THE HUMAN INSIDE)');
await p.mouse.click(r.x, r.y);
await p.waitForTimeout(2500);
console.log('DESPRES', JSON.stringify(await estat()));
console.log('errors:', errs.length, errs.slice(0, 2));
await b.close();
