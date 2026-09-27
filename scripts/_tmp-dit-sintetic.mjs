// TEMPORAL — no es comiteja. El gest del dit, provat amb events de punter sintetics.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1, hasTouch: true });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(async () => {
  const fila = document.querySelector('#stripe-guide-stripe-row');
  const grid = document.querySelector('[data-p2-color-grid]');
  const estat = () => {
    const tiles = [...document.querySelectorAll('[data-stripe-tile]')].sort((a, b) => Number(a.getAttribute('data-stripe-tile')) - Number(b.getAttribute('data-stripe-tile')));
    const seleccionada = [...document.querySelectorAll('[data-color-barra]')].find((el) => getComputedStyle(el).outlineWidth === '1px' && getComputedStyle(el).outlineStyle === 'solid');
    return { srcs: (tiles[0]?.getAttribute('data-stripe-src') || '').split('/').pop(), color: seleccionada ? seleccionada.getAttribute('data-color-barra') : null };
  };
  const dispara = (el, tipus, x) => el.dispatchEvent(new PointerEvent(tipus, { bubbles: true, cancelable: true, pointerId: 7, pointerType: 'touch', isPrimary: true, clientX: x, clientY: 200 }));
  const abans = estat();
  if (fila) {
    dispara(fila, 'pointerdown', 700);
    for (let i = 1; i <= 12; i++) dispara(fila, 'pointermove', 700 - i * 8);
    dispara(fila, 'pointerup', 700 - 96);
  }
  for (let k = 0; k < 40; k++) await new Promise((res) => requestAnimationFrame(res));
  const despres = estat();
  return {
    teFila: !!fila,
    teGrid: !!grid,
    touchActionGrid: grid ? getComputedStyle(grid).touchAction : null,
    touchActionFila: fila ? getComputedStyle(fila).touchAction : null,
    abans, despres, canvi: abans.srcs !== despres.srcs,
  };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
