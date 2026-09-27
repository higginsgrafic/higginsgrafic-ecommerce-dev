import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
await p.evaluate(() => {
  window.__W = [];
  window.addEventListener('wheel', (e) => {
    const t = e.target;
    window.__W.push({ dy: e.deltaY, t: t.tagName + (t.getAttribute && t.getAttribute('data-p2-color-grid') !== null ? '[grid]' : '') + (t.getAttribute && t.getAttribute('data-color-barra') ? '[barra]' : '') + (t.closest && t.closest('[data-p2-color-grid]') ? ' dins-grid' : ''), defaultPrevented: e.defaultPrevented });
  }, true);
});
const c = await p.evaluate(() => { const r = document.querySelector('[data-p2-color-grid]').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; });
await p.mouse.move(c.x, c.y);
await p.mouse.wheel(0, 120);
await p.waitForTimeout(500);
console.log('events de colors:', JSON.stringify(await p.evaluate(() => window.__W)));
await p.evaluate(() => { window.__W = []; });
const g = await p.evaluate(() => { const r = document.querySelector('[data-mega-page-viewport="2"] [data-carrusel="1"]').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; });
await p.mouse.move(g.x, g.y);
await p.mouse.wheel(0, 120);
await p.waitForTimeout(500);
console.log('events de la graella p2:', JSON.stringify(await p.evaluate(() => window.__W)));
await ctx.close();
await b.close();
