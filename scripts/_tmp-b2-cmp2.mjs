import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w,h,touch] of [[1024,768,true],[1366,768,true],[1440,900,false]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(6000);
  console.log(w, JSON.stringify(await p.evaluate(() => {
    const a = [...document.querySelectorAll('[data-carrusel="1"] #stripe-guide-right-arrow')].filter((el) => el.getBoundingClientRect().width > 0);
    const f = document.querySelector('[data-capcalera-fila="1"]');
    return {
      fletxesCarrusel: a.map((el) => { const q = el.getBoundingClientRect(); const vp = el.closest('[data-mega-page-viewport]')?.getAttribute('data-mega-page-viewport'); return { vp, x: +q.left.toFixed(1), r: +q.right.toFixed(1) }; }),
      fletxesR: a.length ? +a[a.length - 1].getBoundingClientRect().right.toFixed(1) : null,
      carrilL: f ? +f.getBoundingClientRect().left.toFixed(1) : null,
      carrilR: f ? +f.getBoundingClientRect().right.toFixed(1) : null,
    };
  })));
  await ctx.close();
}
await b.close();
