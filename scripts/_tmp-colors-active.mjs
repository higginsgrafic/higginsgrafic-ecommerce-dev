// TEMPORAL — no es comiteja. N obertures en fred amb ?active=: quants valors
// distints pinta la tira de colors, i a quina opacitat?
import { chromium } from '@playwright/test';
const b = await chromium.launch();
const N = Number(process.env.HG_N || 6);
for (let i = 1; i <= N; i++) {
  const ctx = await b.newContext({ viewport: { width: 1920, height: 946 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await ctx.addInitScript(() => {
    window.__m = [];
    const foto = () => {
      const v2 = document.querySelector('[data-mega-page-viewport="2"]');
      const panell = document.querySelector('[data-mega-panel-surface="1"]');
      if (v2 && panell) {
        const v = v2.getBoundingClientRect().top;
        const col = v2.querySelector('[data-p2-color-grid]');
        const row = v2.querySelector('[data-p2-cercador-row]');
        const g = v2.querySelector('[data-carrusel="1"] > div');
        const sel = v2.querySelector('[data-p2-color-selector] [data-stripe-buttonbar="bn"]');
        window.__m.push({
          t: Math.round(performance.now()),
          op: +Number.parseFloat(getComputedStyle(panell).opacity).toFixed(2),
          colMt: col ? +Number.parseFloat(getComputedStyle(col).marginTop).toFixed(3) : null,
          colTop: col ? +(col.getBoundingClientRect().top - v).toFixed(2) : null,
          rowTop: row ? +(row.getBoundingClientRect().top - v).toFixed(2) : null,
          rowH: row ? +row.getBoundingClientRect().height.toFixed(2) : null,
          gridH: g ? +g.getBoundingClientRect().height.toFixed(2) : null,
          selTop: sel ? +(sel.getBoundingClientRect().top - v).toFixed(2) : null,
        });
      }
      if (window.__m.length < 3000) requestAnimationFrame(() => window.setTimeout(foto, 0));
    };
    requestAnimationFrame(() => window.setTimeout(foto, 0));
  });
  await p.goto('http://127.0.0.1:3003/nova/inici?active=first_contact', { waitUntil: 'load', timeout: 180000 });
  await p.waitForTimeout(5000);
  const m = (await p.evaluate(() => window.__m)).filter((x) => x.colMt != null);
  await ctx.close();
  const valors = [...new Set(m.map((x) => x.colMt))];
  const primer = m[0];
  const canvi = m.find((x, k) => k > 0 && x.colMt !== m[0].colMt);
  const visible = [...new Set(m.filter((x) => x.op > 0).map((x) => x.colMt))];
  console.log(`run ${i}: mt=${valors.join(' -> ')} | 1r op=${primer.op} mt=${primer.colMt} | canvi a op=${canvi ? canvi.op : '—'} | visible: ${visible.join(' -> ')} | rowH ${m[0].rowH}->${m[m.length - 1].rowH} gridH ${m[0].gridH}->${m[m.length - 1].gridH} selTop ${m[0].selTop}->${m[m.length - 1].selTop}`);
}
await b.close();
