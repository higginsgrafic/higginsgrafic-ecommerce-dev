// TEMPORAL (29/09/2026): comprova al navegador que la paleta nova no trenca res:
// cap 404, totes les imatges de samarreta carreguen i els colors nous surten.
// Us: node scripts/_tmp-verifica-paleta-navegador.mjs
import { chromium } from '@playwright/test';

const BASE = 'http://127.0.0.1:3003';
const PANTALLES = [
  ['inici', '/nova/inici?active=first_contact'],
  ['pdp', '/the-human-inside/afrodita'],
  ['pdp-lfmd', '/austen/looking-for-my-darcy-red-solid?color=dark-chocolate'],
  ['colleccio', '/austen'],
  ['colleccio-cube', '/cube'],
];

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 950 } });
const p = await ctx.newPage();

let fallades = 0;
p.on('response', (r) => {
  if (r.status() >= 400) {
    fallades++;
    console.log(`  404/ERR ${r.status()} ${r.url().replace(BASE, '')}`);
  }
});

const samarretes = new Set();
for (const [nom, url] of PANTALLES) {
  await p.goto(BASE + url, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(6000);
  const info = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    const sam = imgs.filter((i) => /\/placeholders\/apparel\//.test(i.getAttribute('src') || ''));
    return {
      sam: sam.length,
      trencades: sam.filter((i) => i.complete && i.naturalWidth === 0).length,
      colors: [...new Set(sam.map((i) => (i.getAttribute('src') || '').split('/').pop()))],
    };
  });
  info.colors.forEach((c) => samarretes.add(c.replace(/\.webp$/, '')));
  console.log(`${nom.padEnd(16)} samarretes: ${info.sam} · trencades: ${info.trencades}`);
  if (info.trencades) fallades += info.trencades;
}

// El selector de la PDP ha de tenir els 14 colors.
await p.goto(BASE + '/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(5000);
const selector = await p.evaluate(() => {
  const txt = document.body.innerHTML;
  const nous = ['rs-sport-grey', 'ice-grey', 'charcoal', 'dark-chocolate'];
  const vells = ['purple', 'light-pink', 'kiwi', 'forest-green'];
  return {
    nous: nous.filter((c) => txt.includes(c)),
    vells: vells.filter((c) => txt.includes(c)),
  };
});
console.log(`selector PDP: colors nous [${selector.nous.join(', ')}] · vells [${selector.vells.join(', ')}]`);

console.log(`\ncolors de samarreta vistos a pantalla (${samarretes.size}): ${[...samarretes].sort().join(', ')}`);
console.log(fallades === 0 ? '  CAP FALLADA' : `  ${fallades} FALLADES`);
await b.close();
