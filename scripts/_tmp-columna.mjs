import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(5000);
const r = await p.evaluate(() => {
  const bx = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [+b.left.toFixed(1), +b.top.toFixed(1), +b.right.toFixed(1), +b.bottom.toFixed(1)]; };
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const boto = [...v.querySelectorAll('button')].find((x) => /MISCEL/i.test(x.textContent || ''));
  const col = boto ? boto.parentElement : null;
  const cs = col ? getComputedStyle(col) : null;
  return {
    botons: boto ? bx(boto) : null,
    col: bx(col),
    estil: cs ? { position: cs.position, top: cs.top, bottom: cs.bottom, height: cs.height, display: cs.display, flexDirection: cs.flexDirection, justifyContent: cs.justifyContent } : null,
    pare: col && col.parentElement ? { box: bx(col.parentElement), position: getComputedStyle(col.parentElement).position, display: getComputedStyle(col.parentElement).display } : null,
    filles: col ? [...col.children].map((c) => +c.getBoundingClientRect().bottom.toFixed(1)) : null,
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
