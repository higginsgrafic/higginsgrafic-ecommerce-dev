// TEMPORAL — no es comiteja. Que es mou en CANVIAR DE COLLECCIO?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
await p.waitForTimeout(2200);
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(3000);
await p.evaluate(() => {
  window.__m = [];
  const foto = () => {
    const v2 = document.querySelector('[data-mega-page-viewport="2"]');
    if (v2) {
      const v = v2.getBoundingClientRect().top;
      const q = (s) => v2.querySelector(s);
      const graella = q('[data-carrusel="1"] > div');
      const row = q('[data-p2-cercador-row]');
      const peces = graella ? [...graella.querySelectorAll('button')] : [];
      const files = [[], []];
      peces.forEach((x, k) => files[k % 2].push(x));
      const tira = peces[0]?.parentElement;
      const rel = (el) => (el ? +(el.getBoundingClientRect().top - v).toFixed(2) : null);
      window.__m.push({
        t: Math.round(performance.now()),
        sel: rel(q('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')),
        f0: files[0][0] ? rel(files[0][0]) : null,
        f1: files[1][0] ? rel(files[1][0]) : null,
        colors: rel(q('[data-p2-color-grid]')),
        fills: row ? [...row.children].map((c) => rel(c)).join(',') : null,
        franja: rel(q('[data-stripe-visual-content="2"]')),
        tiraX: tira ? +tira.getBoundingClientRect().left.toFixed(1) : null,
        hRow: row ? +row.getBoundingClientRect().height.toFixed(2) : null,
      });
    }
    if (window.__m.length < 1200) requestAnimationFrame(() => window.setTimeout(foto, 0));
  };
  requestAnimationFrame(() => window.setTimeout(foto, 0));
});
const marca = async (n) => { await p.evaluate((x) => window.__m.push({ marca: x, t: Math.round(performance.now()) }), n); };
await marca('ABANS');
// canvi de colleccio des de la columna de la pagina 2
const pos = await p.evaluate(() => {
  const row = document.querySelector('[data-p2-cercador-row]');
  const seg = row.children[1];
  const boto = [...seg.querySelectorAll('button')].find((x) => /cube/i.test(x.textContent || ''));
  if (!boto) return null;
  const b2 = boto.getBoundingClientRect();
  return { x: Math.round(b2.left + b2.width / 2), y: Math.round(b2.top + b2.height / 2), et: boto.textContent.trim().slice(0, 16) };
});
if (pos) { await p.mouse.click(pos.x, pos.y); await marca(`CLIC ${pos.et}`); }
await p.waitForTimeout(2500);
const m = await p.evaluate(() => window.__m);
let previ = null;
for (const x of m) {
  if (x.marca) { console.log(`   >>> ${x.marca} t=${x.t}`); previ = null; continue; }
  const clau = `${x.sel}|${x.f0}|${x.f1}|${x.colors}|${x.fills}|${x.franja}|${x.tiraX}|${x.hRow}`;
  if (clau !== previ) console.log(`t=${String(x.t).padStart(5)} sel=${String(x.sel).padStart(7)} f0=${String(x.f0).padStart(7)} f1=${String(x.f1).padStart(7)} colors=${String(x.colors).padStart(7)} fills=[${x.fills}] franja=${String(x.franja).padStart(7)} tiraX=${x.tiraX} hRow=${x.hRow}`);
  previ = clau;
}
await b.close();
