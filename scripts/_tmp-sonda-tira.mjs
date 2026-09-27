// TEMPORAL — no es comiteja. L'ordre real de la tira de la franja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=austen', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(5000);
const r = await p.evaluate(() => window.__tira);
console.log('n =', r.n);
r.items.forEach((it, i) => {
  const marca = /solid|frame/.test(it) ? '  <-- LFMD' : '';
  if (i < 34 || marca) console.log(String(i).padStart(3), r.collections[i].padEnd(12), it + marca);
});
await b.close();
