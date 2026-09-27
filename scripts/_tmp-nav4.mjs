import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(3000);
// `onMouseEnter` de React s'escolta via `mouseover` delegat.
await p.evaluate(() => {
  const el = [...document.querySelectorAll('header button, header a')].find((e) => /THE HUMAN INSIDE/i.test(e.textContent || ''));
  el?.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, cancelable: true }));
});
await p.waitForTimeout(5000);
const r = await p.evaluate(() => {
  const out = {};
  document.querySelectorAll('[data-mega-page-viewport]').forEach((v) => {
    const b = v.getBoundingClientRect();
    const f = v.querySelector('[data-stripe-visual-content]');
    out[v.getAttribute('data-mega-page-viewport')] = {
      left: +b.left.toFixed(0),
      franja: f ? [+f.getBoundingClientRect().left.toFixed(1), +f.getBoundingClientRect().width.toFixed(1)] : null,
      t: f ? getComputedStyle(f).transform : null,
      fletxa: (() => { const a = v.querySelector('#stripe-guide-right-arrow'); return a ? +a.getBoundingClientRect().right.toFixed(1) : null; })(),
      selector: (() => { const a = v.querySelector('[data-stripe-buttonbar="bn"]'); return a ? [+a.getBoundingClientRect().left.toFixed(1), +a.getBoundingClientRect().right.toFixed(1)] : null; })(),
    };
  });
  return out;
});
console.log(JSON.stringify(r, null, 1));
await p.screenshot({ path: '/tmp/p1-activa.png', clip: { x: 300, y: 60, width: 1300, height: 320 } });
await b.close();
