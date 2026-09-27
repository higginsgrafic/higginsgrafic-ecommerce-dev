import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(600);
console.log(JSON.stringify(await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const rootDiv = v1.querySelector(':scope > div');
  const filera = v1.querySelector('[data-filera-p1="1"]');
  const bloc = v1.querySelector('[data-bloc-dreta-p1="1"]');
  const sel = v1.querySelector('[data-stripe-buttonbar="bn-p1"]');
  const fl = v1.querySelector('[data-fletxes-p1="1"]');
  const fr = v1.querySelector('[data-stripe-visual-content="1"]');
  const q = (el) => { const r = el.getBoundingClientRect(); return { y: +r.top.toFixed(1), h: +r.height.toFixed(1), b: +r.bottom.toFixed(1) }; };
  return {
    rootTransform: getComputedStyle(rootDiv).transform,
    pare: { y: +v1.getBoundingClientRect().top.toFixed(1) },
    filera: q(filera), bloc: q(bloc), sel: q(sel), fletxes: q(fl), franja: q(fr),
    chevAnterior: q(v1.querySelector('button[aria-label="Anterior"]')),
    chevSeguent: q(v1.querySelector('button[aria-label="Següent"]')),
  };
}), null, 1));
await ctx.close();
await b.close();
