// TEMPORAL — no es comiteja. Obertura amb el BOTO (com l'amo), fotogrames cada ~40 ms.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const [w, h] = (process.argv[2] || '1920x946').split('x').map(Number);
const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
const t0 = Date.now();
const files = [];
for (let k = 0; k < 45; k++) {
  const estat = await p.evaluate(() => {
    const panell = document.querySelector('[data-mega-panel-surface="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const car = v2 ? v2.querySelector('[data-carrusel="1"]') : null;
    const imgs = car ? [...car.querySelectorAll('img')] : [];
    const rr = car ? car.getBoundingClientRect() : null;
    const pintats = imgs.filter((im) => { const r = im.getBoundingClientRect(); return r.width > 0 && r.height > 0; }).length;
    const cs = panell ? getComputedStyle(panell) : null;
    return { op: cs ? Number(cs.opacity).toFixed(2) : '?', car: !!car, n: imgs.length, pintats, carY: rr ? Math.round(rr.top) : null, carH: rr ? Math.round(rr.height) : null, carX: rr ? Math.round(rr.left) : null, carW: rr ? Math.round(rr.width) : null };
  }).catch(() => ({ op: '?', car: false, n: 0, pintats: 0, carY: null, carH: null, carX: null, carW: null }));
  files.push({ k, t: Date.now() - t0, ...estat });
  await p.screenshot({ path: `_tmp-obc-${String(k).padStart(2, '0')}.png`, clip: { x: 330, y: 40, width: 1150, height: 420 } }).catch(() => {});
  await p.waitForTimeout(20);
}
for (const f of files.slice(0, 30)) console.log(`k=${String(f.k).padStart(2)} t=${String(f.t).padStart(4)}ms op=${f.op} carrusel=${f.car ? `${f.carX},${f.carY} ${f.carW}x${f.carH}` : 'no'} imgs=${f.n} pintats=${f.pintats}`);
console.log('--- fi');
await ctx.close();
await b.close();
