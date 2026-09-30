// TEMPORAL: tot el que te pointer-events auto DINS l'arrel del panell de franja.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 768, height: 1024 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(6000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const r = await p.evaluate(() => {
  const cela = document.querySelector('[data-taula-cela="6-9+11-14"]');
  const arrel = cela.querySelector('.w-full.shrink-0');
  const autos = [];
  let total = 0;
  arrel.querySelectorAll('*').forEach((el) => {
    total += 1;
    if (getComputedStyle(el).pointerEvents !== 'auto') return;
    const rr = el.getBoundingClientRect();
    autos.push({
      q: `${el.tagName}.${(el.className || '').toString().trim().split(/\s+/).slice(0, 3).join('.')}`,
      caixa: `${Math.round(rr.left)},${Math.round(rr.top)} ${Math.round(rr.width)}x${Math.round(rr.height)}`,
      z: getComputedStyle(el).zIndex,
      atrs: [...el.attributes].map((a) => a.name).filter((n) => n.startsWith('data-') || n === 'role' || n === 'tabindex').join(','),
    });
  });
  // I els elements amb pe auto de TOT el document que cauen damunt del selector.
  const sel = document.querySelector('[data-stripe-buttonbar]');
  const rs = sel.getBoundingClientRect();
  const pila = document.elementsFromPoint(rs.left + 20, rs.top + 20).map((el) => `${el.tagName}.${(el.className||'').toString().trim().split(/\s+/).slice(0,2).join('.')} pe=${getComputedStyle(el).pointerEvents} z=${getComputedStyle(el).zIndex}`);
  return { totalDins: total, autosDins: autos.slice(0, 12), quantsAutos: autos.length, pilaAlSelector: pila.slice(0, 8) };
});
console.log(JSON.stringify(r, null, 1));
await b.close();
