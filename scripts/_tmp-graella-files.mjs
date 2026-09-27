// TEMPORAL — no es comiteja. On cau cada dibuix de la graella (columna i fila
// reals), amb AUSTEN actiu, i on cauen els 8 de LOOKING FOR MY DARCY.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=austen', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const n = bs.length / 2;
  const items = bs.slice(0, n).map((x, i) => {
    const img = x.querySelector('img');
    const src = img ? (img.currentSrc || '').split('/').pop() : null;
    const k = x.getBoundingClientRect();
    return { i, lab: x.getAttribute('aria-label'), src, x: Math.round(k.left), y: Math.round(k.top) };
  });
  // Files i columnes reals: s'agrupen per y i per x.
  const ys = [...new Set(items.map((x) => x.y))].sort((a, b2) => a - b2);
  const xs = [...new Set(items.map((x) => x.x))].sort((a, b2) => a - b2);
  items.forEach((x) => { x.fila = ys.indexOf(x.y) + 1; x.col = xs.indexOf(x.x) + 1; });
  return { files: ys.length, columnes: xs.length, n, items };
});
console.log('files:', r.files, 'columnes:', r.columnes, 'items:', r.n);
const lfmd = r.items.filter((x) => /darcy/i.test(x.lab || ''));
console.log('--- els 8 de LOOKING FOR MY DARCY:');
for (const x of lfmd) console.log(`  fila ${x.fila} col ${String(x.col).padStart(2)}  i=${String(x.i).padStart(2)}  ${x.lab}  (${x.src})`);
console.log('--- x exactes dels 8 de darcy:');
for (const x of r.items.slice(40, 49)) console.log(`  i=${String(x.i).padStart(2)} x=${String(x.x).padStart(5)} y=${String(x.y).padStart(4)}  ${x.lab}`);
await b.close();
