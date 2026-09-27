import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
console.log(JSON.stringify(await p.evaluate(() => {
  const cg = document.querySelector('[data-p2-color-grid]');
  const r = cg.getBoundingClientRect();
  const x = r.left + r.width / 2, y = r.top + r.height / 2;
  return {
    punt: { x: Math.round(x), y: Math.round(y) },
    stack: document.elementsFromPoint(x, y).slice(0, 6).map((e) => `${e.tagName}${e.id ? '#' + e.id : ''}${e.getAttribute('data-p2-color-grid') !== null ? '[grid]' : ''}${e.getAttribute('data-color-barra') ? '[barra]' : ''}.${String(e.className).split(' ')[0].slice(0, 20)}`),
    cgPE: getComputedStyle(cg).pointerEvents,
    parePE: getComputedStyle(cg.parentElement).pointerEvents,
    aviPE: getComputedStyle(cg.parentElement.parentElement).pointerEvents,
  };
}), null, 1));
await ctx.close();
await b.close();
