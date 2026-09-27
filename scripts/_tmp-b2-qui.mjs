import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
console.log(JSON.stringify(await p.evaluate(() => {
  const tots = [...document.querySelectorAll('button[aria-label]')].filter((x) => x.querySelector('svg.lucide-chevron-left, svg.lucide-chevron-right'));
  return tots.map((x) => {
    const q = x.getBoundingClientRect();
    const vp = x.closest('[data-mega-page-viewport]')?.getAttribute('data-mega-page-viewport');
    const bloc = x.closest('[data-bloc-dreta-p1="1"]') ? 'bloc-p1' : (x.closest('[data-fletxes-p1="1"]') ? 'fletxes-p1' : (x.closest('#stripe-guide-right-anchor') ? 'anchor' : 'altre'));
    return { label: x.getAttribute('aria-label'), vp, bloc, x: +q.left.toFixed(0), y: +q.top.toFixed(0), h: +q.height.toFixed(0), pareCls: String(x.parentElement?.className).slice(0, 30) };
  });
}), null, 1));
await ctx.close();
await b.close();
