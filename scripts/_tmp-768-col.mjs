import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w,h] of [[768,1024],[1024,768]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(9000);
  console.log(w + 'x' + h, JSON.stringify(await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const ts = [...v2.querySelectorAll('[data-colleccions-targeta]')];
    const col = ts[0]?.parentElement;
    const sam = v2.querySelector('[data-stripe-visual-content="2"]');
    const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const q = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { y: +r.top.toFixed(1), b: +r.bottom.toFixed(1), h: +r.height.toFixed(1), w: +r.width.toFixed(1) }; };
    const cs = col ? getComputedStyle(col) : null;
    return {
      n: ts.length,
      col: q(col),
      colPad: cs ? cs.padding : null,
      colPos: cs ? cs.position + ' ' + cs.top + ' ' + cs.bottom : null,
      primera: q(ts[0]),
      darrera: q(ts[ts.length - 1]),
      sam: q(sam),
      sel: q(sel),
      v2: q(v2),
    };
  })));
  await ctx.close();
}
await b.close();
