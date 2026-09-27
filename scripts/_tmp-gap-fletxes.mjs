// TEMPORAL — no es coiteja. El gap entre la columna de colleccions i les fletxes.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w,h,touch] of [[1920,946,false],[1440,900,false],[1366,768,true],[1024,768,true]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(8000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const carr = v2.querySelector('[data-carrusel="1"]');
    const fletxa = v2.querySelector('#stripe-guide-right-arrow');
    const col = v2.querySelector('[data-colleccions-targeta]')?.parentElement;
    const q = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: +b.left.toFixed(1), r: +b.right.toFixed(1), w: +b.width.toFixed(1) }; };
    const c = q(carr), f = q(fletxa), co = q(col);
    return {
      carrusel: c, fletxa: f, columna: co,
      gapCarruselColumna: c && co ? +(co.x - c.r).toFixed(1) : null,
      gapFletxaColumna: f && co ? +(co.x - f.r).toFixed(1) : null,
    };
  });
  console.log(`${w}x${h}`, JSON.stringify(r));
  await ctx.close();
}
await b.close();
