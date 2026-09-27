// TEMPORAL — no es coiteja. La p1: quantes fletxes i quants carrusels hi ha, i
// quins son els que funcionen.
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
console.log(JSON.stringify(await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const dx = -v1.getBoundingClientRect().left;
  const vis = (q) => q.width > 0 && q.height > 0 && q.left + dx >= 0 && q.left + dx < 1920;
  const fletxes = [...v1.querySelectorAll('button[aria-label="Anterior"], button[aria-label="Següent"]')].map((e) => {
    const q = e.getBoundingClientRect();
    return { label: e.getAttribute('aria-label'), x: Math.round(q.left + dx), y: Math.round(q.top), w: Math.round(q.width), h: Math.round(q.height), dinsBloc: !!e.closest('[data-fletxes-p1="1"]'), dinsCarrusel: !!e.closest('[data-carrusel="1"]'), visible: vis(q) };
  });
  const carrusels = [...v1.querySelectorAll('[data-carrusel="1"]')].map((e) => { const q = e.getBoundingClientRect(); return { x: Math.round(q.left + dx), y: Math.round(q.top), w: Math.round(q.width), visible: vis(q) }; });
  const blocs = [...v1.querySelectorAll('[data-fletxes-p1="1"]')].map((e) => { const q = e.getBoundingClientRect(); return { x: Math.round(q.left + dx), y: Math.round(q.top), w: Math.round(q.width), visible: vis(q) }; });
  return { fletxes, carrusels, blocs };
}), null, 1));
await ctx.close();
await b.close();
