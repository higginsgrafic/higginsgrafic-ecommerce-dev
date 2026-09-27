// TEMPORAL — no es coiteja. L'alineacio d'ARA: les dues files de dibuixos, la
// tira de colors i les tres cel·les del selector, amb els buits de debò.
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
  const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
  const cg = v2.querySelector('[data-p2-color-grid]');
  const carr = v2.querySelector('[data-carrusel="1"]');
  const retall = carr.firstElementChild;
  const tira = retall.firstElementChild;
  const franja = v2.querySelector('[data-stripe-visual-content="2"]');
  const cy = (e) => { const r = e.getBoundingClientRect(); return +(r.top + r.height / 2).toFixed(1); };
  const box = (e) => { const r = e.getBoundingClientRect(); return { y: +r.top.toFixed(1), b: +r.bottom.toFixed(1), h: +r.height.toFixed(1) }; };
  const celes = [...sel.querySelectorAll('button[aria-label]')].map((x) => ({ nom: x.getAttribute('aria-label'), cy: cy(x) }));
  const peces = [...tira.querySelectorAll('button')].map((x) => { const r = x.getBoundingClientRect(); return +((r.top + r.height / 2).toFixed(1)); });
  const files = [...new Set(peces)].sort((a, b2) => a - b2);
  return {
    selector: { ...box(sel), celes },
    colors: box(cg),
    filesDibuixos: files,
    franja: { ...box(franja), top: +franja.getBoundingClientRect().top.toFixed(1) },
    carrusel: box(carr),
    buits: {
      'selector bottom -> colors top': +(cg.getBoundingClientRect().top - sel.getBoundingClientRect().bottom).toFixed(1),
      'colors bottom -> franja top': +(franja.getBoundingClientRect().top - cg.getBoundingClientRect().bottom).toFixed(1),
      'selector bottom -> franja top': +(franja.getBoundingClientRect().top - sel.getBoundingClientRect().bottom).toFixed(1),
    },
    alcadaFranja: +franja.getBoundingClientRect().height.toFixed(1),
  };
}), null, 1));
await ctx.close();
await b.close();
