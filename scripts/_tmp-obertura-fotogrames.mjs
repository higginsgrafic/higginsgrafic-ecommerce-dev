// TEMPORAL — no es comiteja. Fotogrames de l'obertura (cada ~120 ms) amb l'opacitat del panell.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const act = process.argv[2] || 'first_contact';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'commit', timeout: 180000 });
const t0 = Date.now();
const files = [];
for (let k = 0; k < 40; k++) {
  const estat = await p.evaluate(() => {
    const panell = document.querySelector('[data-mega-panel-surface="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const car = v2 ? v2.querySelector('[data-carrusel="1"]') : null;
    const imgs = car ? [...car.querySelectorAll('img')] : [];
    const pintades = imgs.filter((im) => { const r = im.getBoundingClientRect(); return r.width > 0 && r.bottom > 0 && r.top < 946; }).length;
    const cs = panell ? getComputedStyle(panell) : null;
    return { op: cs ? Number(cs.opacity).toFixed(2) : '?', vis: !!panell, car: !!car, n: imgs.length, pintades };
  }).catch(() => ({ op: '?', vis: false, car: false, n: 0, pintades: 0 }));
  files.push({ k, t: Date.now() - t0, ...estat });
  await p.screenshot({ path: `_tmp-obf-${String(k).padStart(2, '0')}.png`, clip: { x: 330, y: 40, width: 1150, height: 420 } }).catch(() => {});
  await p.waitForTimeout(90);
}
for (const f of files) console.log(`k=${String(f.k).padStart(2)} t=${String(f.t).padStart(5)}ms op=${f.op} panell=${f.vis ? 'si' : 'no'} carrusel=${f.car ? 'si' : 'no'} imgs=${f.n} visibles=${f.pintades}`);
console.log('--- fi');
await ctx.close();
await b.close();
