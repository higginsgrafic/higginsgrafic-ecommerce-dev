// TEMPORAL — no es comiteja. Zoom al canton esquerre de la franja d'escriptori.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const act = process.argv[2] || 'miscellania';
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 4 });
const p = await ctx.newPage();
await p.goto(`http://127.0.0.1:3003/nova/inici?active=${act}`, { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const info = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  window.__franja = franja;
  const r = franja.getBoundingClientRect();
  const imgs = [...franja.querySelectorAll('img')].map((im) => {
    const rr = im.getBoundingClientRect();
    return { src: (im.getAttribute('src') || '').slice(0, 28), box: `${rr.left.toFixed(1)},${rr.top.toFixed(1)} ${rr.width.toFixed(1)}x${rr.height.toFixed(1)}` };
  });
  return { r: { x: r.left, y: r.top, w: r.width, h: r.height }, imgs };
});
console.log('franja', JSON.stringify(info.r));
for (const im of info.imgs.slice(0, 3)) console.log('   img', im.box, im.src);
const clip = { x: Math.max(0, Math.round(info.r.x - 20)), y: Math.max(0, Math.round(info.r.y - 8)), width: 200, height: Math.round(info.r.h + 16) };
await p.screenshot({ path: `_tmp-zd-on-${act}.png`, clip });
await p.evaluate(() => {
  for (const im of window.__franja.querySelectorAll('img')) {
    const s = im.getAttribute('src') || '';
    if (s.startsWith('data:image/svg+xml') && /fill-opacity="0\.6"/.test(decodeURIComponent(s))) im.style.opacity = '0';
  }
});
await p.waitForTimeout(250);
await p.screenshot({ path: `_tmp-zd-off-${act}.png`, clip });
console.log('clip', JSON.stringify(clip));
await ctx.close();
await b.close();
