import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(10000);
await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(600);
const r = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const f = v.querySelector('[data-stripe-visual-content="1"]');
  const fr = f.getBoundingClientRect();
  const x = fr.left + 33; const y = fr.top + 50;
  const els = document.elementsFromPoint(x, y).slice(0, 10).map((e) => {
    const cs = getComputedStyle(e);
    return `${e.tagName}.${String(e.className || '').slice(0, 26)}[z=${cs.zIndex} op=${cs.opacity} bg=${cs.backgroundColor} blend=${cs.mixBlendMode} filter=${cs.filter} tr=${cs.transform !== 'none' ? 'si' : 'no'}]`;
  });
  return { punt: [Math.round(x), Math.round(y)], els };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
