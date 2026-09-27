import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(10000);
// (a) clic en un dibuix de la graella intercalada
const abans = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const act = v2.querySelector('[data-colleccions-targeta][aria-current="true"]');
  return act ? act.textContent.trim() : null;
});
const dib = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const tira = v2.querySelector('[data-carrusel="1"]').firstElementChild.firstElementChild;
  const b = [...tira.querySelectorAll('button')].find((x) => x.getAttribute('aria-label'));
  const r = b.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, label: b.getAttribute('aria-label'), top: (document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) || {}).tagName };
});
console.log('clic al dibuix', JSON.stringify(dib), '| colleccio abans', abans);
await p.mouse.click(dib.x, dib.y);
await p.waitForTimeout(2500);
const despres = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const act = v2.querySelector('[data-colleccions-targeta][aria-current="true"]');
  return act ? act.textContent.trim() : null;
});
console.log('colleccio despres del clic al dibuix:', despres);
// (b) clic en una barra de color
const bar = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const cg = v2.querySelector('[data-p2-color-grid]');
  const b = cg.querySelectorAll('button')[2];
  const r = b.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, slug: b.getAttribute('data-color-barra') };
});
await p.mouse.click(bar.x, bar.y);
await p.waitForTimeout(1200);
const triat = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const m = [...v2.querySelector('[data-p2-color-grid]').querySelectorAll('button')].find((x) => getComputedStyle(x).outlineStyle === 'solid');
  return m ? m.getAttribute('data-color-barra') : null;
});
console.log('clic a la barra', bar.slug, '-> triat:', triat);
await ctx.close();
await b.close();
