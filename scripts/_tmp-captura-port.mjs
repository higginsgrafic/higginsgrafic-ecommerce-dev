// TEMPORAL — no es comiteja. Captura la p2 en vertical (tauleta).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const box = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const r = v2.getBoundingClientRect();
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const rf = franja.getBoundingClientRect();
  window.__n = [...franja.querySelectorAll('path[fill-opacity]')].length;
  window.__fills = [...franja.querySelectorAll('path[fill-opacity]')].map((x) => x.getAttribute('fill-opacity')).join(',');
  window.__z = (() => { const svg = franja.querySelector('svg'); return svg ? getComputedStyle(svg).zIndex : null; })();
  window.__caps = [...franja.querySelectorAll('svg, img')].map((el) => { const cs = getComputedStyle(el); return `${el.tagName}:z${cs.zIndex}:op${cs.opacity}:${(el.getAttribute('src')||el.getAttribute('class')||'').slice(0,24)}`; });
  return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), fx: Math.round(rf.left), fy: Math.round(rf.top), fw: Math.round(rf.width), fh: Math.round(rf.height) };
});
console.log('v2', box, 'paths amb fill-opacity:', await p.evaluate(() => window.__n), await p.evaluate(() => window.__fills), 'svg z', await p.evaluate(() => window.__z));
console.log('capes:', await p.evaluate(() => window.__caps));
await p.screenshot({ path: `_tmp-port-${act}.png`, clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.w, height: Math.min(box.h, 900) } });
await p.screenshot({ path: `_tmp-port-franja-${act}.png`, clip: { x: Math.max(0, box.fx), y: Math.max(0, box.fy), width: box.fw, height: box.fh } });
console.log('fet');
await ctx.close();
await b.close();
