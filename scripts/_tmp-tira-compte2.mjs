// TEMPORAL — no es comiteja. Amb les claus EXACTES del resolver: quin dibuix de
// THE HUMAN INSIDE es queda fora de la tira?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === 'THE HUMAN INSIDE') || null);
const bb = await card.asElement().boundingBox();
await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await p.waitForTimeout(2500);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const graella = [...v2.querySelectorAll('[data-carrusel="1"] button')].map((x) => x.getAttribute('aria-label'));
  const n = graella.length / 2;
  const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
  const srcs = tiles.map((t) => (t.querySelector('img')?.currentSrc || '').split('/').pop());
  return { items: graella.slice(0, n), srcs, n };
});
console.log('n =', r.n, '| dibuixos de THE HUMAN INSIDE a la graella:', r.items.slice(3, 22).join(' | '));
console.log('srcs a la franja:', r.srcs.length);
// Les 14 claus del resolver que produeixen una casa de la franja.
const esperats = ['afrodita','c3p0','cyberman','cylon-03','cylon-78','iron-man-08','iron-man-68','maschinenmensch','mazinger','r2-d2','robbie','robocop','terminator','the-dalek','vader'];
const aLaFranja = r.srcs.map((s) => (s || '').replace('-b-stripe.webp', '').replace('.webp', ''));
console.log('claus del resolver SENSE casa a la franja:', esperats.filter((e) => !aLaFranja.includes(e === 'mazinger' ? 'mazinger-z' : e === 'robbie' ? 'robbie-the-robot' : e === 'c3p0' ? 'c3-p0' : e === 'afrodita' ? 'afrodita-a' : e)).join(', ') || '(cap)');
await b.close();
