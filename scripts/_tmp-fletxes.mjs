// TEMPORAL — no es comiteja. Les fletxes de les dues pagines, amb xifres.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const info = (el) => { if (!el) return null; const r2 = el.getBoundingClientRect(); const svg = el.querySelector('svg'); const s = svg ? svg.getBoundingClientRect() : null; return { bloc: `${Math.round(r2.width)}x${Math.round(r2.height)}`, svg: s ? `${Math.round(s.width)}x${Math.round(s.height)}` : null, fills: el.children.length }; };
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const dre1 = v1?.querySelector('#stripe-guide-right-arrow');
  const dre2 = v2?.querySelector('#stripe-guide-right-arrow');
  const esq1 = v1?.querySelector('#stripe-guide-left-arrow');
  return {
    p1_dreta: info(dre1),
    p1_esquerra: info(esq1),
    p2_dreta: info(dre2),
    p1_pare: dre1?.parentElement ? info(dre1.parentElement) : null,
    p2_pare: dre2?.parentElement ? info(dre2.parentElement) : null,
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
