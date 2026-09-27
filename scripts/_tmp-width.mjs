import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3500);
const r = await p.evaluate(() => {
  const img = [...document.querySelectorAll('img')].map((i) => ({ i, b: i.getBoundingClientRect() })).filter((x) => x.b.width > 250).sort((a, b2) => b2.b.width - a.b.width)[0];
  let el = img?.i; while (el && getComputedStyle(el).display !== 'grid') el = el.parentElement;
  const s = getComputedStyle(el);
  return { inlineWidth: el.style.width, computed: s.width, minWidth: s.minWidth, maxWidth: s.maxWidth, flex: s.flex, overflow: s.overflow, parent: String(el.parentElement.className).slice(0, 24), parentW: el.parentElement.getBoundingClientRect().width, cls: String(el.className).slice(0, 24) };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
