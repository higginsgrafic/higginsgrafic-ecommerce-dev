// TEMPORAL — no es coiteja. Els clics de la p1 amb el ratoli de debò: graella,
// selector, fletxes i samarreta.
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
const estat = () => p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const t = v1.querySelector('[data-carrusel="1"]').firstElementChild.firstElementChild;
  const actiu = v1.querySelector('[data-stripe-buttonbar="bn-p1"] button[aria-label]');
  const sel = getComputedStyle(v1.querySelector('[data-stripe-buttonbar="bn-p1"]'));
  return { carrusel: getComputedStyle(t).transform, radi: sel.borderTopLeftRadius };
});
const punt = (sel) => p.evaluate((s) => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; }, sel);
console.log('abans', JSON.stringify(await estat()));
// 1. clic a la fletxa dreta
let c = await punt('[data-fletxes-p1="1"] button[aria-label="Següent"]');
await p.mouse.click(c.x, c.y); await p.waitForTimeout(800);
console.log('despres de la fletxa dreta:', JSON.stringify(await estat()));
// 2. clic al selector (NEGRE)
c = await punt('[data-stripe-buttonbar="bn-p1"] button[aria-label="Negre"]');
try { await p.click('[data-stripe-buttonbar="bn-p1"] button[aria-label="Negre"]', { timeout: 4000 }); console.log('clic al selector: OK'); } catch (e) { console.log('clic al selector KO'); }
await p.waitForTimeout(500);
// 3. clic a un dibuix de la graella
c = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const tira = v1.querySelector('[data-carrusel="1"]').firstElementChild.firstElementChild;
  const b2 = [...tira.querySelectorAll('button')].find((x) => { const r = x.getBoundingClientRect(); return r.left > 500 && r.left < 1200; });
  const r = b2.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, label: b2.getAttribute('aria-label') };
});
const colAbans = await p.evaluate(() => { const v1 = document.querySelector('[data-mega-page-viewport="1"]'); const a = v1.querySelector('[data-colleccions-targeta]'); return a ? a.textContent.trim() : null; });
await p.mouse.click(c.x, c.y); await p.waitForTimeout(1500);
const quants = await p.evaluate(() => {
  const v1 = document.querySelector('[data-mega-page-viewport="1"]');
  const a = v1.querySelector('[data-colleccions-targeta][aria-current="true"]');
  return a ? a.textContent.trim() : null;
});
console.log('clic al dibuix', c.label, '-> colleccio activa:', quants);
await ctx.close();
await b.close();
