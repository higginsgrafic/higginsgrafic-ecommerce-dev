// TEMPORAL — no es comiteja. Que es mou en obrir el panell, pagina 1 vs pagina 2.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const p = await (await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 })).newPage();
const errs = [];
p.on('pageerror', (e) => errs.push(String(e).slice(0, 120)));
await p.goto('http://127.0.0.1:3003/nova/inici?active=first-contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(3000);
// Es mostreja l'estat de les dues pagines durant l'obertura.
await p.evaluate(() => {
  window.__m = [];
  const id = setInterval(() => {
    const v1 = document.querySelector('[data-mega-page-viewport="1"]');
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    const franja = v2 ? [...v2.querySelectorAll('[data-stripe-tile] img')].map((i) => (i.currentSrc || '').split('/').pop()).join(',') : '';
    const graella = v2 ? v2.querySelectorAll('[data-carrusel="1"] button').length : 0;
    const teP1 = v1 ? v1.querySelectorAll('img').length : 0;
    window.__m.push({ t: Math.round(performance.now()), v1: teP1, v2: graella, franja: franja.length, panell: !!document.querySelector('[data-mega-panel-surface="1"]') });
  }, 60);
  setTimeout(() => clearInterval(id), 2500);
});
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(3000);
const m = await p.evaluate(() => window.__m);
let previ = null;
for (const x of m) {
  if (!previ || x.v1 !== previ.v1 || x.v2 !== previ.v2 || x.franja !== previ.franja || x.panell !== previ.panell) {
    console.log(`t=${String(x.t).padStart(5)}  panell=${x.panell ? 'si' : 'no '}  p1_imatges=${String(x.v1).padStart(3)}  p2_graella=${String(x.v2).padStart(3)}  franja_chars=${x.franja}`);
  }
  previ = x;
}
console.log('errors:', errs.length, errs.slice(0, 2));
await b.close();
