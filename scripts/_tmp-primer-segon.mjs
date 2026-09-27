// TEMPORAL — no es comiteja. TOT el que es mou dins del primer segon, sense filtrar.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const dpr of [1, 2]) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: dpr });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
  await p.evaluate(() => {
    window.__m = [];
    const foto = () => {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const v = v2 ? v2.getBoundingClientRect().top : 0;
      const q = (s) => (v2 ? v2.querySelector(s) : null);
      const graella = q('[data-carrusel="1"] > div');
      const row = q('[data-p2-cercador-row]');
      const peces = graella ? [...graella.querySelectorAll('button')] : [];
      const files = [[], []];
      peces.forEach((x, k) => files[k % 2].push(x));
      const rel = (el) => (el ? +(el.getBoundingClientRect().top - v).toFixed(2) : null);
      const fills = row ? [...row.children].map((c) => rel(c)) : [];
      window.__m.push({
        t: Math.round(performance.now()),
        v2: +v.toFixed(2),
        selector: rel(q('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')),
        f0: files[0][0] ? rel(files[0][0]) : null,
        f1: files[1][0] ? rel(files[1][0]) : null,
        colors: rel(q('[data-p2-color-grid]')),
        fills: fills.join(','),
        franja: rel(q('[data-stripe-visual-content="2"]')),
        hRow: row ? +row.getBoundingClientRect().height.toFixed(2) : null,
        hClip: graella ? +graella.getBoundingClientRect().height.toFixed(2) : null,
      });
      if (window.__m.length < 900) requestAnimationFrame(() => window.setTimeout(foto, 0));
    };
    requestAnimationFrame(() => window.setTimeout(foto, 0));
  });
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(2500);
  const m = await p.evaluate(() => window.__m);
  console.log(`=== DPR ${dpr}  (mostres ${m.length})`);
  let previ = null;
  for (const x of m) {
    const clau = `${x.v2}|${x.selector}|${x.f0}|${x.f1}|${x.colors}|${x.fills}|${x.franja}|${x.hRow}|${x.hClip}`;
    if (clau !== previ) {
      console.log(`  t=${String(x.t).padStart(5)} v2=${String(x.v2).padStart(7)} sel=${String(x.selector).padStart(7)} f0=${String(x.f0).padStart(7)} f1=${String(x.f1).padStart(7)} colors=${String(x.colors).padStart(7)} fills=[${x.fills}] franja=${String(x.franja).padStart(7)} hRow=${x.hRow} hClip=${x.hClip}`);
    }
    previ = clau;
  }
  await ctx.close();
}
await b.close();
