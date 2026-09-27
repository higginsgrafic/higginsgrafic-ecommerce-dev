// TEMPORAL — no es comiteja. On son les cases visibles de la franja i les barres de color?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1, hasTouch: true });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
const r = await p.evaluate(() => {
  const info = (el) => { const x = el.getBoundingClientRect(); return `${Math.round(x.left)},${Math.round(x.top)} ${Math.round(x.width)}x${Math.round(x.height)}`; };
  const tiles = [...document.querySelectorAll('[data-stripe-tile]')].map(info);
  const barres = [...document.querySelectorAll('[data-color-barra]')].map((el) => `${el.getAttribute('data-color-barra')}@${info(el)}`);
  const carrusels = [...document.querySelectorAll('[data-carrusel="1"]')].map(info);
  const panells = [...document.querySelectorAll('[data-mega-panel-surface="1"]')].map((el) => `${info(el)} op=${getComputedStyle(el).opacity}`);
  return { nTiles: tiles.length, tiles: tiles.slice(0, 4), barres: barres.slice(0, 4), carrusels, panells };
});
console.log(JSON.stringify(r, null, 1));
await ctx.close();
await b.close();
