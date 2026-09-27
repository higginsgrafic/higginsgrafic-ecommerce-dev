// TEMPORAL — no es comiteja. On cau cada targeta del rail de dalt, i on cau cada
// columna de la cinta de la TDP. Que quadra?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3500);
const r = await p.evaluate(() => {
  // Les targetes VISIBLES (les que cauen dins la pantalla).
  const targetes = [...document.querySelectorAll('[data-component="product-card"]')]
    .map((c) => c.getBoundingClientRect())
    .filter((x) => x.width > 0 && x.right > 0 && x.left < window.innerWidth)
    .sort((a, b2) => a.left - b2.left)
    .slice(0, 4)
    .map((x, i) => ({ n: i + 1, esq: Math.round(x.left), dreta: Math.round(x.right), ample: Math.round(x.width) }));
  // Les tres columnes de la cinta.
  const img = [...document.querySelectorAll('img')].map((i) => ({ i, b: i.getBoundingClientRect() })).filter((x) => x.b.width > 250).sort((a, b2) => b2.b.width - a.b.width)[0];
  let bloc = img?.i;
  while (bloc && getComputedStyle(bloc).display !== 'grid') bloc = bloc.parentElement;
  const cols = bloc ? [...bloc.children].map((c, i) => { const b2 = c.getBoundingClientRect(); return { n: i + 1, esq: Math.round(b2.left), dreta: Math.round(b2.right), ample: Math.round(b2.width) }; }) : [];
  return { targetes, cols, ample4: targetes.length === 4 ? targetes[3].dreta - targetes[0].esq : null };
});
console.log('--- TARGETES (les 4 visibles)');
for (const x of r.targetes) console.log(`  targeta ${x.n}  ${x.esq}..${x.dreta}  (${x.ample})`);
console.log('--- COLUMNES DE LA TDP');
for (const x of r.cols) console.log(`  columna ${x.n}  ${x.esq}..${x.dreta}  (${x.ample})`);
if (r.targetes.length === 4 && r.cols.length === 3) {
  const t = r.targetes;
  console.log('--- el que hauria de ser:');
  console.log(`  col1 = targeta 1        ${t[0].esq}..${t[0].dreta} (${t[0].ample})`);
  console.log(`  col2 = targetes 2+3     ${t[1].esq}..${t[2].dreta} (${t[2].dreta - t[1].esq})`);
  console.log(`  col3 = targeta 4        ${t[3].esq}..${t[3].dreta} (${t[3].ample})`);
}
await b.close();
