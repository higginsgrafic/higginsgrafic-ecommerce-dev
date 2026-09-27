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
  const arbre = (el, prof) => {
    if (!el || prof > 3) return null;
    const q = el.getBoundingClientRect();
    return {
      tag: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.getAttribute('data-fletxes-p1') ? '[fletxes]' : '') + (el.getAttribute('data-stripe-buttonbar') ? '[selector]' : ''),
      y: +q.top.toFixed(1), h: +q.height.toFixed(1), pos: getComputedStyle(el).position, disp: getComputedStyle(el).display,
      fills: [...el.children].map((c) => arbre(c, prof + 1)).filter(Boolean),
    };
  };
  return arbre(bloc, 0);
}), null, 1));
await ctx.close();
await b.close();
