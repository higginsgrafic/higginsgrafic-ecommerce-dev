// TEMPORAL — no es comiteja. Les dues graelles, per fer-les identiques.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const carr = v2.querySelector('[data-carrusel="1"]');
  const rc = carr.getBoundingClientRect();
  const peces = [...carr.querySelectorAll('button')].slice(0, 2).map((el) => {
    const r2 = el.getBoundingClientRect();
    return { w: +r2.width.toFixed(2), h: +r2.height.toFixed(2), top: +r2.top.toFixed(1), left: +r2.left.toFixed(1), c: +(r2.top + r2.height / 2).toFixed(1) };
  });
  const retall = carr.firstElementChild.getBoundingClientRect();
  const pas = +(([...carr.querySelectorAll('button')][2].getBoundingClientRect().left - [...carr.querySelectorAll('button')][0].getBoundingClientRect().left) / 1).toFixed(2);
  const carril = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hg-mega-w'));
  return { carril, carruselW: +rc.width.toFixed(1), carruselH: +rc.height.toFixed(1), retallW: +retall.width.toFixed(1), peces, pas, carruselTop: +rc.top.toFixed(1) };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
