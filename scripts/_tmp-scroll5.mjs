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
  const tots = [...document.querySelectorAll('[data-p2-color-grid]')];
  return tots.map((cg, i) => {
    const q = cg.getBoundingClientRect();
    const vp = cg.closest('[data-mega-page-viewport]')?.getAttribute('data-mega-page-viewport') || '?';
    return { i, vp, x: Math.round(q.left), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height), vis: getComputedStyle(cg).visibility };
  });
})));
// Esdeveniment a cada instancia i mirem si canvia la tria.
for (const idx of [0, 1]) {
  await p.evaluate((i) => {
    const cg = document.querySelectorAll('[data-p2-color-grid]')[i];
    if (cg) cg.dispatchEvent(new WheelEvent('wheel', { deltaY: 120, bubbles: true, cancelable: true }));
  }, idx);
  await p.waitForTimeout(600);
  const t = await p.evaluate(() => {
    const out = [];
    document.querySelectorAll('[data-p2-color-grid]').forEach((cg, i) => {
      const m = [...cg.querySelectorAll('button')].find((x) => getComputedStyle(x).outlineStyle === 'solid');
      out.push(`${i}:${m ? m.getAttribute('data-color-barra') : '-'}`);
    });
    return out.join(' ');
  });
  console.log('despres de l esdeveniment a', idx, '->', t);
}
await ctx.close();
await b.close();
