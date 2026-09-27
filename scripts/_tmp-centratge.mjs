import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [1512, 900], [2560, 1306], [1680, 900], [2000, 1000]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const row = v2.querySelector('[data-p2-cercador-row]');
    const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const g = row.getBoundingClientRect();
    const s = sel.getBoundingClientRect();
    return { res: +((g.top + g.height / 2) - (s.top + s.height / 2)).toFixed(2) };
  });
  console.log(`${w}x${h}: centre filera - centre selector = ${r.res} px`);
  await ctx.close();
}
await b.close();
