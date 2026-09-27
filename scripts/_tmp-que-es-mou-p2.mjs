// TEMPORAL — no es comiteja. Que es mou, quan, i quant? (mostreig despres de pintar, 8 s)
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2500);
await p.evaluate(() => {
  window.__m = [];
  const foto = () => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    if (v2) {
      const v = v2.getBoundingClientRect().top;
      const graella = v2.querySelector('[data-carrusel="1"] > div');
      const bar = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
      const barres = v2.querySelector('[data-p2-color-grid]');
      const enllacos = v2.querySelector('[data-stripe-buttonbar]') && v2.querySelectorAll('[data-p2-cercador-row] > *')[1];
      const col = v2.querySelector('[data-p2-color-selector]');
      const franja = v2.querySelector('[data-stripe-visual-content="2"]');
      const peces = graella ? [...graella.querySelectorAll('button')] : [];
      const files = [[], []];
      peces.forEach((x, k) => files[k % 2].push(x));
      const rel = (el) => (el ? +(el.getBoundingClientRect().top - v).toFixed(2) : null);
      const row = v2.querySelector('[data-p2-cercador-row]');
      window.__m.push({
        t: Math.round(performance.now()),
        selector: rel(bar),
        col: rel(col),
        fila0: files[0][0] ? rel(files[0][0]) : null,
        fila1: files[1][0] ? rel(files[1][0]) : null,
        colorTira: rel(barres),
        segonaFilaGrid: rel(row ? row.children[1] : null),
        franja: rel(franja),
        altFilera: row ? +row.getBoundingClientRect().height.toFixed(2) : null,
        altRetall: graella ? +graella.getBoundingClientRect().height.toFixed(2) : null,
      });
    }
    if (window.__m.length < 900) requestAnimationFrame(() => window.setTimeout(foto, 0));
  };
  requestAnimationFrame(() => window.setTimeout(foto, 0));
});
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(9000);
const m = (await p.evaluate(() => window.__m)).filter((x) => x.selector != null);
let previ = null;
for (const x of m) {
  const clau = Object.entries(x).filter(([k]) => k !== 't').map(([, val]) => val).join('|');
  if (clau !== previ) {
    console.log(`t=${String(x.t).padStart(5)} selector=${String(x.selector).padStart(7)} fila0=${String(x.fila0).padStart(7)} fila1=${String(x.fila1).padStart(7)} colorTira=${String(x.colorTira).padStart(7)} 2aFila=${String(x.segonaFilaGrid).padStart(7)} franja=${String(x.franja).padStart(7)} altFilera=${x.altFilera} altRetall=${x.altRetall}`);
  }
  previ = clau;
}
console.log(`mostres: ${m.length}`);
await b.close();
