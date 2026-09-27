import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(3000);
const boto = await p.evaluateHandle(() => [...document.querySelectorAll('header button')].find((e) => /THE HUMAN INSIDE/i.test(e.textContent || '')));
await boto.asElement().click();
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const files = [...document.querySelectorAll('#stripe-guide-stripe-row, #stripe-guide-stripe-row-p1')];
  return files.map((f) => {
    const cont = f.querySelector('[data-stripe-visual-content]');
    const imgs = [...f.querySelectorAll('img')];
    return {
      id: f.id,
      offsetW: f.offsetWidth,
      offsetH: f.offsetHeight,
      rectW: +f.getBoundingClientRect().width.toFixed(1),
      contOffsetW: cont ? cont.offsetWidth : null,
      contRectW: cont ? +cont.getBoundingClientRect().width.toFixed(1) : null,
      contT: cont ? getComputedStyle(cont).transform : null,
      imgs: imgs.map((i) => [i.naturalWidth, +i.getBoundingClientRect().width.toFixed(1), i.complete]),
      escalaVar: getComputedStyle(document.documentElement).getPropertyValue('--megaStripeScale').trim(),
      dinsVp: f.closest('[data-mega-page-viewport]')?.getAttribute('data-mega-page-viewport') || null,
    };
  });
});
console.log(JSON.stringify(r, null, 1));
await b.close();
