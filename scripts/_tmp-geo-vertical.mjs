// TEMPORAL — no es comiteja. La geometria vertical de la pagina 2: on cau la
// finestra de la graella, la franja, el selector i la columna de colleccions.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
for (const [w, h] of [[1920, 946], [1920, 1200], [2560, 1440]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 60000 });
  await p.waitForTimeout(2000);
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4500);
  const r = await p.evaluate(() => {
    const q = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { x: Math.round(b.left), y: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; };
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const car = v2?.querySelector('[data-carrusel="1"] > div');
    const tiles = [...(v2?.querySelectorAll('[data-stripe-tile]') || [])];
    return {
      panell: q('[data-mega-panel-surface="1"]'),
      vp1: q('[data-mega-page-viewport="1"]'),
      vp2: q('[data-mega-page-viewport="2"]'),
      finestra: car ? { x: Math.round(car.getBoundingClientRect().left), y: Math.round(car.getBoundingClientRect().top), w: Math.round(car.getBoundingClientRect().width), h: Math.round(car.getBoundingClientRect().height) } : null,
      franja: tiles.length ? { x: Math.round(tiles[0].getBoundingClientRect().left), y: Math.round(tiles[0].getBoundingClientRect().top), w: Math.round(tiles[13].getBoundingClientRect().right - tiles[0].getBoundingClientRect().left), h: Math.round(tiles[0].getBoundingClientRect().height) } : null,
      selectorB: q('[data-p2-color-selector] [data-stripe-buttonbar="bn"]'),
      finestraAlta: window.innerHeight,
    };
  });
  console.log(`${w}x${h}:`, JSON.stringify(r));
  await ctx.close();
}
await b.close();
