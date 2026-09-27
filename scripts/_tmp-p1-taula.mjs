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
  const info = [];
  for (const sel of ['[data-taula-vertical="1"]', '[data-taula-vertical="2"]', '[data-stripe-visual-content="1"]', '[data-stripe-visual-content="2"]']) {
    for (const el of v.querySelectorAll(sel)) {
      const cs = getComputedStyle(el);
      const q = el.getBoundingClientRect();
      let par = el.parentElement; const cadenes = [];
      for (let k = 0; k < 6 && par; k++) { const c = getComputedStyle(par); cadenes.push(`${c.visibility}/${c.opacity}/${c.display}/${c.overflow}`); par = par.parentElement; }
      info.push({ sel, rect: [+q.left.toFixed(1), +q.top.toFixed(1), +q.width.toFixed(1), +q.height.toFixed(1)], vis: cs.visibility, op: cs.opacity, display: cs.display, cadenes });
    }
  }
  return info;
});
console.log(JSON.stringify(r, null, 1));
await ctx.close(); await b.close();
