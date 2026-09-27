import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(4500);
const sel = () => p.evaluate(() => [...document.querySelectorAll('[data-p2-color-grid] button')]
  .filter((x) => getComputedStyle(x).outlineStyle !== 'none')
  .map((x) => x.getAttribute('data-color-barra')));
console.log('abans', await sel());
const caixes = await p.evaluate(() => [...document.querySelectorAll('[data-p2-color-grid] button')].map((x) => {
  const b = x.getBoundingClientRect();
  return { slug: x.getAttribute('data-color-barra'), x: b.left + b.width / 2, y: b.top + b.height / 2 };
}));
const a = caixes[2]; const z = caixes[9];
await p.mouse.move(a.x, a.y);
await p.mouse.down();
await p.mouse.move(z.x, z.y, { steps: 8 });
await p.mouse.up();
await p.waitForTimeout(700);
console.log('despres', await sel());
await b.close();
