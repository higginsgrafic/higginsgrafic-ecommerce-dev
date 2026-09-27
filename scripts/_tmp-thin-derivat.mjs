// TEMPORAL — no es comiteja. La llista derivada del registre es exactament la
// d'abans (mes el Terminator)?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
p.on('console', (m) => { if (m.type() === 'error') errs.push('C: ' + m.text().slice(0, 140)); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === 'THE HUMAN INSIDE') || null);
const bb = await card.asElement().boundingBox();
await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await p.waitForTimeout(2500);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
  return {
    franja: tiles.map((t) => (t.querySelector('img')?.currentSrc || '').split('/').pop().replace('-b-stripe.webp', '')),
    capcalera: !!document.querySelector('header'),
    panell: !!document.querySelector('[data-mega-panel-surface="1"]'),
  };
});
console.log('franja (' + r.franja.length + '):', r.franja.join(' | '));
console.log('Terminator a la franja?', r.franja.includes('terminator'));
console.log('capcalera:', r.capcalera, '| panell:', r.panell);
console.log('errors:', errs.length, errs.slice(0, 3));
await b.close();
