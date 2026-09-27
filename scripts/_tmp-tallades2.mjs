// TEMPORAL — no es comiteja. Els dibuixos de la graella cauen FORA de la caixa
// que retalla (el carrusel)? Es compara cada caixa de dibuix amb el retall.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=austen', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const rb = cont.getBoundingClientRect();
  const cs = getComputedStyle(cont);
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')];
  const n = bs.length / 2;
  const fora = [];
  for (const x of bs.slice(0, n)) {
    const img = x.querySelector('img');
    if (!img) continue;
    const ib = img.getBoundingClientRect();
    const dalt = +(rb.top - ib.top).toFixed(1);
    const baix = +(ib.bottom - rb.bottom).toFixed(1);
    const esq = +(rb.left - ib.left).toFixed(1);
    const dreta = +(ib.right - rb.right).toFixed(1);
    // Nome's el que es veu dins la finestra (el desplaçament horitzontal es normal).
    const dins = ib.right > rb.left && ib.left < rb.right;
    if (dins && (dalt > 0.5 || baix > 0.5)) {
      fora.push({ lab: x.getAttribute('aria-label'), imatge: `${Math.round(ib.width)}x${Math.round(ib.height)}`, dalt: dalt > 0 ? dalt : 0, baix: baix > 0 ? baix : 0, esq: esq > 0 ? esq : 0, dreta: dreta > 0 ? dreta : 0 });
    }
  }
  return {
    retall: { x: Math.round(rb.left), y: Math.round(rb.top), w: Math.round(rb.width), h: Math.round(rb.height), overflow: cs.overflow },
    total: n, fora: fora.length, fora,
  };
});
console.log('retall:', JSON.stringify(r.retall));
console.log('dibuixos:', r.total, '| amb part FORA del retall:', r.fora);
for (const x of r.fora.slice(0, 20)) console.log(`  ${String(x.lab).padEnd(30)} img=${x.imatge.padEnd(8)} dalt=${x.dalt} baix=${x.baix} esq=${x.esq} dreta=${x.dreta}`);
await b.close();
