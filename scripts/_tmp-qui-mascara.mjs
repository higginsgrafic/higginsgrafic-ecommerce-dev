// TEMPORAL — qui porta maskImage a la franja (contenidor i descendents), a p1 i p2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const res = [];
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    const m = cs.maskImage || cs.webkitMaskImage || 'none';
    if (!m || m === 'none') continue;
    const rr = el.getBoundingClientRect();
    if (rr.width < 1 || rr.height < 1) continue;
    res.push({
      tag: el.tagName,
      clase: String(el.className || '').slice(0, 30),
      dins: el.closest('[data-mega-page-viewport]')?.getAttribute('data-mega-page-viewport') || '-',
      rect: [Math.round(rr.left), Math.round(rr.top), Math.round(rr.width), Math.round(rr.height)],
      mask: m.slice(0, 90),
      size: cs.maskSize || cs.webkitMaskSize,
      pos: cs.maskPosition,
      rep: cs.maskRepeat,
    });
  }
  return res;
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
