import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
// Forcem la pagina 1 al davant NOMES per veure que hi ha a sota la franja.
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(600);
await p.screenshot({ path: '_tmp-b2-vista1.png', clip: { x: 1380, y: 80, width: 180, height: 290 } });
// Amb la franja amagada, per veure el bloc sol.
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const f = v1.querySelector('[data-stripe-visual-content="1"]');
  if (f) f.style.visibility = 'hidden';
});
await p.waitForTimeout(300);
await p.screenshot({ path: '_tmp-b2-vista1-sense-franja.png', clip: { x: 1380, y: 80, width: 180, height: 290 } });
console.log('desats');
await ctx.close();
await b.close();
