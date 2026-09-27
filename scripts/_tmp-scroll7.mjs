// TEMPORAL — no es comiteja. La rodeta de debò, amb el ratoli, sobre la tira de
// colors i sobre la graella de cada pagina.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(4000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(9000);
const triat = () => p.evaluate(() => {
  const cg = document.querySelector('[data-p2-color-grid]');
  const m = [...cg.querySelectorAll('button')].find((x) => getComputedStyle(x).outlineStyle === 'solid');
  return m ? m.getAttribute('data-color-barra') : null;
});
const tr = (vp) => p.evaluate((n) => {
  const v = document.querySelector(`[data-mega-page-viewport="${n}"]`);
  const t = v.querySelector('[data-carrusel="1"]')?.firstElementChild?.firstElementChild;
  return t ? getComputedStyle(t).transform : null;
}, vp);
const punt = (sel) => p.evaluate((s) => {
  const el = document.querySelector(s);
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
}, sel);
// COLORS: rodeta avall i despres amunt
let c = await punt('[data-p2-color-grid]');
console.log('colors abans:', await triat());
await p.mouse.move(c.x, c.y);
await p.mouse.wheel(0, 120); await p.waitForTimeout(600);
console.log('colors amb rodeta avall:', await triat());
await p.mouse.wheel(0, -120); await p.waitForTimeout(600);
console.log('colors amb rodeta amunt:', await triat());
// GRAELLA p2
c = await punt('[data-mega-page-viewport="2"] [data-carrusel="1"]');
console.log('graella p2 abans:', await tr(2));
await p.mouse.move(c.x, c.y);
await p.mouse.wheel(0, 120); await p.waitForTimeout(600);
console.log('graella p2 amb rodeta:', await tr(2));
// GRAELLA p1 (posant la pagina 1 al davant)
await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  let t = v1.parentElement;
  while (t && !(t.style && t.style.width === '400%')) t = t.parentElement;
  if (t) { t.style.transition = 'none'; t.style.transform = 'translateX(0%)'; }
});
await p.waitForTimeout(500);
c = await punt('[data-mega-page-viewport="1"] [data-carrusel="1"]');
console.log('graella p1 abans:', await tr(1));
await p.mouse.move(c.x, c.y);
await p.mouse.wheel(0, 120); await p.waitForTimeout(600);
console.log('graella p1 amb rodeta:', await tr(1));
await ctx.close();
await b.close();
