// TEMPORAL — no es coiteja. Qui rep els clics i la rodeta a la graella i als colors.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
console.log(JSON.stringify(await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cg = v2.querySelector('[data-p2-color-grid]');
  const carr = v2.querySelector('[data-carrusel="1"]');
  const retall = carr.firstElementChild;
  const punt = (e) => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  const desc = (e) => `${e.tagName}${e.id ? '#' + e.id : ''}${e.getAttribute('data-p2-color-grid') !== null ? '[grid]' : ''}${e.getAttribute('data-carrusel') ? '[carrusel]' : ''} pe=${getComputedStyle(e).pointerEvents} z=${getComputedStyle(e).zIndex} cls=${String(e.className).split(' ').slice(0, 2).join('.')}`;
  const rc = punt(cg), rr = punt(retall);
  return {
    colors: { punt: rc.map((x) => Math.round(x)), stack: document.elementsFromPoint(rc[0], rc[1]).slice(0, 5).map(desc) },
    graella: { punt: rr.map((x) => Math.round(x)), stack: document.elementsFromPoint(rr[0], rr[1]).slice(0, 5).map(desc) },
  };
}), null, 1));
await ctx.close();
await b.close();
