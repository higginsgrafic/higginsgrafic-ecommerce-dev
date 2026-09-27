import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(12000);
const mesura = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const q = (el) => { const r = el.getBoundingClientRect(); return +r.top.toFixed(1); };
  return { selH: +v1.querySelector('[data-stripe-buttonbar="bn-p1"]').getBoundingClientRect().height.toFixed(1), anH: +v1.querySelector('button[aria-label="Anterior"]').getBoundingClientRect().height.toFixed(1), anPare: (() => { const e = v1.querySelector('button[aria-label="Anterior"]').parentElement; const r = e.getBoundingClientRect(); return +r.top.toFixed(1); })(), bloc: q(v1.querySelector('[data-bloc-dreta-p1="1"]')), sel: q(v1.querySelector('[data-stripe-buttonbar="bn-p1"]')), an: q(v1.querySelector('button[aria-label="Anterior"]')), franja: q(v1.querySelector('[data-stripe-visual-content="1"]')), rootTr: getComputedStyle(v1.querySelector(':scope > div')).transform };
});
for (let i = 0; i < 4; i++) { console.log(i, JSON.stringify(await mesura())); await p.waitForTimeout(1500); }
await ctx.close();
await b.close();
