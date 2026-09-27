import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
console.log(JSON.stringify(await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const dx1 = -v1.getBoundingClientRect().left, dx2 = -v2.getBoundingClientRect().left;
  const files = (v, dx) => {
    const carr = v.querySelector('[data-carrusel="1"]');
    const tira = carr?.firstElementChild?.firstElementChild;
    const peces = [...(tira?.querySelectorAll('button') || [])].map((x) => { const q = x.getBoundingClientRect(); return { y: +(q.top).toFixed(2), cy: +(q.top + q.height / 2).toFixed(2), w: +q.width.toFixed(2), x: +(q.left + dx).toFixed(1), st: (x.getAttribute('style') || '').match(/top: ([^;]+)/)?.[1] }; });
    const agrup = {};
    peces.forEach((q) => { const k = q.cy.toFixed(1); agrup[k] = (agrup[k] || 0) + 1; });
    return { carrusel: { y: +carr.getBoundingClientRect().top.toFixed(2), h: +carr.getBoundingClientRect().height.toFixed(2) }, tira: { y: +tira.getBoundingClientRect().top.toFixed(2), h: +tira.getBoundingClientRect().height.toFixed(2), mt: getComputedStyle(tira).marginTop }, primer: peces[0], segon: peces[1], files: agrup };
  };
  return { p1: files(v1, dx1), p2: files(v2, dx2) };
}), null, 1));
await ctx.close();
await b.close();
