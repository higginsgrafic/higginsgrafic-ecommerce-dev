// TEMPORAL — no es comiteja. Recarregar amb ?active=... : que es mou al primer segon?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const dpr of [2]) {
  const ctx = await b.newContext({ viewport: { width: 1512, height: 900 }, deviceScaleFactor: dpr });
  await ctx.addInitScript(() => {
    window.__m = [];
    const foto = () => {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const panell = document.querySelector('[data-mega-panel-surface="1"]');
      if (v2) {
        const v = v2.getBoundingClientRect().top;
        const q = (s) => v2.querySelector(s);
        const graella = q('[data-carrusel="1"] > div');
        const row = q('[data-p2-cercador-row]');
        const peces = graella ? [...graella.querySelectorAll('button')] : [];
        const files = [[], []];
        peces.forEach((x, k) => files[k % 2].push(x));
        const rel = (el) => (el ? +(el.getBoundingClientRect().top - v).toFixed(2) : null);
        window.__m.push({
          t: Math.round(performance.now()),
          op: panell ? +getComputedStyle(panell).opacity : null,
          ptop: panell ? +panell.getBoundingClientRect().top.toFixed(1) : null,
          sel: rel(q('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')),
          f0: files[0][0] ? rel(files[0][0]) : null,
          f1: files[1][0] ? rel(files[1][0]) : null,
          colors: rel(q('[data-p2-color-grid]')),
          segona: row ? rel(row.children[1]) : null,
          franja: rel(q('[data-stripe-visual-content="2"]')),
          hRow: row ? +row.getBoundingClientRect().height.toFixed(2) : null,
          hClip: graella ? +graella.getBoundingClientRect().height.toFixed(2) : null,
        });
      }
      if (window.__m.length < 900) requestAnimationFrame(() => window.setTimeout(foto, 0));
    };
    requestAnimationFrame(() => window.setTimeout(foto, 0));
  });
  await p_goto(ctx);
  await new Promise((r) => setTimeout(r, 5000));
  await ctx.close();
}
async function p_goto(ctx) {
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(4500);
  const m = await p.evaluate(() => window.__m || []);
  console.log(`=== mostres ${m.length}  (DPR 2, 1512x900)`);
  let previ = null;
  for (const x of m) {
    const clau = `${x.op}|${x.ptop}|${x.sel}|${x.f0}|${x.f1}|${x.colors}|${x.segona}|${x.franja}|${x.hRow}|${x.hClip}`;
    if (clau !== previ) console.log(`  t=${String(x.t).padStart(5)} op=${x.op} ptop=${x.ptop} sel=${String(x.sel).padStart(7)} f0=${String(x.f0).padStart(7)} f1=${String(x.f1).padStart(7)} colors=${String(x.colors).padStart(7)} 2a=${String(x.segona).padStart(7)} franja=${String(x.franja).padStart(7)} hRow=${x.hRow} hClip=${x.hClip}`);
    previ = clau;
  }
  await p.close();
}
await b.close();
