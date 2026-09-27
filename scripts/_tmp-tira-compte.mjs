// TEMPORAL — no es comiteja. Quin dibuix de THE HUMAN INSIDE es queda FORA de la
// tira de la franja, i per que (el resolver torna null).
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

const r = await p.evaluate(async () => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const graella = [...v2.querySelectorAll('[data-carrusel="1"] button')].map((x) => x.getAttribute('aria-label'));
  const n = graella.length / 2;
  const items = graella.slice(0, n);
  // Els srcs que la franja te pintats, per casa.
  const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
  const srcs = tiles.map((t) => (t.querySelector('img')?.currentSrc || '').split('/').pop());
  return { items, srcs };
});
console.log('items de la graella (primers 24):');
console.log(r.items.slice(0, 24).map((x, i) => `${i}:${x}`).join(' | '));
console.log('srcs de la franja (14):', r.srcs.join(' | '));
const set = new Set(r.srcs.map((s) => (s || '').replace('-b-stripe.webp', '').replace('.webp', '')));
console.log('--- quins items NO tenen cap casa a la franja:');
r.items.slice(0, 24).forEach((it, i) => {
  const k = it.trim().toLowerCase();
  const mapa = { 'r2-d2': 'r2-d2', c3p0: 'c3-p0', 'c3-p0': 'c3-p0', vader: 'vader', afrodita: 'afrodita-a', 'afrodita-a': 'afrodita-a', mazinger: 'mazinger-z', 'mazinger-z': 'mazinger-z', 'cylon 78': 'cylon-78', 'cylon 03': 'cylon-03', 'iron man 68': 'iron-man-68', 'iron man 08': 'iron-man-08', cyberman: 'cyberman', 'the dalek': 'the-dalek', robocop: 'robocop', terminator: 'terminator', maschinenmensch: 'maschinenmensch', 'robby the robot': 'robby-the-robot', 'robbie the robot': 'robbie-the-robot' };
  const f = mapa[k];
  if (!f) console.log(`  ${i}: ${it} -> el resolver NO te clau (tornara null)`);
  else if (!set.has(f)) console.log(`  ${i}: ${it} -> clau ${f}, pero no es a la franja`);
});
await b.close();
