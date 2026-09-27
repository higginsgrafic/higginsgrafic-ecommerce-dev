import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(4000);
// Cercar al cercador de la capcalera
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(1500);
const input = await p.$('input[type="search"], input[placeholder]');
if (input) {
  await input.fill('nx-01');
  await p.waitForTimeout(2500);
  const res = await p.evaluate(() => [...document.querySelectorAll('a[href*="/product"], button')]
    .map((e) => ({ t: (e.textContent || '').trim().slice(0, 40), h: e.getAttribute('href') }))
    .filter((x) => x.h || /nx/i.test(x.t)).slice(0, 12));
  console.log(JSON.stringify(res, null, 1));
} else console.log('sense input de cerca');
await b.close();
