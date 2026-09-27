import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4000);
console.log(await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const row = v2.querySelector('[data-p2-cercador-row]');
  const cont = row.parentElement;
  const selCont = v2.querySelector('[data-p2-color-selector]');
  const selBtn = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const root = getComputedStyle(document.documentElement);
  const cs = (el) => getComputedStyle(el);
  return {
    barTopRoot: JSON.stringify(root.getPropertyValue('--hg-cercador-bar-top')),
    barTopSel: JSON.stringify(cs(selCont).getPropertyValue('--hg-cercador-bar-top')),
    contCssTop: cs(cont).top, selContCssTop: cs(selCont).top,
    contTop: +cont.getBoundingClientRect().top.toFixed(2),
    selContTop: +selCont.getBoundingClientRect().top.toFixed(2),
    selBtnTop: +selBtn.getBoundingClientRect().top.toFixed(2),
  };
}));
await b.close();
