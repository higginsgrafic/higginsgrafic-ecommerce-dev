// TEMPORAL — no es comiteja. Arrossegar amb el DIT: la franja i la tira de colors.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1, hasTouch: true, isMobile: false });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
const estat = () => p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const cases = [...franja.querySelectorAll('[data-stripe-tile]')].sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile')));
  const srcs = cases.map((el) => (el.getAttribute('data-stripe-src') || '').split('/').pop().replace('-stripe.webp', '').slice(0, 10)).join(',');
  const barra = [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-color-barra]')].find((el) => getComputedStyle(el).outlineWidth === '1px');
  const dins = (r) => r.width > 0 && r.height > 0 && r.left >= 0 && r.right <= window.innerWidth && r.top >= 0 && r.bottom <= window.innerHeight;
  const centreVis = (llista) => {
    for (const el of llista) { const r = el.getBoundingClientRect(); if (dins(r)) return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; }
    return null;
  };
  const puntFranja = centreVis(cases);
  const colors = centreVis([...document.querySelectorAll('[data-mega-page-viewport="2"] [data-color-barra]')]);
  return { srcs, color: barra ? barra.getAttribute('data-color-barra') : null, franja: puntFranja, colors };
});
const arrossega = async (x, y, dx, passos) => {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= passos; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + (dx * i) / passos, y }] });
    await p.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(300);
};
const abans = await estat();
console.log('ABANS  franja:', abans.srcs.slice(0, 60));
console.log('       color:', abans.color, '| punts', JSON.stringify(abans.franja), JSON.stringify(abans.colors));
// 1) franja: arrosseguem cap a l'esquerra 90 px (3 passos)
await arrossega(abans.franja.x, abans.franja.y, -90, 12);
const desp1 = await estat();
console.log('FRANJA franja:', desp1.srcs.slice(0, 60), '| canviada:', desp1.srcs !== abans.srcs);
// 2) tira de colors: arrosseguem cap a l'esquerra 90 px
await arrossega(abans.colors.x, abans.colors.y, -90, 12);
const desp2 = await estat();
console.log('COLOR  color:', desp2.color, '| canviada:', desp2.color !== abans.color);
await ctx.close();
await b.close();
