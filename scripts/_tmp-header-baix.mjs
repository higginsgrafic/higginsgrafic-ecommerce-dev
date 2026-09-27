import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const header = document.querySelector('header');
  const out = [];
  const walk = (el, d) => {
    if (d > 3) return;
    const x = el.getBoundingClientRect();
    out.push({ d, tag: el.tagName, cls: String(el.className).slice(0, 40), top: +x.top.toFixed(1), baix: +(x.top + x.height).toFixed(1) });
    for (const c of el.children) walk(c, d + 1);
  };
  walk(header, 0);
  return out.filter((o) => o.baix <= 120).slice(0, 14);
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
