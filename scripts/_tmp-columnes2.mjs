// TEMPORAL — no es comiteja. On cau cada peça del bloc (especificacions, TDP,
// detalls) i on cauen les targetes. Que cal per moure una targeta a la dreta?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const targetes = [...document.querySelectorAll('[data-component="product-card"]')]
    .map((c) => c.getBoundingClientRect())
    .filter((x) => x.width > 0 && x.right > 0 && x.left >= -1 && x.left < window.innerWidth)
    .sort((a, b2) => a.left - b2.left)
    .slice(0, 5)
    .map((x, i) => ({ n: i + 1, esq: Math.round(x.left), dreta: Math.round(x.right) }));
  const img = [...document.querySelectorAll('img')].map((i) => ({ i, b: i.getBoundingClientRect() })).filter((x) => x.b.width > 250).sort((a, b2) => b2.b.width - a.b.width)[0];
  let bloc = img?.i; while (bloc && getComputedStyle(bloc).display !== 'grid') bloc = bloc.parentElement;
  const bb = bloc.getBoundingClientRect();
  const peces = [...bloc.children].map((c, i) => { const x = c.getBoundingClientRect(); return { n: i + 1, esq: Math.round(x.left), dreta: Math.round(x.right) }; });
  return {
    targetes,
    bloc: { esq: Math.round(bb.left), dreta: Math.round(bb.right), marginLeft: getComputedStyle(bloc).marginLeft },
    peces,
    ampladaTargeta: targetes.length > 1 ? targetes[1].esq - targetes[0].esq : null,
  };
});
console.log('targetes:', JSON.stringify(r.targetes));
console.log('bloc:', JSON.stringify(r.bloc));
console.log('peces:', JSON.stringify(r.peces));
console.log('pas entre targetes:', r.ampladaTargeta);
await b.close();
