// 02/10/2026 — On cau la graella de la p1 a 1024 i si es mou en clicar un
// enllac de la columna de la p2 (informe de l'amo: «es barreja la p1 amb la p2»).
import { chromium } from '@playwright/test';

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1024, height: 691 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact&carril=1', { waitUntil: 'load', timeout: 180000 });
await p.waitForTimeout(3000);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForSelector('[data-mega-page-viewport="2"]', { timeout: 30000 });
await p.waitForTimeout(6000);

const radi = async (etiqueta) => {
  const r = await p.evaluate(() => {
    const q = (el) => { if (!el) return null; const x = el.getBoundingClientRect(); return [Math.round(x.left), Math.round(x.top), Math.round(x.width), Math.round(x.height)]; };
    const out = { pagines: [], p1: {}, p2: {} };
    document.querySelectorAll('[data-mega-page-viewport]').forEach((v) => {
      const cs = getComputedStyle(v);
      out.pagines.push([v.getAttribute('data-mega-page-viewport'), ...q(v), cs.transform.slice(0, 34), cs.position]);
    });
    const p1 = document.querySelector('[data-mega-page-viewport="1"]');
    const p2 = document.querySelector('[data-mega-page-viewport="2"]');
    for (const [nom, v] of [['p1', p1], ['p2', p2]]) {
      if (!v) continue;
      const car = v.querySelector('[data-carrusel="1"]');
      out[nom].car = q(car);
      let e = car, cadena = [];
      while (e && cadena.length < 6) {
        const cs = getComputedStyle(e);
        cadena.push([e.getAttribute('data-mega-page-viewport') ? ('vp' + e.getAttribute('data-mega-page-viewport')) : (e.tagName + (e.getAttribute('data-p2-color-selector') !== null ? '[sel]' : '')), q(e), cs.position, cs.transform.slice(0, 30), cs.overflow.slice(0, 12)]);
        e = e.parentElement;
      }
      out[nom].cadena = cadena;
      out[nom].stripe = q(v.querySelector('[data-stripe-visual-content]'));
    }
    return out;
  });
  console.log('===', etiqueta);
  console.log('pagines', JSON.stringify(r.pagines));
  for (const n of ['p1', 'p2']) {
    console.log(n, 'car', JSON.stringify(r[n].car), 'stripe', JSON.stringify(r[n].stripe));
    console.log(n, 'cadena', JSON.stringify(r[n].cadena));
  }
};

await radi('ABANS');
await p.locator('[data-mega-page-viewport="2"] [data-colleccions-targeta="1"]').nth(1).click();
await p.waitForTimeout(3000);
await radi('DESPRES');
await b.close();
