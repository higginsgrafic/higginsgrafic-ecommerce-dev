import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
// Mou la tira de pagines per posar la 1 al davant (nomes per a la mesura).
const ok = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let tira = v1.parentElement;
  while (tira && !(tira.style && tira.style.width === '400%')) tira = tira.parentElement;
  if (!tira) return 'no trobada';
  tira.style.transition = 'none';
  tira.style.transform = 'translateX(0%)';
  return tira.getBoundingClientRect().width;
});
await p.waitForTimeout(500);
const estat = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const t = v1.querySelector('[data-carrusel="1"]')?.firstElementChild?.firstElementChild;
  return getComputedStyle(t).transform;
});
const info = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const el = v1.querySelector('#stripe-guide-right-arrow');
  const an = v1.querySelector('button[aria-label="Anterior"]');
  const mid = (r) => [r.left + r.width / 2, r.top + r.height / 2];
  const [x, y] = mid(el.getBoundingClientRect()); const [xa, ya] = mid(an.getBoundingClientRect());
  const e1 = document.elementFromPoint(x, y); const e2 = document.elementFromPoint(xa, ya);
  return { v1Left: +v1.getBoundingClientRect().left.toFixed(0), dreta: { x: +x.toFixed(0), y: +y.toFixed(0), qui: e1 ? (e1.id || e1.tagName) : null }, esq: { x: +xa.toFixed(0), y: +ya.toFixed(0), qui: e2 ? (e2.getAttribute('aria-label') || e2.tagName) : null } };
});
console.log('tira', ok, 'abans', await estat(), JSON.stringify(info));
await p.mouse.click(info.dreta.x, info.dreta.y);
await p.waitForTimeout(1200);
console.log('despres DREITA', await estat());
await p.mouse.click(info.esq.x, info.esq.y);
await p.waitForTimeout(1200);
console.log('despres ESQUERRA', await estat());
await p.screenshot({ path: '_tmp-b2-p1-clic.png', clip: { x: 1300, y: 60, width: 280, height: 320 } });
await ctx.close();
await b.close();
