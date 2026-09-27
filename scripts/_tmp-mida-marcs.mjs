// TEMPORAL — no es comiteja. A la graella, els dibuixos dels marcs surten mes
// grossos que els solids? Es mesura la caixa de cada imatge pintada.
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
    const lab = x.getAttribute('aria-label') || '';
    if (!/darcy/i.test(lab)) continue;
    const img = x.querySelector('img');
    const kb = x.getBoundingClientRect();
    const ib = img ? img.getBoundingClientRect() : null;
    out.push({
      lab,
      boto: `${Math.round(kb.width)}x${Math.round(kb.height)}`,
      imatge: ib ? `${Math.round(ib.width)}x${Math.round(ib.height)}` : null,
      natural: img ? `${img.naturalWidth}x${img.naturalHeight}` : null,
      altura: img ? getComputedStyle(img).height : null,
    });
  }
  return out;
});
for (const x of r) console.log(`${x.lab.padEnd(30)} boto=${x.boto.padEnd(9)} imatge=${String(x.imatge).padEnd(9)} natural=${x.natural}`);
await b.close();
