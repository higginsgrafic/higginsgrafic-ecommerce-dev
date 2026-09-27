// TEMPORAL — no es comiteja. Que es veu ABANS que el panell s'obri? (captures cada 40 ms)
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const act = process.argv[2] || 'first_contact';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2500);
// zona de la graella de dibuixos (p2): la mesurem abans d'obrir
const zona = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const car = v2?.querySelector('[data-carrusel="1"]');
  const r = car ? car.getBoundingClientRect() : null;
  return r ? { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } : null;
});
console.log('zona graella (p2):', JSON.stringify(zona));
const clip = zona ? { x: Math.max(0, zona.x - 10), y: Math.max(0, zona.y - 10), width: zona.w + 20, height: Math.min(zona.h + 20, 400) } : { x: 500, y: 100, width: 900, height: 300 };
await p.click('button:has(svg.lucide-search)').catch(() => {});
const files = [];
for (let k = 0; k < 40; k++) {
  const estat = await p.evaluate(() => {
    const panell = document.querySelector('[data-mega-panel-surface="1"]');
    const cs = panell ? getComputedStyle(panell) : null;
    const imgs = [...document.querySelectorAll('[data-carrusel="1"] img')].filter((im) => im.getBoundingClientRect().width > 0);
    const carregades = imgs.filter((im) => im.complete && im.naturalWidth > 0).length;
    return { op: cs ? Number(cs.opacity).toFixed(2) : '?', tf: cs ? cs.transform.slice(0, 24) : '', n: imgs.length, carregades };
  });
  files.push({ k, ...estat });
  await p.screenshot({ path: `_tmp-ob-${String(k).padStart(2, '0')}.png`, clip }).catch(() => {});
  await p.waitForTimeout(40);
}
let previ = null;
for (const f of files) {
  const clau = `${f.op}|${f.tf}|${f.n}|${f.carregades}`;
  if (clau !== previ) { console.log(`k=${String(f.k).padStart(2)} (${f.k * 40}ms) opacitat ${f.op} tf ${f.tf} imgs ${f.n} carregades ${f.carregades}`); previ = clau; }
}
console.log('--- fi');
await ctx.close();
await b.close();
