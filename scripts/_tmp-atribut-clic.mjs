import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tiles = [...v2.querySelectorAll('[data-stripe-tile]')];
  const capa = document.querySelector('[data-stripe-drawing-layer]');
  const rb = capa.getBoundingClientRect();
  // El que elementFromPoint troba al centre de cada casa.
  const perPunt = tiles.map((t) => {
    const b2 = t.getBoundingClientRect();
    const el = document.elementFromPoint(b2.left + b2.width / 2, b2.top + b2.height / 2);
    const casa = el?.closest?.('[data-stripe-tile]');
    return casa ? casa.getAttribute('data-stripe-item') : 'NULL';
  });
  return {
    casa0: { item: tiles[0].getAttribute('data-stripe-item'), coll: tiles[0].getAttribute('data-stripe-collection') },
    perPunt: perPunt.slice(0, 6),
    teCapa: !!capa,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
