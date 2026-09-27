// TEMPORAL — no es comiteja. Que hi ha al DOM amb el megaslide TANCAT?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
const r = await p.evaluate(() => {
  const carrusels = [...document.querySelectorAll('[data-carrusel="1"]')].map((el) => {
    const rr = el.getBoundingClientRect();
    const imgs = [...el.querySelectorAll('img')];
    const visibles = imgs.filter((im) => { const r2 = im.getBoundingClientRect(); return r2.width > 0 && r2.height > 0 && r2.bottom > 0 && r2.top < window.innerHeight; });
    return { x: Math.round(rr.left), y: Math.round(rr.top), w: Math.round(rr.width), h: Math.round(rr.height), imgs: imgs.length, visibles: visibles.length, dins: !!el.closest('[data-mega-panel-surface="1"]') };
  });
  const panell = document.querySelector('[data-mega-panel-surface="1"]');
  const tiras = [...document.querySelectorAll('[data-stripe-visual-content]')].map((el) => {
    const rr = el.getBoundingClientRect();
    return { id: el.getAttribute('data-stripe-visual-content'), x: Math.round(rr.left), y: Math.round(rr.top), w: Math.round(rr.width), vis: getComputedStyle(el).visibility, dins: !!el.closest('[data-mega-panel-surface="1"]') };
  });
  return { carrusels, panell: !!panell, tiras, nTile: document.querySelectorAll('[data-stripe-tile]').length };
});
console.log('panell muntat:', r.panell, '| tiles:', r.nTile);
console.log('carrusels:', JSON.stringify(r.carrusels, null, 1));
console.log('tires:', JSON.stringify(r.tiras));
await ctx.close();
await b.close();
