// TEMPORAL — la cantonada dreta de la p1: el bloc i la punta de la franja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 4 });
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
await p.waitForTimeout(700);
const r = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="1"]');
  const q = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return [+x.left.toFixed(1), +x.top.toFixed(1), +x.width.toFixed(1), +x.height.toFixed(1)]; };
  return {
    bloc: q(v.querySelector('[data-bloc-dreta-p1="1"]')),
    fletxes: q(v.querySelector('[data-fletxes-p1="1"]')),
    franja: q(v.querySelector('[data-stripe-visual-content="1"]')),
    selector: q(v.querySelector('[data-stripe-buttonbar="bn-p1"]')),
  };
});
console.log(JSON.stringify(r));
await p.screenshot({ path: '_tmp-p1-cantonada.png', clip: { x: 1380, y: 230, width: 160, height: 140 } });
console.log('desat _tmp-p1-cantonada.png');
await ctx.close(); await b.close();
