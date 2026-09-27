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
// Dibuixa les caixes de les peces que mesurem, damunt de tot.
const caixes = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const marca = (el, color) => { const q = el.getBoundingClientRect(); const d = document.createElement('div'); d.style.cssText = `position:fixed;left:${q.left}px;top:${q.top}px;width:${q.width}px;height:${q.height}px;border:2px solid ${color};z-index:99999;pointer-events:none;box-sizing:border-box`; document.body.appendChild(d); return { x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height) }; };
  const out = {
    selector: marca(v1.querySelector('[data-stripe-buttonbar="bn-p1"]'), 'red'),
    fletxes: marca(v1.querySelector('[data-fletxes-p1="1"]'), 'blue'),
    franja: marca(v1.querySelector('[data-stripe-visual-content="1"]'), 'green'),
  };
  for (const s of v1.querySelectorAll('[data-bloc-dreta-p1="1"] svg')) marca(s, 'magenta');
  return out;
});
console.log(JSON.stringify(caixes, null, 1));
await p.screenshot({ path: '_tmp-b2-marca.png', clip: { x: 1330, y: 60, width: 240, height: 320 } });
await ctx.close();
await b.close();
