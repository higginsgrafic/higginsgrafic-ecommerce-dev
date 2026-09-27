import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
console.log(JSON.stringify(await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const dx1 = -v1.getBoundingClientRect().left;
  const dx2 = -v2.getBoundingClientRect().left;
  const info = (sel, vp, dx, et) => {
    const el = vp.querySelector(sel);
    if (!el) return { et, hi: false };
    const q = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { et, y: +q.top.toFixed(1), h: +q.height.toFixed(1), mt: cs.marginTop, pt: cs.paddingTop, pb: cs.paddingBottom, pos: cs.position, tr: cs.transform, cls: String(el.className).slice(0, 40) };
  };
  const franja1 = v1.querySelector('[data-stripe-visual-content="1"]');
  const franja2 = v2.querySelector('[data-stripe-visual-content="2"]');
  const pare1 = franja1?.parentElement?.parentElement?.parentElement;
  return {
    p1: [
      info('[data-filera-p1="1"]', v1, dx1, 'filera'),
      info(':scope > div:nth-child(2)', v1, dx1, 'bloc franja'),
      info('[data-stripe-visual-content="1"]', v1, dx1, 'franja'),
    ],
    p2: [
      info('[data-p2-cercador-row]', v2, dx2, 'filera'),
      info('[data-stripe-visual-content="2"]', v2, dx2, 'franja'),
    ],
    panell1: (() => { const e = document.querySelector('[data-mega-panel-surface="1"]'); const q = e.getBoundingClientRect(); return { y: q.top, h: q.height }; })(),
    panell2: (() => { const e = document.querySelector('[data-mega-panel-surface="2"]'); if (!e) return null; const q = e.getBoundingClientRect(); return { y: q.top, h: q.height }; })(),
    estilFranja1: franja1 ? franja1.getAttribute('style')?.slice(0, 200) : null,
  };
}), null, 1));
await ctx.close();
await b.close();
