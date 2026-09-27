import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3500);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const hasColor = (v) => v ? [...v.querySelectorAll('button[aria-label]')].some((x) => x.getAttribute('aria-label') === 'Color') : null;
  return { p1Color: hasColor(v1), p2Color: hasColor(v2), v1: !!v1, v2: !!v2 };
});
console.log(JSON.stringify(r));
await b.close();
