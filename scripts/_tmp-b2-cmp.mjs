import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w,h,touch,tauleta] of [[1024,768,true,true],[1366,768,true,true],[1440,900,false,false]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(6000);
  const r = await p.evaluate(() => {
    const pela = (et) => [...document.querySelectorAll('button[aria-label]')].find((x) => x.getAttribute('aria-label') === et);
    const nx = pela('NX-01');
    const mz = pela('Mazinger-Z');
    const ncc = pela('NCC-1701');
    const cg = [...document.querySelectorAll('[data-p2-color-grid]')].find((e) => e.getBoundingClientRect().width > 0);
    const arrel = cg?.closest('[data-mega-page-viewport="2"]') || document;
    const sam = arrel.querySelector('[data-stripe-visual-content="2"]');
    const carr = arrel.querySelector('[data-carrusel="1"]');
    const retall = carr?.firstElementChild;
    const f = document.querySelector('[data-capcalera-fila="1"]');
    const q = (el) => el ? { x: +el.getBoundingClientRect().left.toFixed(1), r: +el.getBoundingClientRect().right.toFixed(1), w: +el.getBoundingClientRect().width.toFixed(1) } : null;
    return {
      nx: q(nx), mz: q(mz), ncc: q(ncc), sam: q(sam), carr: q(carr), retall: q(retall), capcalera: q(f),
      carril: getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w').trim(),
      samImg: sam ? getComputedStyle(sam).transform : null,
      v2: q(document.querySelector('[data-mega-page-viewport="2"]')),
    };
  });
  console.log(w, JSON.stringify(r, null, 1));
  await ctx.close();
}
await b.close();
