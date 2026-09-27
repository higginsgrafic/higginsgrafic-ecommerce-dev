// TEMPORAL — no es comiteja. Que es mou en OBRIR, amb mostreig despres de pintar.
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const [w, h, dpr] of [[1920, 946, 1], [1512, 900, 2], [1440, 800, 1], [2560, 1306, 1]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(2500);
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
        const rel = (el) => (el ? +(el.getBoundingClientRect().top - v).toFixed(2) : null);
        window.__m.push({
          t: Math.round(performance.now()),
          sel: rel(q('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')),
          f0: files[0][0] ? rel(files[0][0]) : null,
          f1: files[1][0] ? rel(files[1][0]) : null,
          colors: rel(q('[data-p2-color-grid]')),
          segona: row ? rel(row.children[1]) : null,
          columna: row ? rel(row.children[2]) : null,
          llista: row && row.children[2] ? rel(row.children[2].firstElementChild) : null,
          fletxes: (() => { const c = q('[data-carrusel="1"]'); return c && c.children[1] ? rel(c.children[1]) : null; })(),
          franja: rel(q('[data-stripe-visual-content="2"]')),
          hRow: row ? +row.getBoundingClientRect().height.toFixed(2) : null,
          hClip: graella ? +graella.getBoundingClientRect().height.toFixed(2) : null,
          cella: peces[0] ? +peces[0].getBoundingClientRect().width.toFixed(3) : null,
        });
      }
      if (window.__m.length < 900) requestAnimationFrame(() => window.setTimeout(foto, 0));
    };
    requestAnimationFrame(() => window.setTimeout(foto, 0));
  });
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(4000);
  const m = (await p.evaluate(() => window.__m)).filter((x) => x.sel != null);
  console.log(`=== ${w}x${h} DPR ${dpr}  (mostres amb pagina 2: ${m.length}, primera t=${m[0]?.t})`);
  let previ = null;
  for (const x of m) {
    const clau = `${x.sel}|${x.f0}|${x.f1}|${x.colors}|${x.segona}|${x.columna}|${x.llista}|${x.fletxes}|${x.franja}|${x.hRow}|${x.hClip}|${x.cella}`;
    if (clau !== previ) console.log(`  t=${String(x.t).padStart(5)} sel=${String(x.sel).padStart(7)} f0=${String(x.f0).padStart(7)} f1=${String(x.f1).padStart(7)} colors=${String(x.colors).padStart(7)} 2a=${String(x.segona).padStart(7)} col=${String(x.columna).padStart(7)} llista=${String(x.llista).padStart(7)} fletxes=${String(x.fletxes).padStart(7)} franja=${String(x.franja).padStart(7)} hRow=${x.hRow} cella=${x.cella}`);
    previ = clau;
  }
  await ctx.close();
}
await b.close();
