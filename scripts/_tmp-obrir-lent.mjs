// TEMPORAL — no es comiteja. Obrir amb la CPU alentida: que es mou (vertical I horitzontal)?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const rate of [1, 4, 6]) {
  const ctx = await b.newContext({ viewport: { width: 1512, height: 900 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  await p.goto('http://127.0.0.1:3003/nova/inici', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(3000);
  await p.evaluate(() => {
    window.__m = [];
    const foto = () => {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      if (v2) {
        const q = (s) => v2.querySelector(s);
        const graella = q('[data-carrusel="1"] > div');
        const row = q('[data-p2-cercador-row]');
        const peces = graella ? [...graella.querySelectorAll('button')] : [];
        const files = [[], []];
        peces.forEach((x, k) => files[k % 2].push(x));
        const barres = q('[data-p2-color-grid]');
        const b0 = barres ? barres.querySelector('button') : null;
        const r = (el) => { if (!el) return null; const b2 = el.getBoundingClientRect(); return `${b2.top.toFixed(2)},${b2.left.toFixed(2)},${b2.width.toFixed(2)}`; };
        window.__m.push({
          t: Math.round(performance.now()),
          sel: r(q('[data-p2-color-selector] [data-stripe-buttonbar="bn"]')),
          f0: files[0][0] ? r(files[0][0]) : null,
          f1: files[1][0] ? r(files[1][0]) : null,
          colors: r(barres),
          barra0: r(b0),
          segona: row ? r(row.children[1]) : null,
          columna: row ? r(row.children[2]) : null,
          fletxes: (() => { const c = q('[data-carrusel="1"]'); return c && c.children[1] ? r(c.children[1]) : null; })(),
          franja: r(q('[data-stripe-visual-content="2"]')),
          hRow: row ? +row.getBoundingClientRect().height.toFixed(2) : null,
        });
      }
      if (window.__m.length < 1500) requestAnimationFrame(() => window.setTimeout(foto, 0));
    };
    requestAnimationFrame(() => window.setTimeout(foto, 0));
  });
  await p.click('button:has(svg.lucide-search)').catch(() => {});
  await p.waitForTimeout(5000);
  const m = (await p.evaluate(() => window.__m)).filter((x) => x.sel != null);
  console.log(`=== CPU x${rate}  (mostres ${m.length})`);
  let previ = null;
  for (const x of m) {
    const clau = `${x.sel}|${x.f0}|${x.f1}|${x.colors}|${x.barra0}|${x.segona}|${x.columna}|${x.fletxes}|${x.franja}|${x.hRow}`;
    if (clau !== previ) {
      console.log(`  t=${String(x.t).padStart(5)} sel=${x.sel} | f0=${x.f0} | f1=${x.f1} | colors=${x.colors} | barra0=${x.barra0} | 2a=${x.segona} | col=${x.columna} | fletxes=${x.fletxes} | franja=${x.franja} | hRow=${x.hRow}`);
    }
    previ = clau;
  }
  await ctx.close();
}
await b.close();
