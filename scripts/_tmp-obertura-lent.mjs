// TEMPORAL — no es comiteja. Obertura amb les imatges lentes (xarxa frenada).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const retard = Number(process.argv[2] || 1200);
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
// frena les imatges dels dibuixos (les de la graella)
const vist = new Map();
await p.route('**/*-grid.webp', async (route) => {
  const url = route.request().url();
  const n = vist.get(url) || 0;
  vist.set(url, n + 1);
  if (n === 0) await new Promise((r) => setTimeout(r, retard));
  await route.continue();
});
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
const t0 = Date.now();
const files = [];
for (let k = 0; k < 40; k++) {
  const estat = await p.evaluate(() => {
    const panell = document.querySelector('[data-mega-panel-surface="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const car = v2 ? v2.querySelector('[data-carrusel="1"]') : null;
    const imgs = car ? [...car.querySelectorAll('img')] : [];
    const visibles = imgs.filter((im) => { const r = im.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
    const decodificades = visibles.filter((im) => im.complete && im.naturalWidth > 0).length;
    const cs = panell ? getComputedStyle(panell) : null;
    return { op: cs ? Number(cs.opacity).toFixed(2) : '?', n: visibles.length, dec: decodificades };
  }).catch(() => ({ op: '?', n: 0, dec: 0 }));
  files.push({ k, t: Date.now() - t0, ...estat });
  await p.screenshot({ path: `_tmp-obl-${String(k).padStart(2, '0')}.png`, clip: { x: 330, y: 40, width: 1150, height: 420 } }).catch(() => {});
  await p.waitForTimeout(60);
}
for (const f of files) console.log(`k=${String(f.k).padStart(2)} t=${String(f.t).padStart(5)}ms op=${f.op} imgs=${f.n} decodificades=${f.dec}`);
console.log('--- fi');
await ctx.close();
await b.close();
