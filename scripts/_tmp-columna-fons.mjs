import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(7000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  let el = v2.querySelector('[data-colleccions-targeta="1"]');
  const out = [];
  for (let i = 0; i < 5 && el && el !== v2; i++) {
    const cs = getComputedStyle(el);
    out.push({ i, tag: el.tagName, border: cs.borderTopWidth, bg: cs.backgroundColor, w: Math.round(el.getBoundingClientRect().width), h: Math.round(el.getBoundingClientRect().height) });
    el = el.parentElement;
  }
  return out;
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
