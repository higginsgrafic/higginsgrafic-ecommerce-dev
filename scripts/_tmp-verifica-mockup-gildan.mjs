// TEMPORAL (29/09/2026): comprova que tota la web tira del joc nou de
// samarretes (`mockup-gildan-t-shirt-<color>.webp`), que no queda cap 404 i que
// cap pantalla demana les carpetes velles.
// Us: node scripts/_tmp-verifica-mockup-gildan.mjs
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 950 } });
const p = await ctx.newPage();

const fallades = [];
const demanades = new Set();
p.on('response', (r) => {
  const u = r.url();
  if (u.includes('/placeholders/apparel/t-shirt')) demanades.add(`${r.status()} ${u.split('/t-shirt/')[1] || u}`);
  if (r.status() >= 400) fallades.push(`${r.status()} ${u.replace('http://127.0.0.1:3003', '')}`);
});

const PANTALLES = [
  ['inici', '/nova/inici?active=first_contact'],
  ['pdp', '/the-human-inside/afrodita'],
  ['pdp-mockup', '/austen/looking-for-my-darcy-red-solid?color=irish-green'],
  ['colleccio', '/austen'],
];

for (const [nom, url] of PANTALLES) {
  await p.goto('http://127.0.0.1:3003' + url, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(6000);
  const info = await p.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')];
    return {
      samarretes: imgs.filter((i) => /t-shirt/.test(i.getAttribute('src') || '')).length,
      trencades: imgs.filter((i) => /t-shirt/.test(i.getAttribute('src') || '') && i.complete && i.naturalWidth === 0).length,
    };
  });
  console.log(`${nom.padEnd(12)} ${url}`);
  console.log(`   imgs de samarreta: ${info.samarretes} · trencades: ${info.trencades}`);
  await p.screenshot({ path: `_tmp-mockup-gildan-${nom}.png` });
}

// el megaslide
await p.goto('http://127.0.0.1:3003/nova/inici?active=austen&sub=looking_for_my_darcy', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(5000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const mega = await p.evaluate(() => {
  const imgs = [...document.querySelectorAll('img')];
  const sam = imgs.filter((i) => /t-shirt/.test(i.getAttribute('src') || ''));
  return { samarretes: sam.length, trencades: sam.filter((i) => i.complete && i.naturalWidth === 0).length };
});
console.log(`megaslide    imgs de samarreta: ${mega.samarretes} · trencades: ${mega.trencades}`);
await p.screenshot({ path: '_tmp-mockup-gildan-megaslide.png' });

console.log('\n--- fitxers de samarreta demanats ---');
for (const d of [...demanades].sort()) console.log('  ', d);
console.log('\n--- respostes >=400 ---');
console.log(fallades.length ? fallades.map((f) => '  ' + f).join('\n') : '  cap');
await b.close();
