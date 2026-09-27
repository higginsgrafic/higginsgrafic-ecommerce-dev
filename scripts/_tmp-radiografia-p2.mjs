// TEMPORAL — no es comiteja. Radiografia de la pagina 2: que es pot clicar i on.
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=cube', { waitUntil: 'load', timeout: 60000 });
await p.waitForTimeout(2000);
await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(3500);

const r = await p.evaluate(() => {
  const v = document.querySelector('[data-mega-page-viewport="2"]');
  const box = (e) => { const b = e.getBoundingClientRect(); return [+b.left.toFixed(1), +b.top.toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)]; };
  return {
    targetes: [...v.querySelectorAll('[data-colleccions-targeta]')].map((e) => ({ t: (e.textContent || '').trim(), box: box(e) })),
    stripeRow: [...document.querySelectorAll('[data-mega-page-viewport="2"] [data-stripe-visual-content]')].map((e) => ({ box: box(e), n: e.querySelectorAll('*').length })),
    // Els tiles de la franja: on son i com es diuen
    franja: [...v.querySelectorAll('img')].slice(0, 20).map((i) => ({ src: (i.currentSrc || i.src || '').split('/').slice(-2).join('/'), box: box(i), alt: i.alt })),
    // La filera de noms (etiquetes de text)
    filera: [...v.querySelectorAll('div')].filter((e) => e.children.length === 0 && /^(NX-01|Afrodita-C|Robocube|Persuasion 1|DJ Vader)$/.test((e.textContent || '').trim()))
      .map((e) => ({ t: (e.textContent || '').trim(), box: box(e), pare: e.parentElement.className })),
    carrusels: [...v.querySelectorAll('[data-carrusel]')].map((e) => ({ v: e.getAttribute('data-carrusel'), box: box(e), peces: e.querySelectorAll('button').length })),
  };
});
console.log(JSON.stringify(r, null, 1).slice(0, 4000));
await b.close();
