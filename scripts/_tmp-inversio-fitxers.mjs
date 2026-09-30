// TEMPORAL (29/09/2026): comprova que les imatges que surten amb la regla nova
// existeixen de debò (200) i que navy/dark-chocolate hi surten amb tinta blanca.
// Us: node scripts/_tmp-inversio-fitxers.mjs
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
const r = await p.evaluate(async (colors) => {
  const { tdpImageFor } = await import('/src/lib/pdpMockup.js');
  const { drawingStripePath } = await import('/src/lib/drawingPaths.js');
  const casos = [];
  // austen-quotes nomes te tinta de linia (b/w): es on es veu la inversio.
  for (const color of colors) casos.push(['austen-quotes', 'quotes-it-is-a-truth', color]);
  // I un grapat de la resta de colleccions (aqui, amb COLOR, surt multi).
  for (const color of colors) casos.push(['first-contact', 'nx-01', color]);
  const out = [];
  for (const [col, route, color] of casos) {
    const url = tdpImageFor(col, route, color);
    const stripe = drawingStripePath(col, route, color);
    out.push({ col, route, color, url, fitxer: (url || '').split('/').pop(), stripe: (stripe || '').split('/').slice(-2).join('/') });
  }
  return out;
}, ['white', 'ice-grey', 'rs-sport-grey', 'charcoal', 'black', 'navy', 'dark-chocolate', 'light-blue', 'royal', 'irish-green', 'military-green', 'daisy', 'gold', 'red']);
let mals = 0;
for (const x of r) {
  const res = await fetch('http://127.0.0.1:3003' + x.url);
  const resStripe = x.stripe ? await fetch('http://127.0.0.1:3003/custom_logos/drawings/images_stripe/' + x.stripe) : { status: '-' };
  const ok = res.status === 200 && (resStripe.status === 200 || resStripe.status === '-');
  if (!ok) mals++;
  const tinta = (x.fitxer.match(/-(b|w|multi)-[a-z-]+\.webp$/) || [])[1] || '?';
  console.log(`  ${x.color.padEnd(15)} ${x.fitxer || '(cap)'.padEnd(40)}  ${res.status}  tinta=${tinta}  stripe ${resStripe.status} ${ok ? 'OK' : 'MAL'}`);
}
console.log(mals === 0 ? '\n  TOTES LES IMATGES HI SON' : `\n  ${mals} fallades`);
await b.close();
