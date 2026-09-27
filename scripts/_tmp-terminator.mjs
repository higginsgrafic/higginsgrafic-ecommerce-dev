// TEMPORAL — no es comiteja. Per que el Terminator no surt a la stripe de THE
// HUMAN INSIDE si la seva imatge hi es?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
const fallades = [];
p.on('response', (r) => { if (r.status() >= 400) fallades.push(`${r.status()} ${r.url().split('/').slice(-2).join('/')}`); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const card = await p.evaluateHandle(() => [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-colleccions-targeta]')].find((x) => (x.textContent || '').trim().toUpperCase() === 'THE HUMAN INSIDE') || null);
const bb = await card.asElement().boundingBox();
await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await p.waitForTimeout(3000);

const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
  const graella = [...v2.querySelectorAll('[data-carrusel="1"] button')].map((x) => x.getAttribute('aria-label'));
  const n = graella.length / 2;
  return {
    graella: graella.slice(0, n),
    franja: tiles.map((t) => {
      const img = t.querySelector('img');
      return { casa: t.getAttribute('data-stripe-tile'), src: img ? (img.currentSrc || '').split('/').pop() : null };
    }),
  };
});
console.log('graella (' + r.graella.length + '):', r.graella.join(' | '));
console.log('franja:');
for (const f of r.franja) console.log('  ', f.casa, f.src);
const teTerm = r.graella.some((x) => /terminator/i.test(x));
console.log('el Terminator es a la graella?', teTerm);
const teTermFranja = r.franja.some((f) => /terminator/i.test(f.src || ''));
console.log('el Terminator es a la franja?', teTermFranja);
console.log('respostes >=400:', fallades.length, fallades.slice(0, 6));
await b.close();
