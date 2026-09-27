// TEMPORAL — no es comiteja. Els 4 solids queden en una fila i els 4 marcs a
// l'altra? Es miren les y reals de cada dibuix de LOOKING FOR MY DARCY.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
p.on('console', (m) => { if (m.type() === 'error') errs.push('C: ' + m.text().slice(0, 120)); });
await p.goto('http://127.0.0.1:3003/nova/inici?active=austen', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const n = bs.length / 2;
  const items = bs.slice(0, n).map((x) => {
    const img = x.querySelector('img');
    const k = x.getBoundingClientRect();
    return { lab: x.getAttribute('aria-label'), src: img ? (img.currentSrc || '').split('/').pop() : null, y: Math.round(k.top), x: Math.round(k.left) };
  }).filter((x) => /darcy/i.test(x.lab || ''));
  const ys = [...new Set(items.map((x) => x.y))].sort((a, b2) => a - b2);
  return { files: ys.length, ys, items: items.map((x) => ({ ...x, fila: ys.indexOf(x.y) + 1 })) };
});
console.log('files visuals:', r.files, r.ys.join(' / '));
for (const x of r.items.sort((a, b2) => (a.fila - b2.fila) || (a.x - b2.x))) {
  console.log(`  fila ${x.fila}  x=${String(x.x).padStart(4)}  ${x.lab}  -> ${x.src}`);
}
console.log('errors:', errs.length, errs.slice(0, 3));
await b.close();
