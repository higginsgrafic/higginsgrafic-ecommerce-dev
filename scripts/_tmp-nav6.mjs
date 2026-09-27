import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 45000 });
await p.waitForTimeout(3000);
const boto = await p.evaluateHandle(() => [...document.querySelectorAll('header button')].find((e) => /THE HUMAN INSIDE/i.test(e.textContent || '')));
await boto.asElement().click();
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const detall = (v) => {
    if (!v) return null;
    const f = v.querySelector('[data-stripe-visual-content]');
    if (!f) return null;
    const imgs = [...f.querySelectorAll('img')];
    const fila = f.closest('div[style*="transform"]') || f.parentElement;
    return {
      franja: [+f.getBoundingClientRect().left.toFixed(1), +f.getBoundingClientRect().width.toFixed(1), +f.getBoundingClientRect().height.toFixed(1)],
      transform: getComputedStyle(f).transform,
      pareOffset: fila ? fila.offsetWidth : null,
      imgNatural: imgs[0] ? `${imgs[0].naturalWidth}x${imgs[0].naturalHeight}` : null,
      imgBox: imgs[0] ? +imgs[0].getBoundingClientRect().width.toFixed(1) : null,
      escalaVar: getComputedStyle(document.documentElement).getPropertyValue('--megaStripeScale').trim(),
      carrusel: !!v.querySelector('[data-carrusel="1"]'),
      fletxaDinsCarrusel: (() => { const a = [...document.querySelectorAll('[data-carrusel="1"] #stripe-guide-right-arrow')].filter((e) => v.contains(e)); return a.length; })(),
      fletxaQualsevol: !!v.querySelector('#stripe-guide-right-arrow'),
    };
  };
  return {
    p1: detall(document.querySelector('[data-mega-page-viewport="1"]')),
    p2: detall(document.querySelector('[data-mega-page-viewport="2"]')),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
