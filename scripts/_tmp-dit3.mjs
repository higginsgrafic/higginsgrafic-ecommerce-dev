// TEMPORAL — no es comiteja. Troba els punts de la franja i de la tira de colors amb elementFromPoint.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1, hasTouch: true });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const ancoratges = await p.evaluate(() => {
  const troba = (selector) => {
    for (let y = 40; y < Math.min(window.innerHeight, 500); y += 6) {
      for (let x = 340; x < Math.min(window.innerWidth, 1500); x += 6) {
        const sota = document.elementFromPoint(x, y);
        if (!sota) continue;
        const el = sota.closest ? sota.closest(selector) : null;
        if (el) {
          const r = el.getBoundingClientRect();
          if (r.width >= 4 && r.height >= 4) return { x, y, rect: `${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}` };
        }
      }
    }
    return null;
  };
  return { franja: troba('[data-stripe-tile]'), color: troba('[data-color-barra]') };
});
console.log('ancoratges:', JSON.stringify(ancoratges));
if (!ancoratges.franja || !ancoratges.color) { console.log('no hi ha ancoratges'); await ctx.close(); await b.close(); process.exit(0); }
const estat = () => p.evaluate(() => {
  const tiles = [...document.querySelectorAll('[data-stripe-tile]')].sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile')));
  const srcs = tiles.map((el) => (el.getAttribute('data-stripe-src') || '').split('/').pop().replace('-stripe.webp', '').slice(0, 8)).join(',');
  const barra = [...document.querySelectorAll('[data-color-barra]')].find((el) => getComputedStyle(el).outlineWidth === '1px' && getComputedStyle(el).outlineStyle === 'solid');
  return { srcs, color: barra ? barra.getAttribute('data-color-barra') : null };
});
const arrossega = async (x, y, dx, passos) => {
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let i = 1; i <= passos; i++) {
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(x + (dx * i) / passos), y }] });
    await p.waitForTimeout(20);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await p.waitForTimeout(350);
};
const a = await estat();
console.log('ABANS  ', a.color, '|', a.srcs.slice(0, 70));
await arrossega(ancoratges.franja.x, ancoratges.franja.y, -95, 14);
const f = await estat();
console.log('FRANJA ', f.color, '|', f.srcs.slice(0, 70), '| canvi', f.srcs !== a.srcs);
await arrossega(ancoratges.color.x, ancoratges.color.y, -95, 14);
const c = await estat();
console.log('COLOR  ', c.color, '| canvi', c.color !== a.color, '(abans', a.color, ')');
await ctx.close();
await b.close();
