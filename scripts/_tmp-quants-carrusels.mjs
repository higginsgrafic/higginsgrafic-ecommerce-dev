import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2200);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4000);
const d = await p.evaluate(() => {
  const tots = [...document.querySelectorAll('[data-carrusel="1"]')];
  return tots.map((el) => {
    const b2 = el.getBoundingClientRect();
    const v2 = el.closest('[data-mega-page-viewport="2"]');
    return {
      visible: getComputedStyle(el).visibility,
      dins: !!v2,
      peces: el.querySelectorAll('button').length,
      rect: `${Math.round(b2.left)},${Math.round(b2.top)} ${Math.round(b2.width)}x${Math.round(b2.height)}`,
      top0: el.querySelector('button')?.style.top,
      pare: el.parentElement?.className?.slice(0, 30) || el.parentElement?.tagName,
      avi: el.closest('[data-taula-vertical]') ? 'taula-vertical' : (el.closest('[data-p2-cercador-row]') ? 'filera-p2' : '?'),
    };
  });
});
console.log(`elements [data-carrusel="1"]: ${d.length}`);
for (const [i, x] of d.entries()) console.log(`  ${i}: visibilitat=${x.visible} dins_v2=${x.dins} ${x.avi} peces=${x.peces} rect=${x.rect} top0=${x.top0}`);
await b.close();
