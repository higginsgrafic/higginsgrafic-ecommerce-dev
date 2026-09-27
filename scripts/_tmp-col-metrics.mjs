import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
console.log(JSON.stringify(await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const col = v2.querySelector('[data-colleccions-targeta]').parentElement;
  const cs = getComputedStyle(col);
  const act = [...v2.querySelectorAll('[data-colleccions-targeta]')].find((x) => x.getAttribute('aria-current') === 'true');
  const q = (e) => { const r = e.getBoundingClientRect(); return { y: +r.top.toFixed(2), h: +r.height.toFixed(2), w: +r.width.toFixed(2) }; };
  return {
    col: { ...q(col), pad: cs.padding, border: cs.borderWidth, box: cs.boxSizing, h: cs.height, minH: cs.minHeight, maxH: cs.maxHeight, overflow: cs.overflow, display: cs.display, flexDir: cs.flexDirection },
    actiu: { ...q(act), flex: getComputedStyle(act).flex, alignSelf: getComputedStyle(act).alignSelf, minH: getComputedStyle(act).minHeight },
    fills: [...col.children].map((c) => ({ tag: c.tagName, ...q(c), flex: getComputedStyle(c).flex })),
  };
}), null, 1));
await ctx.close();
await b.close();
