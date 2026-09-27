// TEMPORAL — no es comiteja. Quina interaccio mou el bloc?
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
      const row = v2.querySelector('[data-p2-cercador-row]');
      const franja = v2.querySelector('[data-stripe-visual-content="2"]');
      const peces = graella ? [...graella.querySelectorAll('button')] : [];
      const files = [[], []];
      peces.forEach((x, k) => files[k % 2].push(x));
      const rel = (el) => (el ? +(el.getBoundingClientRect().top - v).toFixed(2) : null);
      window.__m.push({
        t: Math.round(performance.now()),
        selector: rel(bar),
        fila0: files[0][0] ? rel(files[0][0]) : null,
        fila1: files[1][0] ? rel(files[1][0]) : null,
        colorTira: rel(barres),
        segona: rel(row ? row.children[1] : null),
        franja: rel(franja),
        altFilera: row ? +row.getBoundingClientRect().height.toFixed(2) : null,
        altFranja: franja ? +franja.getBoundingClientRect().height.toFixed(2) : null,
      });
    }
    if (window.__m.length < 3000) requestAnimationFrame(() => window.setTimeout(foto, 0));
  };
  requestAnimationFrame(() => window.setTimeout(foto, 0));
});
const marca = async (nom) => { await p.evaluate((n) => window.__m.push({ marca: n, t: Math.round(performance.now()) }), nom); };
await p.click('button:has(svg.lucide-search)').catch(() => {});
await p.waitForTimeout(4000);
await marca('FI ESPERA');
// 1) hover sobre el primer dibuix del carrusel
const pos = await p.evaluate(() => {
  const v2 = document.querySelector('[data-mega-page-viewport="2"]');
  const g = v2.querySelector('[data-carrusel="1"] > div');
  const peces = [...g.querySelectorAll('button')].filter((x) => { const b2 = x.getBoundingClientRect(); const c = g.getBoundingClientRect(); return b2.left > c.left + 20 && b2.right < c.right - 20; });
  const b2 = peces[0].getBoundingClientRect();
  return { x: Math.round(b2.left + b2.width / 2), y: Math.round(b2.top + b2.height / 2), et: peces[0].getAttribute('title') };
});
await p.mouse.move(pos.x, pos.y);
await p.waitForTimeout(1200);
await marca(`HOVER ${pos.et}`);
// 2) rodeta sobre la tira de colors
const posC = await p.evaluate(() => { const r = document.querySelector('[data-p2-color-grid]').getBoundingClientRect(); return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) }; });
await p.mouse.move(posC.x, posC.y);
await p.mouse.wheel(0, 120);
await p.waitForTimeout(1500);
await marca('RODETA COLORS');
// 3) moure el ratoli fora
await p.mouse.move(960, 900);
await p.waitForTimeout(1200);
await marca('FORA');
// 4) clicar un enllac de colleccio
const posL = await p.evaluate(() => {
  const row = document.querySelector('[data-p2-cercador-row]');
  const seg = row.children[1];
  const b2 = seg.querySelector('button')?.getBoundingClientRect();
  return b2 ? { x: Math.round(b2.left + b2.width / 2), y: Math.round(b2.top + b2.height / 2), et: seg.querySelector('button').textContent.trim().slice(0, 14) } : null;
});
if (posL) { await p.mouse.click(posL.x, posL.y); await p.waitForTimeout(2000); await marca(`CLIC COLLECCIO ${posL.et}`); }
const m = await p.evaluate(() => window.__m);
let previ = null;
for (const x of m) {
  if (x.marca) { console.log(`   >>> ${x.marca}  (t=${x.t})`); previ = null; continue; }
  const clau = `${x.selector}|${x.fila0}|${x.fila1}|${x.colorTira}|${x.segona}|${x.franja}|${x.altFilera}|${x.altFranja}`;
  if (clau !== previ) console.log(`t=${String(x.t).padStart(5)} selector=${String(x.selector).padStart(7)} fila0=${String(x.fila0).padStart(7)} fila1=${String(x.fila1).padStart(7)} colorTira=${String(x.colorTira).padStart(7)} 2a=${String(x.segona).padStart(7)} franja=${String(x.franja).padStart(7)} altFilera=${x.altFilera} altFranja=${x.altFranja}`);
  previ = clau;
}
await b.close();
