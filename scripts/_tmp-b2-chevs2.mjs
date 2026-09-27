import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const bloc = v1.querySelector('[data-bloc-dreta-p1="1"]');
  return [...bloc.querySelectorAll('svg')].map((s) => {
    const q = s.getBoundingClientRect();
    const pare = s.closest('button')?.getAttribute('aria-label') || null;
    return { pare, cx: +(q.left + q.width / 2).toFixed(1), cy: +(q.top + q.height / 2).toFixed(1), w: +q.width.toFixed(1), cls: String(s.getAttribute('class')).slice(-40), pos: getComputedStyle(s).position, top: getComputedStyle(s).top, transform: getComputedStyle(s).transform };
  });
}), null, 1));
await ctx.close();
await b.close();
