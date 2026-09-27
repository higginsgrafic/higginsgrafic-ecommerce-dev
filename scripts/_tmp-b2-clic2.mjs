import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
// Situa la pagina 1 al davant amb el mecanisme de la casa (les pestanyes de dalt).
const pag = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  return { x: v1.getBoundingClientRect().left, inner: window.innerWidth };
});
const estat = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const tira = v1.querySelector('[data-carrusel="1"]')?.firstElementChild?.firstElementChild;
  return getComputedStyle(tira).transform;
});
console.log('v1 left', pag.x, 'abans', await estat());
// Clic a la fletxa DRETA de la p1, en coordenades ABSOLUTES de pantalla.
const box = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const el = v1.querySelector('#stripe-guide-right-arrow');
  const q = el.getBoundingClientRect();
  const element = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2);
  return { x: q.left + q.width / 2, y: q.top + q.height / 2, qui: element ? (element.id || element.tagName + '.' + String(element.className).slice(0, 30)) : null };
});
console.log('fletxa dreta absoluta', JSON.stringify(box));
await p.mouse.click(box.x, box.y);
await p.waitForTimeout(1500);
console.log('despres del clic', await estat());
await ctx.close();
await b.close();
