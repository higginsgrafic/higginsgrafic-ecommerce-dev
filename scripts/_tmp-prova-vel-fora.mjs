import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(9000);
const abans = await p.evaluate(() => {
  const a = document.querySelector('a[data-franja][data-colleccio]');
  const r = a.getBoundingClientRect();
  return { href: a.getAttribute('href'), coll: a.getAttribute('data-colleccio'), centre: [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)], hiHaVel: !!document.querySelector('div.z-\\[9989\\]') };
});
console.log('abans:', JSON.stringify(abans));
await p.mouse.click(abans.centre[0], abans.centre[1]);
await p.waitForTimeout(2500);
const despres = await p.evaluate(() => ({ url: location.pathname + location.search, hiHaVel: !!document.querySelector('div.z-\\[9989\\]') }));
console.log('despres:', JSON.stringify(despres));
await b.close();
