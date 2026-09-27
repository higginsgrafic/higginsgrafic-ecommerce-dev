import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('svg.lucide-search').catch(() => {});
await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  const t = window.__tira;
  return { n: t.n, forats: t.forats, primers: t.items.slice(0, 8), coll: t.collections.slice(0, 8) };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
