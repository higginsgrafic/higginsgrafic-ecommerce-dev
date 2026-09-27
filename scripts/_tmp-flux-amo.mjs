// TEMPORAL — no es comiteja. EL FLUX DE L'AMO, sencer: obrir, clicar una
// samarreta d'una altra colleccio, anar a la PDP, TORNAR, obrir el megaslide i
// clicar una altra colleccio.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + String(e).slice(0, 180)));
p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text().slice(0, 180)); });

const retrat = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const capa = v2?.querySelector('[data-stripe-drawing-layer]');
  const tiles = capa ? [...capa.querySelectorAll('[data-stripe-tile]')] : [];
  const retall = v2?.querySelector('[data-carrusel="1"] > div');
  const rb = retall?.getBoundingClientRect();
  const vis = [...(v2?.querySelectorAll('[data-carrusel="1"] button') || [])].slice(0, 40)
    .filter((x) => { const k = x.getBoundingClientRect(); return rb && k.right > rb.left && k.left < rb.right && getComputedStyle(x).opacity === '1'; })
    .map((x) => x.getAttribute('aria-label'));
  const cards = v2 ? [...v2.querySelectorAll('[data-colleccions-targeta]')].filter((x) => getComputedStyle(x).fontWeight === '700').map((x) => (x.textContent || '').trim().toUpperCase()) : null;
  return {
    url: location.pathname + location.search,
    panell: !!document.querySelector('[data-mega-panel-surface="1"]'),
    franja: tiles.slice(0, 3).map((t) => (t.querySelector('img').currentSrc || '').split('/').pop()),
    graella: vis,
    colleccio: cards,
  };
});

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
console.log('1 obert     :', JSON.stringify(await retrat()));

const q = await p.evaluate(() => {
  const t = document.querySelector('[data-mega-page-viewport="2"] [data-stripe-tile="7"]');
  const bb = t.getBoundingClientRect();
  return { x: Math.round(bb.left + bb.width / 2), y: Math.round(bb.top + bb.height / 2), dibuix: (t.querySelector('img').currentSrc || '').split('/').pop() };
});
console.log('2 cliquem   :', q.dibuix, '(THE HUMAN INSIDE, atenuada)');
await p.mouse.click(q.x, q.y);
await p.waitForTimeout(3000);
console.log('3 a la PDP  :', p.url());

await p.goBack({ waitUntil: 'load' });
await p.waitForTimeout(4000);
console.log('4 enrere    :', JSON.stringify(await retrat()));

await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
console.log('5 obert     :', JSON.stringify(await retrat()));

const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === 'CUBE') || null);
if (!card.asElement()) console.log('6 targeta CUBE no trobada');
else {
  const bb = await card.asElement().boundingBox();
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  await p.waitForTimeout(3000);
  console.log('6 clic CUBE :', JSON.stringify(await retrat()));
}
console.log('errors:', errs.length);
for (const e of errs.slice(0, 4)) console.log(' ', e);
await b.close();
