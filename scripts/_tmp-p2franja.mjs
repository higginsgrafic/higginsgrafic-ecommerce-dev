import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
const errors = [];
p.on('pageerror', (e) => errors.push(String(e).slice(0, 140)));
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(5000);
const r = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const f = v.querySelector('[data-stripe-visual-content="2"]');
  const imgs = [...f.querySelectorAll('img')].filter((i) => /drawings|images_grid/.test(i.src));
  return {
    franja: [+f.getBoundingClientRect().left.toFixed(1), +f.getBoundingClientRect().width.toFixed(1)],
    dibuixos: imgs.length,
    mostres: imgs.slice(0, 16).map((i) => i.src.split('/').slice(-2).join('/').slice(0, 34)),
    opacitats: [...new Set(imgs.map((i) => getComputedStyle(i).opacity))],
  };
});
console.log(JSON.stringify(r, null, 1));
console.log('errors', JSON.stringify(errors.slice(0, 2)));
await b.close();
