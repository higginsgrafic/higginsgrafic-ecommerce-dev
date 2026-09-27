// TEMPORAL — no es comiteja. Quins dibuixos de la graella surten TALLATS? Es
// mira si la imatge pintada desborda el seu boto (overflow: hidden).
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
  const out = [];
  for (const x of bs.slice(0, n)) {
    const img = x.querySelector('img');
    if (!img) continue;
    const kb = x.getBoundingClientRect();
    const ib = img.getBoundingClientRect();
    // Desbordament en cada costat (px).
    const d = {
      esq: +(kb.left - ib.left).toFixed(1),
      dreta: +(ib.right - kb.right).toFixed(1),
      dalt: +(kb.top - ib.top).toFixed(1),
      baix: +(ib.bottom - kb.bottom).toFixed(1),
    };
    const tallat = Object.values(d).some((v) => v > 0.5);
    if (tallat) out.push({ lab: x.getAttribute('aria-label'), src: (img.currentSrc || '').split('/').pop(), boto: `${Math.round(kb.width)}x${Math.round(kb.height)}`, imatge: `${Math.round(ib.width)}x${Math.round(ib.height)}`, natural: `${img.naturalWidth}x${img.naturalHeight}`, d: JSON.stringify(d) });
  }
  return { total: n, tallats: out.length, out };
});
console.log('dibuixos:', r.total, '| TALLATS:', r.tallats);
for (const x of r.out) console.log(`  ${String(x.lab).padEnd(30)} boto=${x.boto.padEnd(7)} img=${x.imatge.padEnd(7)} natural=${x.natural.padEnd(9)} ${x.d}`);
await b.close();
