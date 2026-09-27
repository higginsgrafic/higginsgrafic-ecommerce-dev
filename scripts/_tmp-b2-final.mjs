import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const dx1 = -v1.getBoundingClientRect().left, dx2 = -v2.getBoundingClientRect().left;
  const bx = (el, dx) => { const q = el.getBoundingClientRect(); return { x: +(q.left + dx).toFixed(1), y: +q.top.toFixed(1), w: +q.width.toFixed(1), h: +q.height.toFixed(1), r: +(q.right + dx).toFixed(1), b: +q.bottom.toFixed(1) }; };
  const filesPeces = (v, dx) => {
    const carr = v.querySelector('[data-carrusel="1"]');
    const tira = carr?.firstElementChild?.firstElementChild;
    const peces = [...(tira?.querySelectorAll('button') || [])].map((x) => { const q = x.getBoundingClientRect(); return { y: +(q.top + dx * 0).toFixed(2), cy: +(q.top + q.height / 2).toFixed(2), w: +q.width.toFixed(2), x: +(q.left + dx).toFixed(1) }; });
    const agrup = {};
    peces.forEach((q) => { const k = q.cy.toFixed(1); if (!agrup[k]) agrup[k] = { n: 0, x0: q.x, w: q.w }; agrup[k].n += 1; });
    return agrup;
  };
  return {
    p1: {
      graellaEsq: bx(v1.querySelector('[data-carrusel="1"]'), dx1).x,
      bloc: bx(v1.querySelector('[data-bloc-dreta-p1="1"]'), dx1),
      selector: bx(v1.querySelector('[data-stripe-buttonbar="bn-p1"]'), dx1),
      fletxes: bx(v1.querySelector('[data-fletxes-p1="1"]'), dx1),
      franja: bx(v1.querySelector('[data-stripe-visual-content="1"]'), dx1),
      files: filesPeces(v1, dx1),
      gap: +(bx(v1.querySelector('[data-bloc-dreta-p1="1"]'), dx1).x - bx(v1.querySelector('[data-carrusel="1"]'), dx1).r).toFixed(1),
    },
    p2: {
      files: filesPeces(v2, dx2),
      selector: bx(v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]'), dx2),
      franja: bx(v2.querySelector('[data-stripe-visual-content="2"]'), dx2),
    },
  };
});
console.log(JSON.stringify(r, null, 1));
await p.screenshot({ path: '_tmp-b2-final.png' });
await ctx.close();
await b.close();
