import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 } });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(10000);
await p.evaluate(() => { const v = document.querySelector('[data-mega-page-viewport="1"]'); let t = v.parentElement; while (t && !(t.style && t.style.width === '400%')) t = t.parentElement; if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; } });
await p.waitForTimeout(500);
const r = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const f = v.querySelector('[data-stripe-visual-content="1"]');
  return [...f.querySelectorAll('img')].map((i) => {
    const cs = getComputedStyle(i);
    const q = i.getBoundingClientRect();
    return { src: (i.getAttribute('src') || '').slice(0, 46), z: cs.zIndex, op: cs.opacity, vis: cs.visibility, rect: [Math.round(q.left), Math.round(q.top), Math.round(q.width), Math.round(q.height)] };
  });
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
