// TEMPORAL (29/09/2026): el carrusel ha de portar la parella inversa tambe per
// a navy i dark-chocolate. Us: node scripts/_tmp-inversio-carousel.mjs
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
const r = await p.evaluate(async () => {
  const { collectionGridHoverVariantsFor } = await import('/src/lib/pdpMockup.js');
  const casos = [
    ['first-contact', 'nx-01', 'navy'], ['first-contact', 'nx-01', 'dark-chocolate'],
    ['first-contact', 'nx-01', 'charcoal'],
    ['first-contact', 'nx-01', 'black'], ['first-contact', 'nx-01', 'white'],
    ['first-contact', 'nx-01', 'ice-grey'], ['first-contact', 'nx-01', 'rs-sport-grey'],
  ];
  const out = [];
  for (const [col, route, color] of casos) {
    const v = collectionGridHoverVariantsFor(col, route, color, 0);
    out.push({ color, n: v.length, fitxers: v.map((u) => u.split('/').pop()) });
  }
  return out;
});
for (const x of r) {
  console.log(`  ${x.color} (${x.n} imatges)`);
  for (const f of x.fitxers) {
    const res = await fetch('http://127.0.0.1:3003/placeholders/apparel/mockups/' + f);
    console.log(`     ${res.status} ${f}`);
  }
}
await b.close();
