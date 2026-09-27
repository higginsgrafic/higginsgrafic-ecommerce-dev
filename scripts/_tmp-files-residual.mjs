import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1440, 800], [1512, 900], [2560, 1306]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const r = await p.evaluate(() => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
    const crop = v2.querySelector('[data-carrusel="1"] > div');
    const tira = crop.firstElementChild;
    const btns = [...tira.querySelectorAll('button')];
    const caixes = btns.map((x) => x.getBoundingClientRect());
    const files = [...new Set(caixes.map((x) => +x.top.toFixed(1)))].sort((a, b) => a - b);
    const centre = (i) => { const f = caixes.filter((x) => +x.top.toFixed(1) === files[i]); return (Math.min(...f.map((x) => x.top)) + Math.max(...f.map((x) => x.bottom))) / 2; };
    const s = sel.getBoundingClientRect();
    const cella = s.height / 3;
    return { res0: +(centre(0) - (s.top + cella / 2)).toFixed(2), res1: +(centre(1) - (s.top + cella * 1.5)).toFixed(2), cella: +cella.toFixed(3) };
  });
  console.log(`${w}x${h}: residu fila0 ${r.res0} px, fila1 ${r.res1} px (cella DOM ${r.cella})`);
  await ctx.close();
}
await b.close();
