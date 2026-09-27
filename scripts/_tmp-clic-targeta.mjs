// TEMPORAL — no es comiteja. Clicar la targeta CUBE de la columna de colleccions.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errs = [];
p.on('pageerror', (e) => errs.push('PAGEERROR: ' + String(e).slice(0, 200)));
p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text().slice(0, 200)); });

const estat = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const capa = v2?.querySelector('[data-stripe-drawing-layer]');
  const tiles = capa ? [...capa.querySelectorAll('[data-stripe-tile]')] : [];
  const boto = [...(v2?.querySelectorAll('[data-colleccions-targeta]') || [])].find((x) => (x.textContent || '').trim().toUpperCase() === 'CUBE');
  return {
    tiles: document.querySelectorAll('[data-stripe-tile]').length,
    carrusel: !!document.querySelector('[data-carrusel="1"]'),
    // Quina colleccio esta activa, segons les opacitats de la franja
    franjaActius: tiles.filter((t) => getComputedStyle(t).opacity === '1').length,
    franja: tiles.map((t) => (t.querySelector('img').currentSrc || '').split('/').pop()).join(' '),
    // I segons la graella
    graellaActius: [...(v2?.querySelectorAll('[data-carrusel="1"] button') || [])].slice(0, 20).filter((x) => getComputedStyle(x).opacity === '1').length,
    cubeNegreta: boto ? getComputedStyle(boto).fontWeight : null,
    url: location.pathname + location.search,
  };
});

await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
console.log('obert:', JSON.stringify(await estat()));

const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === 'CUBE') || null);
if (!card.asElement()) { console.log('targeta CUBE no trobada'); }
else {
  const bb = await card.asElement().boundingBox();
  console.log('targeta CUBE a', JSON.stringify(bb));
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
  for (const ms of [500, 1500, 3000]) {
    await p.waitForTimeout(ms === 500 ? 500 : 1000);
    console.log(`+${ms}ms:`, JSON.stringify(await estat()));
  }
  // I un altre clic despres, per veure si respon
  const card2 = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === 'MISCEL·LÀNIA') || null);
  if (card2.asElement()) {
    const b2 = await card2.asElement().boundingBox();
    await p.mouse.click(b2.x + b2.width / 2, b2.y + b2.height / 2);
    await p.waitForTimeout(2000);
    console.log('despres de clicar MISCEL·LÀNIA:', JSON.stringify(await estat()));
  } else console.log('targeta MISCEL·LÀNIA no trobada');
}
console.log('errors:', errs.length);
for (const e of errs.slice(0, 4)) console.log(' ', e);
await b.close();
