import { chromium } from '@playwright/test';
const BASE = 'http://127.0.0.1:3003';
const b = await chromium.launch();
const p = await (await b.newContext()).newPage();
await p.goto(BASE + '/nova/inici', { waitUntil: 'domcontentloaded', timeout: 120000 });
const casos = await p.evaluate(async () => {
  const { resolveForItem } = await import('/src/utils/resolveStripeTile.js');
  const G = '/custom_logos/drawings/images_grid/austen/quotes/';
  const ctx = { active: 'austen', displayedShirtColor: 'black' };
  const noms = ['body-and-soul', 'half-agony-half-hope', 'i-admire-and-love-you', 'it-is-a-truth', 'unsociable-and-taciturn', 'you-have-bewitched-me'];
  return noms.map((n) => ({ n, black: resolveForItem(`${G}${n}-b-grid.webp`, 'black', ctx) }));
});
let mals = 0;
for (const c of casos) {
  const f = (c.black || '').split('/').pop();
  const res = await fetch('http://127.0.0.1:3003' + c.black);
  const ok = res.status === 200;
  if (!ok) mals++;
  console.log(`  ${c.n.padEnd(26)} -> ${f.padEnd(42)} ${res.status} ${ok ? '' : 'MAL'}`);
}
console.log(mals === 0 ? '\n  TOTS ELS CAMINS EXISTEIXEN' : `\n  ${mals} fallades`);
await b.close();
