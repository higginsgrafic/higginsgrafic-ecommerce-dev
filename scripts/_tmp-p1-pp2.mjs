import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="1"]', { timeout: 30000 });
await p.waitForTimeout(10000);
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(600);
// Les fletxes del BLOC i el carrusel, tots dos de la vista 1
const estat = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const t = v1.querySelector('[data-carrusel="1"]').firstElementChild.firstElementChild;
  const fletxes = [...v1.querySelectorAll('button[aria-label="Anterior"], button[aria-label="Següent"]')].map((e) => { const r = e.getBoundingClientRect(); return `${e.getAttribute('aria-label')}@${Math.round(r.left)}`; });
  return { transform: getComputedStyle(t).transform, fletxes };
});
await p.evaluate(() => { window.__P1ALL = []; });
console.log('abans:', JSON.stringify(await estat()));
const c = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const e = v1.querySelector('[data-fletxes-p1="1"] button[aria-label="Següent"]');
  const r = e.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
});
await p.mouse.click(c.x, c.y);
await p.waitForTimeout(1500);
console.log('despres del clic al BLOC:', JSON.stringify(await estat()));
console.log('instancies que han renderitzat:', JSON.stringify(await p.evaluate(() => window.__P1ALL)));
// I ara amb les del carrusel (si encara hi son)
const teCarro = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  return v1.querySelectorAll('[data-carrusel="1"] button[aria-label="Següent"]').length;
});
console.log('fletxes dins el carrusel (visibles o no):', teCarro);
await ctx.close();
await b.close();
