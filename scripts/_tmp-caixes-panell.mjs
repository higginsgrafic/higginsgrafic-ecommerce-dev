// TEMPORAL — no es comiteja. Les caixes del panell: qui ocupa l'espai vertical
// i on cau el mig. Serveix per precisar que vol dir «centrar a dalt i a baix».
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4500);

const r = await p.evaluate(() => {
  const panell = document.querySelector('[data-mega-panel-surface="1"]');
  const cami = (el) => {
    const out = [];
    let e = el;
    while (e && out.length < 12) {
      const b = e.getBoundingClientRect();
      out.push({
        tag: e.tagName.toLowerCase(),
        cls: (e.className && typeof e.className === 'string' ? e.className : '').slice(0, 40),
        y: Math.round(b.top), h: Math.round(b.height),
        disp: getComputedStyle(e).display,
        flex: getComputedStyle(e).flex,
        align: getComputedStyle(e).alignItems,
        just: getComputedStyle(e).justifyContent,
        pad: getComputedStyle(e).paddingTop + '/' + getComputedStyle(e).paddingBottom,
      });
      e = e.parentElement;
      if (e === document.body) break;
    }
    return out;
  };
  const car = document.querySelector('[data-mega-page-viewport="2"] [data-carrusel="1"]');
  const v2 = document.querySelector('[data-mega-page-viewport="2"] > div > div');
  return {
    panell: (() => { const b = panell.getBoundingClientRect(); return { y: Math.round(b.top), h: Math.round(b.height) }; })(),
    camiCarrusel: cami(car),
    camiV2: v2 ? cami(v2) : null,
  };
});
console.log('panell:', JSON.stringify(r.panell));
console.log('--- cami del carrusel (de dins cap a fora) ---');
for (const x of r.camiCarrusel) console.log('  ', JSON.stringify(x));
console.log('--- cami del contingut vp2 ---');
if (r.camiV2) for (const x of r.camiV2) console.log('  ', JSON.stringify(x));
await b.close();
