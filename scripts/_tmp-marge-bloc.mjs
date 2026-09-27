import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const img = [...document.querySelectorAll('img')].map((i) => ({ i, b: i.getBoundingClientRect() })).filter((x) => x.b.width > 250).sort((a, b2) => b2.b.width - a.b.width)[0];
  let el = img?.i; while (el && getComputedStyle(el).display !== 'grid') el = el.parentElement;
  const s = getComputedStyle(el);
  const b2 = el.getBoundingClientRect();
  return { margin: s.margin, marginLeft: s.marginLeft, width: s.width, esq: Math.round(b2.left), dreta: Math.round(b2.right), centre: Math.round((b2.left + b2.right) / 2), carrilCentre: Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w')) / 2 + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-x') || 0)) };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
