// TEMPORAL — no es comiteja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(6000);
const r = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cont = v2.querySelector('[data-carrusel="1"] > div');
  const pista = cont.firstElementChild;
  const bs = [...v2.querySelectorAll('[data-carrusel="1"] button')].slice(0, 4);
  return {
    desnivells: window.__desnivells,
    pistaEstil: { h: pista.style.height, top: getComputedStyle(pista).top, pos: getComputedStyle(pista).position },
    pistaBox: (() => { const b2 = pista.getBoundingClientRect(); return { top: +b2.top.toFixed(2), h: +b2.height.toFixed(2) }; })(),
    retallBox: (() => { const b2 = cont.getBoundingClientRect(); return { top: +b2.top.toFixed(2), h: +b2.height.toFixed(2) }; })(),
    items: bs.map((x, i) => ({ i, lab: x.getAttribute('aria-label'), top: x.style.top, left: x.style.left, box: (() => { const b2 = x.getBoundingClientRect(); return { top: +b2.top.toFixed(2), h: +b2.height.toFixed(2) }; })() })),
  };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
