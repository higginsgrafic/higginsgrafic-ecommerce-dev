// TEMPORAL — no es comiteja. El grid-template que rep el bloc de debò.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3500);
const r = await p.evaluate(() => {
  const img = [...document.querySelectorAll('img')].map((i) => ({ i, b: i.getBoundingClientRect() })).filter((x) => x.b.width > 250).sort((a, b2) => b2.b.width - a.b.width)[0];
  let el = img?.i;
  while (el && getComputedStyle(el).display !== 'grid') el = el.parentElement;
  const s = getComputedStyle(el);
  const b2 = el.getBoundingClientRect();
  return {
    inline: el.style.gridTemplateColumns,
    computed: s.gridTemplateColumns,
    width: s.width,
    gap: s.gap,
    esq: Math.round(b2.left), dreta: Math.round(b2.right), ample: Math.round(b2.width),
    marginLeft: s.marginLeft,
    fills: el.children.length,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
