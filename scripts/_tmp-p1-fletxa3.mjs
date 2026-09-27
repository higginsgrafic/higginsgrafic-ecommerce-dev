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
// (a) clic sintetic (dispatchEvent) a la fletxa
console.log('abans:', await tr());
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const el = v1.querySelector('[data-fletxes-p1="1"] button[aria-label="Següent"]');
  el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
});
await p.waitForTimeout(900);
console.log('despres del clic sintetic:', await tr());
// (b) la fletxa del BLOC o la del carrusel?
const qui = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const blocs = [...v1.querySelectorAll('#stripe-guide-right-arrow')].map((e) => ({ id: e.id, dins: !!e.closest('[data-fletxes-p1="1"]'), dinsCarrusel: !!e.closest('[data-carrusel="1"]') }));
  const fletxes = [...v1.querySelectorAll('[data-fletxes-p1="1"] button')].map((e) => e.getAttribute('aria-label'));
  return { blocs, fletxes };
});
console.log('fletxes:', JSON.stringify(qui));
await ctx.close();
await b.close();
