import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/the-human-inside/afrodita', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const header = document.querySelector('header');
  const cands = [...header.querySelectorAll('a, div, span, svg')].map((e) => ({ e, b: e.getBoundingClientRect() })).filter((x) => x.b.width > 60 && x.b.width < 300 && x.b.top < 50);
  return cands.slice(0, 8).map((x) => ({ tag: x.e.tagName.toLowerCase(), cls: String(x.e.className).slice(0, 22), esq: Math.round(x.b.left), dreta: Math.round(x.b.right), dalt: Math.round(x.b.top), baix: Math.round(x.b.bottom) }));
});
for (const x of r) console.log(`${x.tag.padEnd(5)} esq=${String(x.esq).padStart(4)} dreta=${String(x.dreta).padStart(4)} dalt=${x.dalt} baix=${x.baix}  ${x.cls}`);
await b.close();
