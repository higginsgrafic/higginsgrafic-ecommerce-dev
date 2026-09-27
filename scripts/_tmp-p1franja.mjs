import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 900]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(4500);
  const r = await p.evaluate(() => {
    const bx = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [+b.left.toFixed(1), +b.top.toFixed(1), +b.right.toFixed(1), +b.bottom.toFixed(1)]; };
    const p1 = document.querySelector('[data-mega-page-viewport="1"]');
    const p2 = document.querySelector('[data-mega-page-viewport="2"]');
    const vis = (sel, arrel) => [...(arrel || document).querySelectorAll(sel)].find((e) => e.getBoundingClientRect().width > 0) || null;
    const f1 = vis('[data-stripe-visual-content="1"]', p1);
    const f2 = vis('[data-stripe-visual-content="2"]', p2);
    return {
      p1: bx(f1), p1Transform: f1 ? getComputedStyle(f1).transform : null,
      p2: bx(f2), p2Transform: f2 ? getComputedStyle(f2).transform : null,
      carril: [+document.querySelector('[data-capcalera-fila="1"]').getBoundingClientRect().left.toFixed(1), +document.querySelector('[data-capcalera-fila="1"]').getBoundingClientRect().right.toFixed(1)],
    };
  });
  console.log(`${w}x${h}`, JSON.stringify(r));
  await ctx.close();
}
await b.close();
