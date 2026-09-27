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
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(600);
const tr = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  return getComputedStyle(v1.querySelector('[data-carrusel="1"]').firstElementChild.firstElementChild).transform;
});
const info = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const el = v1.querySelector('[data-fletxes-p1="1"] button[aria-label="Següent"]');
  const r = el.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  const top = document.elementFromPoint(x, y);
  return { x: Math.round(x), y: Math.round(y), top: top ? `${top.tagName}${top.id ? '#' + top.id : ''}.${String(top.className).split(' ').slice(0, 3).join('.')}` : null, esLaFletxa: el === top || el.contains(top) };
});
console.log('fletxa:', JSON.stringify(info), 'abans:', await tr());
await p.mouse.click(info.x, info.y);
await p.waitForTimeout(1000);
console.log('despres:', await tr());
await ctx.close();
await b.close();
