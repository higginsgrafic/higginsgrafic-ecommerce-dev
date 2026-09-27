// TEMPORAL — no es comita. On son els botons i la fila de colors (pagina 2).
import { chromium } from '@playwright/test';
const b = await chromium.launch();
for (const mida of ['1920x946', '1440x900']) {
  const [w, h] = mida.split('x').map(Number);
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w <= 1366 });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:3003/nova/inici?carril=1', { waitUntil: 'load', timeout: 45000 });
  await p.waitForTimeout(2500);
  await p.click('button:has(svg.lucide-search)', { timeout: 8000 }).catch(() => {});
  await p.waitForTimeout(4500);
  const r = await p.evaluate(() => {
    const box = (e) => {
      if (!e) return null;
      const b = e.getBoundingClientRect();
      return [+b.left.toFixed(1), +b.top.toFixed(1), +b.right.toFixed(1), +b.bottom.toFixed(1)];
    };
    const v = document.querySelector('[data-mega-page-viewport="2"]');
    const sel = v.querySelector('[data-p2-color-selector]');
    const bn = sel.querySelector('[data-stripe-buttonbar="bn"]');
    const filera = v.querySelector('[data-p2-cercador-row]');
    const carr = v.querySelector('[data-carrusel="1"]');
    const retall = carr.firstElementChild;
    const grid = v.querySelector('[data-p2-color-grid]');
    const mostres = [...grid.children];
    return {
      filera: box(filera), bn: box(bn),
      anterior: box(v.querySelector('[aria-label="Anterior"]')),
      seguent: box(v.querySelector('[aria-label="Següent"]')),
      carrusel: box(carr), retall: box(retall), grid: box(grid),
      mostra0: box(mostres[0]), mostra7: box(mostres[7]), mostra13: box(mostres[13]),
      ampleBarra: +(mostres[0].getBoundingClientRect().width).toFixed(1),
      alcadaBarra: +(mostres[0].getBoundingClientRect().height).toFixed(1),
      radi: getComputedStyle(mostres[0]).borderRadius,
      franja: box(v.querySelector('[data-stripe-visual-content="2"]')),
      linies: (() => {
        const tira = carr.firstElementChild.firstElementChild;
        const cs = [...tira.querySelectorAll('button')].map((b) => b.getBoundingClientRect()).filter((b) => b.width > 0);
        const tops = [...new Set(cs.map((b) => +b.top.toFixed(1)))].sort((a, b) => a - b);
        return tops.map((t) => {
          const f = cs.filter((b) => +b.top.toFixed(1) === t);
          const top = Math.min(...f.map((b) => b.top));
          const bottom = Math.max(...f.map((b) => b.bottom));
          return [+top.toFixed(1), +bottom.toFixed(1), +((top + bottom) / 2).toFixed(1)];
        });
      })(),
    };
  });
  console.log(mida, JSON.stringify(r));
  await ctx.close();
}
await b.close();
